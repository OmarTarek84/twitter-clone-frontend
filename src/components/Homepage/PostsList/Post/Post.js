import React, { useState } from "react";
import ReplyModal from "./ReplyModal/ReplyModal";
import "./Post.scss";
import DeleteModal from "./DeleteModal/DeleteModal";

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
  viewSinglePostReq,
  type,
  replyPostTypeReplyToUsername,
  disableBorderBottom,
  postIdHasGreenBackground,
  deletePost,
  replyTo,
  goToProfile,
  disableReply,
  pinPost,
  pinnedPost,
  pinnedPostId
}) => {
  const likePost = (e) => {
    e.stopPropagation();
    likePostReq(postId, replyTo ? replyTo.originalPost._id: null);
  };

  const retweet = (e) => {
    retweetReq(postId, retweetData ? retweetData._id: null);
    e.stopPropagation();
  };

  const [replymodalOpen, setreplymodalOpen] = useState(false);
  const [deletemodalOpen, setdeletemodalOpen] = useState({open: false, type: 'delete'});

  const closeModel = () => {
    setreplymodalOpen(false);
  };

  const openReplyModal = (e) => {
    e.stopPropagation();
    setreplymodalOpen(true);
  };

  const goToProfileReq = e => {
    e.stopPropagation();
    goToProfile(replyTo.originalPost.postedBy.username);
  };

  const openDeleteModal = (e, modalType) => {
    e.stopPropagation();
    setdeletemodalOpen({
      open: true,
      type: modalType
    });
  };

  const closeDeleteModel = () => {
    setdeletemodalOpen({
      open: false,
      type: 'delete'
    });
  };

  const deletePostReq = () => {
    deletePost(postId, replyTo ? replyTo.originalPost.postedBy.username: null);
    closeDeleteModel();
  };
  
  const pinPostReq = () => {
    pinPost(postId);
    closeDeleteModel();
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
        {
          pinnedPost && (
            <div className="pinned">
              <i className="fa fa-thumbtack"></i>
              <span>Pinned Post</span>
            </div>
          )
        }
        <div className="row">
          <div className="profPic col-md-2">
            <img
              src={content ? profilePic : retweetData.postedBy.profilePic}
              alt={content ? firstName : retweetData.postedBy.profilePic}
            />
          </div>
          <div className="postDetails col-md-10">
            <div className="namesdate">
              <span className="firstLastName" onClick={(e) => {
                e.stopPropagation();
                goToProfile(content ? username : retweetData.postedBy.username)
              }}>
                {content ? firstName : retweetData.postedBy.firstName}{" "}
                {content ? lastName : retweetData.postedBy.lastName}
              </span>
              <span className="username">
                @{content ? username : retweetData.postedBy.username}
              </span>
              <p className="date">{createdAt}</p>
              <div className="pinnedClose">
                <i style={{
                  color: pinnedPostId && pinnedPostId === postId ? 'red': 'grey'
                }} onClick={(e) => openDeleteModal(e, 'pin')} className="fa fa-thumbtack"></i>
                <i onClick={(e) => openDeleteModal(e, 'delete')} style={{
                  display: username === loggedInUsername && !pinnedPost ? 'inline': 'none'
                }} className="fa fa-times"></i>
              </div>
            </div>
            {(replyTo && replyTo.originalPost) && (
              <p className="replyTo">
                Replying To{" "}
                <span onClick={goToProfileReq}>
                  @{replyTo.originalPost.postedBy.username}
                </span>
              </p>
            )}
            <p className="postContent">
              {content ? content : retweetData.content}
            </p>
            <div className="commentslikes">
              {/** start reply */}
              <button className="comment"
                      type="button"
                      onClick={openReplyModal}
                      style={{
                        display:
                          disableReply ? "none" : "flex"
                      }}>
                <i className="fa fa-comment"></i>
              </button>
              {/** end reply */}

              {/** start retweet */}
              <button
                className="comment"
                disabled={
                  (retweetActionLoading.postLoading)
                  ||
                  (
                    (!retweetData && username === localStorage.getItem("userName"))
                    ||
                    (retweetData && retweetData.postedBy.username === localStorage.getItem("userName"))
                  )
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
                    (replyTo && replyTo.originalPost) || type === "replyPost" ? "none" : "flex",
                }}
                onClick={retweet}
              >
                <i className="fa fa-retweet"></i>
                <span className="number">{retweetUsers.length}</span>
              </button>
              {/** end retweet */}

              {/** start like */}
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
      {replymodalOpen && (
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
      {deletemodalOpen.open && <DeleteModal deletePost={deletePostReq} modalType={deletemodalOpen.type} pinPostReq={pinPostReq} closeDeleteModel={closeDeleteModel} /> }
    </>
  );
};

export default Post;
