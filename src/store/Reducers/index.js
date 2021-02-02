import {combineReducers} from 'redux';
import postReducer from './post';
import userReducer from './user';
import userSearchReducer from './userSearch';

export default combineReducers({
    user: userReducer,
    post: postReducer,
    userSearch: userSearchReducer
});