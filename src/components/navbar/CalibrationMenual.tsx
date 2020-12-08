import React from 'react';
import '../../styles/main.css';

const style = {
  width: '36px',
  height: '36px',
  padding: '4px'
}

class ManualCalibration extends React.Component {
  render() {
    return (
          <button id="btn_start_calibration" disabled type="button" className="btn btn-neo" title="Pairing paper with PDF">
              <div className="c2 disabled">
                  <img style={style} src='../../icons/icon_calibration_n.png' className="normal-image"></img>
                  <img style={style} src='../../icons/icon_calibration_p.png' className="hover-image"></img>
              </div>
          </button>
    )
  }
}

export default ManualCalibration;