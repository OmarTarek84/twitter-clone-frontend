const { LOGIN, USER_ERROR, CLEAR_USER_ERROR, RETWEET_POST, UNRETWEET_POST, LOGOUT } = require("../Actions/actionTypes");

const initialState = {
    isAuthenticated: false,
    errorMessage: null,
    token: null,
    userDetails: null
};

const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOGIN:
            return {
                ...state,
                token: action.token,
                isAuthenticated: true,
                errorMessage: null,
                userDetails: action.userDetails
            };
        case USER_ERROR:
            return {
                ...state,
                errorMessage: action.errorMessage
            };
        case CLEAR_USER_ERROR:
            return {
                ...state,
                errorMessage: null
            };
        case RETWEET_POST:
            return {
                ...state,
                userDetails: {
                    ...state.userDetails,
                    retweets: [
                        action.retweet,
                        ...state.userDetails.retweets
                    ]
                }
            };
        case UNRETWEET_POST:
            return {
                ...state,
                userDetails: {
                    ...state.userDetails,
                    retweets: [
                        ...state.userDetails.retweets.filter(p => p !== action.deletedPostId)
                    ]
                }
            };
        case LOGOUT:
            return {
                ...state,
                isAuthenticated: false,
                errorMessage: null,
                token: null,
                userDetails: null
            };
        default:
            return state;
    }
};

export default userReducer;