import React from "react";
import { Link } from "react-router-dom";
import "./Header.scss";
import history from '../../history';

const Header = () => {

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('email');
    localStorage.removeItem('userName');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('profilePic');
    history.push('/login');
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
        <button onClick={logout}>
          <i className="fa fa-sign-out-alt"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;
