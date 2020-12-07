
import PenManager from '../neosmartpen/pencomm/PenManager';
import jQuery from "jquery";

let $ = jQuery;
let _thememanager_instance = null;

export default class ThemeManager {
  penManager = PenManager.getInstance();
  constructor() {
    if (_thememanager_instance) return _thememanager_instance;
  }

  /**
   * @return {ThemeManager}
   */
  static getInstance() {
    if (_thememanager_instance) return _thememanager_instance;

    _thememanager_instance = new ThemeManager();
    return _thememanager_instance;
  }

  public setFitToZoomIcon(icon_name) {
    if (!icon_name) {
      icon_name = "icon_ratio";
    }

    let norm_img = "icons/" + icon_name + "_n.png";
    let hover_img = "icons/" + icon_name + "_p.png";

    let $elem = $("#btn_fit");
    let $c2 = $elem.children(".c2");
    $c2.children(".normal-image").attr("src", norm_img);
    $c2.children(".hover-image").attr("src", hover_img);
  }

  public setUITextColor(c) {
    document.getElementById("grida_board").style.color = c;
  }

  public setUITextColorNormal() {
    this.setUITextColor("#000000");
  }

  public setUiTextColorInverse() {
    this.setUITextColor("#ffffff");
  }

  // white board 등
  private setPenColorNormal() {
    let c = this.penManager.defaultColorNum;
    if (c === 1) {
      // 흰색 펜이면
      c = 2;
    }
    this.penManager.setColor(c);
  }

  // blackboard 등
  private setPenColorInverse() {
    let c = this.penManager.defaultColorNum;
    if (c === 2) {
      // 검은색 펜이면
      c = 1;
    }

    this.penManager.setColor(c);
  }

  private setThemeDark(val) {
    if (val) {
      this.setPenColorInverse();
      this.setUiTextColorInverse();
    } else {
      this.setPenColorNormal();
      this.setUITextColorNormal();
    }
  }

  // Theme 1: Gurodong
  public setT1() {
    document.body.style.backgroundColor = "rgb(255,229,237)";
    document.body.style.backgroundImage = "-o-linear-gradient(bottom, rgb(255,229,237) 0%, rgb(224,255,233) 100%)";
    document.body.style.backgroundImage = "-moz-linear-gradient(bottom, rgb(255,229,237) 0%, rgb(224,255,233) 100%)";
    document.body.style.backgroundImage = "-webkit-linear-gradient(bottom, rgb(255,229,237) 0%, rgb(224,255,233) 100%)";
    document.body.style.backgroundImage = "-ms-linear-gradient(bottom, rgb(255,229,237) 0%, rgb(224,255,233) 100%)";
    document.body.style.backgroundImage = "linear-gradient(bottom, rgb(255,229,237) 0%, rgb(224,255,233) 100%)";
    this.setThemeDark(false);
  }

  // Theme 2: Aubergine
  public setT2() {
    document.body.style.backgroundColor = "#cc2b5e";
    document.body.style.backgroundImage = "-webkit-linear-gradient(bottom, #cc2b5e 0%, #753a88 100%)";
    this.setThemeDark(false);
  }

  // Theme 3: Grid
  public setT3() {
    document.body.style.backgroundColor = "rgb(255, 255, 255)";
    document.body.style.backgroundImage = "-webkit-linear-gradient(bottom, rgb(255, 255, 255) 0%, rgb(230, 230, 230) 100%)";
    this.setThemeDark(false);

    console.log("theme3");
  }

  // Theme 4: Whiteboard
  public setT4() {
    document.body.style.backgroundColor = "rgb(255, 255, 255)";
    document.body.style.backgroundImage = "-webkit-linear-gradient(bottom, rgb(255, 255, 255) 0%, rgb(230, 230, 230) 100%)";
    this.setThemeDark(false);

    console.log("theme4");
  }

  // Theme 5: Blackboard
  public setT5() {
    document.body.style.backgroundColor = "rgb(33, 33, 33)";
    document.body.style.backgroundImage = "-webkit-linear-gradient(bottom, rgb(33, 33, 33) 0%, rgb(0, 0, 0) 100%)";
    this.setThemeDark(true);

    console.log("theme5");
  }

  public toggleFullScreen() {
    let document: any = window.document;

    let isInFullScreen =
      (document.fullscreenElement && document.fullscreenElement !== null) ||
      (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
      (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
      (document.msFullscreenElement && document.msFullscreenElement !== null);

    let docElm = document.documentElement;
    if (!isInFullScreen) {
      if (docElm.requestFullscreen) {
        docElm.requestFullscreen();
      } else if (docElm.mozRequestFullScreen) {
        docElm.mozRequestFullScreen();
      } else if (docElm.webkitRequestFullScreen) {
        docElm.webkitRequestFullScreen();
      } else if (docElm.msRequestFullscreen) {
        docElm.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  }

  private addDisabledAttr(elem_name, sw) {
    let $elem = $(`#${elem_name}`);
    if (sw) {
      $elem.prop("disabled", false);
      $elem.children(".c2").removeClass("disabled");
    } else {
      $elem.prop("disabled", true);
      $elem.children(".c2").addClass("disabled");
    }
  }
  public enablePenRelatedButtons(sw) {
    //   this.addDisabledAttr("pen_info_btn", sw);
    this.addDisabledAttr("btn_brush", sw);
  }

  public enablePdfRelatedButtons(sw) {
    this.addDisabledAttr("btn_clear_pdf", sw);
    this.addDisabledAttr("btn_print_pdf", sw);
    this.addDisabledAttr("btn_start_calibration", sw);
  }
}