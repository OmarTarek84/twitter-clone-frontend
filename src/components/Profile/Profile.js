import React, { useEffect, useReducer, useState } from "react";
import "./Profile.scss";
import axios from "../../axios";
import Spinner from "../Spinner/Spinner";
import TabsPosts from "./Tabs/Tabs";
import { useDispatch, useSelector } from "react-redux";
import history from "../../history";
import {
  deletePost,
  likePost,
  replyPost,
  retweetPost,
} from "../../store/Actions/post";
import { FOLLOW_USER } from "../../store/Actions/actionTypes";

const initialState = {
  userLoading: false,
  profile: null,
  error: null,
  combinedPostsAndRetweets: [],
  followLoading: false
};

const reducer = (state, action) => {
  switch (action.type) {
    case "user_loading":
      return {
        ...state,
        userLoading: true,
        error: null,
      };
    case "fetch_user":
      return {
        ...state,
        userLoading: false,
        profile: action.profile,
        combinedPostsAndRetweets: [
          ...action.profile.posts,
          ...action.profile.retweets,
        ],
        followLoading: false
      };
    case "user_error":
      return {
        ...state,
        error: action.error,
        userLoading: false,
        followLoading: false
      };
    case "retweet":
      let combinedPostsAndRetweetsForRetweet = [
        ...state.combinedPostsAndRetweets,
      ];
      const targetedPostIndexForRetweet = combinedPostsAndRetweetsForRetweet.findIndex(
        (o) => o._id === action.postId
      );
      let postretweetUsers = [
        ...combinedPostsAndRetweetsForRetweet[targetedPostIndexForRetweet]
          .retweetUsers,
      ];
      const retweetUsersIndex = postretweetUsers.findIndex(
        (u) => u.username === localStorage.getItem("userName")
      );
      if (retweetUsersIndex > -1) {
        postretweetUsers = postretweetUsers.filter(
          (u) => u.username !== localStorage.getItem("userName")
        );
      } else {
        postretweetUsers.unshift({
          firstName: localStorage.getItem("firstName"),
          lastName: localStorage.getItem("lastName"),
          username: localStorage.getItem("userName"),
          profilePic: localStorage.getItem("profilePic"),
        });
      }
      combinedPostsAndRetweetsForRetweet[
        targetedPostIndexForRetweet
      ].retweetUsers = postretweetUsers;
      return {
        ...state,
        profile: {
          ...state.profile,
          combinedPostsAndRetweets: combinedPostsAndRetweetsForRetweet,
        },
      };
    case "like_post":
      let postsArray = [...state.combinedPostsAndRetweets];
      if (action.tabIndex === 1) {
        postsArray = [...state.profile.replies];
      }
      const targetedPostIndex = postsArray.findIndex(
        (o) => o._id === action.postId
      );
      const allPostLikes = [...postsArray[targetedPostIndex].likes];
      const likeUserFoundIndex = allPostLikes.findIndex(
        (like) => like.username === localStorage.getItem("userName")
      );
      if (likeUserFoundIndex > -1) {
        allPostLikes.splice(likeUserFoundIndex, 1);
      } else {
        allPostLikes.push({
          firstName: localStorage.getItem("firstName"),
          lastName: localStorage.getItem("lastName"),
          username: localStorage.getItem("userName"),
          profilePic: localStorage.getItem("profilePic"),
        });
      }
      postsArray[targetedPostIndex].likes = allPostLikes;
      if (action.tabIndex === 0) {
        return {
          ...state,
          combinedPostsAndRetweets: postsArray,
        };
      } else {
        return {
          ...state,
          profile: {
            ...state.profile,
            replies: postsArray,
          },
        };
      }
    case "delete_reply_post":
      const allReplies = [...state.profile.replies];
      const foundReplyPostIndex = allReplies.findIndex(
        (r) => r._id === action.replyPostId
      );
      allReplies.splice(foundReplyPostIndex, 1);
      return {
        ...state,
        profile: {
          ...state.profile,
          replies: [...allReplies],
        },
      };
    case "follow_loading":
      return {
        ...state,
        followLoading: true
      };
    case "follow_user":
      if (action.resType === "Add") {
        return {
          ...state,
          profile: {
            ...state.profile,
            followers: [...state.profile.followers, action.follower],
          },
          followLoading: false
        };
      } else {
        return {
          ...state,
          profile: {
            ...state.profile,
            followers: state.profile.followers.filter(
              (p) => p.username !== action.follower.username
            ),
          },
          followLoading: false
        };
      }
    default:
      return state;
  }
};

