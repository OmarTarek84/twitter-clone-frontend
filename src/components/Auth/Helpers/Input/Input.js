import React from "react";
import "./Input.scss";

const Input = ({type, name, placeholder, validationRules, register, errors}) => {

  return (
    <>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        ref={register(validationRules)}
      />
      {errors && errors[name] && (
        <p className="error">{errors[name].message}</p>
      )}
    </>
  );
};

export default Input;
