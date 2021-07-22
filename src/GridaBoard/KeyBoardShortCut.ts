
// 2020-12-09 현재 구현되어 있는 기능까지 단축키 완성(추가 구현된 기능 넣고 다른 버튼들 단축키 지정하기)

import { store } from "./client/pages/GridaBoard";
import { IBrushType, ZoomFitEnum } from "nl-lib/common/enums";
import PenManager from "nl-lib/neosmartpen/PenManager";
import { setActivePageNo } from "./store/reducers/activePageReducer";
import GridaDoc from "./GridaDoc";
import { setViewFit } from "./store/reducers/viewFitReducer";
import { setZoomStore } from "./store/reducers/zoomReducer";
import { setRotationTrigger } from "./store/reducers/rotate";
import { showAlert } from "./store/reducers/listReducer";
import { PEN_THICKNESS } from '../nl-lib/common/enums';
import $ from "jquery";
import { setPointerTracer } from "./store/reducers/pointerTracer";
import { showShortCut } from './store/reducers/ui';


/* 
let _isCtrl = false;
let _isAlt = false;
let _isShift = false;

export function KeyBoardShortCut_keyup(evt: KeyboardEvent) {
  if (evt.defaultPrevented) {
    return; // Should do nothing if the default action has been cancelled
  }

  switch (evt.key) {
    case "Alt": {
      _isAlt = false;
      break;
    }

    case "Control": {
      _isCtrl = false;
      break;
    }

    case "Shift": {
      _isShift = false;
      break;
    }
  }
  const cmd = (_isCtrl ? 1 : 0) | (_isAlt ? 2 : 0) | (_isShift ? 4 : 0) | (evt.metaKey ? 8 : 0);

  // console.log(`key up cmd=${cmd} ==> code=${evt.code}  key => ${evt.key}`);

} */


