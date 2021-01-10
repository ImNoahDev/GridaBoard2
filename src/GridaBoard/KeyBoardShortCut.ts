
// 2020-12-09 현재 구현되어 있는 기능까지 단축키 완성(추가 구현된 기능 넣고 다른 버튼들 단축키 지정하기)

import { store } from "../client/Root";
import { IBrushType } from "../nl-lib/common/enums";
import PenManager from "../nl-lib/neosmartpen/PenManager";
import { setActivePageNo } from "../store/reducers/activePageReducer";
import GridaDoc from "./GridaDoc";


let _isCtrl = false;
let _isAlt = false;
let _isShift = false;
let _isMeta = false;

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

  console.log(`key up cmd=${cmd} ==> code=${evt.code}  key => ${evt.key}`);

}


export default function KeyBoardShortCut(evt: KeyboardEvent) {
  if (evt.defaultPrevented) {
    return; // Should do nothing if the default action has been cancelled
  }

  let handled = false;
  switch (evt.key) {
    case "Alt": {
      _isAlt = true;
      handled = true;
      break;
    }

    case "Control": {
      _isCtrl = true;
      handled = true;
      break;
    }

    case "Shift": {
      _isShift = true;
      handled = true;
      break;
    }
  }

  const cmd = (_isCtrl ? 1 : 0) | (_isAlt ? 2 : 0) | (_isShift ? 4 : 0) | (evt.metaKey ? 8 : 0);

  console.log(`key down cmd=${cmd} ==> code=${evt.code}  key => ${evt.key}`);

  if (cmd == 0) {
    switch (evt.key) {
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
          const color_num = evt.keyCode - 0x30;
          PenManager.getInstance().setColor(color_num);
          // setPenColor(color_num);
          // toggleColorRadioButton( color_num );
          // console.log(`                ==> setColor(${color_num})`);
          // var $elem = $(`.color_${color_num}`);
          // processColorRadioButton(undefined, $elem);
          handled = true;
        }

        break;

      case "q": // q
        // setPenType(PenType.PEN);
        PenManager.getInstance().setPenRendererType(IBrushType.PEN);
        handled = true;
        break;

      case "w": // w
        // setPenType(PenType.MARKER);
        PenManager.getInstance().setPenRendererType(IBrushType.MARKER);
        handled = true;
        break;

      case "e": // e
        // setPenType(PenType.ERASER);
        PenManager.getInstance().setPenRendererType(IBrushType.ERASER);
        handled = true;
        break;

      case "r": // r
        break;

      case "t": // t
        break;

      case "a": // a
        // setPenThickness(1);
        PenManager.getInstance().setThickness(1);
        handled = true;
        break;

      case "s": // s
        // setPenThickness(2);
        PenManager.getInstance().setThickness(2);
        handled = true;
        break;

      case "d": // d
        // setPenThickness(3);
        PenManager.getInstance().setThickness(3);
        handled = true;
        break;

      case "f": // f
        // setPenThickness(4);
        // handled = true;
        break;

      case "g": // g
        // setPenThickness(5);
        // handled = true;
        break;

      case "z": // z
        // onBtn_fitWidth();
        // handled = true;
        break;

      case "x": // x
        // onBtn_fitHeight();
        // handled = true;
        break;

      case "c": // c
        // onBtn_fitCanvas();
        // handled = true;
        break;

      case "v": // v
        // onBtn_fitPaper();
        // handled = true;
        break;

      case "b": // b
        break;

      case "Tab": // <TAB>
        // onRotateButton();
        // handled = true;
        break;


      case "p": // P
        // toggleAllStrokesVisible();
        // handled = true;
        break;

      // page up
      case "PageUp": {
        const doc = GridaDoc.getInstance();
        const state = store.getState();
        const activePageNo = state.activePage.activePageNo;
        const pageNo = Math.max(0, activePageNo - 1);
        setActivePageNo(pageNo);

        // onPrevPage();
        handled = true;
        break;
      }

      // page down
      case "PageDown": {
        const doc = GridaDoc.getInstance();
        const state = store.getState();
        const activePageNo = state.activePage.activePageNo;
        const pageNo = Math.min(doc.numPages - 1, activePageNo + 1);
        setActivePageNo(pageNo);

        // onPrevPage();
        handled = true;
        break;
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
        // handled = true;
        break;

      case "0":
        // toggleAllStrokesVisible();
        // handled = true;
        break;
    }
  } else if (cmd == 1) {
    switch (evt.key) {
      case "z": // ctrl-Z
        // onBtnUndo();
        // handled = true;
        break;

      case "y": // ctrl-Z
        // onBtnRedo();
        // handled = true;
        break;

      // ctrl - page up
      case "Home": {
        const pageNo = 0;
        setActivePageNo(pageNo);

        // onPrevPage();
        handled = true;
        break;
      }

      // ctrl - page down
      case "End": {
        const doc = GridaDoc.getInstance();
        const pageNo = doc.numPages - 1;
        setActivePageNo(pageNo);

        // onPrevPage();
        handled = true;
        break;
      }
    }
  }

  // if (handled) {
  //   evt.preventDefault();
  // }
}
