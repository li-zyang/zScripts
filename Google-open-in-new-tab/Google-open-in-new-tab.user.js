// ==UserScript==
// @name         Google-open-in-new-tab
// @name:ZH-CN   谷歌搜索：新建标签页打开链接
// @name:ZH-TW   谷歌搜尋：新建標籤頁打開鏈接
// @namespace    https://github.com/li-zyang/
// @version      1.0.0
// @description  Open links in the google search results in a new tab
// @description:ZH-CN  点击搜索结果中的链接时在新标签页中打开
// @description:ZH-TW  點擊搜索結果中的連接時在新標籤頁中打開
// @author       阿昭
// @include      https://www.google.com/*
// @require      https://cdn.staticfile.org/jquery/3.4.1/jquery.min.js
// @grant        GM_setValue
// @grant        GM_getValue
// @noframes
// ==/UserScript==

(function() {
  'use strict';
  $('#taw a').attr('target', '_blank').attr('rel', 'noopener');
  $('#taw div:nth-of-type(2) a').attr('target', '');
  $('#res a').attr('target', '_blank').attr('rel', 'noopener');
  $('#rhs a').attr('target', '_blank').attr('rel', 'noopener');
  $('#taw a').unbind().removeAttr('onmousedown').removeAttr('onclick');
  $('#taw a').off('click');
  $('#res a').unbind().removeAttr('onmousedown').removeAttr('onclick');
  $('#res a').off('click');
  $('#rhs a').unbind().removeAttr('onmousedown').removeAttr('onclick');
  $('#rhs a').off('click');
  let observer = new MutationObserver(function(mulist) {
    for (var mutation of mulist) {
      if (mutation.type == 'childList') {
        let jq_target = $(mutation.target);
        if ($('#taw') in jq_target.parents) {
          $('#taw a').attr('target', '_blank').attr('rel', 'noopener');
          $('#taw a').unbind().removeAttr('onmousedown').removeAttr('onclick');
          $('#taw a').off('click');
          $('#taw div:nth-of-type(2) a').attr('target', '');
        } else if ($('#res') in jq_target.parents) {
          $('#res a').attr('target', '_blank').attr('rel', 'noopener');
          $('#res a').unbind().removeAttr('onmousedown').removeAttr('onclick');
          $('#res a').off('click');
        } else if ($('#rhs') in jq_target.parents) {
          $('#rhs a').attr('target', '_blank').attr('rel', 'noopener');
          $('#rhs a').unbind().removeAttr('onmousedown').removeAttr('onclick');
          $('#rhs a').off('click');
        }
      }
    }
  });
  observer.observe($('#rcnt')[0], {
    childList: true,
    subtree: true
  });
})();