import React, { Component, createRef } from "react";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import { uuidv4 } from "../NcodePrintLib";
import { IMappingParams, IPdfPageDesc } from "../NcodePrintLib/Coordinates";
import { IPageSOBP, ISizeDpi } from "../NcodePrintLib/DataStructure/Structures";
import { PenBasedRenderer } from "../neosmartpen";
import { IRenderWorkerOption, PLAYSTATE } from "../neosmartpen/renderer/pageviewer/RenderWorkerBase";
import NeoPdfViewer from "../neosmartpen/renderer/pdf/NeoPdfViewer";
import { Page } from "../neosmartpen/renderer/pdf/Page";

interface Props {
  pdfUrl: string,
  pdfFilename: string,
  pageNo: string,

  pageInfo: IPageSOBP,
  rotation: number,

  mapping: IMappingParams;
}

interface State {
  status: string,
}

export default class GridaPage extends Component<Props, State> {

  mappingInfo: IMappingParams;
  pdfPage: Page;

  penPage: PenBasedRenderer;

  size: ISizeDpi;

  canvasId = uuidv4();
  inkCanvasRef: React.RefObject<PenBasedRenderer> = React.createRef();

  // setCanvasRef = (canvas: HTMLCanvasElement) => this.canvas = canvas;
  // setInkCanvasRef = (canvas: HTMLCanvasElement) => this.canvas = canvas;

  state: State = {
    status: "N/A",
  }

  render = () => {
    const pdfCanvas: CSSProperties = {
      position: "absolute",
      height: "0px",
      width: "0px",
      left: "0px",
      top: "0px",
      // zoom: this.state.canvasPosition.zoom,
      overflow: "visible",
    }

    const inkCanvas: CSSProperties = {
      position: "absolute",
      height: "100%",
      width: "100%",
      left: "0px",
      top: "0px",
      overflow: "visible",
    }

    return (
      <div id={"mixed_view"} style={{
        position: "absolute",
        left: "0px", top: "0px",
        // flexDirection: "row-reverse", display: "flex",
        width: "100%", height: "100%",
        alignItems: "center",
        zIndex: 1,
      }
      }>
        <div id={"pdf_layer"} style={pdfCanvas} >
          <NeoPdfViewer
            url={this.props.pdfUrl}
            filename={this.props.pdfFilename}
            pageNo={this.props.pageNo} onReportPdfInfo={undefined}
            position={undefined}
          />
        </div>
        < div id={"ink_layer"} style={inkCanvas} >
          <PenBasedRenderer
            scale={1}
            pageInfo={this.props.pageInfo}
            playState={PLAYSTATE.live} pens={[]}
            onNcodePageChanged={undefined}
            onCanvasShapeChanged={undefined}
            ref={this.inkCanvasRef}
            rotation={this.props.rotation}
            h={this.props.mapping.h}
          />
        </div>
      </div>
    );
  }
}