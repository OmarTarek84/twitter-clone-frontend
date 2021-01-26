import React from "react";
import "./Form.scss";
import { useForm } from "react-hook-form";
import Input from "../Input/Input";

const Form = ({ submitForm, defaultValues, inputs, errorMessage, submitBtnText }) => {
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
    <form onSubmit={handleSubmit(submitForm)}>
      {renderInputs}
      {errorMessage && <p className="err">{errorMessage}</p>}
      <button type="submit">{submitBtnText}</button>
    </form>
  );
};

export default Form;
