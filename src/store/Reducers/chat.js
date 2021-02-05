import { CHAT_LOADING, CHAT_MESSAGES_ERROR, FETCH_CHAT_MESSAGES, CHANGE_CHAT_NAME } from "../Actions/actionTypes";

const initialState = {
    chatError: null,
    chatLoading: false,
    chat: null
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
                chat: action.chat
            };
        case CHANGE_CHAT_NAME:
            return {
                ...state,
                chat: {
                    ...state.chat,
                    chatName: action.chatName
                }
            };
        default:
            return state;
    }
};

export default chatReducer;