const Profile = (props) => {
  const [profileState, dispatch] = useReducer(reducer, initialState);
  const [tabIndex, settabIndex] = useState(0);
  const [ifFollowing, setifFollowing] = useState(false);

  const dispatch2 = useDispatch();
  const { postActionLoading, retweetActionLoading } = useSelector(
    (state) => state.post
  );
  const { token, userDetails } = useSelector((state) => state.user);

  const likePostReq = (postId, originalPostId) => {
    dispatch2(likePost(postId, originalPostId));

    // here if condition because there's already a reducer that does this dispatch in posts array
    dispatch({
      type: "like_post",
      postId: postId,
      tabIndex: tabIndex,
    });
  };

  const retweetReq = (postId, originalPostId) => {
    dispatch2(retweetPost(postId, originalPostId));
    dispatch({
      type: "retweet",
      postId: postId,
    });
  };

  const deletePostReqGoHome = (postId, originalPostId) => {
    dispatch({ type: "delete_reply_post", replyPostId: postId });
    dispatch2(deletePost(postId, originalPostId));
  };

  const viewSinglePostReq = (postId, replyPostId) => {
    history.push(`/post/${replyPostId || postId}`, {
      postId: replyPostId || postId,
      backgroundGreenPostId: postId,
    });
  };

  const goToProfile = (username) => {
    history.push(`/profile/${username}`);
  };

  const selectTabIndex = (tabindex) => {
    settabIndex(tabindex);
  };

  const submitReplyReq = async (formData, postId) => {
    const result = await dispatch2(replyPost(formData.reply, postId));
    dispatch({
      type: "add_reply",
      reply: result.post,
    });
  };

  const goToFollowList = index => {
    history.push(`/profile/${profileState.profile.username}/follow`, {
      tabIndex: index,
      username: profileState.profile.username,
      followers: profileState.profile.followers,
      following: profileState.profile.following,
      firstName: profileState.profile.firstName,
      lastName: profileState.profile.lastName,
    });
  };

  const followUser = async () => {
    dispatch({
      type: 'follow_loading'
    });
    const response = await axios.put(
      `/user/follow/${profileState.profile.username}`,
      {},
      {
        headers: {
          Authorization:
            "Bearer " + token || localStorage.getItem("accessToken"),
        },
      }
    );
    dispatch2({
      type: FOLLOW_USER,
      newfollowingUser:
        response.data && response.data.newfollowingUser
          ? response.data.newfollowingUser
          : null,
    });
    dispatch({
      type: "follow_user",
      follower: {
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        email: userDetails.email,
        profilePic: userDetails.profilePic,
        username: userDetails.username,
      },
      resType: response.data.type,
    });
    if (response.data.type === "Add") {
      setifFollowing(true);
    } else {
      setifFollowing(false);
    }
  };

  useEffect(() => {
    const getProfile = async () => {
      dispatch({
        type: "user_loading",
      });
      settabIndex(0);
      try {
        const response = await axios.get(
          `/user/profile/${props.match.params.username}`,
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("accessToken"),
            },
          }
        );
        dispatch({
          type: "fetch_user",
          profile: response.data,
          likes: response.data.likes,
          retweets: response.data.retweets,
        });
        console.log(response.data);
        const followUserBool =
          response.data.followers.findIndex(
            (p) => p.username === localStorage.getItem("userName")
          ) > -1;
        setifFollowing(followUserBool);
      } catch (err) {
        console.log(err);
        dispatch({
          type: "user_error",
          error:
            err.response && err.response.data && err.response.data.message
              ? err.response.data.message
              : err.message,
        });
      }
    };
    getProfile();
  }, [props.match.params.username]);

  const renderProfile = () => {
    return (
      <>
        <div className="coverphoto">
          <img
            src={profileState.profile.profilePic}
            alt={profileState.profile.username}
          />
          <div className="profilePic">
            <img
              src={profileState.profile.profilePic}
              alt={profileState.profile.username}
            />
          </div>
        </div>
        <div className="emailfollowing" style={{
          display: profileState.profile.username === (userDetails ? userDetails.username: localStorage.getItem('userName')) ? 'none': 'flex'
        }}>
          <button className="email">
            <i className="fa fa-envelope"></i>
          </button>
          <button
            className="follow"
            onClick={followUser}
            disabled={profileState.followLoading}
            style={{
              backgroundColor: ifFollowing ? "#00ACEE" : "white",
              color: ifFollowing ? "white" : "#00ACEE",
            }}
          >
            {ifFollowing ? "Following" : "Follow"}
          </button>
        </div>
        <div className="userdetails" style={{
          marginTop: profileState.profile.username === (userDetails ? userDetails.username: localStorage.getItem('userName')) ? '70px': '20px'
        }}>
          <p className="firstlastname">
            {profileState.profile.firstName} {profileState.profile.lastName}
          </p>
          <p className="username">@{profileState.profile.username}</p>
          <div className="followingfollowers">
            <p onClick={() => goToFollowList(0)}>
              <span>{profileState.profile.following.length}</span> Following
            </p>
            <p onClick={() => goToFollowList(1)}>
              <span>{profileState.profile.followers.length}</span> Followers
            </p>
          </div>
        </div>
        <div className="tabs">
          <TabsPosts
            likePostReq={likePostReq}
            viewSinglePostReq={viewSinglePostReq}
            retweetReq={retweetReq}
            deletePostReqGoHome={deletePostReqGoHome}
            postActionLoading={postActionLoading}
            retweetActionLoading={retweetActionLoading}
            posts={
              tabIndex === 0
                ? profileState.combinedPostsAndRetweets
                : profileState.profile.replies
            }
            selectTabIndex={selectTabIndex}
            goToProfile={goToProfile}
            disableReply={tabIndex === 1}
            submitReplyReq={submitReplyReq}
          />
        </div>
      </>
    );
  };

  return (
    <div className="profile">
      {!profileState.userLoading && profileState.profile ? (
        <>
          <h2>
            {profileState.profile.firstName} {profileState.profile.lastName}
          </h2>
          {renderProfile()}
        </>
      ) : (
        <Spinner width="60" />
      )}
    </div>
  );
};

export default Profile;
