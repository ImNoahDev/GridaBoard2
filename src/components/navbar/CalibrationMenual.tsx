import React from 'react';
import '../../styles/main.css';

const style = {
  width: '36px',
  height: '36px',
  padding: '4px'
}

class calibrationMenual extends React.Component {
  render() {
    return (
      <div className="navbar-menu d-flex justify-content-end align-items-end neo_shadow">
          <button id="btn_start_calibration" disabled type="button" className="btn btn-neo" title="Pairing paper with PDF">
              <div className="c2 disabled">
                  <img style={style} src={require('../../icons/icon_calibration_n.png')} className="normal-image"></img>
                  <img style={style} src={require('../../icons/icon_calibration_p.png')} className="hover-image"></img>
              </div>
          </button>
      </div>
    )
  }
}

export default calibrationMenual;