import React, { CSSProperties } from "react";
import PenBasedRenderer, { PLAYSTATE } from "./pageviewer/PenBasedRenderer";
import NeoPdfViewer from "./pdf/NeoPdfViewer";
import { IPageSOBP } from "../DataStructure/Structures";
import { NeoSmartpen }from "../pencomm/neosmartpen";


export interface IMixedPageViewProps {
  pageInfo?: IPageSOBP;
  pdfUrl: string;
  pageNo: number;
  pens: NeoSmartpen[];

  scale: number,
  pageId: string,
  playState: PLAYSTATE;
}

export interface IMixedPageViewState {
  pageInfo: IPageSOBP;
  pdfUrl: string;

  /** NOTE: pageNo라고 씌어 있는 것은, 항상 PDF의 페이지번호(1부터 시작)를 나타내기로 한다.  */
  pageNo: number;
}

const tempStyle: CSSProperties = {
  position: "absolute",
  height: "100%",
  width: "100%",
  left: "0px",
  top: "0px",
  overflow: "hidden",
}

export default class MixedPageView extends React.Component<IMixedPageViewProps, IMixedPageViewState> {
  constructor(props: IMixedPageViewProps) {
    super(props);

    let { pageInfo, pdfUrl, pageNo } = props;

    if (!pageInfo) {
      pageInfo = { section: -1, owner: -1, book: -1, page: -1, }
    }

    this.state = { pageInfo, pdfUrl, pageNo };
  }

  onNcodePageChanged = (pageInfo: IPageSOBP) => {
    /** 
     * 임시코드, 2020/11/20, 나중에는 ncode와 매핑되어 있는 정보를 가지고 pageNo를 설정해야 한다 
     * 또는, PDF 파일을 바꿀 수 있도록 해야 한다. 
    */
    const pageDelta = pageInfo.page - this.props.pageInfo.page;
    this.setState({ pageNo: pageDelta + 1 });
    /** 여기까지 임시 내용 */
  }

  render() {
    return (
      <div id={"mixed_view"} style={{
        // position: "absolute",
        left: "0px", top: "0px",
        flexDirection: "row-reverse", display: "flex",
        width: "100%", height: "100%",
        alignItems: "center",
        zIndex: 1,
      }}>
        <div id={"pdf_layer"} style={tempStyle}>
          <NeoPdfViewer url={this.state.pdfUrl} pageNo={this.state.pageNo} />
        </div>
        <div id={"ink_layer"} style={tempStyle}>
          <PenBasedRenderer scale={1} pageId={"0.0.0.0"} playState={PLAYSTATE.live} pens={this.props.pens} />
        </div>
      </div>
    );
  }
}
