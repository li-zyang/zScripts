// ==UserScript==
// @name         shimo-embrace-html
// @name:ZH-CN   石墨 HTML
// @name:ZH-TW   石墨 HTML
// @namespace    https://github.com/li-zyang
// @version      0.1.0
// @description  Import from or export as HTML in shimo-doc
// @description:ZH-CN  石墨文档导入 / 导出 HTML
// @description:ZH-TW  石墨文檔導入 / 導出 HTML
// @author       阿昭
// @include      https://shimo.im/*
// @exclude      none
// @require      https://cdn.staticfile.org/jquery/3.4.1/jquery.min.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_addValueChangeListener
// @grant        GM_removeValueChangeListener
// @grant        GM_addStyle
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
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
// @compatible   describe compatibility
// @match

// See https://www.tampermonkey.net/documentation.php for full documention

(function(window, $) {
  'use strict';

  window.shimoEmbraceHtmlJS = {};
  let script = shimoEmbraceHtmlJS;

  script.isChild = function(inner, outer) {
    let cur = inner;
    while (cur.parentNode != document) {
      if (cur.parentNode == outer) {
        return true;
      }
      cur = cur.parentNode;
    }
    return false;
  }
  let isChild = script.isChild;

  script.exportNode = function(node) {
    // white-space: 
    // + normal, nowrap => inner newline
    // + pre, pre-line, pre-wrap => no inner newline
    // display:
    // + inline, list-item, table-cell => no outer newline
    // + inline-block, inline-flex, inline-grid, inline-table => no outer newline if no more than 1 child element
    // + default => outer newline
    // + (inside pre, pre-line, pre-wrap) => no outer newline
    let res = [];
    let toProcess = [node]; // any type of node
    let processed = [];     // elements only
    while (toProcess.length) {
      let cur = toProcess.pop();
      if (processed.length && !isChild(cur, processed[processed.length - 1])) {
        let completed = processed.pop();

      }
      for (let i = 0; i < cur.childNodes.length; i++) {
        let curChild = cur.childNodes[i];
        if (curChild.nodeName == '#text') {
          // res += curChild.nodeValue;
        } else if (curChild.nodeName == '#comment') {

        } else {

        }
      }
    }
  };
  let exportNode = script.exportNode;

})(window.unsafeWindow, $);















