import axios from "../../axios";
import socketIOClient from 'socket.io-client';
import {
  CHANGE_CHAT_NAME,
  CHAT_LOADING,
  CHAT_MESSAGES_ERROR,
  CREATE_CHAT,
  FETCH_CHAT_MESSAGES,
  SEND_MESSAGE,
  SEND_MESSAGE_ERROR,
  UPDATE_LATEST_MESSAGE,
} from "./actionTypes";

export const getChatMsgs = (chatId, currentPage, pageSize) => {
  return async (dispatch, getState) => {
    try {
      if (currentPage === 1) {
        dispatch({ type: CHAT_LOADING });
      }
      const token =
        getState().user && getState().user.token
          ? getState().user.token
          : localStorage.getItem("accessToken");
      const { data } = await axios.get(`/chat/getMessages?chatId=${chatId}&currentPage=${currentPage}&pageSize=${pageSize}`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });
      // console.log(data);
      dispatch({
        type: FETCH_CHAT_MESSAGES,
        chat: data.chat,
        messages: data.messages,
        currentPage: data.currentPage,
        pages: data.pages,
        messagesCount: data.messagesCount,
        pageSize: data.pageSize
      });
    } catch (err) {
      dispatch({
        type: CHAT_MESSAGES_ERROR,
        error:
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : err.message,
      });
    }
  };
};

export const createChat = (users, isGroupChat) => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: CHAT_LOADING });
      const { data } = await axios.post(
        `/chat/createChat?isGroupChat=${isGroupChat}`,
        { users },
        {
          headers: {
            Authorization:
              "Bearer " +
              (getState().user.token || localStorage.getItem("accessToken")),
          },
        }
      );
      const result = await dispatch({
        type: CREATE_CHAT,
        chat: data,
      });
      return result;
    } catch (err) {
      console.log(err);
    }
  };
};

export const changeChatName = (chatId, chatName) => {
  return async (dispatch, getState) => {
    try {
      await axios.put(
        `/chat/changeChatName?chatId=${chatId}`,
        { chatName },
        {
          headers: {
            Authorization:
              "Bearer " +
              (getState().user.token || localStorage.getItem("accessToken")),
          },
        }
      );
      dispatch({
        type: CHANGE_CHAT_NAME,
        chatName: chatName,
      });
    } catch (err) {
      console.log(err);
    }
  };
};

export const sendMessage = (chatId, content) => {
  return async (dispatch, getState) => {
    const newDate = new Date().toISOString();
    dispatch({
      type: SEND_MESSAGE,
      message: {
        content: content,
        _id: newDate,
        createdAt: new Date(),
        updatedAt: new Date(),
        sender: {
          coverPhoto: getState().user.userDetails.coverPhoto,
          firstName: getState().user.userDetails.firstName,
          lastName: getState().user.userDetails.lastName,
          profilePic: getState().user.userDetails.profilePic,
          username: getState().user.userDetails.username,
        },
        readBy: [],
        chat: chatId,
        error: false
      },
    });
    const SOCKETENDPOINT = process.env.NODE_ENV === 'development' ? 'http://localhost:8080': '/';
    const socket = socketIOClient(SOCKETENDPOINT, {transports: ['websocket']});
    socket.emit('sendMessage', {
      sender: {
        firstName: getState().user.userDetails.firstName,
        lastName: getState().user.userDetails.lastName,
        profilePic: getState().user.userDetails.profilePic,
        username: getState().user.userDetails.username,
        email: getState().user.userDetails.email,
      },
      content: content,
      chatId: chatId,
      createdAt: new Date()
    });
    try {
      await axios.post(
        `/chat/sendMessage?chatId=${chatId}`,
        { content },
        {
          headers: {
            Authorization:
              "Bearer " +
              (getState().user.token || localStorage.getItem("accessToken")),
          },
        }
      );
      dispatch({
          type: UPDATE_LATEST_MESSAGE,
          content: content,
          user: {
            coverPhoto: getState().user.userDetails.coverPhoto,
            firstName: getState().user.userDetails.firstName,
            lastName: getState().user.userDetails.lastName,
            profilePic: getState().user.userDetails.profilePic,
            username: getState().user.userDetails.username,
          },
          chatId: chatId
      });
    } catch (err) {
        console.log(err);
      dispatch({
        type: SEND_MESSAGE_ERROR,
        msgId: newDate,
      });
    }
  };
};
