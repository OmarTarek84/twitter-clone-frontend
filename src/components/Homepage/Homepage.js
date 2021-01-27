import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPosts, likePost, replyPost, retweetPost, deletePost } from "../../store/Actions/post";
import "./Homepage.scss";
import Postfeed from "./Postfeed/Postfeed";
import PostsList from "./PostsList/PostsList";
import history from '../../history';
import Spinner from "../Spinner/Spinner";

const Homepage = () => {
  // const {userName} = useSelector(state => state.user);

  const dispatch = useDispatch();
  const { posts, postActionLoading, retweetActionLoading, postLoading, errorMessage } = useSelector(
    (state) => state.post
  );
  const { userDetails } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(getPosts());
  }, [dispatch]);

  const likePostReq = (postId, originalPostId) => {
    dispatch(likePost(postId, originalPostId));
  };

  const retweetReq = (postId) => {
    dispatch(retweetPost(postId));
  };

  const submitReplyReq = (formData, postId) => {
    dispatch(replyPost(formData.reply, postId));
  };

  const viewSinglePostReq = (postId, replyPostId) => {
    history.push(`/post/${replyPostId || postId}`, {
      postId: replyPostId || postId,
      backgroundGreenPostId: postId
    });
  };

  const deletePostReq = (postId, originalPostId) => {
    dispatch(deletePost(postId, originalPostId));
  };

  return (
    <div className="homepage">
      <h1>Home</h1>
      <Postfeed />
      {!postLoading && !errorMessage ? <PostsList
        loggedInUsername={
          userDetails ? userDetails.username : localStorage.getItem("username")
        }
        retweetReq={retweetReq}
        likePostReq={likePostReq}
        postActionLoading={postActionLoading}
        retweetActionLoading={retweetActionLoading}
        posts={posts}
        submitReplyReq={submitReplyReq}
        viewSinglePostReq={viewSinglePostReq}
        deletePost={deletePostReq}
      />: (
        <Spinner width="45" />
      )}
    </div>
  );
};

export default Homepage;
