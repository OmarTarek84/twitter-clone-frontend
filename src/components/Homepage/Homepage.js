import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getPosts,
  likePost,
  replyPost,
  retweetPost,
  deletePost,
} from "../../store/Actions/post";
import "./Homepage.scss";
import Postfeed from "./Postfeed/Postfeed";
import PostsList from "./PostsList/PostsList";
import history from "../../history";
import Spinner from "../Spinner/Spinner";
import Paginate from "./Paginate/Paginate";

const Homepage = () => {
  // const {userName} = useSelector(state => state.user);

  const dispatch = useDispatch();
  const {
    posts,
    postActionLoading,
    retweetActionLoading,
    postLoading,
    errorMessage,
    currentPage,
    pageSize,
    pages,
    totalItemsCount,
  } = useSelector((state) => state.post);
  const { userDetails } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(getPosts(1, 30));
  }, [dispatch]);

  const likePostReq = (postId, originalPostId) => {
    dispatch(likePost(postId, originalPostId));
  };

  const retweetReq = (postId, originalPostId) => {
    dispatch(retweetPost(postId, originalPostId));
  };

  const submitReplyReq = (formData, postId) => {
    dispatch(replyPost(formData.reply, postId));
  };

  const viewSinglePostReq = (postId, replyPostId) => {
    history.push(`/post/${replyPostId || postId}`, {
      postId: replyPostId || postId,
      backgroundGreenPostId: postId,
    });
  };

  const deletePostReq = (postId, originalPostId) => {
    dispatch(deletePost(postId, originalPostId));
  };

  const handlePageChange = (pageNumber) => {
    dispatch(getPosts(pageNumber, 30));
  };

  const goToProfile = username => {
    history.push(`/profile/${username}`);
  };

  return (
    <div className="homepage">
      <h1>Home</h1>
      <Postfeed />
      {pages > 1 && (
        <div className="paginate">
          <Paginate
            handlePageChange={handlePageChange}
            currentPage={currentPage}
            pageSize={pageSize}
            pages={pages}
            totalItemsCount={totalItemsCount}
          />
        </div>
      )}
      {!postLoading && !errorMessage ? (
        <PostsList
          loggedInUsername={
            userDetails
              ? userDetails.username
              : localStorage.getItem("username")
          }
          retweetReq={retweetReq}
          likePostReq={likePostReq}
          postActionLoading={postActionLoading}
          retweetActionLoading={retweetActionLoading}
          posts={posts}
          submitReplyReq={submitReplyReq}
          viewSinglePostReq={viewSinglePostReq}
          deletePost={deletePostReq}
          goToProfile={goToProfile}
        />
      ) : (
        <Spinner width="45" />
      )}
    </div>
  );
};

export default Homepage;
