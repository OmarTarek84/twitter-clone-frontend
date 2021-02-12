import axios from "../../axios";
import {FETCH_NOTIFICATIONS, NOTIFICATIONS_LOADING, MARK_READ} from './actionTypes';

export const fetchNotifications = (currentPage, pageSize) => {
  return async (dispatch, getState) => {
    dispatch({
      type: NOTIFICATIONS_LOADING
    });
    const { data } = await axios.get(`/notifications?currentPage=${currentPage}&pageSize=${pageSize}`, {
      headers: {
        Authorization:
          "Bearer " +
          (getState().user.token || localStorage.getItem("accessToken")),
      },
    });
    dispatch({
      type: FETCH_NOTIFICATIONS,
      currentPage: data.currentPage,
      notifications: data.notifications,
      pageSize: data.pageSize,
      pages: data.pages,
      totalItemsCount: data.totalItemsCount,
    });
  };
};


export const markRead = (markAll, notificationId) => {
  return async (dispatch, getState) => {
    dispatch({
      type: MARK_READ,
      notificationId: notificationId,
      markAll: markAll
    });
    await axios.put(`/notifications/${notificationId}/markRead?markAll=${markAll}`, {}, {
      headers: {
        Authorization:
          "Bearer " +
          (getState().user.token || localStorage.getItem("accessToken")),
      },
    });
  };
};
