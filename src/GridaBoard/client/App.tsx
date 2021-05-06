import React, { Component } from 'react';
import { Route } from 'react-router-dom';
// import GridaBoard from "./page/GridaBoard";
// import About from "./page/About";
import { Home, About, GridaBoard, LoginCheck } from "./pages"

class App extends Component {
    render() {
        return (
            <div>
              <Route path="/" component={GridaBoard}/>
              {/* <Route exact path="/" component={Home}/>
              <Route exact path="/about" component={About}/>
              <Route exact path="/app" component={GridaBoard}/>
              <Route exact path="/loginCheck" component={LoginCheck}/> */}
            </div>
        );
    }
}

export default App;