import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import history from "../../history";
import { CLEAR_MESSAGES } from "../../store/Actions/actionTypes";
import { changeChatName, getChatMsgs, sendMessage } from "../../store/Actions/chat";
import Spinner from "../Spinner/Spinner";
import socketIOClient from "socket.io-client";
import ChatNameModel from "./ChatNameModel/ChatNameModel";
import "./MessageChat.scss";

const MessageChat = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { chatError, chatLoading, chat, messages, currentMessagesPage, totalMessagesPages } = useSelector((state) => state.chat);
  const { userDetails } = useSelector((state) => state.user);
  const [openModel, setOpenModel] = useState(false);

  const titleRef = useRef();
  const peoplesRef = useRef();
  const formRef = useRef();
  const messageChatRef = useRef();

  const socket = useRef();

  const SOCKETENDPOINT = process.env.NODE_ENV === 'development' ? 'http://localhost:8080': '/';

  const { handleSubmit, register, reset } = useForm();

  const sendMsg = formData => {
    const content = formData.msg;
    reset();
    const list = document.getElementById("sc");
    dispatch(sendMessage(location.pathname.split("/")[2], content)).then(() => {
      list.scrollTop = list.scrollHeight - list.clientHeight - 1;
    });
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
      socket.current = socketIOClient(SOCKETENDPOINT);

      socket.current.emit('join room', pathname);

      dispatch(getChatMsgs(pathname, 1, 30)).then(() => {

        if (titleRef.current && peoplesRef.current && formRef.current) {
          const allElementsHeightAdded = titleRef.current.getBoundingClientRect().height + peoplesRef.current.getBoundingClientRect().height + formRef.current.getBoundingClientRect().height + 26;
          document.querySelector('.messages').style.maxHeight = `calc(100vh - ${allElementsHeightAdded}px)`;
          var list = document.getElementById("sc");
          list.scrollTop = list.scrollHeight - list.clientHeight - 1;
        }
      });
    }
    return () => {
      dispatch({type: CLEAR_MESSAGES});
      socket.current.disconnect();
    }
  }, [location.pathname, dispatch]);

  const changeChatname = val => {
    closeChatNameModel();
    dispatch(changeChatName(location.pathname.split("/")[2], val));
  };

  const renderOwnMsg = (content, error) => {
    return (
      <div className="flCol">
      <span style={{
        opacity: error ? '.4': '1'
      }}>{content}</span>
      {error && <p className="error">Error Sending this message</p>}
      </div>
    )
  };

  const renderTheirsMsg = (profilePic, firstName, lastName, username, content, isFirst, isLast) => {
    return (
      <div className="fl" style={{marginTop: isFirst ? '12px': '0'}}>
        <div className="image">
          {isLast && <img src={profilePic} alt={username} />}
        </div>
        <div className="content-names">
          {isFirst && <span className="firstlastnames">{firstName} {lastName}</span>}
          <span className="content">{content}</span>
        </div>
      </div>
    )
  };

  const renderMessages = () => {
    return messages.map((msg, index) => {
      const username = userDetails ? userDetails.username: localStorage.getItem('userName');
      const isFirst = !messages[index - 1] || messages[index - 1].sender.username !== messages[index].sender.username;
      const isLast = !messages[index + 1] || !messages[index - 1] || (messages[index - 1].sender.username === messages[index].sender.username && messages[index + 1].sender.username !== messages[index].sender.username);
      const senderClassName = msg.sender.username === username ? 'own': 'theirs';
      return (
        <div className={`msg${index} ${senderClassName}`} key={msg._id}>
          {senderClassName === 'own' ? renderOwnMsg(msg.content, msg.error): renderTheirsMsg(msg.sender.profilePic, msg.sender.firstName, msg.sender.lastName, msg.sender.username, msg.content, isFirst, isLast)}
        </div>
      )
    });
  };

  const msgsScroll = () => {
      var list = document.getElementById("sc");
      if (list.scrollTop === 0 && currentMessagesPage + 1 <= totalMessagesPages) {
        dispatch(getChatMsgs(location.pathname.split("/")[2], currentMessagesPage + 1, 30)).then(() => {
          list.scrollTop = (list.scrollHeight - list.clientHeight) / 2
        });
      }
  };

  console.log('CHAT RENDERED')

  return (
    <>
    <div className="messagechat">
      <div className="title" ref={titleRef}>
        <h2>Chat</h2>
        <Link to="/messages/new">
          <i className="far fa-plus-square"></i>
        </Link>
      </div>
      {chat && <div className="peoplesChat" ref={peoplesRef}>{renderImageAndNames()}</div>}
      <div className="messages" ref={messageChatRef} id="sc" onScroll={msgsScroll}>
        {chatLoading ? (
          <Spinner width="60px" />
        ) : chatError ? (
          <h4 className="chaterror">{chatError}</h4>
        ) : renderMessages()}
      </div>
      <form className="submitMsg" ref={formRef} onSubmit={handleSubmit(sendMsg)}>
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
