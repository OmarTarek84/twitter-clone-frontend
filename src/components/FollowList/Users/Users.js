import React from "react";
import User from "./User/User";
import "./Users.scss";

const Users = ({ following, followers, tabIndex, loggedinFollowing, followUser, followLoading, followIndex, userIndex }) => {
  let arrayToBeRendered = tabIndex === 0 ? following : followers;

  const renderFollowList = arrayToBeRendered.map((user, index) => {
    return (
      <User
        key={user.username}
        firstName={user.firstName}
        lastName={user.lastName}
        username={user.username}
        profilePic={user.profilePic}
        loggedinFollowing={loggedinFollowing}
        followUser={e => followUser(e, user.username, index)}
        followLoading={followLoading}
        followIndex={followIndex}
        userIndex={index}
        parentUserClicked={() => {}}
      />
    );
  });

  return renderFollowList;
};

export default Users;
