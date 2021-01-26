import React from "react";
import "./PostsList.scss";
import Post from "./Post/Post";

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

const PostsList = ({
  posts,
  likePostReq,
  postActionLoading,
  submitReplyReq,
  viewSinglePostReq,
  retweetActionLoading,
  loggedInUsername,
  retweetReq,
  deletePost
}) => {
  const renderPosts = posts.map((post) => {
    return (
      <Post
        key={post._id}
        postId={post._id}
        firstName={post.postedBy.firstName}
        lastName={post.postedBy.lastName}
        username={post.postedBy.username}
        content={post.content}
        createdAt={timeDifference(
          new Date(),
          new Date(post.content ? post.createdAt : post.retweetData.createdAt)
        )}
        profilePic={post.postedBy.profilePic}
        likePostReq={likePostReq}
        likes={post.likes}
        postActionLoading={postActionLoading}
        loggedInUsername={loggedInUsername}
        retweetReq={retweetReq}
        retweetActionLoading={retweetActionLoading}
        retweetUsers={post.retweetUsers}
        retweetData={post.retweetData}
        submitReplyReq={submitReplyReq}
        replyToUsername={
          post.replyTo && post.replyTo.originalPost ? post.replyTo.originalPost.postedBy.username : null
        }
        viewSinglePostReq={() => viewSinglePostReq(post._id, post.replyTo ? post.replyTo.originalPost._id: null)}
        goToReplyOriginalPost={() => viewSinglePostReq(post._id, post.replyTo.originalPost._id)}
        deletePost={() => deletePost(post._id, post.replyTo ? post.replyTo.originalPost._id: null)}
      />
    );
  });

  return <div className="posts">{renderPosts}</div>;
};

export default PostsList;
