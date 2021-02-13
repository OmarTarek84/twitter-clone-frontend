import React from "react";
import { Route, Redirect } from "react-router-dom";

function ProtectedRoute({
  component: Component,
  token: token,
  ...rest
}) {
  return (
    <Route
      {...rest}
      render={(props) => {
        if (token) {
          return <Component {...props} />;
        } else {
          return (
            <Redirect to={{ pathname: "/login", state: { from: props.location } }} />
          );
        }
      }}
    />
  );
}

export default ProtectedRoute;