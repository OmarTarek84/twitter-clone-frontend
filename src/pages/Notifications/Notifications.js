import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import NotificationList from "../../components/NotificationList/NotificationList";
import { fetchNotifications, markRead } from "../../store/Actions/notification";
import Spinner from "../../components/Spinner/Spinner";
import Paginate from "../../components/Paginate/Paginate";
import "./Notifications.scss";

const Notifications = () => {
  const dispatch = useDispatch();
  const {
    notifications,
    notificationsLoading,
    currentPage,
    pageSize,
    totalItemsCount,
    pages,
  } = useSelector((state) => state.notification);

  useEffect(() => {
    dispatch(fetchNotifications(1, 30));
  }, [dispatch]);

  const markReadNotifications = (markAll, notificationId) => {
    dispatch(markRead(markAll, notificationId));
  };

  const handlePageChange = (pageNumber) => {
    dispatch(fetchNotifications(pageNumber, 30));
  };

  return (
    <div className="notificationsParent">
      <div className="title">
        <h2>Notifications</h2>
        {notifications.length > 0 && (
          <i
            className="fas fa-check-double"
            onClick={() => markReadNotifications(true, null)}
          ></i>
        )}
      </div>
      {pages > 1 && !notificationsLoading && (
        <div className="paginate">
          <Paginate
            currentPage={currentPage}
            pageSize={pageSize}
            totalItemsCount={totalItemsCount}
            handlePageChange={handlePageChange}
          />
        </div>
      )}
      {notificationsLoading ? (
        <Spinner width="70px" />
      ) : notifications.length > 0 ? (
        <NotificationList
          notifications={notifications}
          markReadNotifications={markReadNotifications}
        />
      ) : (
        <h3 className="nonotifications">No Notifications Yet</h3>
      )}
    </div>
  );
};

export default Notifications;
