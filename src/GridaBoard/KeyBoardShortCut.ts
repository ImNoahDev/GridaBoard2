
// 2020-12-09 현재 구현되어 있는 기능까지 단축키 완성(추가 구현된 기능 넣고 다른 버튼들 단축키 지정하기)

import { IBrushType } from "../nl-lib/common/enums";
import PenManager from "../nl-lib/neosmartpen/PenManager";

export default function KeyBoardShortCut(evt) {

  // console.log("webViewerKeyDown");
  let handled = false;
  const ensureViewerFocused = false;
  const cmd = (evt.ctrlKey ? 1 : 0) | (evt.altKey ? 2 : 0) | (evt.shiftKey ? 4 : 0) | (evt.metaKey ? 8 : 0);

  // console.log(`keyCode = ${evt.keyCode}`);

  if (cmd == 0) {
    switch (true) {
      case 0x30 <= evt.keyCode && evt.keyCode <= 0x39: // '1'
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

      case 81 == evt.keyCode: // q
        // setPenType(PenType.PEN);
        PenManager.getInstance().setPenRendererType(IBrushType.PEN);
        handled = true;
        break;

      case 87 == evt.keyCode: // w
        // setPenType(PenType.MARKER);
        PenManager.getInstance().setPenRendererType(IBrushType.MARKER);
        handled = true;
        break;

      case 69 == evt.keyCode: // e
        // setPenType(PenType.ERASER);
        PenManager.getInstance().setPenRendererType(IBrushType.ERASER);
        handled = true;
        break;

      case 82 == evt.keyCode: // r
        break;

      case 84 == evt.keyCode: // t
        break;

      case 65 == evt.keyCode: // a
        // setPenThickness(1);
        PenManager.getInstance().setThickness(1);
        handled = true;
        break;

      case 83 == evt.keyCode: // s
        // setPenThickness(2);
        PenManager.getInstance().setThickness(2);
        handled = true;
        break;

      case 68 == evt.keyCode: // d
        // setPenThickness(3);
        PenManager.getInstance().setThickness(3);
        handled = true;
        break;

      case 70 == evt.keyCode: // f
        // setPenThickness(4);
        // handled = true;
        break;

      case 71 == evt.keyCode: // g
        // setPenThickness(5);
        // handled = true;
        break;

      case 90 == evt.keyCode: // z
        // onBtn_fitWidth();
        // handled = true;
        break;

      case 88 == evt.keyCode: // x
        // onBtn_fitHeight();
        // handled = true;
        break;

      case 67 == evt.keyCode: // c
        // onBtn_fitCanvas();
        // handled = true;
        break;

      case 86 == evt.keyCode: // v
        // onBtn_fitPaper();
        // handled = true;
        break;

      case 66 == evt.keyCode: // b
        break;

      case 9 == evt.keyCode: // <TAB>
        // onRotateButton();
        // handled = true;
        break;


      case 80 == evt.keyCode: // P
        // toggleAllStrokesVisible();
        // handled = true;
        break;

      case 33 == evt.keyCode: // page up
        // onPrevPage();
        // handled = true;
        break;
      case 34 == evt.keyCode: // page down
        // onNextPage();
        // handled = true;
        break;

    }
  } else if (cmd == 4) {
    switch (evt.keyCode) {
      case 0x31:
      case 0x32:
      case 0x33:
      case 0x34:
      case 0x35:
      case 0x36:
      case 0x37:
      case 0x38:
      case 0x39:
        // togglePenStrokeVisible(evt.keyCode - 0x30);
        // handled = true;
        break;

      case 0x30:
        // toggleAllStrokesVisible();
        // handled = true;
        break;
    }
  } else if (cmd == 1) {
    switch (evt.keyCode) {
      case 90: // ctrl-Z
        // onBtnUndo();
        // handled = true;
        break;

      case 89: // ctrl-Z
        // onBtnRedo();
        // handled = true;
        break;
    }
  }

  if (handled) {
    evt.preventDefault();
  }
}
