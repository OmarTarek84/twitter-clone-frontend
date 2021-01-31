import React from "react";
import "./User.scss";

const User = ({
  username,
  profilePic,
  firstName,
  lastName,
  loggedinFollowing,
  followUser,
  followLoading,
  followIndex,
  userIndex
}) => {
  const ifFollowing = loggedinFollowing
    ? loggedinFollowing.findIndex((u) => u.username === username) > -1
    : null;

  return (
    <div
      className="userDet"
      key={username}
    >
      <div className="details">
        <div className="picAndName">
          <img src={profilePic} alt={username} />
          <span className="firstlastname">
            {firstName} {lastName}
          </span>
          <span className="username">@{username}</span>
        </div>
      </div>
      <div
        className="followBtn"
        style={{
          display:
            username === localStorage.getItem("userName")
              ? "none"
              : "inline-block",
        }}
      >
        <button
          style={{
            backgroundColor: ifFollowing ? "#00ACEE" : "white",
            color: ifFollowing ? "white" : "#00ACEE",
          }}
          disabled={followLoading && followIndex === userIndex}
          onClick={followUser}
        >
          {ifFollowing ? "Following" : "Follow"}
        </button>
      </div>
    </div>
  );
};

export default User;
