import axios from '../../axios';
import { CHANGE_CHAT_NAME, CHAT_LOADING, CHAT_MESSAGES_ERROR, CREATE_CHAT, FETCH_CHAT_MESSAGES } from './actionTypes';

export const getChatMsgs = chatId => {
    return async (dispatch, getState) => {
        try {
            dispatch({type: CHAT_LOADING});
            const token = getState().user && getState().user.token ? getState().user.token: localStorage.getItem('accessToken');
            const {data} = await axios.get(`/chat/getMessages?chatId=${chatId}`, {
                headers: {
                    Authorization: 'Bearer ' + token
                }
            });
            dispatch({
                type: FETCH_CHAT_MESSAGES,
                chat: data
            });
        } catch(err) {
            dispatch({
                type: CHAT_MESSAGES_ERROR,
                error: err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : err.message
            });
        }
    };
};


export const createChat = (users, isGroupChat) => {
    return async (dispatch, getState) => {
        try {
            dispatch({type: CHAT_LOADING});
            const {data} = await axios.post(`/chat/createChat?isGroupChat=${isGroupChat}`, {users}, {
                headers: {
                    Authorization: 'Bearer ' + (getState().user.token || localStorage.getItem('accessToken'))
                }
            });
            const result = await dispatch({
                type: CREATE_CHAT,
                chat: data
            });
            return result;
        } catch(err) {
            console.log(err);
        }
    };
};


export const changeChatName = (chatId, chatName) => {
    return async (dispatch, getState) => {
        try {
            await axios.put(`/chat/changeChatName?chatId=${chatId}`, {chatName}, {
                headers: {
                    Authorization: 'Bearer ' + (getState().user.token || localStorage.getItem('accessToken'))
                }
            });
            dispatch({
                type: CHANGE_CHAT_NAME,
                chatName: chatName
            });
        } catch(err) {
            console.log(err);
        }
    };
};