import React from 'react';
import '../../styles/main.css';

class canvas extends React.Component {
    render() {
        return (
          <div id="writing_board" className="hide_when_print">
              <canvas id="pdf_canvas"></canvas>
              <canvas id="ink_canvas"></canvas>
          </div>
        )
    }
}

export default canvas;