const { FETCH_NOTIFICATIONS, NOTIFICATIONS_LOADING, MARK_READ, ADD_NOTIFICATION } = require("../Actions/actionTypes");

const initialState = {
    notifications: [],
    currentPage: 1,
    pageSize: 30,
    pages: 1,
    totalItemsCount: 10,
    notificationsLoading: false,
};

const notificationsReducer = (state = initialState, action) => {
    switch (action.type) {
        case NOTIFICATIONS_LOADING:
            return {
                ...state,
                notificationsLoading: true
            };
        case FETCH_NOTIFICATIONS:
            return {
                ...state,
                notificationsLoading: false,
                notifications: action.notifications,
                currentPage: action.currentPage,
                pageSize: action.pageSize,
                pages: action.pages,
                totalItemsCount: action.totalItemsCount,
            };
        case MARK_READ:
            let notsAfterMarkRead = [...state.notifications];
            if (action.markAll === true) {
                notsAfterMarkRead = notsAfterMarkRead.map(notification => {
                    return {
                        ...notification,
                        opened: true
                    };
                });
            } else {
                const targetedNotificationIndex = notsAfterMarkRead.findIndex(n => n._id === action.notificationId);
                notsAfterMarkRead[targetedNotificationIndex].opened = true;
            }
            return {
                ...state,
                notifications: notsAfterMarkRead
            };
        case ADD_NOTIFICATION:
            return {
                ...state,
                notifications: [action.notification, ...state.notifications]
            };
        default:
            return state;
    }
};

export default notificationsReducer;