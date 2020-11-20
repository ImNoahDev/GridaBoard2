import React from 'react';
import '../../styles/main.css';
import ColorButtons from './ColorButtons';

const style = {
  width: '36px',
  height: '36px',
  padding: '4px'
}

class menuButton extends React.Component {

  render() {
    return (
      <React.Fragment>
      <button id="btn_menu" type="button" className="btn btn-neo " title="Open a menu">
          <div className="c2">
            <img style={style} src={require('../../icons/all_menu.png')} className="normal-image"></img>
            <img style={style} src={require('../../icons/all_menu.png')} className="hover-image"></img>
          </div>
      </button>
      </React.Fragment>
      
    )
  }
}

export default menuButton;


