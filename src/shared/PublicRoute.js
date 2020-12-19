import React from 'react';
import { connect } from 'react-redux';
import { Redirect, Route } from 'react-router-dom';

const PublicRoute = ({
  isAuthenticated,
  component: Component,
  ...rest
}) => {
  console.log('PublicRoute call');
  return (
    <Route {...rest} render={(props) => (
      isAuthenticated === true
        ? <Redirect to="/" />
        : (
          <React.Fragment>
            <Component {...props} />
          </React.Fragment>
        )
    )} />
  );
};

const mapStateToProps = (state) => ({
  isAuthenticated: !!state.auth.authToken
});

export default connect(mapStateToProps)(PublicRoute);
