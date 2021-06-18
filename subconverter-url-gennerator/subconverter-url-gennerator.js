// ==UserScript==
// @name         subgennerator
// @namespace    https://github.com/li-zyang
// @version      0.1.0
// @description  Generate subscription URL of subconverter / Convert node URLs to subscription texts
// @author       阿昭
// @include      *://*
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

  window.subgenneratorJS = {};
  var s = subgenneratorJS;

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

  s.Base64 = function Base64() { }
  var Base64 = s.Base64;

  Base64.encode = function encode(str) {
    return window.btoa(
      unescape(
        encodeURIComponent(str)
      )
    );
  };

  Base64.decode = function decode(str) {
    return decodeURIComponent(
      escape(
        window.atob(str)
      )
    );
  };

  s.genSubscribeText = function genSubscribeText(links) {
    return Base64.encode(links.trim());
  }

  s.convertURL = function convertURL(source, config = {}) {
    if (!config.target) {
      console.warn('subgennerator: Target is not provided. Used default "clash"');
      config.target = 'clash';
    }
    var baseURL = new URL('http://127.0.0.1:25500/sub');
    baseURL.searchParams.set('url', source);
    var entries = Object.entries(config);
    for (var i = 0; i < entries.length; i++) {
      var [key, val] = entries[i];
      baseURL.searchParams.set(key, val);
    }
    return baseURL.toString();
  }
  var convertURL = s.convertURL;

  (function() {
    var sources = GM_getValue('sources') || {};
    Object.defineProperty(s, 'sources', {
      value: new Proxy(sources, {
        set: function(target, prop, value) {
          target[prop] = value;
          GM_setValue('sources', sources);
        },
        deleteProperty: function(target, prop) {
          delete target[prop];
          GM_setValue('sources', sources);
        }
      }),
      writable: false,
      configurable: true,
      enumerable: true
    });
  })();

})(window.unsafeWindow, $);















