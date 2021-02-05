import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import history from "../../history";
import { changeChatName, getChatMsgs } from "../../store/Actions/chat";
import Spinner from "../Spinner/Spinner";
import ChatNameModel from "./ChatNameModel/ChatNameModel";
import "./MessageChat.scss";

const MessageChat = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { chatError, chatLoading, chat } = useSelector((state) => state.chat);
  const [openModel, setOpenModel] = useState(false);

  const { handleSubmit, register } = useForm();

  const sendMsg = formData => {
    console.log(formData);
  };

  const openChatNameModel = () => {
    setOpenModel(true);
  };
  const closeChatNameModel = () => {
    setOpenModel(false);
  };

  const renderImageAndNames = () => {
    if (chat) {
      const chatUsers = chat.users.filter(
        (user) => user.username !== localStorage.getItem("userName")
      );
      const groupChatNames = chatUsers.map(
        (user) => user.firstName + " " + user.lastName
      );
      if (chat.isGroupChat && chatUsers[1]) {
        return (
          <>
            <div className="images">
              <img
                className="firstImg"
                src={chatUsers[0].profilePic}
                alt={chatUsers[0].username}
              />
              <img
                className="secondImg"
                src={chatUsers[1].profilePic}
                alt={chatUsers[1].username}
              />
              {chatUsers.length > 2 && <span className="usersLeft">+{chatUsers.length - 2}</span>}
            </div>
            <span className="chatname" onClick={openChatNameModel}>{chat.chatName ? chat.chatName: groupChatNames.join(", ")}</span>
          </>
        );
      } else {
        return (
          <>
            <div className="image">
              <img
                className="singleImg"
                src={chatUsers[0].profilePic}
                alt={chatUsers[0].username}
              />
            </div>
            <span className="chatname">
              {chatUsers[0].firstName + " " + chatUsers[0].lastName}
            </span>
          </>
        );
      }
    }
  };

  useEffect(() => {
    const pathname = location.pathname.split("/")[2];
    if (!pathname) {
      history.push("/messages");
    } else {
      dispatch(getChatMsgs(pathname)).then(() => {});
    }
  }, [location.pathname, dispatch]);

  const changeChatname = val => {
    closeChatNameModel();
    dispatch(changeChatName(location.pathname.split("/")[2], val));
  };

  return (
    <>
    <div className="messagechat">
      <div className="title">
        <h2>Chat</h2>
        <Link to="/messages/new">
          <i className="far fa-plus-square"></i>
        </Link>
      </div>
      {chat && <div className="peoplesChat">{renderImageAndNames()}</div>}
      <div className="chats">
        {chatLoading ? (
          <Spinner width="60px" />
        ) : chatError ? (
          <h4 className="chaterror">{chatError}</h4>
        ) : (
          <h1>Success</h1>
        )}
      </div>
      <form className="submitMsg" onSubmit={handleSubmit(sendMsg)}>
        <input type="text" name="msg" placeholder="Type a message..." ref={register({ required: true })} />
        <button type="submit">
          <i className="fas fa-paper-plane"></i>
        </button>
      </form>
    </div>
    {openModel && <ChatNameModel closeChatNameModel={closeChatNameModel} changeChatname={changeChatname} />}
    </>
  );
};

export default MessageChat;
