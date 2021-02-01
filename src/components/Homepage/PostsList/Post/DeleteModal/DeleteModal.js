import React from "react";
import "./DeleteModal.scss";

const DeleteModal = ({closeDeleteModel, deletePost, modalType, pinPostReq}) => {

  return (
    <div className="backdrop">
      <div className="deleteModal">
        <div className="titleP">
          <h2>{modalType === 'delete' ? 'Delete The Post?': 'Pin this post On Your Profile?'}</h2>
          <i className="fa fa-times" onClick={closeDeleteModel}></i>
        </div>
        <div className="makesureDelete">
            <p>{modalType === 'delete' ? "You won't be able to undo this.": "This post will appear on the top of your profile. You can only pin one post"}</p>
        </div>
        <div className="btnActions">
          <button
            onClick={modalType === 'delete' ? deletePost: pinPostReq}
            className="btn btn-primary"
          >
            {modalType === 'delete' ? 'Delete': 'Pin'}
          </button>
          <button onClick={closeDeleteModel} className="btn btn-danger">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
