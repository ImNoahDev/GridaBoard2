import React, { Component } from "react";
import { BrowserRouter } from "react-router-dom";
import { Route, Switch } from "react-router-dom";
import {  About, Posts } from "../pages";
import Home from "../GridaBoard/View/Home";
// import Menu from '../components/Menu';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        {/* <Menu /> */}
        <Route exact path="/" component={Home} />
        <Switch>
          <Route path="/about/:name" component={About} />
          <Route path="/about" component={About} />
        </Switch>
        <Route path="/posts" component={Posts} />
      </BrowserRouter>
    );
  }
}

export default App;
