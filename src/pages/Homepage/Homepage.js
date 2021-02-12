import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getPosts,
  likePost,
  replyPost,
  retweetPost,
  deletePost,
} from "../../store/Actions/post";
import { pinPostUser } from "../../store/Actions/user";
import "./Homepage.scss";
import Postfeed from "../../components/Homepage/Postfeed/Postfeed";
import PostsList from "../../components/Homepage/PostsList/PostsList";
import history from "../../history";
import Spinner from "../../components/Spinner/Spinner";
import Paginate from "../../components/Paginate/Paginate";
import Post from "../../components/Homepage/PostsList/Post/Post";
import { toast } from "react-toastify";

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

  const deleteToastId = useRef();
  const pinToastId = useRef();
  const replyToastId = useRef();
  const retweetToastId = useRef();

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
    dispatch(getPosts(1, 30, ""));
  }, [dispatch]);

  const likePostReq = (postId, originalPostId) => {
    dispatch(likePost(postId, originalPostId));
  };

  const retweetReq = (postId, originalPostId) => {
    retweetToastId.current = toast.warning("Submitting Your retweet...");
    dispatch(retweetPost(postId, originalPostId)).then(() => {
      toast.dismiss(retweetToastId.current);
      toast.success("Retweet Success");
    });
  };

  const submitReplyReq = (formData, postId) => {
    replyToastId.current = toast.warning("Submitting Your Reply...");
    dispatch(replyPost(formData.reply, postId)).then(() => {
      toast.dismiss(replyToastId.current);
      toast.success("Reply Post Success");
    });
  };

  const viewSinglePostReq = (postId, replyPostId) => {
    history.push(`/post/${replyPostId || postId}`, {
      postId: replyPostId || postId,
      backgroundGreenPostId: postId,
    });
  };

  const deletePostReq = (postId, originalPostId) => {
    deleteToastId.current = toast.warning("Delete post in progress");
    dispatch(deletePost(postId, originalPostId)).then(() => {
      toast.dismiss(deleteToastId.current);
      toast.success("Delete Post Success");
    });
  };

  const handlePageChange = (pageNumber) => {
    dispatch(getPosts(pageNumber, 30, ""));
  };

  const goToProfile = (username) => {
    history.push(`/profile/${username}`);
  };

  const pinPost = (postId) => {
    pinToastId.current = toast.warning("Pinning Post...");
    dispatch(pinPostUser(postId)).then(() => {
      toast.dismiss(pinToastId.current);
      toast.success("Pin Post Success");
    });
  };

  return (
    <div className="homepage">
      <h1>Home</h1>
      <Postfeed />
      {userDetails && userDetails.pinnedPost && (
        <div className="pinnedPost">
          <Post
            postId={userDetails.pinnedPost._id}
            firstName={userDetails.pinnedPost.postedBy.firstName}
            lastName={userDetails.pinnedPost.postedBy.lastName}
            username={userDetails.pinnedPost.postedBy.username}
            content={userDetails.pinnedPost.content}
            pinnedPost={true}
            viewSinglePostReq={() =>
              viewSinglePostReq(
                userDetails.pinnedPost._id,
                userDetails.pinnedPost.replyTo
                  ? userDetails.pinnedPost.replyTo.originalPost._id
                  : null
              )
            }
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
            likePostReq={() =>
              likePostReq(
                userDetails.pinnedPost._id,
                userDetails.pinnedPost.replyTo
                  ? userDetails.pinnedPost.replyTo.originalPost._id
                  : null
              )
            }
            likes={userDetails.pinnedPost.likes}
            postActionLoading={postActionLoading}
            loggedInUsername={
              userDetails.username || localStorage.getItem("userName")
            }
            goToProfile={() =>
              goToProfile(userDetails.pinnedPost.postedBy.username)
            }
            retweetReq={() =>
              retweetReq(
                userDetails.pinnedPost._id,
                userDetails.pinnedPost.retweetData
                  ? userDetails.pinnedPost.retweetData._id
                  : null
              )
            }
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
            replyPostTypeReplyToUsername={
              userDetails.pinnedPost.postedBy.username
            }
            pinPost={() => pinPost(userDetails.pinnedPost._id)}
          />
        </div>
      )}
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
          pinnedPostId={
            userDetails && userDetails.pinnedPost
              ? userDetails.pinnedPost._id
              : null
          }
        />
      ) : postLoading && !errorMessage ? (
        <Spinner width="60px" />
      ) : (
        <h4 className="fetchpostserror">Error in Fetching Posts</h4>
      )}
    </div>
  );
};

export default Homepage;
