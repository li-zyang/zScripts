// ==UserScript==
// @name         Base64-Select-to-Codec
// @name:ZH-CN   Base64 选区解编码
// @name:ZH-TW   Base64 選區解編碼
// @namespace    https://github.com/li-zyang
// @version      0.1.0
// @description  Encode or decode selected text to / from Base64
// @description:ZH-CN  将选区文本 编码为 Base64 / 从 Base64 解码
// @description:ZH-TW  將選區文本 編碼爲 Base64 / 從 Base64 解碼
// @author       阿昭
// @include      *://*
// @exclude      none
// @require      https://cdn.staticfile.org/jquery/3.4.1/jquery.min.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @connect      *
// @noframes
// @run-at       document-end
// @note         v1.0.0      1970-01-01  Add your release notes here.
// ==/UserScript==

// => More metadata:
// @contributor  the contributors of this script
// @homepageURL  the homepage of this script (commonly <sth>.io)
// @supportURL   Defines the URL where the user can report issues and get personal support. (such as https://greasyfork.org/scripts/41537)
// @icon         url of the icon for this script, data64 is okay
// @license      license of this script
// @compatible   descript compatibility, just a human-readable message
// @match

// See https://www.tampermonkey.net/documentation.php for full documention

(function(window, $) {
  'use strict';
  window.B64_sel2codec = {};
  B64_sel2codec.utob = function(str) {
    return window.btoa(
      unescape(
        encodeURIComponent(str)
      )
    );
  }
  B64_sel2codec.btou = function(str) {
    return decodeURIComponent(
      escape(
        window.atob(str)
      )
    );
  }
  B64_sel2codec.vinput = $('<input></input>');
  B64_sel2codec.panel = $(`
    <div class="B64-sel2codec B64-sel2codec-root">
      <div class="B64-sel2codec B64-sel2codec-preceding">
      </div>
      <div class="B64-sel2codec B64-sel2codec-panel">
        <div class="B64-sel2codec B64-sel2codec-btn-wrapper">
          <button class="B64-sel2codec B64-sel2codec-btn B64-sel2codec-copy-base64" />
        </div>
        <div class="B64-sel2codec B64-sel2codec-btn-wrapper">
          <button class="B64-sel2codec B64-sel2codec-btn B64-sel2codec-copy-plain"  />
        </div>
      </div>
    </div>`
  )
  B64_sel2codec.style = $(`
    <style>
      B64-sel2codec {
        --pan-bg: transparent;
        --btn-bg: linear-gradient(30deg, #313131, #404040, #484848);
        --btn-hover-bg: linear-gradient(30deg, #b44400, #db8313, #e5b456);
        --base64-btn-fg: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAADZQTFRFAAAAz8/Pzs7Ozc3Nzc3Nzs7OzMzMzc3Nzs7OzMzMzMzMz8/Pz8/Py8vLzc3Nzc3Nzs7OzMzMGqxWFwAAABJ0Uk5TACD/78+vYL+fUHAQMECA34+IS4o6oAAAAKpJREFUeJzlkksOwyAMRG1sQxxMkt7/sgVUFKqQz7JSZzVCT4PHMsDfCF0TsfhLoCjcAW4aA15VZ6n/jAGs1hcbLwB8kiBjQM0sLatzq123YLyrKScJkhVCrXnI6Ia0dbSpDqg1Dj17wIoHSJp91AGwlCKQeMsxW9vpDkSlOoNsc4pevoBdlIB5IWQ8AfLJhBno5ajdRg9Q3ZPSxBFiS4jalOzzZIpdi5/XG4MpBTeqNi57AAAAAElFTkSuQmCC");
        --plain-btn-fg:  url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAEVQTFRFAAAAzs7Ozs7Oz8/PzMzMzs7Ozs7Oz8/Pzc3NzMzMz8/Pzc3NzMzMzs7Ozc3Ny8vLz8/Pzc3NzMzMzMzMzc3Nzc3Nzc3N2Rnt+AAAABd0Uk5TAJ//MFCPryDfYBC/dErvQJaAW3DPwy7Zb6ejAAAAbElEQVR4nO3SwQ5AMAwG4G5tKWM1w/s/KnMjGxcHCf+pSb80PfwA34mxx+DzgDglrap9qvOfyAaaq1d/kAXtHWBTAOikc+h68ZQHjtUPnssXxIQw2lgGcTKzJ4ssegJKRKkJqIsCIlChFi/MCkmNBAXqVWHkAAAAAElFTkSuQmCC");
        --btn-shadow: 1px 1px 3px rgba(0, 0, 0, .16);
        --btn-hover-shadow: 1px 1px 0px rgba(250, 243, 240, .16);
        --transi-dur: 0.3s;
      }
    </style>
  `)
  B64_sel2codec.fullNode = $('');
  B64_sel2codec.copy = function(text) {
    vinput = B64_sel2codec.vinput;
    vinput.val(text);
    vinput[0].select();
    document.execCommand("copy");
  }
  B64_sel2codec.lastKeyCode = 0;
  B64_sel2codec.selempty = true;
  
  B64_sel2codec.handleClear = function() {
    // handle selection clear
    if (!B64_sel2codec.selempty) {
      B64_sel2codec.selempty = true;
      console.log('handling selection clear ...');
    }
  }
  
  B64_sel2codec.handleSelect = function() {
    // handle selection creation
    if (B64_sel2codec.selempty) {
      B64_sel2codec.selempty = false;
    }
    console.log('handling selection creation ...');
    /**
     * TODO: handle panel positioning
     *
     * - Getting Element's current position & size info (https://stackoverflow.com/questions/442404/): 
     *   temp0.getBoundingClientRect()
     *    DOMRect
     *    bottom: 242.06666564941406
     *    height: 20
     *    left: 461.01666259765625
     *    right: 692.6666717529297
     *    top: 222.06666564941406
     *    width: 231.65000915527344
     *    x: 461.01666259765625
     *    y: 222.06666564941406
     *    <prototype>: DOMRectPrototype { x: Getter & Setter, y: Getter & Setter, width: Getter & Setter, … }
     *
     * - Selection: 
     *   getSelection()
     *    // The Start node of the selection, maybe a real node or #text
     *    anchorNode: #text "First, you will need to have the "
     *
     *    // Character distance between the starting caret & the left-most character of the start node
     *    anchorOffset: 7
     *
     *    caretBidiLevel: 0
     *
     *    // The End node of the selection
     *    focusNode: #text "First, you will need to have the "
     *
     *    focusOffset: 26
     *
     *    // true if empty
     *    isCollapsed: false
     *    rangeCount: 1
     *    type: "Range"
     *    <prototype>: SelectionPrototype { getRangeAt: getRangeAt(), addRange: addRange(), removeRange: removeRange(), … }
     *
     * - Get selected text:
     *   getSelection().toString()
     */

    if (type(precdNode.tagName) == 'undefined') {
      let selection = getSelection();
      let focusNode = selection.focusNode;
      let precdNode = focusNode.cloneNode();
      let precdNode.data = precdNode.data.slice(0, selection.focusOffset);
      let parentNode = precdNode.parentNode;
      let parenClone = parentNode.cloneNode();
    } else {
      console.log('non-text element selected, skipped');
    }
    B64_sel2codec.panel.find('.B64-sel2codec-preceding')
      .html(precdNode.)
  }
  
  $('body').on('mousedown', function() {
    // selection may be cleared
    // console.log('mousedown');
    setTimeout(function() {
      let curSel = window.getSelection();
      if (curSel.isCollapsed) {
        B64_sel2codec.handleClear();
      }
    }, 50);
  });
  $('body').on('keydown', function(e) {
    // selection may be created or cleared
    // console.log('keydown');
    setTimeout(function() {
      if ( e.keyCode == 16 || // Shift
           e.keyCode == 17 || // Ctrl
           e.keyCode == 18 && // Alt
           B64_sel2codec.lastKeyCode == e.keyCode
      ) {
        return;
      }
      B64_sel2codec.lastKeyCode = e.keyCode;
      let curSel = window.getSelection();
      if (!curSel.isCollapsed) {
        B64_sel2codec.handleSelect();
      } else {
        B64_sel2codec.handleClear();
      }
    }, 50);
  });
  
  $('body').on('mouseup', function() {
    // something may be selected
    // console.log('mouseup');
    setTimeout(function() {
      let curSel = window.getSelection();
      if (!curSel.isCollapsed) {
        B64_sel2codec.handleSelect();
      }
    }, 50);
  })
  
  
})(window.unsafeWindow, $);















