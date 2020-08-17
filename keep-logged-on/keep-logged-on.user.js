// ==UserScript==
// @name         keep-logged-on
// @name:ZH-CN   保持登录
// @name:ZH-TW   保持登入
// @namespace    https://github.com/li-zyang
// @version      0.1.0
// @description  Keep the accounts on the websites you added (NOTE: This script only works when the browser is running, and cannot keep accounts whose auto-logout algorism ignores the latest visiting time)
// @description:ZH-CN  保留在你指定网站上的账户，避免其过期（注：需要保持浏览器开启、对部分不管期间有无访问均在固定时间下线的网站无效）
// @description:ZH-TW  保留在你制定網站上的賬戶，避免其過期（註：需要保持瀏覽器開啓、對部分不管期間有無訪問均在固定時間下線的網站無效）
// @author       阿昭
// @include      http://*
// @include      https://*
// @exclude      none
// @require      https://cdn.staticfile.org/jquery/3.4.1/jquery.min.js
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

  window.keepLoggedOnJS = {};
  var s = keepLoggedOnJS;

  s.type = function type(...args) {
    var primitiveConvTable = [[Boolean, 'boolean'], [Number, 'number'], [String, 'string'], [Symbol, 'symbol']];
    var nonClassProcTable  = [
      [function(v) { return v === null; }, function(v) { return v === null; }],
      [function(v) { return v === undefined; }, function(v) { return v === undefined; }],
      [function(v) { return v == 'ValidNumber'; }, function(v) { return (typeof v == 'number' || v instanceof Number) && !isNaN(v); }],
      [function(v) { return v == 'Finite'; }, function(v) { return (typeof v == 'number' || v instanceof Number) && isFinite(v); }],
      [function(v) { return (typeof v == 'number' || v instanceof Number) && isNaN(v); }, function(v) { return (typeof v == 'number' || v instanceof Number) && isNaN(v); }],
      [function(v) { return (typeof v == 'number' || v instanceof Number) && !isFinite(v); }, function(v) { return (typeof v == 'number' || v instanceof Number) && !isFinite(v); }]
    ];
    if (
      args.length == 2 ||
      args.length == 3 && typeof args[2] == 'string')
    {
      var cls     = args[0];
      var value   = args[1];
      var message = args[2];
      var nClsIdx = 0;
      for (; nClsIdx < nonClassProcTable.length; nClsIdx++) {
        var cur = nonClassProcTable[nClsIdx];
        if (cur[0](cls)) {
          break;
        }
      }
      if (nClsIdx < nonClassProcTable.length && nonClassProcTable[nClsIdx][1](value)) {
        return value;
      } else if (nClsIdx < nonClassProcTable.length) {
        var e = new TypeError(`${String(cls)} required`);
        e.value = value;
        throw e;
      }
      var primIdx = 0;
      for (; primIdx < primitiveConvTable.length; primIdx++) {
        var cur = primitiveConvTable[primIdx];
        if (cls == cur[0]) {
          break;
        }
      }
      if (primIdx < primitiveConvTable.length && typeof value == primitiveConvTable[primIdx][1]) {
        return value;
      }
      if (value instanceof cls) {
        return value;
      } else if (message) {
        throw new TypeError(message);
      } else if (cls.name) {
        var e = new TypeError(`${cls.name} required`);
        e.value = value;
        throw e;
      } else {
        var e = new TypeError();
        e.value = value;
        throw e;
      }
    } else {
      var given = args[0];
      for (var i = 1; i < args.length; i++) {
        var refactor = args[i];
        var exec = refactor[refactor.length - 1];
        if (refactor.length - 1 != given.length) {
          continue;
        }
        var matched = true;
        for (var j = 0; j < refactor.length - 1; j++) {
          try {
            type(refactor[j], given[j]);
          } catch (e) { if (e.name == 'TypeError') {
            matched = false;
            break;
          } else {
            throw e;
          } }
        }
        if (matched) {
          return exec(...given);
          break;
        }
      }
      var types = [];
      for (var i = 0; i < given.length; i++) {
        var cur = given[i];
        var primIdx = 0;
        for (; primIdx < primitiveConvTable.length; primIdx++) {
          if (typeof cur == primitiveConvTable[primIdx][1]) { break; }
        }
        if (primIdx < primitiveConvTable.length) {
          types.push(primitiveConvTable[primIdx][0].name);
        } else {
          types.push((Object.getPrototypeOf(cur) || {constructor: {name: '<null class>'}}).constructor.name);
        }
      }
      throw new TypeError(`Refactor no found: ${types.join(', ')}`);
    }
  }
  var type = s.type;

  s.TimeDelta = function TimeDelta(...args) {

  }

  s.AccountInfo = function AccountInfo(obj) {
    this.URL = type(String, obj.URL);
    this.interval = (obj.interval || new Date())
  }

  s.AccountKeeper = function AccountKeeper() {

  }
  var AccountKeeper = s.AccountKeeper;

})(window.unsafeWindow, $);















