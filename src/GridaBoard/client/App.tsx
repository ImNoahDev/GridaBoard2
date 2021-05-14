import React, { Component } from 'react';
import { Route } from 'react-router-dom';
// import GridaBoard from "./page/GridaBoard";
// import About from "./page/About";
import { Login, List, GridaBoard, LoginCheck } from "./pages"

const App = ()=>{
    /**
     * 커밋할 경우 true로 고정
     */
    const isOnlyGrida = true;
    if(!isOnlyGrida){
        // 기본 경로를 그리다로 고정
        return (<div>
          <Route path="/" component={GridaBoard}/>
        </div>);
    }else{
        // 경로 옵션 사용하고 싶을떄
        return (<div>
          <Route exact path="/" component={Login}/>
          <Route exact path="/list" component={List}/>
          <Route exact path="/app" component={GridaBoard}/>
          <Route exact path="/loginCheck" component={LoginCheck}/>
        </div>);
    }
}

export default App;