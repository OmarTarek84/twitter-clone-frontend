import React from "react";
import { useForm } from "react-hook-form";
import "./Modal.scss";

const ReplyModal = ({
  profilePic,
  content,
  firstName,
  lastName,
  username,
  createdAt,
  closeModel,
  retweetedFirstName,
  retweetedLastName,
  postId,
  submitReplyReq
}) => {
  const { register, handleSubmit, errors } = useForm();

  const submitReply = (formData) => {
    submitReplyReq(formData, postId);
    closeModel();
  };

  return (
    <div className="backdrop">
      <div className="replyModal">
        <div className="titleP">
          <h2>Reply</h2>
          <i className="fa fa-times" onClick={closeModel}></i>
        </div>
        <div className="row postDetails">
          {retweetedFirstName ? (
            <span className="reposted">
              Retweeted By {retweetedFirstName} {retweetedLastName}
            </span>
          ) : null}
          <div className="profPic col-md-2">
            <img src={profilePic} alt={"gdfgfdg"} />
          </div>
          <div className="postDetails col-md-10">
            <div className="namesdate">
              <span className="firstLastName">
                {firstName} {lastName}
              </span>
              <span className="username">@{username}</span>
              <p className="date">{createdAt}</p>
              <div className="pinnedClose">
                <i className="fa fa-thumbtack"></i>
                <i className="fa fa-times"></i>
              </div>
            </div>
            <p className="postContent">{content}</p>
          </div>
        </div>
        <div className="postflex">
          <div className="profilePic">
            <img
              src={profilePic || localStorage.getItem("profilePic")}
              alt="profile pic"
            />
          </div>
          <form>
            <textarea
              name="reply"
              placeholder="Type Your Reply"
              ref={register({ required: true })}
            ></textarea>
          </form>
        </div>
        <div className="btnActions">
          <button
            onClick={handleSubmit(submitReply)}
            disabled={!!errors["reply"]}
            className="btn btn-primary"
          >
            Reply
          </button>
          <button onClick={closeModel} className="btn btn-danger">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReplyModal;
