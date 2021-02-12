import React, { useState } from "react";
import "./ChatNameModel.scss";

const ChatNameModel = ({closeChatNameModel, changeChatname}) => {

    const [inputVal, setInputVal] = useState('');

  return (
    <div className="backdrop">
      <div className="changeChatModal">
        <div className="titleP">
          <h3>Change The Chat Name</h3>
          <i className="fa fa-times" onClick={closeChatNameModel}></i>
        </div>
        <div className="changeChatInput">
          <input type="text" name="chatname" value={inputVal} onChange={e => setInputVal(e.target.value)} />
        </div>
        <div className="btnActions">
          <button
            className="btn btn-primary"
            onClick={() => changeChatname(inputVal)}
          >
            Save
          </button>
          <button onClick={closeChatNameModel} className="btn btn-danger">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatNameModel;
