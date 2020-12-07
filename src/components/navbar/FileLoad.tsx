import React from 'react';
import '../../styles/main.css';
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';
import { Theme, Typography, withStyles } from '@material-ui/core';

const PdfFileTooltip = withStyles((theme: Theme) => ({
  tooltip: {
      backgroundColor: '#f5f5f9',
      color: 'rgba(0, 0, 0, 0.87)',
      maxWidth: 240,
      fontSize: theme.typography.pxToRem(12),
      border: '1px solid #dadde9',
  },
}))(Tooltip);

class fileLoad extends React.Component {
  render() {
    return (
      <React.Fragment>
        <button id="btn_file_open" type="button" className="btn btn-neo " title="Open a file">
          <PdfFileTooltip placement="top" title={
            <React.Fragment>
                <Typography color="inherit">PDF File Open</Typography>
                <em>{"배경으로 쓸 PDF 파일을 엽니다. 스마트 플레이트로 조작하거나, 인쇄하여 덧필기할 수 있습니다."}</em>
                <br></br>
                <b>{"키보드 버튼 Ctrl + O으로 이동 가능합니다"}</b>
            </React.Fragment>
                }>
            <div className="c2">
                <img src='../../icons/icon_file_n.png' className="normal-image"></img>
                <img src='../../icons/icon_file_p.png' className="hover-image"></img>
            </div>
          </PdfFileTooltip>
        </button>
      </React.Fragment>
    )
  }
}

export default fileLoad;