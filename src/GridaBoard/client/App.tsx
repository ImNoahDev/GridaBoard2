import React, { Component } from 'react';
import { Route } from 'react-router-dom';
// import GridaBoard from "./page/GridaBoard";
// import About from "./page/About";
import { About, GridaBoard } from "./pages"

class App extends Component {
    render() {
        return (
            <div>
              <Route path="/" component={GridaBoard}/>
              {/* <Route exact path="/" component={About}/> */}
              {/* <Route exact path="/app" component={GridaBoard}/> */}
            </div>
        );
    }
}

export default App;