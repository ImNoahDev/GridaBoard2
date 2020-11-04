import React from "react";
import { connect } from "react-redux";
import { Redirect, Route } from "react-router-dom";

const RestrictedRoute = ({
  isAuthenticated,
  component: Component,
  ...rest
}) => {
  console.log("RestrictedRoute call");
  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated === true ? (
          <Component {...props} />
        ) : (
            <Redirect to="/" />
          )
      }
    />
  );
};

const mapStateToProps = (state) => ({
  isAuthenticated: !!state.auth.authToken,
});

export default connect(mapStateToProps)(RestrictedRoute);
