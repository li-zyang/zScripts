// ==UserScript==
// @name         share-this-page
// @namespace    https://github.com/li-zyang
// @version      0.1.1
// @description  Generate sharing cover for webpage
// @author       阿昭
// @include      *//*
// @require      https://cdn.staticfile.org/jquery/3.4.1/jquery.min.js
// @resource     artical-cover-template  http://127.0.0.1/share-this-page/artical-cover-template.html
// @resource     audio-cover-template    http://127.0.0.1/share-this-page/audio-cover-template.html
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @grant        GM_addValueChangeListener
// @grant        GM_removeValueChangeListener
// @grant        GM_addStyle
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_download
// @grant        GM_getTab
// @grant        GM_saveTab
// @grant        GM_getTabs
// @grant        GM_setClipboard
// @grant        GM_info
// @grant        GM_openInTab
// @grant        GM_notification
// @grant        GM_getResourceText
// @grant        GM_getResourceURL
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

  window.shareThisPageJS = {};
  var s = shareThisPageJS;

  s.articalCoverTemplate = GM_getResourceText('artical-cover-template');
  s.audioCoverTemplate   = GM_getResourceText('audio-cover-template');
  s.imgFormat = 'image/png';
  s.imgExts = {};
  s.imgExts['image/png']  = '.png';
  s.imgExts['image/jpeg'] = '.jpg';
  s.imgExts['image/webp'] = '.webp';

  s.genID = function genID() {
    var charMap = '0123456789abcdefghijklmnopqretuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var rawID = Number(Math.floor(Math.random() * Math.pow(2, 16)).toString() + Date.now().toString());
    var ID = '';
    while(rawID > 1) {
      var rem = rawID % charMap.length;
      rawID /= charMap.length;
      ID += charMap.charAt(rem);
    }
    return ID;
  }
  var genID = s.genID;

  s.fillTemplate = function fillTemplate(template, values = {}, patStart = '[SET[-', patEnd = '-]]') {
    var res = '';
    var remain = template;
    while (remain.length) {
      var patternIndex = remain.indexOf(patStart);
      if (patternIndex != -1) {
        res += remain.slice(0, patternIndex);
        remain = remain.slice(patternIndex);
        patternIndex = 0;
      } else {
        res += remain;
        remain = '';
        break;
      }
      var patternLength = remain.indexOf(patEnd) + patEnd.length;
      var innerExpression;
      if (patternLength >= patStart.length + patEnd.length) {
        var nextPatternIndex = remain.slice(patStart.length).indexOf(patStart) + patStart.length;
        if (nextPatternIndex >= patStart.length && nextPatternIndex < patternLength) {
          res += remain.slice(0, nextPatternIndex);
          remain = remain.slice(nextPatternIndex);
          patternIndex = 0;
          continue;
        } else {
          innerExpression = remain.slice(patStart.length, patternLength - patEnd.length);
        }
      } else {
        res += remain;
        remain = '';
        break;
      }
      var exprFunc = new Function(`return (${innerExpression})`);
      var replacement = exprFunc.call(values);
      res += String(replacement);
      remain = remain.slice(patternLength);
    }
    return res;
  };
  var fillTemplate = s.fillTemplate;

  s.downloadAsTextFile = function downloadAsTextFile(content, filename, options = {}) { return new Promise(function(resolve, reject) {
    var mimeType = options.mimeType || 'text/plain';
    var saveAs   = options.saveAs   || false;
    var endings  = options.endings  || 'transparent';
    var contentBlob = new Blob([content], {
      type: mimeType,
      endings: endings
    });
    var blobUrl = URL.createObjectURL(contentBlob);
    GM_download({
      url: blobUrl,
      name: filename,
      saveAs: saveAs,
      onerror: function(e) {
        URL.revokeObjectURL(blobUrl);
        reject(e);
      },
      ontimeout: function() {
        URL.revokeObjectURL(blobUrl);
        reject('timeout');
      },
      onload: function() {
        URL.revokeObjectURL(blobUrl);
        resolve('success');
      }
    });
  }) };
  var downloadAsTextFile = s.downloadAsTextFile;

  s.genCover = function genCover() {

    // 微信公衆號文章
    // https://mp.weixin.qq.com/s/_inXEVhWcj9azIQUdt7uEA
    // https://mp.weixin.qq.com/s?__biz=MzIzNjM2NzEzNA==&mid=2247484479&idx=1&sn=a278612c6f48ebb3ba12308c7bf8172b
    if (location.hostname == 'mp.weixin.qq.com') {
      var twitterImageMeta = $('meta[property="twitter:image"]')[0];
      var cover = twitterImageMeta.getAttribute('content');
      var title = document.title;
      var extra = $('#js_name').text().trim();
      var docString = fillTemplate(s.articalCoverTemplate, {
        cover: cover,
        title: title,
        extra: extra,
        targetURL: location.toString()
      });
      downloadAsTextFile(docString, genID() + '.html', {
        saveAs: true
      }).then(function(result) {
        console.log(result);
      }).catch(function(e) {
        console.error(e);
      });
    }

    // 網易雲音樂歌曲
    // https://music.163.com/#/song?id=441491828
    else if (location.hostname == 'music.163.com' && location.hash.startsWith('#/song')) {
      var mainDoc = document.querySelector('#g_iframe').contentDocument;
      var cover = mainDoc.querySelector('.u-cover img').getAttribute('src');
      var title = mainDoc.querySelector('.tit').innerText.trim() + ' - ' + mainDoc.querySelector('.des a').innerText.trim();
      var targetURL = location.toString();
      var source = location.toString();
      var offline = 'false';
      var docString = fillTemplate(s.audioCoverTemplate, {
        cover: cover,
        title: title,
        source: source,
        offline: offline
      });
      downloadAsTextFile(docString, genID() + '.html', {
        saveAs: true
      }).then(function(result) {
        console.log(result);
      }).catch(function(e) {
        console.error(e);
      });
    }

  }
  var genCover = s.genCover;

  if (/^file:\/\/.*\/idlery\/covers\/[^\/]+\.html$/.test(location.toString())) {
    var shareType = $('meta[property="shareType"]')[0].getAttribute('content');
    var shareID = location.toString().match(/([^\/]+)\.html$/)[1];
    if (shareType == 'article') {
      var targetURL = $('meta[property="targetURL"]')[0].getAttribute('content');
      var infoTable = $(`<table class="info">
        <tr>
          <td><strong>ID</strong></td>
          <td>${shareID}</td>
        </tr>
        <tr>
          <td><strong>Screenshot name</strong></td>
          <td>${shareID}${s.imgExts[s.imgFormat]}</td>
        </tr>
        <tr>
          <td><strong>HTML</strong></td>
          <td>
            &lt;p&gt;<br>&lt;a href="${targetURL}"&gt;&lt;img src="src/${shareID}${s.imgExts[s.imgFormat]}" width="400"&gt;&lt;/a&gt;&lt;/p&gt;
          </td>
        </tr>
      </table>`)[0];
    } else if (shareType == 'audio') {
      var source = $('.cover-source-url').text().trim();
      var targetURL;
      var offline = Boolean($('meta[property="offline"]')[0].getAttribute('content'));
      if (offline == 'true') {
        targetURL = source + '?raw=true';
      } else {
        targetURL = source;
      }
      var infoTable = $(`<table class="info">
        <tr>
          <td><strong>ID</strong></td>
          <td>${shareID}</td>
        </tr>
        <tr>
          <td><strong>Screenshot name</strong></td>
          <td>${shareID}${s.imgExts[s.imgFormat]}</td>
        </tr>
        <tr>
          <td><strong>HTML</strong></td>
          <td>
            &lt;p&gt;<br>&lt;a href="${targetURL}"&gt;&lt;img src="src/${shareID}${s.imgExts[s.imgFormat]}" width="400"&gt;&lt;/a&gt;&lt;/p&gt;
          </td>
        </tr>
      </table>`)[0];
    }
    $('body').append(infoTable);
    $('body').append(`<style>
      .info {
        font-family: monospace;
        margin: 8px 0px;
        width: 400px;
      }
    </style>`)
  } else {
    s.generateCommandID = GM_registerMenuCommand('Generate cover', genCover);
  }

})(window.unsafeWindow, $);















