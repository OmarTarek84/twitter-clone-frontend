import axios from '../../axios';
import { AUTH_LOADING, FETCH_USERS, LOGIN, PIN_POST, USERS_LOADING, USER_ERROR } from './actionTypes';
import history from '../../history';

export const signup = formData => {
    return async (dispatch, getState) => {
        try {
            await axios.post('/auth/signup', formData);
            history.push('/login');
        } catch(err) {
            dispatch({
                type: USER_ERROR,
                errorMessage: err.response && err.response.data && err.response.data.message ? err.response.data.message: err.message
            });
        }
    };
};

export const login = formData => {
    return async (dispatch, getState) => {
        dispatch({
            type: AUTH_LOADING
        });
        try {
            const response = await axios.post('/auth/login', formData);
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('email', response.data.userDetails.email);
            localStorage.setItem('userName', response.data.userDetails.username);
            localStorage.setItem('firstName', response.data.userDetails.firstName);
            localStorage.setItem('lastName', response.data.userDetails.lastName);
            localStorage.setItem('profilePic', response.data.userDetails.profilePic);
            history.push('/');
            dispatch({
                type: LOGIN,
                token: response.data.accessToken,
                userDetails: response.data.userDetails
            });
        } catch(err) {
            dispatch({
                type: USER_ERROR,
                errorMessage: err.response && err.response.data && err.response.data.message ? err.response.data.message: err.message
            });
        }
    };
};


export const pinPostUser = postId => {
    return async (dispatch, getState) => {
        try {
            const response = await axios.put('/user/pinPost', {postId}, {
                headers: {
                    Authorization: 'Bearer ' + (getState().user.token || localStorage.getItem('accessToken'))
                }
            });
            console.log(response.data);
            dispatch({
                type: PIN_POST,
                pinnedPost: response.data.pinnedPost,
                pintype: response.data.type
            });
        } catch(err) {
            dispatch({
                type: USER_ERROR,
                errorMessage: err.response && err.response.data && err.response.data.message ? err.response.data.message: err.message
            });
        }
    };
};


export const searchUsers = (currentPage, pageSize, search) => {
    return async (dispatch, getState) => {
        try {
            dispatch({
                type: USERS_LOADING
            });
            const response = await axios.get(`/user/search?currentPage=${currentPage}&pageSize=${pageSize}&search=${search}`, {
                headers: {
                    Authorization: 'Bearer ' + (getState().user.token || localStorage.getItem('accessToken'))
                }
            });
            console.log(response.data);
            dispatch({
                type: FETCH_USERS,
                userDetails: response.data.userDetails,
                currentPageUser: response.data.currentPage,
                pageSizeUser: response.data.pageSize,
                pagesUser: response.data.pages,
                totalItemsCountUser: response.data.totalItemsCount,
            });
        } catch(err) {
            dispatch({
                type: USER_ERROR,
                errorMessage: err.response && err.response.data && err.response.data.message ? err.response.data.message: err.message
            });
        }
    };
};