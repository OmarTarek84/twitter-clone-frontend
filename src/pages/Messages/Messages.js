import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ChatList from '../../components/ChatList/ChatList';
import history from '../../history';
import './Messages.scss';

const Messages = () => {

  const {userDetails} = useSelector(state => state.user);

  const goToMessageChat = chatId => {
    history.push('/chat/' + chatId);
  };

  return (
    <div className="messages">
      <div className="title">
        <h2>Inbox</h2>
        <Link to="/messages/new">
          <i className="far fa-plus-square"></i>
        </Link>
      </div>
      {(userDetails && userDetails.chats) && <ChatList chats={userDetails.chats} goToMessageChat={goToMessageChat} />}
    </div>
  );
};

export default Messages;