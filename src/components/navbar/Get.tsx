import React, { Component } from 'react';
import $ from 'jquery';
import { gapi } from 'gapi-script';

window.onload = function(){
    gapi.client.load('drive', 'v2', getFiles);
}

function getFiles(){
    var get = document.getElementById('get');
	// get = "1CjHDjg-EEEZVE3zXhuBQgJGuvzDamr2r";
}

class Get extends Component {
    render() {
        return (
            <div id="get">
                
            </div>
        );
    }
}

export default Get;