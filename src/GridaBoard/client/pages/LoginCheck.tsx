import React from 'react';
import qs from "query-string";


const LoginCheck = () => {
  const code : string = qs.parse(location.search).code;
  
  (window.opener as Window).postMessage("login/"+code , window.location.origin);
    return (<div />);
};

export default LoginCheck; 