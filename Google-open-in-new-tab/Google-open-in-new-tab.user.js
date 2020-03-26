// ==UserScript==
// @name         Google-open-in-new-tab
// @name:ZH-CN   谷歌搜索：新建标签页打开链接
// @name:ZH-TW   谷歌搜尋：新建標籤頁打開鏈接
// @namespace    https://github.com/li-zyang/
// @version      1.0.1
// @description  Open links in the google search results in a new tab
// @description:ZH-CN  点击搜索结果中的链接时在新标签页中打开
// @description:ZH-TW  點擊搜索結果中的連接時在新標籤頁中打開
// @author       阿昭
// @include      https://www.google.com/*
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
// @note         v1.0.0      2020-03-15  First published
// @note         v1.0.1      2020-03-26  Fixed bug: uncaught mutation
// ==/UserScript==

(function() {
  'use strict';
  $('#taw a').attr('target', '_blank').attr('rel', 'noopener');
  $('#taw div:nth-of-type(2) a').attr('target', '');
  $('#res a').attr('target', '_blank').attr('rel', 'noopener');
  $('#rhs a').attr('target', '_blank').attr('rel', 'noopener');
  $('#taw a').unbind().removeAttr('onmousedown').removeAttr('onclick');
  $('#res a').unbind().removeAttr('onmousedown').removeAttr('onclick');
  $('#rhs a').unbind().removeAttr('onmousedown').removeAttr('onclick');
  let observer = new MutationObserver(function(mulist) {
    for (let mutation of mulist) {
      if (mutation.type == 'childList') {
        let jq_target = $(mutation.target);
        let caught = false;
        jq_target.parents().each(function() {
          if ($(this).attr('id') == 'taw') {
            caught = true;
            $('#taw a').attr('target', '_blank').attr('rel', 'noopener');
            $('#taw a').unbind().removeAttr('onmousedown').removeAttr('onclick');
            $('#taw div:nth-of-type(2) a').attr('target', '');
          } else if ($(this).attr('id') == 'res') {
            caught = true;
            $('#res a').attr('target', '_blank').attr('rel', 'noopener');
            $('#res a').unbind().removeAttr('onmousedown').removeAttr('onclick');
          } else if ($(this).attr('id') == 'rhs') {
            caught = true;
            $('#rhs a').attr('target', '_blank').attr('rel', 'noopener');
            $('#rhs a').unbind().removeAttr('onmousedown').removeAttr('onclick');
          }
        });
        /*
        if (!caught) {
          console.log('uncaught mutation:', jq_target);
          console.log('parents:', jq_target.parents());
        } */
      }
    }
  });
  observer.observe($('#rcnt')[0], {
    childList: true,
    subtree: true
  });
})();