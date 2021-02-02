import React, { lazy, Suspense, useEffect } from "react";
import { Switch, Route, useLocation } from "react-router-dom";
import "./App.scss";
import Header from "./components/Header/Header";
import axios from './axios';
import { useDispatch } from "react-redux";
import { LOGIN } from "./store/Actions/actionTypes";
import history from './history';
import { ToastContainer } from "react-toastify";
import Spinner from "./components/Spinner/Spinner";

const Login = lazy(() => import("./components/Auth/Login/Login"));
const Signup = lazy(() => import("./components/Auth/Signup/Signup"));
const Homepage = lazy(() => import("./components/Homepage/Homepage"));
const ViewPost = lazy(() => import("./components/ViewPost/ViewPost"));
const Profile = lazy(() => import("./components/Profile/Profile"));
const FollowList = lazy(() => import("./components/FollowList/FollowList"));
const Search = lazy(() => import("./components/Search/Search"));

const App = (props) => {
  const location = useLocation();
  const dispatch = useDispatch();

  const path = location.pathname;

  const renderHeader = () => {
    if (path !== "/login" && path !== "/signup") {
      return <Header />;
    } else {
      return null;
    }
  };

  useEffect(() => {
    if (localStorage.getItem('accessToken') && localStorage.getItem('email')) {
      const getUser = async () => {
        try {
          const response = await axios.get('/user/getUserByToken', {
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('accessToken')
            }
          });
          const userDetails = response.data;
          localStorage.setItem('email', userDetails.email);
          localStorage.setItem('userName', userDetails.username);
          localStorage.setItem('firstName', userDetails.firstName);
          localStorage.setItem('lastName', userDetails.lastName);
          localStorage.setItem('profilePic', userDetails.profilePic);
          dispatch({
              type: LOGIN,
              token: localStorage.getItem('accessToken'),
              userDetails: userDetails
          });
        } catch(err) {
          console.log(err);
          history.push('/login');
        }
      };
      getUser();
    }
  }, [dispatch]);

  return (
    <div className="container-fluid" style={{
      backgroundColor: path === "/login" || path === "/signup" ? "#0099ff" : "white",
    }}>
      <div className="container">
        <div
          className="allParent row"
          style={{
            justifyContent:
              path === "/login" || path === "/signup" ? "center" : null,
          }}
        >
          {renderHeader()}
          <Suspense fallback={<Spinner />}>
            <main
              className="col-md-9"
              style={{
                display:
                  path === "/login" || path === "/signup" ? "flex" : "block",
                flexDirection:
                  path === "/login" || path === "/signup" ? "column" : null,
                justifyContent:
                  path === "/login" || path === "/signup" ? "center" : null,
              }}
            >
              <Switch>
                <Route path="/signup" component={Signup} />
                <Route path="/login" component={Login} />
                <Route path="/post/:postId" component={ViewPost} />
                <Route path="/profile/:username/follow" exact component={FollowList} />
                <Route path="/profile/:username" exact component={Profile} />
                <Route path="/search" exact component={Search} />
                <Route path="/" exact component={Homepage} />
              </Switch>
            </main>
          </Suspense>
          {path !== "/login" && path !== "/signup" && (
            <div className="empty col-md-2"></div>
          )}
        </div>
      </div>
      <ToastContainer autoClose={4000} />
    </div>
  );
};

export default App;
