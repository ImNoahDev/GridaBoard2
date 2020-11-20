import React from 'react';
import '../../styles/main.css';
import MenuButtons from './MenuButton';

const DEFAULT_COLOR_NUM = 2;

// const _color_num = DEFAULT_COLOR_NUM;

const penManager = {
    name: "penManager",

    /** @type {number} */
    _color_num: DEFAULT_COLOR_NUM,

    /** @type {string[]} */
    colors: [
        "rgb(101, 44, 179)", // 0
        "rgb(255,255,255)",
        "rgb(0,0,0)",
        "rgb(180, 180, 180)",

        "rgb(254, 244, 69)",

        "rgb(250, 199, 16)",
        "rgb(227, 95, 72)",
        "rgb(16, 205, 212)",

        "rgb(11, 167, 137)",
        "rgb(218, 34, 99)", // 9
        "rgb(101, 44, 179)" // 10
    ],

    init() {
        setPenColor(this._color_num);
    },

    /**
     * @return {number} - color index: 0~9
     */
    get defaultColorNum() {
        return this._color_num;
    },

    /**
     * default penColor - rgb string
     */
    get defaultColor() {
        return this.colors[this._color_num];
    },

    /**
     *
     * @param {number} color_num - this.colors에 있는 color index
     */
    setColor(color_num) {
        // 펜이 연결되지 않은 상태에서 색깔을 바꿀 수도 있다.
        this._color_num = color_num;

        // if (_active_pen) {
        //     _active_pen.setColor(this.colors[color_num]);
        // }
    },
}

console.log(DEFAULT_COLOR_NUM);

function setPenColor(color_num) {
    // toggleColorRadioButton(color_num);
    penManager.setColor(color_num);
}

// function toggleColorRadioButton(color_num) {
//     var elem = document.getElementsByClassName('color_');
//     // var $elem = '.color_${color_num}';
//     // var $elem = '.color_' + color_num;
//     var $elem = elem + 'color_num;
//     toggleColorRadioButton_inner(undefined, $elem);
// }

// function toggleColorRadioButton_inner(e, $elem) {
//     if ($elem === undefined) {
//         $elem = e.target;
//     }
//     var target = e.target;
//     if ($elem.hasClass("color_icon")) {
//         ".color_icon".forEach(function () {
//             this.removeClass("pressed");
//         });
//         $elem.addClass("pressed");
//     }
// }

function onPenColor_1() {
    console.log("onPenColor_1");
    setPenColor(1);
}

function onPenColor_2() {
    console.log("onPenColor_2");
    setPenColor(2);
}

function onPenColor_3() {
    console.log("onPenColor_3");
    setPenColor(3);
}

function onPenColor_4() {
    console.log("onPenColor_4");
    setPenColor(4);
}

function onPenColor_5() {
    console.log("onPenColor_5");
    setPenColor(5);
}

function onPenColor_6() {
    console.log("onPenColor_6");
    setPenColor(6);
}

function onPenColor_7() {
    console.log("onPenColor_7");
    setPenColor(7);
}

function onPenColor_8() {
    console.log("onPenColor_8");
    setPenColor(8);
}
function onPenColor_9() {
    console.log("onPenColor_9");
    setPenColor(9);
}

function onPenColor_0() {
    console.log("onPenColor_0");
    setPenColor(0);
}

export const state = {
    color_state : false
}



class penColor extends React.Component {

//   colorFunction = (color_state) => {
//     console.log(color_state);
//   }  
  render() {

    state.color_state = true;
    if (state.color_state === true) {
        return (
            <div className="btn-group">
                <button id="clr_1" type="button" className="btn btn-neo color_btn othercolors" title="color 1" onClick={onPenColor_1}>
                    <div className="color_icon color_1">
                    </div>
                </button>
  
                <button id="clr_2" type="button" className="btn btn-neo color_btn" title="Pen color" onClick={onPenColor_2}>
                    <div className="color_icon color_2">
                    </div>
                </button>
                <button id="clr_3" type="button" className="btn btn-neo color_btn othercolors" title="color 3" onClick={onPenColor_3}>
                    <div className="color_icon color_3">
                    </div>
                </button>
                <button id="clr_4" type="button" className="btn btn-neo color_btn othercolors" title="color 4" onClick={onPenColor_4}>
                    <div className="color_icon color_4">
                    </div>
                </button>
                <button id="clr_5" type="button" className="btn btn-neo  color_btn othercolors" title="color 5" onClick={onPenColor_5}>
                    <div className="color_icon color_5">
                    </div>
                </button>
                <button id="clr_6" type="button" className="btn btn-neo  color_btn othercolors" title="color 6" onClick={onPenColor_6}>
                    <div className="color_icon color_6">
                    </div>
                </button>
                <button id="clr_7" type="button" className="btn btn-neo  color_btn othercolors" title="color 7" onClick={onPenColor_7}>
                    <div className="color_icon color_7">
                    </div>
                </button>
                <button id="clr_8" type="button" className="btn btn-neo  color_btn othercolors" title="color 8" onClick={onPenColor_8}>
                    <div className="color_icon color_8">
                    </div>
                </button>
                <button id="clr_9" type="button" className="btn btn-neo  color_btn othercolors" title="color 9" onClick={onPenColor_9}>
                    <div className="color_icon color_9">
                    </div>
                </button>
                <button id="clr_0" type="button" className="btn btn-neo color_btn othercolors" title="color 0" onClick={onPenColor_0}>
                    <div className="color_icon color_0">
                    </div>
                </button>
                {/* <MenuButtons colorFunction={this.colorFunction}></MenuButtons> */}
            </div>
      )       
    }else {
        return (
            <div className="btn-group">

            </div>
        )
    }
  }
}

export default penColor;