import React from "react";
import "./SearchTab.scss";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import Post from "../../Homepage/PostsList/Post/Post";
import Spinner from "../../Spinner/Spinner";
import User from "../../FollowList/Users/User/User";

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

const SearchTab = ({
  selectTabIndex,
  posts,
  deletePost,
  retweetReq,
  viewSinglePostReq,
  likePostReq,
  postActionLoading,
  retweetActionLoading,
  goToProfile,
  submitReplyReq,
  disableReply,
  pinPost,
  pinnedPostId,
  postLoading,
  users,
  userLoading
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
        viewSinglePostReq={() =>
          viewSinglePostReq(
            post._id,
            post.replyTo ? post.replyTo.originalPost._id : null
          )
        }
        deletePost={deletePost}
        goToProfile={goToProfile}
        disableReply={disableReply}
        pinPost={() => pinPost(post._id)}
        pinnedPostId={pinnedPostId}
        submitReplyReq={submitReplyReq}
      />
    );
  });

  const renderUserList = users.map((user, index) => {
    return (
      <User
        key={user.username}
        firstName={user.firstName}
        lastName={user.lastName}
        username={user.username}
        profilePic={user.profilePic}
      />
    );
  });

  return (
    <Tabs onSelect={selectTabIndex}>
      <TabList>
        <Tab>Posts</Tab>
        <Tab>Users</Tab>
      </TabList>

      <TabPanel>{postLoading ? <Spinner width="60px" />: (posts.length > 0 ? renderPosts: <h3 className="notfound">No Posts Found.</h3>)}</TabPanel>
      <TabPanel>{userLoading ? <Spinner width="60px" />: (users.length > 0 ? renderUserList: <h3 className="notfound">No Users Found.</h3>)}</TabPanel>
    </Tabs>
  );
};

export default SearchTab;
