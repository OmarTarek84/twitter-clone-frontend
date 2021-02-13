import React, { useEffect, useReducer, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deletePost, likePost, replyPost, retweetPost } from "../../store/Actions/post";
import Post from "../../components/Homepage/PostsList/Post/Post";
import axios from "../../axios";
import "./ViewPost.scss";
import Spinner from "../../components/Spinner/Spinner";
import history from "../../history";
import { pinPostUser } from "../../store/Actions/user";
import { toast } from "react-toastify";
import useSocket from "../../shared/socketCustomHook";

const timeDifference = (current, previous) => {
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;

  const elapsed = current - previous;

  if (elapsed < msPerMinute) {
    if (elapsed / 1000 < 30) return "Just Now";
    return Math.round(elapsed / 1000) + " seconds ago";
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + " minutes ago";
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + " hours ago";
  } else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + " days ago";
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + " months ago";
  } else {
    return Math.round(elapsed / msPerYear) + " years ago";
  }
};

const initialState = {
  postLoading: false,
  postDetails: null,
  postErrorMessage: null,
  postLoaded: false
};

const reducer = (state, action) => {
  switch (action.type) {
    case "fetch_post":
      return {
        ...state,
        postDetails: action.post,
        postErrorMessage: null,
        postLoading: false,
        postLoaded: true
      };
    case "post_loading":
      return {
        ...state,
        postLoading: true,
      };
    case "post_error":
      return {
        ...state,
        postErrorMessage: action.error,
        postLoading: false,
      };
    case "add_reply":
      return {
        ...state,
        postLoading: false,
        postDetails: {
          ...state.postDetails,
          replies: [...state.postDetails.replies, action.reply],
        },
      };
    case "retweet":
      let retweetUsers = [...state.postDetails.retweetUsers];
      const retweetUsersIndex = retweetUsers.findIndex(u => u.username === localStorage.getItem('userName'));
      if (retweetUsersIndex > -1) {
        retweetUsers = retweetUsers.filter(u => u.username !== localStorage.getItem('userName'));
      } else {
        retweetUsers.unshift({
          firstName: localStorage.getItem('firstName'),
          lastName: localStorage.getItem('lastName'),
          username: localStorage.getItem('userName'),
          profilePic: localStorage.getItem('profilePic'),
        });
      }
      return {
        ...state,
        postDetails: {
          ...state.postDetails,
          retweetUsers: retweetUsers
        }
      };
    case 'like_post':
      const allPostLikes = [...state.postDetails.likes];
      if (action.postId === state.postDetails._id) {
        const likeUserFoundIndex = allPostLikes.findIndex(like => like.username === localStorage.getItem('userName'));
        if (likeUserFoundIndex > -1) {
          allPostLikes.splice(likeUserFoundIndex, 1);
        } else {
          allPostLikes.push({
            firstName: localStorage.getItem('firstName'),
            lastName: localStorage.getItem('lastName'),
            username: localStorage.getItem('userName'),
            profilePic: localStorage.getItem('profilePic'),
          });
        }
      } else {
        const foundReplyPost = state.postDetails.replies.find(
          (p) => p._id === action.postId
        );
        console.log(foundReplyPost);
        if (foundReplyPost) {
          const findUserLikeIndex = foundReplyPost.likes.findIndex(
            (p) => p.username === localStorage.getItem('userName')
          );
          if (findUserLikeIndex > -1) {
            foundReplyPost.likes.splice(findUserLikeIndex, 1);
          } else {
            foundReplyPost.likes.push({
              firstName: localStorage.getItem('firstName'),
              lastName: localStorage.getItem('lastName'),
              profilePic: localStorage.getItem('profilePic'),
              username: localStorage.getItem('userName'),
            });
          }
        }
      }
      return {
        ...state,
        postDetails: {
          ...state.postDetails,
          likes: [...allPostLikes]
        },
      };
    case 'delete_reply_post':
      const allReplies = [...state.postDetails.replies];
      const foundReplyPostIndex = allReplies.findIndex(r => r._id === action.replyPostId);
      allReplies.splice(foundReplyPostIndex, 1);
      return {
        ...state,
        postDetails: {
          ...state.postDetails,
          replies: [...allReplies]
        }
      };
    default:
      return state;
  }
};

