import React from 'react';
import '../../styles/main.css';
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';
import { Theme, Typography, withStyles } from '@material-ui/core';
import GridaToolTip from '../../styles/GridaToolTip';
class fileLoad extends React.Component {
  render() {
    return (
      <React.Fragment>
        <button id="btn_file_open" type="button" className="btn btn-neo">
          <GridaToolTip open={true} placement="top"
            tip={{
              head: "PDF File Open",
              msg: "배경으로 쓸 PDF 파일을 엽니다. 스마트 플레이트로 조작하거나, 인쇄하여 덧필기할 수 있습니다.",
              tail: "키보드 버튼 Ctrl + O으로 이동 가능합니다"
            }}
            title={undefined}>
            <div className="c2">
              <img src='../../icons/icon_file_n.png' className="normal-image"></img>
              <img src='../../icons/icon_file_p.png' className="hover-image"></img>
            </div>
          </GridaToolTip>
        </button>
      </React.Fragment>
    )
  }
}

export default fileLoad;