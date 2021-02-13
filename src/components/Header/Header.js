import React from "react";
import { Link } from "react-router-dom";
import "./Header.scss";
import history from "../../history";
import { useDispatch, useSelector } from "react-redux";
import { LOGOUT } from "../../store/Actions/actionTypes";
import socketIOClient from "socket.io-client";

const Header = () => {
  const dispatch = useDispatch();
  const { userDetails } = useSelector((state) => state.user);

  const goToProfile = () => {
    history.push(
      `/profile/${userDetails.username || localStorage.getItem("userName")}`
    );
  };

  const logout = () => {
    const SOCKETENDPOINT =
      process.env.NODE_ENV === "development" ? "http://localhost:8080" : "/";
    const socket = socketIOClient(SOCKETENDPOINT);
    socket.emit("loggedout", localStorage.getItem("email"));
    localStorage.removeItem("accessToken");
    localStorage.removeItem("email");
    localStorage.removeItem("userName");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("profilePic");
    history.push("/login");
    dispatch({ type: LOGOUT });
  };

  return (
    <header className="col-md-1">
      <div className="navItem">
        <Link to="/">
          <i className="fab fa-twitter"></i>
        </Link>
      </div>
      <div className="navItem">
        <Link to="/">
          <i className="fa fa-home"></i>
        </Link>
      </div>
      <div className="navItem">
        <Link to="/search">
          <i className="fa fa-search"></i>
        </Link>
      </div>
      <div className="navItem">
        <Link to="/notificationsList">
          <i className="fa fa-bell"></i>
        </Link>
        {userDetails &&
        userDetails.numberOfNotifications &&
        userDetails.numberOfNotifications > 0 ? (
          <span className="no">{userDetails.numberOfNotifications}</span>
        ) : null}
      </div>
      <div className="navItem">
        <Link to="/messages">
          <i className="fa fa-envelope"></i>
        </Link>
      </div>
      <div className="navItem" onClick={goToProfile}>
        <Link to="/">
          <i className="fa fa-user"></i>
        </Link>
      </div>
      <div className="navItem">
        <button onClick={logout}>
          <i className="fa fa-sign-out-alt"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;
