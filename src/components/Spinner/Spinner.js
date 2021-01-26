import React from "react";
import "./Spinner.scss";

const Spinner = ({width}) => {
  return <div className="loader" style={{width: width, height: width}}>Loading...</div>;
};

export default Spinner;
