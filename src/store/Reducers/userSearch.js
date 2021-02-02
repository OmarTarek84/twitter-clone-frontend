import { FETCH_USERS, USERS_LOADING } from "../Actions/actionTypes";

const initialState = {
  users: [],
  currentPageUser: 1,
  pageSizeUser: 30,
  pagesUser: 1,
  totalItemsCountUser: 10,
  userLoading: false,
};

const userSearchReducer = (state = initialState, action) => {
  switch (action.type) {
    case USERS_LOADING:
      return {
        ...state,
        userLoading: true,
      };
    case FETCH_USERS:
      return {
        ...state,
        users: [...action.userDetails],
        userLoading: false,
        currentPageUser: action.currentPageUser,
        pageSizeUser: action.pageSizeUser,
        pagesUser: action.pagesUser,
        totalItemsCountUser: action.totalItemsCountUser,
      };
    default:
        return state;
  }
};

export default userSearchReducer;
