import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { CLEAR_USER_ERROR } from "../../../store/Actions/actionTypes";
import { signup } from "../../../store/Actions/user";
import Form from "../../../components/AuthHelpers/Form/Form";
import "./Signup.scss";

const Signup = () => {
  const dispatch = useDispatch();
  const { errorMessage } = useSelector((state) => state.user);

  const [loading, setloading] = useState(false);

  useEffect(() => {
    dispatch({type: CLEAR_USER_ERROR});
  }, [dispatch]);

  const defaultValues = {
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  const inputs = [
    {
      name: "firstName",
      placeholder: "First Name",
      type: "text",
      validationRules: {
        required: "First Name Is Required",
        pattern: /^[A-Za-z]+$/i,
      },
    },
    {
      name: "lastName",
      placeholder: "Last Name",
      type: "text",
      validationRules: {
        required: "Last Name Is Required",
        pattern: /^[A-Za-z]+$/i,
      },
    },
    {
      name: "userName",
      placeholder: "User Name",
      type: "text",
      validationRules: {
        required: "User Name Is Required",
      },
    },
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
    {
      name: "confirmPassword",
      placeholder: "Confirm Password",
      type: "password",
      validationRules: {
        required: "Confirm Password Is Required",
      },
    },
  ];

  const submitForm = (formData) => {
    setloading(true);
    dispatch(signup(formData)).then(() => {
      setloading(false);
    });
  };

  return (
    <div className="card">
      <h2>Register</h2>
      <Form
        submitForm={submitForm}
        errorMessage={errorMessage}
        defaultValues={defaultValues}
        inputs={inputs}
        submitBtnText='Register'
        authLoading={loading}
      />
      <Link to="/login">Already Have Account? Please Login</Link>
    </div>
  );
};

export default Signup;
