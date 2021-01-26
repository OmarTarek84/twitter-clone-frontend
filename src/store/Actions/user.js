import axios from '../../axios';
import { LOGIN, USER_ERROR } from './actionTypes';
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
        try {
            const response = await axios.post('/auth/login', formData);
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('email', response.data.userDetails.email);
            localStorage.setItem('userName', response.data.userDetails.userName);
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