const ViewPost = (props) => {
  const dispatch2 = useDispatch();
  const [postState, dispatch] = useReducer(reducer, initialState);
  const { userDetails } = useSelector((state) => state.user);
  const { postActionLoading, retweetActionLoading, posts } = useSelector(
    (state) => state.post
  );

  const {socket} = useSocket();

  const deleteToastId = useRef();
  const pinToastId = useRef();
  const replyToastId = useRef();
  const retweetToastId = useRef();

  const likePostReq = (postId, originalPostId, postedByUsername) => {
    dispatch2(likePost(postId, originalPostId));
    if (postedByUsername !== userDetails.username) {
      socket.current.emit('notification Sent', {
        notificationFrom: userDetails.username,
        notificationTo: [postedByUsername],
        type: 'like',
        postId: postId
      });
    }
    // here if condition because there's already a reducer that does this dispatch in posts array
    if (posts.length <= 0) {
      dispatch({
        type: 'like_post',
        postId: postId,
      });
    }

  };

  const submitReplyReq = async (formData, postId, postedByUsername) => {
    replyToastId.current = toast.warning('Submitting Your Reply...');
    const result = await dispatch2(replyPost(formData.reply, postId));
    toast.dismiss(replyToastId.current);
    toast.success('Reply Post Success');
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

  const deletePostReq = (postId, originalPostId) => {
    deleteToastId.current = toast.warning('Deleting Your Post...');
    dispatch({
      type: 'delete_reply_post',
      replyPostId: postId
    });
    dispatch2(deletePost(postId, originalPostId)).then(() => {
      toast.dismiss(deleteToastId.current);
      toast.success('Delete Post Success');
    });
  };

  const pinPost = postId => {
    pinToastId.current = toast.warning('Pinning Post...');
    dispatch2(pinPostUser(postId)).then(() => {
      toast.dismiss(pinToastId.current);
      toast.success('Pin Post Success');
    });
  };

  const retweetReq = (postId, originalPostId, postedByUsername) => {
    if (posts.length <= 0) {
      dispatch({
        type: "retweet",
        postId: postId
      });
    }
    retweetToastId.current = toast.warning('Submitting Your retweet...');
    dispatch2(retweetPost(postId, originalPostId)).then(() => {
      toast.dismiss(retweetToastId.current);
      toast.success('Retweet Success');
      if (postedByUsername !== userDetails.username) {
        socket.current.emit('notification Sent', {
          notificationFrom: userDetails.username,
          notificationTo: [postedByUsername],
          type: 'retweet',
          postId: postId
        });
      }
    });
  };

  const deletePostReqGoHome = (postId, originalPostId) => {
    dispatch({type: 'post_loading'});
    dispatch2(deletePost(postId, originalPostId)).then(() => {
      history.push('/');
    });
  };

  const goToProfile = username => {
    history.push(`/profile/${username}`);
  };

  useEffect(() => {
    if ((!posts || posts.length <= 0 || !history.location.state || !history.location.state.postId) && !postState.postLoaded) {
      dispatch({
        type: "post_loading",
      });
      const getSinglePost = async () => {
        try {
          const response = await axios.get(
            `/post/${props.match.params.postId}`,
            {
              headers: {
                Authorization: "Bearer " + localStorage.getItem("accessToken"),
              },
            }
          );
          console.log("responsedata", response.data);
          dispatch({
            type: "fetch_post",
            post: response.data,
          });
        } catch (err) {
          dispatch({
            type: "post_error",
            error:
              err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : err.message,
          });
        }
      };
      getSinglePost();
    } else {

      if (posts.length > 0 && history.location.state && history.location.state.postId) {

        const foundPost = posts.find(
          (post) => post._id === history.location.state.postId
        );
        dispatch({
          type: "fetch_post",
          post: foundPost,
        });

      }

    }

  }, [props.match.params.postId, posts, postState.postLoaded]);

  const renderReplies =
    postState.postDetails &&
    postState.postDetails.replies.map((postreply) => {
      return (
        <Post
          key={postreply._id}
          postId={postreply._id}
          firstName={postreply.postedBy.firstName}
          lastName={postreply.postedBy.lastName}
          username={postreply.postedBy.username}
          content={postreply.content}
          createdAt={timeDifference(
            new Date(),
            new Date(
              postreply.content
                ? postreply.createdAt
                : postreply.retweetData.createdAt
            )
          )}
          goToProfile={goToProfile}
          profilePic={postreply.postedBy.profilePic}
          likePostReq={likePostReq}
          replyTo={postreply.replyTo || null}
          likes={postreply.likes}
          deletePost={deletePostReq}
          postActionLoading={postActionLoading}
          loggedInUsername={
            userDetails ? userDetails.username: localStorage.getItem("userName")
          }
          retweetReq={retweetReq}
          retweetActionLoading={retweetActionLoading}
          retweetUsers={postreply.retweetUsers || []}
          retweetData={postreply.retweetData}
          submitReplyReq={submitReplyReq}
          pinPost={() => pinPost(postreply._id)}
          pinnedPostId={userDetails && userDetails.pinnedPost ? userDetails.pinnedPost._id: null}
          disableBorderBottom={true}
          replyToUsername={
            postreply.replyTo && postreply.replyTo.originalPost
              ? postreply.replyTo.originalPost.postedBy.username
              : null
          }
          type="replyPost"
          replyPostTypeReplyToUsername={postState.postDetails.postedBy.username}
          postIdHasGreenBackground={
            history.location.state
              ? history.location.state.backgroundGreenPostId
              : null
          }
        />
      );
    });

  console.log("VIEWPOST RENDERED");

  const renderPostWithReplies = () => {
    return postState && !postState.postLoading && postState.postDetails ? (
      <>
        <Post
          postId={postState.postDetails._id}
          firstName={postState.postDetails.postedBy.firstName}
          lastName={postState.postDetails.postedBy.lastName}
          username={postState.postDetails.postedBy.username}
          content={postState.postDetails.content}
          createdAt={timeDifference(
            new Date(),
            new Date(
              postState.postDetails.content
                ? postState.postDetails.createdAt
                : postState.postDetails.retweetData.createdAt
            )
          )}
          profilePic={postState.postDetails.postedBy.profilePic}
          likePostReq={likePostReq}
          likes={postState.postDetails.likes}
          postActionLoading={postActionLoading}
          loggedInUsername={
            userDetails ? userDetails.username: localStorage.getItem("userName")
          }
          goToProfile={goToProfile}
          retweetReq={retweetReq}
          retweetActionLoading={retweetActionLoading}
          retweetUsers={postState.postDetails.retweetUsers}
          retweetData={postState.postDetails.retweetData}
          submitReplyReq={submitReplyReq}
          replyToUsername={
            postState.postDetails.replyTo &&
            postState.postDetails.replyTo.originalPost
              ? postState.postDetails.replyTo.originalPost.postedBy.username
              : null
          }
          replyPostTypeReplyToUsername={postState.postDetails.postedBy.username}
          deletePost={deletePostReqGoHome}
          pinnedPost={false}
          pinnedPostId={userDetails && userDetails.pinnedPost ? userDetails.pinnedPost._id: null}
          pinPost={() => pinPost(postState.postDetails._id)}
        />
        {postState.postDetails.replies &&
          postState.postDetails.replies.length > 0 && <h5>Replies:</h5>}
        {postState.postDetails.replies &&
          postState.postDetails.replies.length > 0 &&
          renderReplies}
      </>
    ) : (
      <Spinner width="80" />
    );
  };

  return (
    <div className="viewpost">
      <h1>View Post</h1>
      {postState.postErrorMessage ? (
        <p className="error">{postState.postErrorMessage}</p>
      ) : (
        renderPostWithReplies()
      )}
    </div>
  );
};

export default ViewPost;
