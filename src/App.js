/* eslint-disable */
import React, { lazy, Suspense, useEffect } from "react";
import { Switch, Route, useLocation } from "react-router-dom";
import "./App.scss";
import Header from "./components/Header/Header";
import axios from "./axios";
import { useDispatch } from "react-redux";
import { ADD_NOTIFICATION, LOGIN, SEND_MESSAGE } from "./store/Actions/actionTypes";
import history from "./history";
import { toast, ToastContainer } from "react-toastify";
import Spinner from "./components/Spinner/Spinner";
import useSocket from "./shared/socketCustomHook";
import NotificationToast from "./shared/NotificationToast/NotificationToast";
import ProtectedRoute from './shared/ProtectedRoute';

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
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));

const App = (props) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const {socket} = useSocket();

  const path = location.pathname;

  const renderHeader = () => {
    if (path !== "/login" && path !== "/signup") {
      return <Header />;
    } else {
      return null;
    }
  };

  useEffect(() => {
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
          socket.current.emit("loggedin", userDetails.email);
          socket.current.on("message received", (data) => {
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
          socket.current.on('notification received', data => {
            if (data.type !== 'newMessage') {
              dispatch({
                type: ADD_NOTIFICATION,
                notification: {
                  _id: data.postId ? data.postId: data.chatId,
                  opened: false,
                  userFrom: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    profilePic: data.profilePic,
                  },
                  notificationType: data.type === 'like' ? 'postLike': data.type,
                  postId: data.postId,
                  chatId: data.chatId,
                  createdAt: new Date()
                }
              });
            }
            if (data.type === 'newMessage' && history.location.pathname.indexOf('/chat') > -1) {
              return;
            } else {
              toast(<NotificationToast text={data.text} profilePic={data.profilePic} />, {
                onClick: () => {
                  if (data.type === "retweet" || data.type === 'like' || data.type === 'reply') {
                    history.push(`/post/${data.postId}`);
                  } else if (data.type === "follow") {
                    history.push(`/profile/${data.followUsername}`);
                  } else if (data.type === "newMessage") {
                    history.push(`/chat/${data.chatId}`);
                  }
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
                <ProtectedRoute
                  token={localStorage.getItem('accessToken')}
                  path="/post/:postId"
                  component={ViewPost}
                  exact
                />
                <ProtectedRoute
                  token={localStorage.getItem('accessToken')}
                  path="/profile/:username/follow"
                  component={FollowList}
                  exact
                />
                <ProtectedRoute
                  token={localStorage.getItem('accessToken')}
                  path="/profile/:username"
                  component={Profile}
                  exact
                />
                <ProtectedRoute
                  token={localStorage.getItem('accessToken')}
                  path="/messages/new"
                  component={NewMessage}
                  exact
                />
                <ProtectedRoute
                  token={localStorage.getItem('accessToken')}
                  path="/messages"
                  component={Messages}
                  exact
                />
                <ProtectedRoute
                  token={localStorage.getItem('accessToken')}
                  path="/chat/:id"
                  component={MessageChat}
                  exact
                />
                <ProtectedRoute
                  token={localStorage.getItem('accessToken')}
                  path="/search"
                  component={Search}
                  exact
                />
                <ProtectedRoute
                  token={localStorage.getItem('accessToken')}
                  path="/"
                  component={Homepage}
                  exact
                />
                <ProtectedRoute
                  token={localStorage.getItem('accessToken')}
                  path="/notificationsList"
                  component={Notifications}
                  exact
                />
                <Route path="*" component={NotFound} />
              </Switch>
            </main>
          </Suspense>
          {path !== "/login" && path !== "/signup" && (
            <div className="empty col-md-2"></div>
          )}
        </div>
      </div>
      <ToastContainer autoClose={4000} hideProgressBar={true} />
    </div>
  );
};

export default App;
