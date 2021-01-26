import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./Postfeed.scss";
import { useForm } from "react-hook-form";
import { createPost } from "../../../store/Actions/post";
import Spinner from "../../Spinner/Spinner";

const Postfeed = () => {
  const { userDetails } = useSelector((state) => state.user);
  const { register, handleSubmit, errors, reset } = useForm();

  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const submitPostFeed = (formData) => {
    setLoading(true);
    dispatch(createPost(formData))
      .then(() => {
        reset();
        setLoading(false);
      })
      .catch((err) => setLoading(false));
  };

  const renderRequestButton = () => {
    if (loading) {
      return (
        <div className="spinner">
          <Spinner width="40px" />
        </div>
      );
    } else {
      return (
        <button
          type="submit"
          disabled={!!errors["content"]}
          className="btn btn-primary"
        >
          Post
        </button>
      );
    }
  };

  return (
    <div className="postfeed">
      <div className="postflex">
        <div className="profilePic">
          <img
            src={userDetails?.profilePic || localStorage.getItem("profilePic")}
            alt="profile pic"
          />
        </div>
        <form onSubmit={handleSubmit(submitPostFeed)}>
          <textarea
            name="content"
            placeholder="What's Happening?"
            ref={register({ required: true })}
          ></textarea>
          {renderRequestButton()}
        </form>
      </div>
    </div>
  );
};

export default Postfeed;
