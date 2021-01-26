import axios from "../../axios";
// import history from '../../history';
import {
  CREATE_POST,
  FETCH_POSTS,
  LIKE_LOADING,
  LIKE_POST,
  POST_ERROR,
  REPLY_TO_POST,
  RETWEET_LOADING,
  RETWEET_POST,
  UNRETWEET_POST,
} from "./actionTypes";

export const createPost = (formData) => {
  return async (dispatch, getState) => {
    try {
      const response = await axios.post("/post/create", formData, {
        headers: {
          Authorization:
            "Bearer " + getState().user.token || localStorage.getItem("accessToken"),
        },
      });
      dispatch({
        type: CREATE_POST,
        post: response.data.post,
      });
    } catch (err) {
      dispatch({
        type: POST_ERROR,
        errorMessage:
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : err.message,
      });
    }
  };
};

export const getPosts = () => {
  return async (dispatch, getState) => {
    try {
      const response = await axios.get("/post", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("accessToken"),
        },
      });
      console.log(response.data);
      dispatch({
        type: FETCH_POSTS,
        posts: response.data,
      });
    } catch (err) {
      dispatch({
        type: POST_ERROR,
        errorMessage:
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : err.message,
      });
    }
  };
};

export const likePost = (postId) => {
  return async (dispatch, getState) => {
    try {
      dispatch({
        type: LIKE_LOADING,
        postId: postId,
      });
      const response = await axios.put(
        `/post/like/${postId}`,
        {},
        {
          headers: {
            Authorization: "Bearer " + getState().user.token,
          },
        }
      );
      return dispatch({
        type: LIKE_POST,
        postId: response.data.postId,
        likes: response.data.likes,
      });
    } catch (err) {
      console.log(err);
      dispatch({
        type: POST_ERROR,
        errorMessage:
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : err.message,
      });
    }
  };
};

export const retweetPost = (postId) => {
  return async (dispatch, getState) => {
    const accessToken = getState().user.token;
    try {
      dispatch({
        type: RETWEET_LOADING,
        postId: postId,
      });
      const response = await axios.put(
        `/post/retweet/${postId}`,
        {},
        {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
        }
      );
      console.log(response.data);
      if (response.data.message === "success" && response.data.type === "add") {
        dispatch({
          type: RETWEET_POST,
          newlyAddedPost: response.data.newlyAddedPost,
          retweet: response.data.newlyAddedPost._id,
          postId: response.data.originalPostId,
          postedBy: response.data.newlyAddedPost.postedBy,
        });
      } else if (
        response.data.message === "success" &&
        response.data.type === "delete"
      ) {
        dispatch({
          type: UNRETWEET_POST,
          deletedPostId: response.data.deletedPostId,
          originalPostId: response.data.originalPostId,
          username: getState().user.userDetails.username,
        });
      }
    } catch (err) {
      console.log(err);
      dispatch({
        type: POST_ERROR,
        errorMessage:
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : err.message,
      });
    }
  };
};


export const replyPost = (replyText, postId) => {
  return async (dispatch, getState) => {
    try {
      const response = await axios.post(
        `/post/reply`,
        {
          replyText: replyText,
          postId: postId
        },
        {
          headers: {
            Authorization: "Bearer " + getState().user.token,
          },
        }
      );
      const p = await dispatch({
        type: REPLY_TO_POST,
        post: response.data,
        originalPostId: postId
      });
      return p;
    } catch(err) {
      console.log(err);
      dispatch({
        type: POST_ERROR,
        errorMessage:
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : err.message,
      });
    }
  };
};