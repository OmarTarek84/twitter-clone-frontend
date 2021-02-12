import React from "react";
import "./Form.scss";
import { useForm } from "react-hook-form";
import Input from "../Input/Input";
import Spinner from '../../Spinner/Spinner';

const Form = ({ submitForm, defaultValues, inputs, errorMessage, submitBtnText, authLoading }) => {
  const { handleSubmit, register, errors, watch } = useForm({
    defaultValues: defaultValues,
  });

  const renderInputs = inputs.map((input) => {
    return (
      <div className="inputParent" key={input.name}>
        <Input
          type={input.type}
          placeholder={input.placeholder}
          name={input.name}
          validationRules={
            input.name === "confirmPassword" ? {
                ...input.validationRules,
                validate: (value) => value === watch('password') || "Passwords don't match."
            } : input.validationRules
          }
          register={register}
          errors={errors}
        />
      </div>
    );
  });

  return (
    <form className="authForm" onSubmit={handleSubmit(submitForm)}>
      {renderInputs}
      {errorMessage && <p className="err">{errorMessage}</p>}
      {
        authLoading ?
        <Spinner width="40px" />:
        <button type="submit">{submitBtnText}</button>
      }
    </form>
  );
};

export default Form;
