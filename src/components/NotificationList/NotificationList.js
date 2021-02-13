import React from 'react';
import './NotificationList.scss';
import history from '../../history';

const NotificationList = ({notifications, markReadNotifications}) => {
    const notificationList = notifications.map((notification) => {
        
        let notificationDetails = {
            text: '',
            link: '/'
        };

        if (notification.notificationType === 'retweet') {
            notificationDetails = {
                text: 'retweeted one of your posts',
                link: `/post/${notification.postId}`
            };
        } else if (notification.notificationType === 'postLike') {
            notificationDetails = {
                text: 'liked one of your posts',
                link: `/post/${notification.postId}`
            };
        } else if (notification.notificationType === 'follow') {
            notificationDetails = {
                text: 'followed you',
                link: `/profile/${notification.userId.username}`
            };
        } else if (notification.notificationType === 'newMessage') {
            notificationDetails = {
                text: 'sent a new message',
                link: `/chat/${notification.chatId}`
            };
        } else if (notification.notificationType === 'reply') {
            notificationDetails = {
                text: 'replied to your post',
                link: `/post/${notification.postId}`
            };
        }

        const activeClass = notification.opened ? '' : 'active';

        const notificationClicked = () => {
            history.push(notificationDetails.link);
            markReadNotifications(false, notification._id, notification.opened);
        };

        return (
            <div className={`notification ${activeClass}`} key={notification._id} onClick={notificationClicked}>
                <img src={notification.userFrom.profilePic} alt={notification.userFrom.username} />
                <p className="text">{notification.userFrom.firstName} {notification.userFrom.lastName} {notificationDetails.text}</p>
            </div>
        )
    });
    return notificationList;
};

export default NotificationList;