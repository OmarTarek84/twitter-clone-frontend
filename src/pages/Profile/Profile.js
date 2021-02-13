import React, { useEffect, useReducer, useRef, useState } from "react";
import "./Profile.scss";
import axios from "../../axios";
import Spinner from "../../components/Spinner/Spinner";
import TabsPosts from "../../components/PostsTabs/Tabs";
import { useDispatch, useSelector } from "react-redux";
import history from "../../history";
import {
  deletePost,
  likePost,
  replyPost,
  retweetPost,
} from "../../store/Actions/post";
import {
  CHANGE_COVER_PHOTO,
  CHANGE_PROFILE_PIC,
  FOLLOW_USER,
} from "../../store/Actions/actionTypes";
import ImageUploadModal from "../../components/ImageUploadModal/ImageUploadModal";
import { Circle } from "rc-progress";
import { pinPostUser } from "../../store/Actions/user";
import { toast } from "react-toastify";
import { createChat } from "../../store/Actions/chat";
import useSocket from "../../shared/socketCustomHook";

const initialState = {
  userLoading: false,
  profile: null,
  error: null,
  combinedPostsAndRetweets: [],
  followLoading: false,
  imageUploadProgressRunning: false,
  imageUploadProgress: 0,
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
        followLoading: false,
      };
    case "user_error":
      return {
        ...state,
        error: action.error,
        userLoading: false,
        followLoading: false,
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
        followLoading: true,
      };
    case "follow_user":
      if (action.resType === "Add") {
        return {
          ...state,
          profile: {
            ...state.profile,
            followers: [...state.profile.followers, action.follower],
          },
          followLoading: false,
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
          followLoading: false,
        };
      }
    case "image_upload":
      return {
        ...state,
        imageUploadProgressRunning: true,
        imageUploadProgress: action.progress,
      };
    case "change_profile_pic":
      return {
        ...state,
        imageUploadProgressRunning: false,
        imageUploadProgress: 0,
        profile: {
          ...state.profile,
          profilePic: action.profilePic,
        },
      };
    case "change_cover_photo":
      return {
        ...state,
        imageUploadProgressRunning: false,
        imageUploadProgress: 0,
        profile: {
          ...state.profile,
          coverPhoto: action.coverPhoto,
        },
      };
    default:
      return state;
  }
};

