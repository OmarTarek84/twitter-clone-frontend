import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getPosts,
  likePost,
  replyPost,
  retweetPost,
  deletePost,
} from "../../store/Actions/post";
import {pinPostUser} from '../../store/Actions/user';
import "./Homepage.scss";
import Postfeed from "./Postfeed/Postfeed";
import PostsList from "./PostsList/PostsList";
import history from "../../history";
import Spinner from "../Spinner/Spinner";
import Paginate from "./Paginate/Paginate";
import Post from "./PostsList/Post/Post";

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

  const pinPost = postId => {
    dispatch(pinPostUser(postId));
  };

  return (
    <div className="homepage">
      <h1>Home</h1>
      <Postfeed />
      {
        (userDetails && userDetails.pinnedPost) &&
        <div className="pinnedPost">
          <Post
            postId={userDetails.pinnedPost._id}
            firstName={userDetails.pinnedPost.postedBy.firstName}
            lastName={userDetails.pinnedPost.postedBy.lastName}
            username={userDetails.pinnedPost.postedBy.username}
            content={userDetails.pinnedPost.content}
            pinnedPost={true}
            pinnedPostId={userDetails.pinnedPost._id}
            createdAt={timeDifference(
              new Date(),
              new Date(
                userDetails.pinnedPost.content
                  ? userDetails.pinnedPost.createdAt
                  : userDetails.pinnedPost.retweetData.createdAt
              )
            )}
            profilePic={userDetails.pinnedPost.postedBy.profilePic}
            likePostReq={() => likePostReq(userDetails.pinnedPost._id, userDetails.pinnedPost.replyTo ? userDetails.pinnedPost.replyTo.originalPost._id: null)}
            likes={userDetails.pinnedPost.likes}
            postActionLoading={postActionLoading}
            loggedInUsername={
              userDetails.username || localStorage.getItem("userName")
            }
            goToProfile={() => goToProfile(userDetails.pinnedPost.originalPost.postedBy.username)}
            retweetReq={() => retweetReq(userDetails.pinnedPost._id, userDetails.pinnedPost.retweetData ? userDetails.pinnedPost.retweetData._id: null)}
            retweetActionLoading={retweetActionLoading}
            retweetUsers={userDetails.pinnedPost.retweetUsers}
            retweetData={userDetails.pinnedPost.retweetData}
            submitReplyReq={submitReplyReq}
            replyToUsername={
              userDetails.pinnedPost.replyTo &&
              userDetails.pinnedPost.replyTo.originalPost
                ? userDetails.pinnedPost.replyTo.originalPost.postedBy.username
                : null
            }
            replyPostTypeReplyToUsername={userDetails.pinnedPost.postedBy.username}
            pinPost={() => pinPost(userDetails.pinnedPost._id)}
          />
        </div>
      }
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
          pinPost={pinPost}
          pinnedPost={false}
          pinnedPostId={userDetails && userDetails.pinnedPost ? userDetails.pinnedPost._id: null}
        />
      ) : (
        <Spinner width="45" />
      )}
    </div>
  );
};

export default Homepage;
