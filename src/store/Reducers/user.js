const {
  LOGIN,
  USER_ERROR,
  CLEAR_USER_ERROR,
  RETWEET_POST,
  UNRETWEET_POST,
  LOGOUT,
  FOLLOW_USER,
  AUTH_LOADING,
} = require("../Actions/actionTypes");

const initialState = {
  isAuthenticated: false,
  errorMessage: null,
  token: null,
  userDetails: null,
  authLoading: false
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        token: action.token,
        isAuthenticated: true,
        errorMessage: null,
        userDetails: action.userDetails,
        authLoading: false
      };
    case AUTH_LOADING:
      return {
        ...state,
        authLoading: true
      };
    case USER_ERROR:
      return {
        ...state,
        errorMessage: action.errorMessage,
        authLoading: false
      };
    case CLEAR_USER_ERROR:
      return {
        ...state,
        errorMessage: null,
      };
    case RETWEET_POST:
      return {
        ...state,
        userDetails: {
          ...state.userDetails,
          retweets: [action.retweet, ...state.userDetails.retweets],
        },
      };
    case UNRETWEET_POST:
      return {
        ...state,
        userDetails: {
          ...state.userDetails,
          retweets: [
            ...state.userDetails.retweets.filter(
              (p) => p !== action.deletedPostId
            ),
          ],
        },
      };
    case LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        errorMessage: null,
        token: null,
        userDetails: null,
        authLoading: false
      };
    case FOLLOW_USER:
      const followingUser = action.newfollowingUser;
      let following = [...state.userDetails.following];
      const foundFollowingIndex = following.findIndex(
        (p) => p.username === followingUser.username
      );
      console.log(foundFollowingIndex);
      if (foundFollowingIndex > -1) {
        following.splice(foundFollowingIndex, 1);
      } else {
        following.push(action.newfollowingUser);
      }
      return {
        ...state,
        userDetails: {
          ...state.userDetails,
          following: following,
        },
      };
    default:
      return state;
  }
};

export default userReducer;
