import React from "react";
import "./ChatItem.scss";
const ChatItem = ({
  firstName,
  lastName,
  profilePic,
  username,
  isGroupChat,
  groupChatImage1,
  groupChatImage2,
  groupChatNames,
  goToMessageChat,
  latestMessageFirstName,
  latestMessageLastName,
  latestMessageContent
}) => {
  const renderImage = () => {
    if (isGroupChat && groupChatImage2) {
      return (
        <div className="images">
          <img className="firstImg" src={groupChatImage1} alt={username} />
          <img className="secondImg" src={groupChatImage2} alt={username} />
        </div>
      );
    } else {
      return (
        <div className="image">
          <img className="singleImg" src={profilePic} alt={username} />
        </div>
      );
    }
  };

  return (
    <div className="chatP" onClick={goToMessageChat}>
      {renderImage()}
      <div className="chatdetails">
        <span className="firstlastname">
          {isGroupChat ? groupChatNames: firstName + " " + lastName}
        </span>
        {
          latestMessageFirstName && latestMessageLastName
          ?
          <span className="lastestmsg">{latestMessageFirstName} {latestMessageLastName}: {latestMessageContent}</span>
          :
          <span className="lastestmsg">No Messages Yet</span>
        }
      </div>
    </div>
  );
};

export default ChatItem;
