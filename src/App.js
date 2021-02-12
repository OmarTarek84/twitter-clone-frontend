/* eslint-disable */
import React, { lazy, Suspense, useEffect } from "react";
import { Switch, Route, useLocation } from "react-router-dom";
import "./App.scss";
import Header from "./components/Header/Header";
import axios from "./axios";
import { useDispatch } from "react-redux";
import { LOGIN, SEND_MESSAGE } from "./store/Actions/actionTypes";
import history from "./history";
import { ToastContainer } from "react-toastify";
import Spinner from "./components/Spinner/Spinner";
import socketIOClient from "socket.io-client";

const Login = lazy(() => import("./pages/Auth/Login/Login"));
const Signup = lazy(() => import("./pages/Auth/Signup/Signup"));
const Homepage = lazy(() => import("./pages/Homepage/Homepage"));
const ViewPost = lazy(() => import("./pages/ViewPost/ViewPost"));
const Profile = lazy(() => import("./pages/Profile/Profile"));
const FollowList = lazy(() => import("./pages/FollowList/FollowList"));
const Search = lazy(() => import("./pages/Search/Search"));
const Messages = lazy(() => import("./pages/Messages/Messages"));
const NewMessage = lazy(() => import("./pages/NewMessage/NewMessage"));
const MessageChat = lazy(() => import("./pages/MessageChat/MessageChat"));
const Notifications = lazy(() => import("./pages/Notifications/Notifications"));

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
    const SOCKETENDPOINT =
    process.env.NODE_ENV === "development"
      ? "http://localhost:8080"
      : "/";
    const socket = socketIOClient(SOCKETENDPOINT, {transports: ['websocket']});
    if (localStorage.getItem("accessToken") && localStorage.getItem("email")) {
      const getUser = async () => {
        try {
          const response = await axios.get("/user/getUserByToken", {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("accessToken"),
            },
          });
          const userDetails = response.data;
          localStorage.setItem("email", userDetails.email);
          localStorage.setItem("userName", userDetails.username);
          localStorage.setItem("firstName", userDetails.firstName);
          localStorage.setItem("lastName", userDetails.lastName);
          localStorage.setItem("profilePic", userDetails.profilePic);
          socket.emit("loggedin", userDetails.email);
          socket.on("message received", (data) => {
            if (path.indexOf('/chat') > -1) {
              dispatch({
                type: SEND_MESSAGE,
                message: {
                  content: data.content,
                  _id: new Date(),
                  createdAt: data.createdAt,
                  updatedAt: data.createdAt,
                  sender: data.sender,
                  readBy: [],
                  chat: data.chatId,
                  error: false
                },
              });
            }
          });
          dispatch({
            type: LOGIN,
            token: localStorage.getItem("accessToken"),
            userDetails: userDetails,
          });
        } catch (err) {
          console.log(err);
          history.push("/login");
        }
      };
      getUser();
    }
    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  return (
    <div
      className="container-fluid"
      style={{
        backgroundColor:
          path === "/login" || path === "/signup" ? "#0099ff" : "white",
      }}
    >
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
                <Route
                  path="/profile/:username/follow"
                  exact
                  component={FollowList}
                />
                <Route path="/profile/:username" exact component={Profile} />
                <Route path="/messages/new" exact component={NewMessage} />
                <Route path="/messages" exact component={Messages} />
                <Route path="/chat/:id" exact component={MessageChat} />
                <Route path="/search" exact component={Search} />
                <Route path="/notifications" exact component={Notifications} />
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
