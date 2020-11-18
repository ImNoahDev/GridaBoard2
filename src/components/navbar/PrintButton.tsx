import React from 'react';
import '../../styles/main.css';

class printFunction extends React.Component {
  render() {
    return (
      // <div className="navbar-menu d-flex justify-content-center align-items-center neo_shadow">
      <React.Fragment>
        <button id="btn_print_pdf" type="button" disabled className="btn btn-neo " title="Print PDF">
            <div className="c2 disabled">
                <img src={require('../../icons/icon_print_n.png')} className="normal-image"></img>
                <img src={require('../../icons/icon_print_p.png')} className="hover-image"></img>
            </div>
        </button>
        </React.Fragment>
      // </div>
    )
  }
}

export default printFunction;