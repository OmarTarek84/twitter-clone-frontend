import React from "react";
import "./User.scss";
import {Link} from 'react-router-dom';

const User = ({
  username,
  profilePic,
  firstName,
  lastName,
  loggedinFollowing,
  followUser,
  followLoading,
  followIndex,
  userIndex,
  parentUserClicked
}) => {
  const ifFollowing = loggedinFollowing
    ? loggedinFollowing.findIndex((u) => u.username === username) > -1
    : null;

  return (
    <div
      className="userDet"
      key={username}
      onClick={parentUserClicked}
    >
      <div className="details">
        <div className="picAndName">
          <img src={profilePic} alt={username} />
          <Link className="firstlastname" to={`/profile/${username}`} onClick={e => e.stopPropagation()}>
            {firstName} {lastName}
          </Link>
          <span className="username">@{username}</span>
        </div>
      </div>
      <div
        className="followBtn"
        style={{
          display:
            username === localStorage.getItem("userName") || (!followUser || !loggedinFollowing)
              ? "none"
              : "flex",
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
