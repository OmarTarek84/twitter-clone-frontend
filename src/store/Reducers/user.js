const {
  LOGIN,
  USER_ERROR,
  CLEAR_USER_ERROR,
  RETWEET_POST,
  UNRETWEET_POST,
  LOGOUT,
  FOLLOW_USER,
  AUTH_LOADING,
  CHANGE_PROFILE_PIC,
  CHANGE_COVER_PHOTO,
  PIN_POST,
  LIKE_POST,
  CREATE_CHAT,
  UPDATE_LATEST_MESSAGE,
  MARK_READ,
  ADD_NOTIFICATION,
} = require("../Actions/actionTypes");

const initialState = {
  isAuthenticated: false,
  errorMessage: null,
  token: null,
  userDetails: null,
  authLoading: false,
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
        authLoading: false,
      };
    case AUTH_LOADING:
      return {
        ...state,
        authLoading: true,
      };
    case USER_ERROR:
      return {
        ...state,
        errorMessage: action.errorMessage,
        authLoading: false,
      };
    case CLEAR_USER_ERROR:
      return {
        ...state,
        errorMessage: null,
      };
    case RETWEET_POST:
      if (
        !state.userDetails ||
        !state.userDetails.pinnedPost ||
        state.userDetails.pinnedPost._id !== action.postId
      ) {
        return {
          ...state,
          userDetails: {
            ...state.userDetails,
            retweets: [action.retweet, ...state.userDetails.retweets],
          },
        };
      } else {
        const pinnedpostRetweet = [{...state.userDetails.pinnedPost}].map((p) => {
          if (p.retweetData) {
            if (
              p.retweetData._id === action.postId ||
              p._id === action.postId
            ) {
              return {
                ...p,
                retweetUsers: [action.postedBy, ...p.retweetUsers],
              };
            } else {
              return { ...p };
            }
          } else {
            if (p._id === action.postId) {
              return {
                ...p,
                retweetUsers: [action.postedBy, ...p.retweetUsers],
              };
            } else {
              return { ...p };
            }
          }
        });
        return {
          ...state,
          userDetails: {
            ...state.userDetails,
            retweets: [action.retweet, ...state.userDetails.retweets],
            pinnedPost: pinnedpostRetweet[0]
          },
        };
      }
    case UNRETWEET_POST:
      if (
        !state.userDetails ||
        !state.userDetails.pinnedPost ||
        state.userDetails.pinnedPost._id !== action.originalPostId
      ) {
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
      } else {  
        const pinnedPostUnretweet = [{...state.userDetails.pinnedPost}].map((p) => {
          if (p.retweetData) {
            if (
              p.retweetData._id === action.originalPostId ||
              p._id === action.originalPostId
            ) {
              return {
                ...p,
                retweetUsers: p.retweetUsers.filter(
                  (re) => re.username !== localStorage.getItem('userName')
                ),
              };
            } else {
              return { ...p };
            }
          } else {
            if (p._id === action.originalPostId) {
              return {
                ...p,
                retweetUsers: p.retweetUsers.filter(
                  (re) => re.username !== localStorage.getItem('userName')
                ),
              };
            } else {
              return { ...p };
            }
          }
        });
        return {
          ...state,
          userDetails: {
            ...state.userDetails,
            retweets: [
              ...state.userDetails.retweets.filter(
                (p) => p !== action.deletedPostId
              ),
            ],
            pinnedPost: pinnedPostUnretweet[0]
          },
        };
      }
      case LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        errorMessage: null,
        token: null,
        userDetails: null,
        authLoading: false,
      };
    case FOLLOW_USER:
      const followingUser = action.newfollowingUser;
      let following = [...state.userDetails.following];
      const foundFollowingIndex = following.findIndex(
        (p) => p.username === followingUser.username
      );
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
    case CHANGE_PROFILE_PIC:
      return {
        ...state,
        userDetails: {
          ...state.userDetails,
          profilePic: action.profilePic,
        },
      };
    case LIKE_POST:
      if (
        !state.userDetails ||
        !state.userDetails.pinnedPost ||
        state.userDetails.pinnedPost._id !== action.postId
      ) {
        return { ...state };
      }
      const pinnedPost = { ...state.userDetails.pinnedPost };
      const likeUserFoundIndex = pinnedPost.likes.findIndex(
        (like) => like.username === action.like.username
      );
      if (likeUserFoundIndex > -1) {
        pinnedPost.likes.splice(likeUserFoundIndex, 1);
      } else {
        pinnedPost.likes.push(action.like);
      }
      return {
        ...state,
        userDetails: {
          ...state.userDetails,
          pinnedPost: pinnedPost,
        },
      };
    case CHANGE_COVER_PHOTO:
      return {
        ...state,
        userDetails: {
          ...state.userDetails,
          coverPhoto: action.coverPhoto,
        },
      };
    case PIN_POST:
      if (action.pintype === 'add') {
        return {
          ...state,
          userDetails: {
            ...state.userDetails,
            pinnedPost: action.pinnedPost,
          },
        };
      } else {
        return {
          ...state,
          userDetails: {
            ...state.userDetails,
            pinnedPost: null,
          },
        };
      };
    case CREATE_CHAT:
      return {
        ...state,
        userDetails: {
          ...state.userDetails,
          chats: [action.chat, ...state.userDetails.chats]
        }
      };
    case UPDATE_LATEST_MESSAGE:
      const allChats = [...state.userDetails.chats];
      const chatInd = allChats.findIndex(chat => chat._id === action.chatId);
      allChats[chatInd].latestMessage = {
        content: action.content,
        sender: {
          firstName: action.user.firstName,
          lastName: action.user.lastName,
          username: action.user.username,
          profilePic: action.user.profilePic,
          coverPhoto: action.user.coverPhoto,
        },
        _id: new Date()
      };
      return {
        ...state,
        userDetails: {
          ...state.userDetails,
          chats: allChats
        }
      };
    case MARK_READ:
      return {
        ...state,
        userDetails: {
          ...state.userDetails,
          numberOfNotifications: action.markAll ? 0: state.userDetails.numberOfNotifications - 1
        }
      };
    case ADD_NOTIFICATION:
      return {
        ...state,
        userDetails: {
          ...state.userDetails,
          numberOfNotifications: state.userDetails.numberOfNotifications+1
        }
      };
    default:
      return state;
  }
};

export default userReducer;
