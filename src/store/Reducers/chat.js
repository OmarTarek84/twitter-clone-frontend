import { CHAT_LOADING, CHAT_MESSAGES_ERROR, FETCH_CHAT_MESSAGES, CHANGE_CHAT_NAME, SEND_MESSAGE, SEND_MESSAGE_ERROR, CLEAR_MESSAGES } from "../Actions/actionTypes";

const initialState = {
    chatError: null,
    chatLoading: false,
    chat: null,
    messages: [],
    currentMessagesPage: 1,
    messagesPageSize: 60,
    totalMessagesCount: 60,
    totalMessagesPages: 10
};

const chatReducer = (state = initialState, action) => {
    switch (action.type) {
        case CHAT_MESSAGES_ERROR:
            return {
                ...state,
                chatError: action.error,
                chatLoading: false
            };
        case CHAT_LOADING:
            return {
                ...state,
                chatLoading: true,
                chatError: null,
            };
        case FETCH_CHAT_MESSAGES:
            return {
                ...state,
                chatLoading: false,
                chat: action.chat,
                messages: [...action.messages.reverse(), ...state.messages ],
                currentMessagesPage: action.currentPage,
                messagesPageSize: action.pageSize,
                totalMessagesCount: action.messagesCount,
                totalMessagesPages: action.pages
            };
        case CHANGE_CHAT_NAME:
            return {
                ...state,
                chat: {
                    ...state.chat,
                    chatName: action.chatName
                }
            };
        case SEND_MESSAGE:
            let newMessages;
            if (state.messages.length >= 30) {
                if (state.currentMessagesPage === state.totalMessagesPages) {
                    newMessages = [
                        ...state.messages,
                        action.message,
                    ];
                } else {
                    // if there's pagination left
                    newMessages = [
                        ...state.messages.slice(1),
                        action.message
                    ];
                }
            } else {
                newMessages = [
                    ...state.messages,
                    action.message,
                ];
            }
            return {
                ...state,
                messages: newMessages
            };
        case SEND_MESSAGE_ERROR:
            const allMsgs = [...state.messages];
            const MsgIndx = allMsgs.findIndex(msg => msg._id === action.msgId);
            allMsgs[MsgIndx].error = true;
            return {
                ...state,
                messages: allMsgs
            };
        case CLEAR_MESSAGES:
            return {
                ...state,
                messages: [],
                chat: null
            };
        default:
            return state;
    }
};

export default chatReducer;