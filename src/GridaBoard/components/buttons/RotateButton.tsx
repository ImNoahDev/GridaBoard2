import React from "react";
import '../../styles/buttons.css';
import GridaToolTip from "../../styles/GridaToolTip";
import { RootState } from '../../store/rootReducer';
import { setRotationTrigger } from '../../store/reducers/rotate';
import { useSelector } from 'react-redux';
import GridaDoc from "../../GridaDoc";
import { IconButton, SvgIcon } from "@material-ui/core";
import $ from "jquery";

const RotateButton = () => {
  const doc = GridaDoc.getInstance();

  const rotationTrigger = useSelector((state: RootState) => state.rotate.rotationTrigger);
  const activePageNo_store = useSelector((state: RootState) => state.activePage.activePageNo);

  let disabled = true;
  if (activePageNo_store !== -1) {
    disabled = false;
  }

  const onToggleRotate = () => {
    setRotationTrigger(!rotationTrigger);

    const page = doc.getPageAt(activePageNo_store);

    if (page._pdfPage !== undefined) {
      if (page._pdfPage.viewport.rotation >= 270) {
        page._pdfPage.viewport.rotation = 0;
      } else {
        page._pdfPage.viewport.rotation += 90;
      }
    }

    if (page.pageOverview.rotation >= 270) {
      page._rotation = 0;
    } else {
      page._rotation += 90;
    }

    if (page.pageOverview.rotation == 90 || page.pageOverview.rotation == 270) {
      $('#vertical_rotate').css('display', 'none');
      $('#horizontal_rotate').css('display', 'block');
    } else {
      $('#vertical_rotate').css('display', 'block');
      $('#horizontal_rotate').css('display', 'none');
    }

    const tmp = page.pageOverview.sizePu.width ;
    page.pageOverview.sizePu.width = page.pageOverview.sizePu.height;
    page.pageOverview.sizePu.height = tmp;
  }

  $('#vertical_rotate').hover(function() {
    $(this).css("color", "rgba(104,143,255,1)")
  },function() {
    $(this).css("color", "rgba(18,18,18,1)")
  });

  $('#horizontal_rotate').hover(function() {
    $(this).css("color", "rgba(104,143,255,1)")
  },function() {
    $(this).css("color", "rgba(18,18,18,1)")
  });

  const brZoom = useSelector((state: RootState) => state.ui.browser.zoom);

  const verticalStyle = {
    background: "rgba(255, 255, 255, 0.8)",
    boxShadow: "2px 0px 24px rgba(0, 0, 0, 0.15), inset 0px 2px 0px rgba(255, 255, 255, 0.15)",
    borderRadius: "40px",
    display: "block",
    flexWrap: "wrap",
    zIndex: 100,
    zoom: 1 / brZoom,
  } as React.CSSProperties;

  const horizontalStyle = {
    background: "rgba(255, 255, 255, 0.8)",
    boxShadow: "2px 0px 24px rgba(0, 0, 0, 0.15), inset 0px 2px 0px rgba(255, 255, 255, 0.15)",
    borderRadius: "40px",
    display: "none",
    flexWrap: "wrap",
    zIndex: 100,
    zoom: 1 / brZoom,
  } as React.CSSProperties;
  // if (activePageNo_store === -1) {

  // }

  return (
    // <GridaToolTip open={true} placement="left" tip={{
    //     head: "Rotate",
    //     msg: "종이 또는 스마트 플레이트의 입력이 회전되어 반영될지 아닐지를 선택합니다.",
    //     tail: "TAB 가로쓰기/세로쓰기 전환"
    //   }} title={undefined}>
      <div className="c2">
        <IconButton id="vertical_rotate" style={verticalStyle} onClick={onToggleRotate} disabled={disabled}>
          <SvgIcon>
            <path
              d="M8.55 4.9l2.667-2a.5.5 0 000-.8L8.55.1a.5.5 0 00-.8.4v1.25C5.105 1.75 3 3.956 3 6.627c0 .793.185 1.544.514 2.208a.75.75 0 001.344-.666A3.462 3.462 0 014.5 6.626C4.5 4.74 5.977 3.25 7.75 3.25V4.5a.5.5 0 00.8.4z"
            />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.733 9v13h9.534V9H8.733zm-.866-2C7.388 7 7 7.448 7 8v15c0 .552.388 1 .867 1h11.266c.479 0 .867-.448.867-1V8c0-.552-.388-1-.867-1H7.867z"
              />
          </SvgIcon>
        </IconButton>
        <IconButton id="horizontal_rotate" style={horizontalStyle} onClick={onToggleRotate} disabled={disabled}>
          <SvgIcon>
          <path
            d="M8.55 4.9l2.667-2a.5.5 0 000-.8L8.55.1a.5.5 0 00-.8.4v1.25C5.105 1.75 3 3.956 3 6.627c0 .793.185 1.544.514 2.208a.75.75 0 001.344-.666A3.462 3.462 0 014.5 6.626C4.5 4.74 5.977 3.25 7.75 3.25V4.5a.5.5 0 00.8.4z"
          />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M8 20.267h13v-9.534H8v9.534zm-2 .866c0 .479.448.867 1 .867h15c.552 0 1-.388 1-.867V9.867C23 9.388 22.552 9 22 9H7c-.552 0-1 .388-1 .867v11.266z"
            />
          </SvgIcon>
        </IconButton>
      </div>
    // </GridaToolTip>
  );
}

export default RotateButton;