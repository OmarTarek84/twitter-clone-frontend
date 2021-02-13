/* eslint-disable */
import React, { useEffect, useRef, useState } from "react";
import "./Search.scss";
import SearchTab from "../../components/SearchTabs/SearchTab";
import Paginate from "../../components/Paginate/Paginate";
import { useDispatch, useSelector } from "react-redux";
import {
  deletePost,
  getPosts,
  likePost,
  replyPost,
  retweetPost,
} from "../../store/Actions/post";
import { pinPostUser, searchUsers } from "../../store/Actions/user";
import history from "../../history";
import { toast } from "react-toastify";
import useSocket from "../../shared/socketCustomHook";

const Search = () => {
  const [searchVal, setSearchVal] = useState("");
  const [tabIndex, setTabIndex] = useState(0);

  const {socket} = useSocket();

  const dispatch = useDispatch();
  const pinToastId = useRef();
  const replyToastId = useRef();
  const retweetToastId = useRef();
  const deleteToastId = useRef();

  const {
    posts,
    currentPage,
    pageSize,
    totalItemsCount,
    pages,
    postActionLoading,
    retweetActionLoading,
    postLoading,
  } = useSelector((state) => state.post);
  const {
    users,
    currentPageUser,
    pageSizeUser,
    totalItemsCountUser,
    pagesUser,
    userLoading
  } = useSelector((state) => state.userSearch);

  const { userDetails } = useSelector((state) => state.user);

  const handlePageChange = (pageNumber) => {
    if (tabIndex === 0) {
      dispatch(getPosts(pageNumber, 30, searchVal));
    } else {
      dispatch(searchUsers(pageNumber, 30, searchVal, ''));
    }
  };

  const renderPaginate = () => {
    return (
      <div className="paginate">
        {tabIndex === 0 ? (
          <Paginate
            handlePageChange={handlePageChange}
            currentPage={currentPage}
            pageSize={pageSize}
            pages={pages}
            totalItemsCount={totalItemsCount}
          />
        ) : (
          <Paginate
            handlePageChange={handlePageChange}
            currentPage={currentPageUser}
            pageSize={pageSizeUser}
            pages={pagesUser}
            totalItemsCount={totalItemsCountUser}
          />
        )}
      </div>
    );
  };

  useEffect(() => {
    const arrayToRender = tabIndex === 0 ? posts : users;

    // check if this is the first render or not
    if (!searchVal && arrayToRender.length <= 0) {
      // search immediately if this is the first render
      //   search();
      if (tabIndex === 0) {
        dispatch(getPosts(1, 30, searchVal));
      } else {
        dispatch(searchUsers(1, 30, searchVal, ''));
      }
    } else {
      // otherwise 500 ms timeout on type search
      const timeoutId = setTimeout(() => {
        if (searchVal) {
          if (tabIndex === 0) {
            dispatch(getPosts(1, 30, searchVal));
          } else {
            dispatch(searchUsers(1, 30, searchVal, ''))
          }
        }
      }, 500);

      // will run only with the second render (its objective is to clear the previous values from the first render if any)
      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [searchVal, tabIndex, dispatch]);

  const selectTabIndex = (index) => {
    setTabIndex(index);
  };

  const likePostReq = (postId, originalPostId, postedByUsername) => {
    dispatch(likePost(postId, originalPostId));
    if (postedByUsername !== userDetails.username) {
      socket.current.emit('notification Sent', {
        notificationFrom: userDetails.username,
        notificationTo: [postedByUsername],
        type: 'like',
        postId: postId
      });
    }
  };

  const goToProfile = (username) => {
    history.push(`/profile/${username}`);
  };

  const retweetReq = (postId, originalPostId, postedByUsername) => {
    retweetToastId.current = toast.warning("Submitting Your retweet...");
    dispatch(retweetPost(postId, originalPostId)).then(() => {
      toast.dismiss(retweetToastId.current);
      toast.success("Retweet Success");
      if (postedByUsername !== userDetails.username) {
        socket.current.emit('notification Sent', {
          notificationFrom: userDetails.username,
          notificationTo: [postedByUsername],
          type: 'retweet',
          postId: postId
        });
      }
    });
  };

  const submitReplyReq = (formData, postId, postedByUsername) => {
    replyToastId.current = toast.warning("Submitting Your Reply...");
    dispatch(replyPost(formData.reply, postId)).then(() => {
      toast.dismiss(replyToastId.current);
      toast.success("Reply Post Success");
      socket.current.emit('notification Sent', {
        notificationFrom: userDetails.username,
        notificationTo: [postedByUsername],
        type: 'reply',
        postId: postId
      });
    });
  };

  const viewSinglePostReq = (postId, replyPostId) => {
    history.push(`/post/${replyPostId || postId}`, {
      postId: replyPostId || postId,
      backgroundGreenPostId: postId,
    });
  };

  const deletePostReq = (postId, originalPostId) => {
    deleteToastId.current = toast.warning("Delete post in progress");
    dispatch(deletePost(postId, originalPostId)).then(() => {
      toast.dismiss(deleteToastId.current);
      toast.success("Delete Post Success");
    });
  };

  const pinPost = (postId) => {
    pinToastId.current = toast.warning("Pinning Post...");
    dispatch(pinPostUser(postId)).then(() => {
      toast.dismiss(pinToastId.current);
      toast.success("Pin Post Success");
    });
  };

  console.log("SEARCH RENDERED");

  return (
    <div className="search">
      <h2>Search</h2>
      <div className="input">
        <i className="fa fa-search"></i>
        <input
          type="text"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
        />
      </div>
      {
        userLoading || postLoading || (tabIndex === 0 && pages <= 1) || (tabIndex === 1 && pagesUser <= 1) ? null: renderPaginate()
      }
      <div className="tab">
        <SearchTab
          likePostReq={likePostReq}
          viewSinglePostReq={viewSinglePostReq}
          retweetReq={retweetReq}
          deletePost={deletePostReq}
          postLoading={postLoading}
          postActionLoading={postActionLoading}
          retweetActionLoading={retweetActionLoading}
          selectTabIndex={selectTabIndex}
          goToProfile={goToProfile}
          disableReply={tabIndex === 1}
          submitReplyReq={submitReplyReq}
          pinnedPostId={
            userDetails && userDetails.pinnedPost
              ? userDetails.pinnedPost._id
              : null
          }
          pinPost={pinPost}
          posts={posts}
          users={users}
          userLoading={userLoading}
        />
      </div>
    </div>
  );
};

export default Search;
