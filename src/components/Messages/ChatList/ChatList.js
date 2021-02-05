import React from "react";
import ChatItem from "./ChatItem/ChatItem";
import "./ChatList.scss";

const ChatList = ({ chats, goToMessageChat }) => {
  const renderChatList = chats.map((chat) => {
    const chatUsers = chat.users.filter(
      (user) => user.username !== localStorage.getItem("userName")
    );
    const groupChatNames = chatUsers.map(user => user.firstName + " " + user.lastName);
    return (
      <ChatItem
        key={chat._id}
        firstName={chatUsers[0].firstName}
        lastName={chatUsers[0].lastName}
        profilePic={chatUsers[0].profilePic}
        username={chatUsers[0].username}
        isGroupChat={chat.isGroupChat}
        groupChatImage1={chatUsers[0].profilePic}
        groupChatImage2={chatUsers[1] ? chatUsers[1].profilePic: null}
        groupChatNames={groupChatNames.join(', ')}
        goToMessageChat={() => goToMessageChat(chat._id)}
      />
    );
  });
  return renderChatList;
};

export default ChatList;
