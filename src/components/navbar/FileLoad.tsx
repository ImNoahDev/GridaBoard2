import React from 'react';
import '../../styles/main.css';

class fileLoad extends React.Component {
  render() {
    return (
      <React.Fragment>
        <button id="btn_file_open" type="button" className="btn btn-neo " title="Open a file">
            <div className="c2">
                <img src={require('../../icons/icon_file_n.png')} className="normal-image"></img>
                <img src={require('../../icons/icon_file_p.png')} className="hover-image"></img>
            </div>
        </button>
      </React.Fragment>
    )
  }
}

export default fileLoad;