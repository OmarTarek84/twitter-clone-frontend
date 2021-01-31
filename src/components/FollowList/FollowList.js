import React, { useEffect, useReducer, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import axios from "../../axios";
import history from "../../history";
import { FOLLOW_USER } from "../../store/Actions/actionTypes";
import Spinner from "../Spinner/Spinner";
import "./FollowList.scss";
import Users from "./Users/Users";

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
        return {
          ...state,
        followers: [...state.followers, action.follower],
          followLoading: false,
        };
      } else {
        return {
          ...state,
        followers: state.followers.filter(
            (p) => p.username !== action.follower.username
        ),
          followLoading: false,
        };
      }
    default:
      return state;
  }
};

const FollowList = (props) => {
  const [listState, dispatch] = useReducer(reducer, initialState);
  const dispatch2 = useDispatch();

  const { userDetails } = useSelector((state) => state.user);

  const [tabIndex, settabIndex] = useState(
    history.location && history.location.state
      ? history.location.state.tabIndex
      : 0
  );

  const selectTabIndex = (index) => {
    settabIndex(index);
  };

  const followUser = async (username, index) => {
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
    });
    // if (response.data.type === "Add") {
    //   setifFollowing(true);
    // } else {
    //   setifFollowing(false);
    // }
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
            ) : (
              <Users
                following={listState.following}
                followUser={followUser}
                loggedinFollowing={userDetails ? userDetails.following : null}
                tabIndex={tabIndex}
                followLoading={listState.followLoading}
                followIndex={listState.followIndex}
              />
            )}
          </TabPanel>
          <TabPanel>
            {listState.listLoading ? (
              <Spinner width="60" />
            ) : listState.listError ? (
              listState.listError
            ) : (
              <Users
                followers={listState.followers}
                followUser={followUser}
                loggedinFollowing={userDetails ? userDetails.following : null}
                tabIndex={tabIndex}
                followLoading={listState.followLoading}
                followIndex={listState.followIndex}
              />
            )}
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
};

export default FollowList;
