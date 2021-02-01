import React from "react";
import "./Tabs.scss";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import Post from "../../Homepage/PostsList/Post/Post";

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

const TabsPosts = ({
  posts,
  deletePostReqGoHome,
  retweetReq,
  viewSinglePostReq,
  likePostReq,
  postActionLoading,
  retweetActionLoading,
  selectTabIndex,
  goToProfile,
  submitReplyReq,
  disableReply,
  pinPost,
  pinnedPostId
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
        loggedInUsername={localStorage.getItem("userName")}
        retweetReq={retweetReq}
        retweetActionLoading={retweetActionLoading}
        retweetUsers={post.retweetUsers}
        retweetData={post.retweetData}
        combineretweetsAndPosts={true}
        replyTo={post.replyTo || null}
        replyToUsername={
          post.replyTo && post.replyTo.originalPost
            ? post.replyTo.originalPost.postedBy.username
            : null
        }
        replyPostTypeReplyToUsername={post.postedBy.username}
        viewSinglePostReq={() => viewSinglePostReq(post._id, post.replyTo ? post.replyTo.originalPost._id: null)}
        deletePost={deletePostReqGoHome}
        goToProfile={goToProfile}
        disableReply={disableReply}
        pinPost={() => pinPost(post._id)}
        pinnedPostId={pinnedPostId}
        submitReplyReq={submitReplyReq}
      />
    );
  });

  return (
    <Tabs onSelect={selectTabIndex}>
      <TabList>
        <Tab>Posts</Tab>
        <Tab>Replies</Tab>
      </TabList>

      <TabPanel>
        {renderPosts}
      </TabPanel>
      <TabPanel>
        {renderPosts}
      </TabPanel>
    </Tabs>
  );
};

export default TabsPosts;
