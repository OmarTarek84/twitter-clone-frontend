import React from "react";
import "./DeleteModal.scss";

const DeleteModal = ({closeDeleteModel, deletePost}) => {

  return (
    <div className="backdrop">
      <div className="deleteModal">
        <div className="titleP">
          <h2>Delete The Post?</h2>
          <i className="fa fa-times" onClick={closeDeleteModel}></i>
        </div>
        <div className="makesureDelete">
            <p>You won't be able to undo this.</p>
        </div>
        <div className="btnActions">
          <button
            onClick={deletePost}
            className="btn btn-primary"
          >
            Delete
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
