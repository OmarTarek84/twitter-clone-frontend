import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { CLEAR_USER_ERROR } from "../../../store/Actions/actionTypes";
import { login } from "../../../store/Actions/user";
import Form from "../../../components/AuthHelpers/Form/Form";
import socketIOClient from "socket.io-client";
import "./Login.scss";

const Login = () => {

  const { errorMessage, authLoading } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({type: CLEAR_USER_ERROR});
  }, [dispatch]);

  const defaultValues = {
    email: "",
    password: "",
  };

  const inputs = [
    {
      name: "email",
      placeholder: "Email",
      type: "email",
      validationRules: {
        required: "Email Is Required",
        pattern: {
          value: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
          message: "Entered value does not match email format",
        },
      },
    },
    {
      name: "password",
      placeholder: "Password",
      type: "password",
      validationRules: {
        required: "Password Is Required",
      },
    },
  ];

  const submitForm = (formData) => {
    dispatch(login(formData)).then(() => {
      const SOCKETENDPOINT = process.env.NODE_ENV === 'development' ? 'http://localhost:8080': '/';
      const socket = socketIOClient(SOCKETENDPOINT);
      socket.emit('loggedin', formData.email);
    });
  };

  return (
    <div className="card">
      <h2>Login</h2>
      <Form
        submitForm={submitForm}
        defaultValues={defaultValues}
        inputs={inputs}
        submitBtnText='Login'
        errorMessage={errorMessage}
        authLoading={authLoading}
      />
      <Link to="/signup">Don't Have Account? Create New Account</Link>
    </div>
  );
};

export default Login;
