import React from 'react';
import '../../styles/main.css';


const style = {
    width: '36px',
    height: '36px',
    padding: '4px'
}

class bottomNav extends React.Component {
    render() {
        return (
            // <React.Fragment>
            <nav id="colornav" className="navbar fixed-bottom navbar-light bg-transparent">
                <div className="color_bar neo_shadow float-left bottom_text color_bar">
                    <div className="btn-group-vertical">
                        <button id="pen_info_btn" type="button" disabled className="btn btn-neo" title="Status">
                            <div className="c2 disabled state_0">
                                <img src={require('../../icons/icon_pen_n.png')} className="state_0 normal-image" />
                                <img src={require('../../icons/icon_pen_p.png')} className="state_0 hover-image"></img>

                                <img src={require('../../icons/icon_highlight_n.png')} className="state_1 normal-image"></img>
                                <img src={require('../../icons/icon_highlight_p.png')} className="state_1 hover-image"></img>

                                <img src={require('../../icons/icon_eraser_n.png')} className="state_2 normal-image"></img>
                                <img src={require('../../icons/icon_eraser_p.png')} className="state_2 hover-image"></img>

                                <span id="thickness_num_bottom" className="thickness-badge badge badge-pill badge-secondary">2</span>
                            </div>
                        </button>
                    </div>
                    <div className="btn-group">
                        <button id="clr_1" type="button" className="btn btn-neo color_btn othercolors" title="color 1">
                            <div className="color_icon color_1">
                            </div>
                        </button>

                        <button id="clr_2" type="button" className="btn btn-neo color_btn" title="Pen color">
                            <div className="color_icon color_2">
                            </div>
                        </button>
                        <button id="clr_3" type="button" className="btn btn-neo color_btn othercolors" title="color 3">
                            <div className="color_icon color_3">
                            </div>
                        </button>
                        <button id="clr_4" type="button" className="btn btn-neo color_btn othercolors" title="color 4">
                            <div className="color_icon color_4">
                            </div>
                        </button>
                        <button id="clr_5" type="button" className="btn btn-neo  color_btn othercolors" title="color 5">
                            <div className="color_icon color_5">
                            </div>
                        </button>
                        <button id="clr_6" type="button" className="btn btn-neo  color_btn othercolors" title="color 6">
                            <div className="color_icon color_6">
                            </div>
                        </button>
                        <button id="clr_7" type="button" className="btn btn-neo  color_btn othercolors" title="color 7">
                            <div className="color_icon color_7">
                            </div>
                        </button>
                        <button id="clr_8" type="button" className="btn btn-neo  color_btn othercolors" title="color 8">
                            <div className="color_icon color_8">
                            </div>
                        </button>
                        <button id="clr_9" type="button" className="btn btn-neo  color_btn othercolors" title="color 9">
                            <div className="color_icon color_9">
                            </div>
                        </button>
                        <button id="clr_0" type="button" className="btn btn-neo color_btn othercolors" title="color 0">
                            <div className="color_icon color_0">
                            </div>
                        </button>
                    </div>
                </div>

                <div className="navbar-menu d-flex justify-content-center align-items-center neo_shadow">
                    <button id="btn_prevpage" type="button" className="btn btn-neo " title="Previous page">
                        <div className="c2">
                            <img src={require('../../icons/icon_prev_n.png')} className="normal-image"></img>
                            <img src={require('../../icons/icon_prev_p.png')} className="hover-image"></img>
                        </div>
                    </button>
                    <input type="text" className="form-control-plaintext form-control-sm neo-form-pdf-number" placeholder=".form-control-sm"
                        value="Page:" readOnly />
                    <input id="curr_page_num" type="text" className="form-control form-control-sm neo-form-pdf-number"
                        placeholder=".form-control-sm" value=" " />
                    <input id="page_count" type="text" className="form-control-plaintext form-control-sm neo-form-pdf-number"
                        placeholder=".form-control-sm" value="/" readOnly />
                    <button id="btn_nextpage" type="button" className="btn btn-neo " title="Next page">
                        <div className="c2">
                            <img src={require('../../icons/icon_next_n.png')} className="normal-image"></img>
                            <img src={require('../../icons/icon_next_p.png')} className="hover-image"></img>
                        </div>
                    </button>
                    <button id="btn_print_pdf" type="button" disabled className="btn btn-neo " title="Print PDF">
                        <div className="c2 disabled">
                            <img src={require('../../icons/icon_print_n.png')} className="normal-image"></img>
                            <img src={require('../../icons/icon_print_p.png')} className="hover-image"></img>
                        </div>
                    </button>
                    <button id="btn_file_open" type="button" className="btn btn-neo " title="Open a file">
                        <div className="c2">
                            <img src={require('../../icons/icon_file_n.png')} className="normal-image"></img>
                            <img src={require('../../icons/icon_file_p.png')} className="hover-image"></img>
                        </div>
                    </button>
                </div>

                <div className="navbar-menu d-flex justify-content-end align-items-end neo_shadow">
                    <button id="btn_start_calibration" disabled type="button" className="btn btn-neo" title="Pairing paper with PDF">
                        <div className="c2 disabled">
                            <img style={style} src={require('../../icons/icon_calibration_n.png')} className="normal-image"></img>
                            <img style={style} src={require('../../icons/icon_calibration_p.png')} className="hover-image"></img>
                        </div>
                    </button>
                </div>
            </nav>
            // </React.Fragment>
        )
    }
}

export default bottomNav;