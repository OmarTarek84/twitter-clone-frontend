import {combineReducers} from 'redux';
import chatReducer from './chat';
import notificationsReducer from './notifications';
import postReducer from './post';
import userReducer from './user';
import userSearchReducer from './userSearch';

export default combineReducers({
    user: userReducer,
    post: postReducer,
    userSearch: userSearchReducer,
    chat: chatReducer,
    notification: notificationsReducer
});