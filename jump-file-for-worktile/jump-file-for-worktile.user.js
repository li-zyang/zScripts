// ==UserScript==
// @name         jump-file-for-worktile
// @name:ZH-CN   在 Worktile 上创建跳转文件
// @name:ZH-TW   在 Worktile 上創建跳轉檔案
// @namespace    https://github.com/li-zyang
// @version      0.1.0
// @description  Create a jump file automatically on worktile, Simply copy & paste the URL of an online document
// @description:ZH-CN  在 Worktile 上自动化地创建一个跳转文档，只需要复制在线文档的 URL 并粘贴即可
// @description:ZH-TW  在 Worktile 上自動化地創建一個跳轉文檔，只需要複製在線文檔的 URL 並粘貼即可
// @author       阿昭
// @include      https://*.worktile.com/*
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
// @grant        GM_download
// @grant        GM_getResourceText
// @grant        GM_getResourceURL
// @grant        GM_openInTab
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

  window.jumpFileForWorktileJS = {};
  var s = jumpFileForWorktileJS;

  history.pushState = ( f => function pushState(){
    var ret = f.apply(this, arguments);
    window.dispatchEvent(new Event('pushstate'));
    window.dispatchEvent(new Event('locationchange'));
    return ret;
  })(history.pushState);

  history.replaceState = ( f => function replaceState(){
    var ret = f.apply(this, arguments);
    window.dispatchEvent(new Event('replacestate'));
    window.dispatchEvent(new Event('locationchange'));
    return ret;
  })(history.replaceState);

  window.addEventListener('popstate',()=>{
    window.dispatchEvent(new Event('locationchange'))
  });

  s.wait = async function(discriminant, timeout) {
    var prop = {};
    var res = new Promise(function poll(resolve, reject) {
      var condition = discriminant();
      if (condition) {
        // clearTimeout(prop.timeout);
        resolve(condition);
      } else if (timeout != undefined && (new Date).getTime() - prop.openTime > timeout) {
        reject(new TimeoutError('Timeout exceeded'));
      } else {
        setTimeout(poll, 0, resolve, reject);
      }
    });
    prop.promise  = res;
    prop.openTime = new Date();
    return res;
  }
  var wait = s.wait;

  s.delay = async function(ms) {
    return new Promise(function(resolve, reject) {
      setTimeout(resolve, ms);
    });
  }
  var delay = s.delay;

  s.entitize = function(html) {
    var elem = document.createElement("div");
    var txt = document.createTextNode(html);
    elem.appendChild(txt);
    return elem.innerHTML;
  }
  var entitize = s.entitize;

  s.unentitize = function(str) {
    var elem = document.createElement("div");
    elem.innerHTML = str;
    return elem.innerText || elem.textContent;
  }
  var unentitize = s.unentitize;

  s.genID = function() {
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

  s.dedentText = function(str) {
    var splitted = str.split('\n');
    var minSpaces = Infinity;
    while (/^\s*$/.test(splitted[0])) {
      splitted.shift();
    }
    while (/^\s*$/.test(splitted[splitted.length - 1])) {
      splitted.pop();
    }
    for (var i = 0; i < splitted.length; i++) {
      var line = splitted[i];
      if (/^\s*$/.test(line)) {
        continue;
      }
      var matched = /^\s*/.exec(line)[0];
      if (matched.length < minSpaces) {
        minSpaces = matched.length;
      }
    }
    for (var i = 0; i < splitted.length; i++) {
      var line = splitted[i];
      splitted[i] = line.slice(minSpaces);
    }
    return splitted.join('\n');
  }
  var dedentText = s.dedentText;

  s.indentText = function(str, level = 1, fill = '  ') {
    var splitted = str.split('\n');
    for (var i = 0; i < splitted.length; i++) {
      var line = splitted[i];
      if (!/^\s*$/.test(line)) {
        splitted[i] = fill.repeat(level) + line;
      }
    }
    return splitted.join('\n');
  }
  var indentText = s.indentText;
  
  s.downloadAsTextFile = function(content, filename, options = {}) { return new Promise(function(resolve, reject) {
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

  s.fillTemplate = function(template, values = {}, patStart = '[SET[-', patEnd = '-]]') {
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

  s.escapeStr = function(str) {
    return JSON.stringify(str).slice(1, -1);
  };
  var escapeStr = s.escapeStr;
  
  s.jumpFileTemplate = dedentText(`
  <meta charset="UTF-8">

  <!-- 
    This is a jump file created by userscript "jump-file-for-worktile".
    Install the userscript or use a jump file template to create a jump file like this.
    -->

  <script>
    window.location = "[SET[-documentURL-]]";
  </script>
  `);
  var jumpFileTemplate = s.jumpFileTemplate;
  // documentURL
  
  s.dialogTemplate = dedentText(`
  <div uib-modal-backdrop="modal-backdrop" class="modal-backdrop fade ng-scope in" uib-modal-animation-class="fade" modal-in-class="in" modal-animation="true" data-bootstrap-modal-aria-hidden-count="1" aria-hidden="true"></div>
  <div uib-modal-window="modal-window" class="modal fade ng-scope ng-isolate-scope in" role="dialog" index="0" animate="animate" ng-style="{display: 'block'}" tabindex="-1" uib-modal-animation-class="fade" modal-in-class="in" modal-animation="true">
    <div class="modal-dialog">
      <div class="modal-content" uib-modal-transclude="">
        <create-jump-file resolve="$resolve" modal-instance="$uibModalInstance" close="$close($value)" dismiss="$dismiss($value)" class="ng-scope ng-isolate-scope">
          <wt-dialog class="ng-isolate-scope">
            <section class="wt-dialog" ng-class="{'wt-dialog-has-footer':$ctrl.isFooter}" ng-transclude="">
              <wt-dialog-header title="[SET[-winTitle-]]" class="ng-scope ng-isolate-scope">
                <header class="modal-header">
                  <ng-transclude>
                    <a href="javascript:;" class="modal-close ng-scope" ng-click="$ctrl.onClose()"><i class="lcfont lc-close"></i></a>
                    <h3 class="modal-title ng-binding ng-scope">
                      <!-- ngIf: $ctrl.isIcon --><i ng-if="$ctrl.isIcon" class=""></i><!-- end ngIf: $ctrl.isIcon -->
                      [SET[-winTitle-]]
                    </h3>
                  </ng-transclude>
                </header>
              </wt-dialog-header>
              <wt-dialog-body class="ng-scope ng-isolate-scope">
                <div class="wt-dialog-body modal-body" ng-transclude="">
                  [SET[-winBodyContent-]]
                </div>
              </wt-dialog-body>
            </section>
          </wt-dialog>
        </create-jump-file>
      </div>
    </div>
  </div>
  `);
  var dialogTemplate = s.dialogTemplate;
  // winTitle, winBodyContent

  s.inputTemplate = dedentText(`
  <textarea class="form-control ng-untouched ng-pristine ng-valid" name="[SET[-name-]]" rows="3" placeholder="[SET[- placeholder || '' -]]"></textarea>
  `);
  var inputTemplate = s.inputTemplate;
  // name[, placeholder]

  s.toolbarIconTemplate = dedentText(`
  <li>
    <a class="toolbtn" href="javascript:;" ng-click="[SET[-action-]]">
      <i class="wtf [SET[-iconClass-]]"></i>
    </a>
  </li>
  `);
  var toolbarIconTemplate = s.toolbarIconTemplate;
  // action, iconClass

  s.actionMenuItemTemplate = dedentText(`
  <a href="javascript:;" thyactionmenuitem="" class="action-menu-item"><span translate="">[SET[-text-]]</span></a>
  `);
  var actionMenuItemTemplate = s.actionMenuItemTemplate;
  // text

  s.winBodyTemplate = dedentText(`
  <div class="jump-file-for-worktile-ui-hint">请输入目标文件的 URL 和文件名</div>
  [SET[-inputElemCode-]]
  `);
  var winBodyTemplate = s.winBodyTemplate;
  // inputElemCode

  s.fontClassFrom = `//at.alicdn.com/t/font_1966527_wy0uliohmaf.css`;
  var fontClassFrom = s.fontClassFrom;

  s.showCreatorDialog = function() {
    var container = $('.cdk-overlay-container');
    var winTitle = '生成跳转文件';
    var inputElemCode = fillTemplate(inputTemplate, {
      name: 'links',
      placeholder: escapeStr(dedentText(`
      文件名与 URL 之间添加至少一个空格分隔，可用 "《》" 明确指明文件名范围，如：
      https://example.com/docs/wRJTjcDKCjjypxhW/ 样例文档
      https://example.com/docs/wRJTjcDKCjjypxhW/ 《样例文档》，可复制链接后...
      多个文件使用换行符分隔
      `));
    });
    var winBodyContent = fillTemplate(winBodyTemplate, {
      inputElemCode: inputElemCode
    });
    var $dialog = $(fillTemplate(dialogTemplate, {
      winTitle: winTitle,
      winBodyContent: winBodyContent
    }));
    container.addClass('modal-open');
    container.append($dialog);
  }

})(window.unsafeWindow, $);















