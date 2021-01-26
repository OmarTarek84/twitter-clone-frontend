import React from "react";
import { Link } from "react-router-dom";
import "./Header.scss";

const Header = () => {
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
        <Link to="/">
          <i className="fa fa-search"></i>
        </Link>
      </div>
      <div className="navItem">
        <Link to="/">
          <i className="fa fa-bell"></i>
        </Link>
        <span className="no">0</span>
      </div>
      <div className="navItem">
        <Link to="/">
          <i className="fa fa-user"></i>
        </Link>
      </div>
      <div className="navItem">
        <Link to="/">
          <i className="fa fa-sign-out-alt"></i>
        </Link>
      </div>
    </header>
  );
};

export default Header;