export default function KeyBoardShortCut(evt: KeyboardEvent) {
  if (evt.defaultPrevented) {
    return; // Should do nothing if the default action has been cancelled
  }
  const isCtrl = evt.ctrlKey, isAlt = evt.altKey, isShift = evt.shiftKey;

  const cmd = (isCtrl ? 1 : 0) | (isAlt ? 2 : 0) | (isShift ? 4 : 0) | (evt.metaKey ? 8 : 0);

  // console.log(`key down cmd=${cmd} ==> code=${evt.code}  key => ${evt.key}`);
  
  if (cmd == 0) {
    switch (evt.key.toLocaleLowerCase()) {
      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        {
          if(evt.code.indexOf("Numpad") === -1){
            const color_num = evt.keyCode - 0x30;
            PenManager.getInstance().setColor(color_num);
          }
        }

        break;

      case "a": // a
        // setPenThickness(1);
        break;

      case "b": // b
        PenManager.getInstance().setThickness(PEN_THICKNESS.THICKNESS5);
        break;

      case "c": // c
        PenManager.getInstance().setThickness(PEN_THICKNESS.THICKNESS3);
        break;

      case "d": // d
        // setPenThickness(3);
        showAlert({
          type: "deletePage",
          selected: null,
        })
        break;

      case "e": // e
        // setPenType(PenType.ERASER);
        PenManager.getInstance().setPenRendererType(IBrushType.ERASER);
        break;

      case "f": // f
        // setPenThickness(4);
        break;

      case "g": // g
        // setPenThickness(5);
        break;

      case "h": // h
        // onBtn_fitHeight();
        setViewFit(ZoomFitEnum.HEIGHT);
        break;
      case "l": //L
        (document.querySelector("#arrow-btn") as HTMLElement).click();
        break;
      case "p":{ // P
        evt.preventDefault(); //web 기본 탭 기능 정지
        const activePageNo = store.getState().activePage.activePageNo;
        //페이지가 하나도 없으면 인쇄 못함
        if(activePageNo === -1) break;

        (document.querySelector("#printBtn") as HTMLElement).click();
        break;
  
      }
      case "q": // q
        // setPenType(PenType.PEN);
        PenManager.getInstance().setPenRendererType(IBrushType.PEN);
        break;

      case "r": // r
        PenManager.getInstance().setPenRendererType(IBrushType.MARKER);
        break;

      case "s":{ // s => pdf save기능
        evt.preventDefault(); //web 기본 탭 기능 정지
        const activePageNo = store.getState().activePage.activePageNo;
        //페이지가 하나도 없으면 저장 못함
        if(activePageNo === -1) break;
        if((document.querySelector(".save_drop_down") as HTMLElement) == null)
          (document.querySelector(".saveButton") as HTMLElement).click();
        //1틱 뒤에 동작해야함
        setTimeout(()=>{
          const saveBtn = document.querySelector(".save_drop_down") as HTMLElement;
          if(saveBtn !== null)
            saveBtn.click();
        },0);
        break;
      }
      case "t": {// t
          const isTrace = store.getState().pointerTracer.isTrace;
          store.dispatch(setPointerTracer(!isTrace));
  
          const $elem = $(`#${"btn_tracepoint"}`);
          if (!isTrace) {
            const $elem = $("#btn_tracepoint").find(".c2");
            $elem.addClass("checked");
            $('#btn_tracepoint').css('background', 'white');
            $('#tracer_svg_icon').css('color', '#688FFF');
          } else {
            const $elem = $("#btn_tracepoint").find(".c2");
            $elem.removeClass("checked");
            $('#btn_tracepoint').css('background', 'none');
            $('#tracer_svg_icon').css('color', '#58627D');
          }
          break;
        }

      case "v": // v
        // onBtn_fitPaper();
        PenManager.getInstance().setThickness(PEN_THICKNESS.THICKNESS4);
        break;

      case "w": // w
        setViewFit(ZoomFitEnum.WIDTH);
        break;
      case "x" : {
        PenManager.getInstance().setThickness(PEN_THICKNESS.THICKNESS2);
        break;
      }
      case "y" : {
        (document.querySelector("#pageClearButton") as HTMLElement).click();
        break;
      }
      case "z" : {
        PenManager.getInstance().setThickness(PEN_THICKNESS.THICKNESS1);
        break;
      }
      case "tab": {// <TAB>
        evt.preventDefault(); //web 기본 탭 기능 정지
        (document.querySelector("#pageRotateButton") as HTMLElement).click();
        break;
      }

      // page up
      // case "pageup":
      case "arrowleft": {// 키보드 ←  
        if(document.querySelector("#main").clientHeight < (document.querySelector("#main") as HTMLElement).offsetHeight){
          //하단 스크롤 존재
          return ;
        }
        const activePageNo = store.getState().activePage.activePageNo;
        if (activePageNo <= 0) {
          return;
        }
        setActivePageNo(activePageNo-1);
        break;
      }
      // page down
      // case "pagedown":
      case "arrowright": {// →  
        if(document.querySelector("#main").clientHeight < (document.querySelector("#main") as HTMLElement).offsetHeight){
          //하단 스크롤 존재
          return ;
        }
        const activePageNo = store.getState().activePage.activePageNo;
        const numDocPages = store.getState().activePage.numDocPages;
        if (activePageNo === numDocPages-1) {
          return;
        }
        setActivePageNo(activePageNo+1);
        break;
      }

      case "+": {
        setViewFit(ZoomFitEnum.FREE);
        const zoom = store.getState().zoomReducer.zoom;
        const delta = -100;
        const newZoom = zoom * 0.9985 ** delta
        setZoomStore(newZoom);
        break;
      }

      case "-": {
        setViewFit(ZoomFitEnum.FREE);
        const zoom = store.getState().zoomReducer.zoom;
        const delta = 100;
        const newZoom = zoom * 0.9985 ** delta
        setZoomStore(newZoom);
        break;
      }
      case "escape" : {
        (document.querySelector("#arrow-btn") as HTMLElement).click();
        
        break ;
      }

    }
  } else if (cmd == 4) {
    switch (evt.key) {
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
        // togglePenStrokeVisible(evt.keyCode - 0x30);
        break;

      case "0":
        // toggleAllStrokesVisible();
        break;
    }
  } else if (cmd == 1) {
    switch (evt.key.toLocaleLowerCase()) {
      case "o":{ // ctrl-o
        evt.preventDefault(); //web 기본 오픈 기능 강제 스탑
        (document.querySelector("#loadFileButton") as HTMLSpanElement).click();
        
        break;
      }
      case "z": // ctrl-Z
        // onBtnUndo();
        break;

      case "y": // ctrl-Z
        // onBtnRedo();
        break;

      // ctrl - page up
      case "home": {
        const pageNo = 0;
        setActivePageNo(pageNo);

        // onPrevPage();
        break;
      }

      // ctrl - page down
      case "end": {
        const doc = GridaDoc.getInstance();
        const pageNo = doc.numPages - 1;
        setActivePageNo(pageNo);

        // onPrevPage();
        break;
      }

      case "+": 
      case "-": {
        evt.cancelBubble = true;
        evt.returnValue = false;
        break;
      }
    }
  } else if(cmd == 2){
    switch (evt.key.toLocaleLowerCase()) {
      case "alt" : {
        evt.preventDefault(); //web 기본 오픈 기능 강제 스탑
        showShortCut(!store.getState().ui.shotcut.show);
        break; 
      }
    }
  }

  // if (handled) {
  //   evt.preventDefault();
  // }
}
