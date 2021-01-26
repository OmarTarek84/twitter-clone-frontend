import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPosts, likePost, replyPost, retweetPost } from "../../store/Actions/post";
import "./Homepage.scss";
import Postfeed from "./Postfeed/Postfeed";
import PostsList from "./PostsList/PostsList";
import history from '../../history';

const Homepage = () => {
  // const {userName} = useSelector(state => state.user);

  const dispatch = useDispatch();
  const { posts, postActionLoading, retweetActionLoading } = useSelector(
    (state) => state.post
  );
  const { userDetails } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(getPosts());
  }, [dispatch]);

  const likePostReq = (postId) => {
    dispatch(likePost(postId));
  };

  const retweetReq = (postId) => {
    dispatch(retweetPost(postId));
  };

  const submitReplyReq = (formData, postId) => {
    dispatch(replyPost(formData.reply, postId));
  };

  const viewSinglePostReq = (postId, replyPostId) => {
    console.log('POSTID', postId);
    console.log('REPLY_POST_ID', replyPostId);
    console.log('=============')
    history.push(`/post/${replyPostId || postId}`, {
      postId: replyPostId || postId,
      backgroundGreenPostId: postId
    });
  };

  return (
    <div className="homepage">
      <h1>Home</h1>
      {/* <div className="found">
                {userName || localStorage.getItem('userName')}
            </div> */}
      <Postfeed />
      <PostsList
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
      />
    </div>
  );
};

export default Homepage;
