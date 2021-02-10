/* eslint-disable */
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CLEAR_USER_SEARCH } from "../../store/Actions/actionTypes";
import { searchUsers } from "../../store/Actions/user";
import User from "../FollowList/Users/User/User";
import history from "../../history";
import "./NewMessage.scss";
import { createChat } from "../../store/Actions/chat";
import Spinner from "../Spinner/Spinner";

const NewMessage = () => {
  const [inputVal, setInputVal] = useState("");
  const [selectedUsers, setSelectersUsers] = useState([]);
  const inputRef = useRef();
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.userSearch);
  const { chatLoading } = useSelector((state) => state.chat);

  const parentUserClicked = (user) => {
    setSelectersUsers((users) => [...users, user]);
    dispatch({ type: CLEAR_USER_SEARCH });
    setInputVal("");
  };

  const removeLastSelectedUsers = (e) => {
    if (e.key == "Backspace" && !inputRef.current.value) {
      console.log(selectedUsers);
      setSelectersUsers((users) =>
        users.filter((user, i) => i !== users.length - 1)
      );
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", removeLastSelectedUsers);
  }, []);

  useEffect(() => {
    if (!inputVal) {
      dispatch({ type: CLEAR_USER_SEARCH });
      return;
    }

    const timeoutId = setTimeout(() => {
      const mappedUsernames = selectedUsers.map((n) => n.username);
      const usernamesSelected = mappedUsernames.join(",");
      dispatch(searchUsers(0, 1000, inputVal, usernamesSelected));
    }, 400);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("keydown", removeLastSelectedUsers);
    };
  }, [inputVal, dispatch, selectedUsers]);

  const renderUserList = users.map((user, index) => {
    return (
      <User
        key={user.username}
        firstName={user.firstName}
        lastName={user.lastName}
        username={user.username}
        profilePic={user.profilePic}
        parentUserClicked={() => parentUserClicked(user)}
      />
    );
  });

  const createChatReq = () => {
    const mappedUsernames = selectedUsers.map((n) => n.username);
    dispatch(createChat(mappedUsernames, true)).then(() => {
      history.push("/messages");
    });
  };

  return (
    <>
      <div className="newmessage">
        <div className="h2">
          <h2>New Message</h2>
        </div>
        <div className="personsinput">
          <span>To: </span>
          <div className="users-input">
            <div className="users">
              {selectedUsers.map((selUser) => {
                return (
                  <span key={selUser.username}>
                    {selUser.firstName} {selUser.lastName}
                  </span>
                );
              })}
            </div>
            <div className="input">
              <input
                type="text"
                autoComplete="off"
                name="person"
                placeholder="Type the name of the person/s"
                value={inputVal}
                ref={inputRef}
                onFocus={() => dispatch(searchUsers(0, 1000, '', selectedUsers.map((n) => n.username)))}
                onChange={(e) => setInputVal(e.target.value)}
              />
            </div>
          </div>
        </div>
        {users && users.length > 0 && (
          <div className="usersTable">{renderUserList}</div>
        )}
      </div>
      <div className="createChatBtn">
        {chatLoading ? (
          <Spinner width="30px" />
        ) : (
          <button onClick={createChatReq} disabled={selectedUsers.length <= 0}>
            Create Chat
          </button>
        )}
      </div>
    </>
  );
};

export default NewMessage;
