const {
  CREATE_POST,
  FETCH_POSTS,
  POST_ERROR,
  LIKE_POST,
  DELETE_POST,
  RETWEET_POST,
  UNRETWEET_POST,
  RETWEET_LOADING,
  REPLY_TO_POST,
  POST_LOADING
} = require("../Actions/actionTypes");

const initialState = {
  posts: [],
  currentPage: 1,
  pageSize: 30,
  pages: 1,
  totalItemsCount: 10,
  errorMessage: null,
  postActionLoading: {
    postId: null,
    postLoading: false,
  },
  retweetActionLoading: {
    postId: null,
    postLoading: false,
  },
  postLoading: false
};

const postReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_POST:
      return {
        ...state,
        posts: [action.post, ...state.posts],
        errorMessage: null,
      };
    case POST_LOADING:
      return {
        ...state,
        postLoading: true
      };
    case FETCH_POSTS:
      return {
        ...state,
        posts: [...action.posts],
        errorMessage: null,
        postLoading: false,
        currentPage: action.currentPage,
        pageSize: action.pageSize,
        pages: action.pages,
        totalItemsCount: action.totalItemsCount
      };
    case LIKE_POST:
      const allPosts = [...state.posts];
      if (allPosts.length > 0) {
        const targetPostIndex = allPosts.findIndex(
          (p) => p._id === action.postId
        );
        if (targetPostIndex > -1) {
          const likeUserFoundIndex = allPosts[targetPostIndex].likes.findIndex(like => like.username === action.like.username);
          if (likeUserFoundIndex > -1) {
            allPosts[targetPostIndex].likes.splice(likeUserFoundIndex, 1);
          } else {
            allPosts[targetPostIndex].likes.push(action.like);
          }

          const originalPost = allPosts.find(p => p._id === action.originalPostId);
          if (originalPost && originalPost.replies && originalPost.replies.length > 0) {
            const foundMyPost = originalPost.replies.find(post => post._id === action.postId);
            const foundReplyPostIndex = foundMyPost.likes.findIndex(like => like.username === action.like.username);
            if (foundReplyPostIndex > -1) {
              foundMyPost.likes.splice(foundReplyPostIndex, 1);
            } else {
              foundMyPost.likes.push(action.like);
            }
          }

        }
      }
      return {
        ...state,
        posts: allPosts,
        postActionLoading: {
          postId: null,
          postLoading: false,
        },
      };
    case POST_ERROR:
      return {
        ...state,
        errorMessage: action.errorMessage,
        postLoading: false
      };
    case RETWEET_LOADING:
      return {
        ...state,
        retweetActionLoading: {
          postId: action.postId,
          postLoading: true,
        },
      };
    case RETWEET_POST:
      const allPostForRetweet = [...state.posts];
      if (allPostForRetweet.length > 0) {
        const allPostsToRet = allPostForRetweet.map((p) => {
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
          posts: [action.newlyAddedPost, ...allPostsToRet],
          errorMessage: null,
          retweetActionLoading: {
            postId: null,
            postLoading: false,
          },
        };
      } else {
        return {
          ...state,
          posts: [...state.posts],
          errorMessage: null,
          retweetActionLoading: {
            postId: null,
            postLoading: false,
          },
        };
      }
    case UNRETWEET_POST:
      const allPostsToUnretweet = [...state.posts];
      const filteredPosts = allPostsToUnretweet.filter(
        (p) => p._id !== action.deletedPostId
      );

      const allPostsToUnRet = filteredPosts.map((p) => {
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
        posts: allPostsToUnRet,
        retweetActionLoading: {
          postId: null,
          postLoading: false,
        },
      };
    case REPLY_TO_POST:
      const allPostsToReply = [...state.posts];
      const postIdReplyOriginal = action.post.replyTo
        ? action.post.replyTo.originalPost._id
        : action.originalPostId;
      const foundPostToReplyIndex = allPostsToReply.findIndex(
        (p) => p._id === postIdReplyOriginal
      );
      if (foundPostToReplyIndex > -1) {
        allPostsToReply[foundPostToReplyIndex].replies.push(action.post);
      }
      return {
        ...state,
        posts:
          state.posts.length > 0
            ? [action.post, ...allPostsToReply]
            : [...state.posts],
      };
    case DELETE_POST:
      const allPostsForDelteReply = [...state.posts];
      if (action.originalPostId) {
          const targetPostForDeleteReplyIndex = allPostsForDelteReply.findIndex(
            (post) => post._id === action.originalPostId
          );
          if (targetPostForDeleteReplyIndex > -1) {
            allPostsForDelteReply[targetPostForDeleteReplyIndex].replies = 
                      allPostsForDelteReply[targetPostForDeleteReplyIndex].replies.filter(rep => rep._id !== action.postId);
          }
        
      }
      const filteredPostsAfterDelte = allPostsForDelteReply.filter((p) => p._id !== action.postId);
      return {
        ...state,
        posts: filteredPostsAfterDelte,
      };
    default:
      return state;
  }
};

export default postReducer;
