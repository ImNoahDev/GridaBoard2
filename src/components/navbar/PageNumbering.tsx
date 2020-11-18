import React from 'react';
import '../../styles/main.css';

class pageNumbering extends React.Component {
  render() {
    return (
      // <div className="navbar-menu d-flex justify-content-center align-items-center neo_shadow">
      <React.Fragment>
        <button id="btn_prevpage" type="button" className="btn btn-neo " title="Previous page">
            <div className="c2">
                <img src={require('../../icons/icon_prev_n.png')} className="normal-image"></img>
                <img src={require('../../icons/icon_prev_p.png')} className="hover-image"></img>
            </div>
        </button>
        <input type="text" className="form-control-plaintext form-control-sm neo-form-pdf-number" placeholder=".form-control-sm"
            value="Page:" readOnly />
        <input id="curr_page_num" type="text" className="form-control form-control-sm neo-form-pdf-number"
            placeholder=".form-control-sm" value=" " />
        <input id="page_count" type="text" className="form-control-plaintext form-control-sm neo-form-pdf-number"
            placeholder=".form-control-sm" value="/" readOnly />
        <button id="btn_nextpage" type="button" className="btn btn-neo " title="Next page">
            <div className="c2">
                <img src={require('../../icons/icon_next_n.png')} className="normal-image"></img>
                <img src={require('../../icons/icon_next_p.png')} className="hover-image"></img>
            </div>
        </button>
      </React.Fragment>
    )
  }
}

export default pageNumbering;