const Profile = (props) => {
  const [profileState, dispatch] = useReducer(reducer, initialState);
  const [tabIndex, settabIndex] = useState(0);
  const [ifFollowing, setifFollowing] = useState(false);
  const [modalOpen, setModalOpen] = useState({
    open: false,
    type: "profilePic",
  });

  const pinToastId = useRef();
  const replyToastId = useRef();
  const retweetToastId = useRef();

  const {socket} = useSocket();

  const dispatch2 = useDispatch();
  const { postActionLoading, retweetActionLoading } = useSelector(
    (state) => state.post
  );
  const { token, userDetails } = useSelector((state) => state.user);
  const { chatLoading } = useSelector((state) => state.chat);

  const likePostReq = (postId, originalPostId, postedByUsername) => {
    dispatch2(likePost(postId, originalPostId));

    // here if condition because there's already a reducer that does this dispatch in posts array
    dispatch({
      type: "like_post",
      postId: postId,
      tabIndex: tabIndex,
    });
    if (postedByUsername !== userDetails.username) {
      socket.current.emit('notification Sent', {
        notificationFrom: userDetails.username,
        notificationTo: [postedByUsername],
        type: 'like',
        postId: postId
      });
    }
  };

  const retweetReq = (postId, originalPostId, postedByUsername) => {
    retweetToastId.current = toast.warning("Submitting Your retweet...");
    dispatch2(retweetPost(postId, originalPostId)).then(() => {
      toast.dismiss(retweetToastId.current);
      toast.success("Retweet Success");
      if (postedByUsername !== userDetails.username) {
        socket.current.emit('notification Sent', {
          notificationFrom: userDetails.username,
          notificationTo: [postedByUsername],
          type: 'retweet',
          postId: postId
        });
      }
    });
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

  const submitReplyReq = async (formData, postId, postedByUsername) => {
    replyToastId.current = toast.warning("Submitting Your Reply...");
    const result = await dispatch2(replyPost(formData.reply, postId));
    toast.dismiss(replyToastId.current);
    toast.success("Reply Post Success");
    socket.current.emit('notification Sent', {
      notificationFrom: userDetails.username,
      notificationTo: [postedByUsername],
      type: 'reply',
      postId: postId
    });
    dispatch({
      type: "add_reply",
      reply: result.post,
    });
  };

  const goToFollowList = (index) => {
    history.push(`/profile/${profileState.profile.username}/follow`, {
      tabIndex: index,
      username: profileState.profile.username,
      followers: profileState.profile.followers,
      following: profileState.profile.following,
      firstName: profileState.profile.firstName,
      lastName: profileState.profile.lastName,
    });
  };

  const pinPost = (postId) => {
    pinToastId.current = toast.warning("Pinning Post...");
    dispatch2(pinPostUser(postId)).then(() => {
      toast.dismiss(pinToastId.current);
      toast.success("Pin Post Success");
    });
  };

  const followUser = async () => {
    dispatch({
      type: "follow_loading",
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
    toast.success(
      response.data.type === "Add"
        ? `You are following ${response.data.newfollowingUser.firstName} ${response.data.newfollowingUser.lastName}`
        : `You unfollowed ${response.data.newfollowingUser.firstName} ${response.data.newfollowingUser.lastName}`
    );
    if (response.data.type === "Add") {
      socket.current.emit('notification Sent', {
        notificationFrom: userDetails.username,
        notificationTo: [response.data.newfollowingUser.username],
        type: 'follow'
      });
      setifFollowing(true);
    } else {
      setifFollowing(false);
    }
  };

  const openUploadModal = (photoType) => {
    setModalOpen({
      type: photoType,
      open: true,
    });
  };

  const closeUploadModal = () => {
    setModalOpen({
      type: "profilePic",
      open: false,
    });
  };

  const chatWithUser = async () => {
    const disResult = await dispatch2(
      createChat([profileState.profile.username], false)
    );
    history.push(`/chat/${disResult.chat._id}`);
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
        if (!response.data.username) {
          throw new Error();
        }
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

  const urltoFile = async (url, filename, mimeType) => {
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    return new File([arrayBuffer], filename, { type: mimeType });
  };

  const fileUploadProgress = (progressEvent) => {
    const percentageLoaded = (progressEvent.loaded / progressEvent.total) * 100;
    dispatch({
      type: "image_upload",
      progress: percentageLoaded,
    });
  };

  const uploadProfilePic = async (base64DataUrl, photoType) => {
    const response = await axios.get(
      "/user/getSignedUrl?photoType=" + photoType,
      {
        headers: {
          Authorization:
            "Bearer " + (token ? token : localStorage.getItem("accessToken")),
        },
      }
    );
    const { url, imagePath } = response.data;
    console.log(response.data);
    const fileObj = await urltoFile(
      base64DataUrl,
      `${userDetails.username || localStorage.getItem("userName")}.png`,
      "image/png"
    );
    try {
      await axios.put(url, fileObj, {
        headers: {
          "Content-Type": "image/png",
        },
        onUploadProgress:
          photoType === "profilePic" ? fileUploadProgress : null,
      });

      if (photoType === "profilePic") {
        dispatch2({
          type: CHANGE_PROFILE_PIC,
          profilePic: imagePath + "?" + new Date().getTime(),
        });
        dispatch({
          type: "change_profile_pic",
          profilePic: imagePath + "?" + new Date().getTime(),
        });
        await axios.put(
          "/user/changeProfilePic",
          { imagePath: imagePath },
          {
            headers: {
              Authorization:
                "Bearer " +
                (token ? token : localStorage.getItem("accessToken")),
            },
          }
        );
      } else {
        dispatch2({
          type: CHANGE_COVER_PHOTO,
          coverPhoto: imagePath + "?" + new Date().getTime(),
        });
        dispatch({
          type: "change_cover_photo",
          coverPhoto: imagePath + "?" + new Date().getTime(),
        });
        await axios.put(
          "/user/changeCoverPhoto",
          { imagePath: imagePath },
          {
            headers: {
              Authorization:
                "Bearer " +
                (token ? token : localStorage.getItem("accessToken")),
            },
          }
        );
      }
      toast.success("Your photo has been changed");
    } catch (err) {
      console.log(err);
    }
  };

  const renderProfile = () => {
    return (
      <>
        <div
          className="coverphoto"
          style={{
            backgroundColor: !profileState.profile.coverPhoto && "#00ACEE",
          }}
        >
          <button
            className="cameraCoverPhoto"
            onClick={() => openUploadModal("coverPhoto")}
            style={{
              display:
                (profileState.profile.username !==
                  localStorage.getItem("userName") ||
                  profileState.imageUploadProgressRunning) &&
                "none",
            }}
            disabled={profileState.imageUploadProgressRunning}
          >
            <i className="fas fa-camera"></i>
          </button>
          {profileState.profile.coverPhoto && (
            <img
              src={profileState.profile.coverPhoto}
              alt={profileState.profile.username}
            />
          )}
        </div>
        <div className="profilePic">
          <img
            src={profileState.profile.profilePic}
            alt={profileState.profile.username}
            style={{
              WebkitFilter: profileState.imageUploadProgressRunning
                ? "blur(3px)"
                : "none",
              filter: profileState.imageUploadProgressRunning
                ? "blur(3px)"
                : "none",
              msFilter: profileState.imageUploadProgressRunning
                ? "blur(3px)"
                : "none",
            }}
          />
          <button
            className="camera"
            onClick={() => openUploadModal("profilePic")}
            style={{
              display:
                (profileState.profile.username !==
                  localStorage.getItem("userName") ||
                  profileState.imageUploadProgressRunning) &&
                "none",
            }}
            disabled={profileState.imageUploadProgressRunning}
          >
            <i className="fas fa-camera"></i>
          </button>
          {profileState.imageUploadProgressRunning && (
            <div className="progressCir">
              <Circle percent="70" strokeWidth="4" strokeColor="#00875D" />
            </div>
          )}
        </div>
        <div
          className="emailfollowing"
          style={{
            display:
              profileState.profile.username ===
              (userDetails
                ? userDetails.username
                : localStorage.getItem("userName"))
                ? "none"
                : "flex",
          }}
        >
          {chatLoading ? (
            <Spinner width="30px" />
          ) : (
            <button className="email" onClick={chatWithUser}>
              <i className="fa fa-envelope"></i>
            </button>
          )}
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
        <div
          className="userdetails"
          style={{
            marginTop:
              profileState.profile.username ===
              (userDetails
                ? userDetails.username
                : localStorage.getItem("userName"))
                ? "70px"
                : "20px",
          }}
        >
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
            pinnedPostId={
              userDetails && userDetails.pinnedPost
                ? userDetails.pinnedPost._id
                : null
            }
            pinPost={pinPost}
          />
        </div>
      </>
    );
  };

  return (
    <div className="profile">
      {!profileState.userLoading &&
      profileState.profile &&
      !profileState.error ? (
        <>
          <h2>
            {profileState.profile.firstName} {profileState.profile.lastName}
          </h2>
          {renderProfile()}
        </>
      ) : profileState.userLoading && !profileState.error ? (
        <Spinner width="60px" />
      ) : (
        <h4 className="profileFetchError">Error in Fetching Profile</h4>
      )}
      {modalOpen.open && (
        <ImageUploadModal
          token={token}
          username={userDetails.username || localStorage.getItem("userName")}
          closeUploadModal={closeUploadModal}
          uploadProfilePic={uploadProfilePic}
          photoType={modalOpen.type}
        />
      )}
    </div>
  );
};

export default Profile;
