import React, { useEffect, useReducer, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import axios from "../../axios";
import history from "../../history";
import { FOLLOW_USER } from "../../store/Actions/actionTypes";
import Spinner from "../../components/Spinner/Spinner";
import "./FollowList.scss";
import Users from "../../components/Users/Users";
import useSocket from "../../shared/socketCustomHook";

const initialState = {
  following: [],
  followers: [],
  username: null,
  listLoading: false,
  listError: null,
  firstName: null,
  lastName: null,
  followLoading: false,
  followIndex: 0,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "list_loading":
      return {
        ...state,
        listLoading: true,
        listError: null,
      };
    case "fetch_list":
      return {
        ...state,
        following: action.following,
        followers: action.followers,
        username: action.username,
        firstName: action.firstName,
        lastName: action.lastName,
        listLoading: false,
        listError: null,
      };
    case "list_error":
      return {
        ...state,
        listLoading: false,
        listError: action.listError,
      };
    case "follow_loading":
      return {
        ...state,
        followLoading: true,
        followIndex: action.followIndex,
      };
    case "follow_user":
      if (action.resType === "Add") {
        if (action.profileUsername === action.follower.username) {
          return {
            ...state,
            following: [...state.following, action.mainUserFollowing],
            followLoading: false,
          };
        } else {
          return {
            ...state,
            followLoading: false,
          };
        }
      } else {
        if (action.profileUsername === action.follower.username) {
          return {
            ...state,
            // followers: state.followers.filter(
            //   (p) => p.username !== action.follower.username
            // ),
            following: state.following.filter(p => p.username !== action.mainUserFollowing.username),
            followLoading: false,
          };
        } else {
          return {
            ...state,
            followLoading: false,
          };
        }
      };
    default:
      return state;
  }
};

const FollowList = (props) => {
  const [listState, dispatch] = useReducer(reducer, initialState);
  const dispatch2 = useDispatch();
  const {socket} = useSocket();

  const { userDetails } = useSelector((state) => state.user);

  const [tabIndex, settabIndex] = useState(
    history.location && history.location.state
      ? history.location.state.tabIndex
      : 0
  );

  const selectTabIndex = (index) => {
    settabIndex(index);
  };

  const followUser = async (e, username, firstName, lastName, profilePic, index) => {
    e.stopPropagation();
    dispatch({
      type: "follow_loading",
      followIndex: index,
    });
    const response = await axios.put(
      `/user/follow/${username}`,
      {},
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("accessToken"),
        },
      }
    );
    dispatch2({
      type: FOLLOW_USER,
      newfollowingUser:
        response.data && response.data.newfollowingUser
          ? response.data.newfollowingUser
          : null,
    });
    dispatch({
      type: "follow_user",
      follower: {
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        email: userDetails.email,
        profilePic: userDetails.profilePic,
        username: userDetails.username,
      },
      resType: response.data.type,
      tabIndex: tabIndex,
      profileUsername: props.match.params.username,
      mainUserFollowing: {
        firstName: firstName,
        lastName: lastName,
        profilePic: profilePic,
        username: username,
      }
    });
    if (response.data.type === "Add") {
      socket.current.emit('notification Sent', {
        notificationFrom: userDetails.username,
        notificationTo: [response.data.newfollowingUser.username],
        type: 'follow'
      });
    }
  };

  useEffect(() => {
    console.log(history.location);
    dispatch({ type: "list_loading" });
    const getFollowList = async () => {
      try {
        const response = await axios.get(
          `/user/followList/${props.match.params.username}`,
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("accessToken"),
            },
          }
        );
        console.log(response.data);
        dispatch({
          type: "fetch_list",
          following: response.data.following,
          followers: response.data.followers,
          username: response.data.username,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
        });
      } catch (err) {
        console.log(err);
        dispatch({
          type: "list_error",
          listError:
            err.response && err.response.data && err.response.data.message
              ? err.response.data.message
              : err.message,
        });
      }
    };
    if (
      !history.location ||
      !history.location.state ||
      !history.location.state.following
    ) {
      getFollowList();
    } else {
      dispatch({
        type: "fetch_list",
        following: history.location.state.following,
        followers: history.location.state.followers,
        username: history.location.state.username,
        firstName: history.location.state.firstName,
        lastName: history.location.state.lastName,
      });
    }
  }, [props.match.params.username]);

  return (
    <div className="followlist">
      <h2>
        {listState && listState.firstName}{" "}
        {listState.lastName && listState.lastName}
      </h2>
      <div className="tabs">
        <Tabs onSelect={selectTabIndex} defaultIndex={tabIndex}>
          <TabList>
            <Tab>Following</Tab>
            <Tab>Followers</Tab>
          </TabList>

          <TabPanel>
            {listState.listLoading ? (
              <Spinner width="60" />
            ) : listState.listError ? (
              listState.listError
            ) :
              listState.following.length > 0 ?
              <Users
                following={listState.following}
                followUser={followUser}
                loggedinFollowing={userDetails ? userDetails.following : null}
                tabIndex={tabIndex}
                followLoading={listState.followLoading}
                followIndex={listState.followIndex}
              />
              :
              <h4 className="nofollow">You are not following any users yet</h4>
            }
          </TabPanel>
          <TabPanel>
            {listState.listLoading ? (
              <Spinner width="60" />
            ) : listState.listError ? (
              listState.listError
            ) :
              listState.followers.length > 0 ?
              <Users
                followers={listState.followers}
                followUser={followUser}
                loggedinFollowing={userDetails ? userDetails.following : null}
                tabIndex={tabIndex}
                followLoading={listState.followLoading}
                followIndex={listState.followIndex}
              />
              :
              <h4 className="nofollow">You have no followers yet</h4>
            }
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
};

export default FollowList;
