import React from 'react';
import './NotificationToast.scss';

const NotificationToast = ({profilePic, text}) => {
    return (
        <div className="toastNot">
            <img src={profilePic} alt="alt" />
            <p>{text}</p>
        </div>
    )
};

export default NotificationToast;