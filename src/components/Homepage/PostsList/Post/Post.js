import React, { useState } from "react";
import ReplyModal from "./Modal/Modal";
import "./Post.scss";

const Post = ({
  postId,
  firstName,
  lastName,
  username,
  profilePic,
  content,
  createdAt,
  likePostReq,
  likes,
  postActionLoading,
  loggedInUsername,
  retweetReq,
  retweetActionLoading,
  retweetUsers,
  retweetData,
  submitReplyReq,
  replyToUsername,
  viewSinglePostReq,
  type,
  replyPostTypeReplyToUsername,
  goToReplyOriginalPost,
  disableBorderBottom,
  postIdHasGreenBackground,
}) => {
  const likePost = (e) => {
    e.stopPropagation();
    likePostReq(postId);
  };

  const retweet = (e) => {
    retweetReq(postId);
    e.stopPropagation();
  };

  const [modalOpen, setmodalOpen] = useState(false);

  const closeModel = () => {
    setmodalOpen(false);
  };

  const openModel = (e) => {
    e.stopPropagation();
    setmodalOpen(true);
  };

  const goToViewPost = (e) => {
    e.stopPropagation();
    goToReplyOriginalPost();
  };

  return (
    <>
      <div
        className="postParent"
        onClick={viewSinglePostReq}
        style={{
          borderBottom: disableBorderBottom ? "none" : "1px solid #dddada",
          backgroundColor: postIdHasGreenBackground && postIdHasGreenBackground === postId ? 'rgba(1, 152, 117, .17)': "white"
        }}
      >
        {!content ? (
          <span className="reposted">
            Retweeted By {firstName} {lastName}
          </span>
        ) : null}
        <div className="row">
          <div className="profPic col-md-2">
            <img
              src={content ? profilePic : retweetData.postedBy.profilePic}
              alt={content ? firstName : retweetData.postedBy.profilePic}
            />
          </div>
          <div className="postDetails col-md-10">
            <div className="namesdate">
              <span className="firstLastName">
                {content ? firstName : retweetData.postedBy.firstName}{" "}
                {content ? lastName : retweetData.postedBy.lastName}
              </span>
              <span className="username">
                @{content ? username : retweetData.postedBy.username}
              </span>
              <p className="date">{createdAt}</p>
              <div className="pinnedClose">
                <i className="fa fa-thumbtack"></i>
                <i className="fa fa-times"></i>
              </div>
            </div>
            {replyToUsername && (
              <p className="replyTo">
                Replying To{" "}
                <span onClick={goToViewPost}>
                  @{replyToUsername}'s post
                </span>
              </p>
            )}
            {/* {(replyPostTypeReplyToUsername && type === 'replyPost') && <p className="replyTo">Replying To <span onClick={goToViewPost}>@{replyPostTypeReplyToUsername}</span></p>} */}
            <p className="postContent">
              {content ? content : retweetData.content}
            </p>
            <div className="commentslikes">
              <button className="comment" type="button" onClick={openModel}>
                <i className="fa fa-comment"></i>
              </button>
              <button
                className="comment"
                disabled={
                  retweetActionLoading.postLoading &&
                  retweetActionLoading.postId === postId
                }
                style={{
                  color:
                    retweetUsers.findIndex(
                      (x) =>
                        x.username ===
                        (loggedInUsername || localStorage.getItem("userName"))
                    ) > -1
                      ? "green"
                      : "black",
                  display:
                    replyToUsername || type === "replyPost" ? "none" : "flex",
                }}
                onClick={retweet}
              >
                <i className="fa fa-retweet"></i>
                <span className="number">{retweetUsers.length}</span>
              </button>
              <button
                className="comment"
                disabled={
                  postActionLoading.postLoading &&
                  postActionLoading.postId === postId
                }
                onClick={likePost}
                style={{
                  color:
                    likes.findIndex(
                      (x) =>
                        x.username ===
                        (loggedInUsername || localStorage.getItem("userName"))
                    ) > -1
                      ? "red"
                      : "black",
                }}
              >
                <i className="far fa-heart"></i>
                <span className="number">{likes.length}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {modalOpen && (
        <ReplyModal
          profilePic={content ? profilePic : retweetData.postedBy.profilePic}
          content={content ? content : retweetData.content}
          firstName={content ? firstName : retweetData.postedBy.firstName}
          lastName={content ? lastName : retweetData.postedBy.lastName}
          username={content ? username : retweetData.postedBy.username}
          retweetedFirstName={!content && firstName}
          retweetedLastName={!content && lastName}
          createdAt={createdAt}
          closeModel={closeModel}
          postId={postId}
          submitReplyReq={submitReplyReq}
        />
      )}
    </>
  );
};

export default Post;
