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
  var s = shimoEmbraceHtmlJS;

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

  s.Base64 = function() { }
  var Base64 = s.Base64;

  Base64.encode = function(str) {
    return window.btoa(
      unescape(
        encodeURIComponent(str)
      )
    );
  };

  Base64.decode = function(str) {
    return decodeURIComponent(
      escape(
        window.atob(str)
      )
    );
  };

  s.reviewCode = function(code) {
    var reviewWindow = window.open('about:blank');
    reviewWindow.document.write(dedentText(`
      <html>
      <body>
        <pre>
      ${s.entitize(code)}
        </pre>
      </body>
      </html>
    `));
    reviewWindow.document.close();
  }
  var reviewCode = s.reviewCode;

  s.isChild = function(inner, outer) {
    var cur = inner;
    while (cur.parentNode != document) {
      if (cur.parentNode == outer) {
        return true;
      }
      cur = cur.parentNode;
    }
    return false;
  }
  var isChild = s.isChild;

  s.removeEmptyLines = function(code) {
    var lines = code.split('\n');
    var i = 0; 
    while(lines[i] != undefined) {
      var line = lines[i];
      if (/^\s*$/.test(line)) {
        lines.splice(i, 1);
      } else {
        i++;
      }
    }
    return lines.join('\n');
  }
  var removeEmptyLines = s.removeEmptyLines;

  s.cutText = function(text, start = true, end = true) {
    var res = text;
    if (start) {
      res = res.replace(/^\s+/, ' ');
    }
    if (end) {
      res = res.replace(/\s+$/, ' ');
    }
    return res;
  }
  var cutText = s.cutText;

  s.Kwargs = function(kwargs) {
    kwargs = kwargs || {};
    var entries = Object.entries(kwargs);
    for (var i = 0; i < entries.length; i++) {
      var key = entries[i][0];
      var val = entries[i][1];
      this[key] = val;
    }
  }
  var Kwargs = s.Kwargs;

  Kwargs.prototype.update = function(overrides) {
    var res = new Kwargs(this);
    Object.assign(res, overrides);
    return res;
  }

  s.exportNode = function(node, config = new Kwargs()) {
    /* 
     * * {
     *   innerNL: false;
     *   combine: current-line;
     *   process-text: auto;
     *   combine-child: auto;
     *   indent: obey;
     * }
     * [len(outer()) >= wrapWidth][display != inline],
     * [has('\n')],
     * [display !^= inline][display != list-item, table-cell] {
     *   innerNL: true;
     *   process-text: auto;
     * }
     * [len(outer()) < wrapWidth]:not([has('\n')])[display ^= inline-][childCount() <= 1] {
     *   innerNL: false;
     *   process-text: auto;
     * }
     * [len(outer()) + len(before()) >= wrapWidth],
     * [has('\n')] {
     *   combine: next-line;
     * }
     * head {
     *   combine-child: next-line;
     * }
     * title {
     *   innerNL: false;
     * }
     * [white-space = pre, pre-line, pre-wrap] {
     *   innerNL: false;
     *   combine-child: current-line;
     *   process-text: none;
     * }
     * [has('\n')][white-space = pre, pre-line, pre-wrap],
     * [display !^= inline][display != list-item, table-cell][white-space = pre, pre-line, pre-wrap] {
     *   indent: none;
     * }
     */
    var wrapWidth = config.wrapWidth || 80;
    var tabSize = config.tabSize || 2;
    var translateTabs = config.translateTabs != undefined ? config.translateTabs : true;
    var indentLevel = config.indentLevel || 0;
    var preventIndent = config.preventIndent || false;
    if (preventIndent) {
      indentLevel = 0;
    }
    if (node.nodeName == '#comment') {
      var res = indentText(`<!--${node.nodeValue}-->`, indentLevel);
      return res;
    } else if (node.nodeName == '#text') {
      var res = node.nodeValue;
      if (['script', 'style'].indexOf(node.parentNode.tagName.toLowerCase()) == -1) {
        res = entitize(res);
      }
      return res;
    } else {
      var startTag = '<' + node.tagName.toLowerCase();
      var partials = [];
      var endTag   = indentText(`</${node.tagName.toLowerCase()}>`, indentLevel);
      var style = getComputedStyle(node);
      if (style.whiteSpace == 'pre' || style.whiteSpace == 'pre-line' || style.whiteSpace == 'pre-wrap') {
        for (var i = 0; i < node.attributes.length; i++) {
          var attribute = node.attributes[i];
          var attrRepr = ` ${attribute.nodeName}="${attribute.nodeValue}"`;
          startTag += attrRepr;
        }
      } else {
        for (var i = 0; i < node.attributes.length; i++) {
          var attribute = node.attributes[i];
          var attrRepr = ` ${attribute.nodeName}="${attribute.nodeValue}"`;
          startTag += (
            startTag.slice(startTag.lastIndexOf('\n') + 1).length + attrRepr.length >= wrapWidth ? 
            '\n' : 
            '') + attrRepr;
        }
      }
      startTag += (startTag.indexOf('\n') != -1 ? '\n>' : '>');
      startTag = indentText(startTag, indentLevel);
      if (style.whiteSpace == 'pre' || style.whiteSpace == 'pre-line' || style.whiteSpace == 'pre-wrap') {
        for (var i = 0; i < node.childNodes.length; i++) {
          var child = node.childNodes[i];
          var childRepr = s.exportNode(
            child, 
            config.update({
              indentLevel: 0,
              preventIndent: true
            })
          );
          partials.push(childRepr);
        }
      } else {
        for (var i = 0; i < node.childNodes.length; i++) {
          var child = node.childNodes[i];
          var childRepr = s.exportNode(
            child, 
            config.update({
              indentLevel: indentLevel + 1,
              preventIndent: false
            })
          );
          partials.push(childRepr);
        }
      }
      if (partials.length == 0) {
        startTag = startTag.replace(/ ?>$/, ' />');
        return startTag;
      } else {
        var innerNL = false;
        var processText = 'auto';
        var combineChild = 'auto';
        var indent = 'obey';
        var outerWidth = startTag.length + endTag.length;
        for (var i = 0; i < partials.length; i++) {
          outerWidth += cutText(partials[i]).length;
        }
        var hasNL = false;
        for (var i = 0; i < partials.length; i++) {
          if (partials[i].indexOf('\n') >= 0) {
            hasNL = true;
            break;
          } 
        }
        if (
          outerWidth >= wrapWidth && style.display != 'inline' || 
          hasNL || 
          (!/^inline/.test(style.display) && style.display != 'list-item' && style.display != 'table-cell')) 
        {
          innerNL = true;
          processText = 'auto';
        }
        if (outerWidth < wrapWidth && !hasNL && /^inline-/.test(style.display) && partials.length <= 1) {
          innerNL = false;
          processText = 'auto';
        }
        if (node.tagName.toLowerCase() == 'head') {
          combineChild = 'next-line';
        }
        if (node.tagName.toLowerCase() == 'title') {
          innerNL = false;
        }
        if (style.whiteSpace == 'pre' || style.whiteSpace == 'pre-line' || style.whiteSpace == 'pre-wrap') {
          innerNL = false;
          combineChild = 'current-line';
          processText = 'none';
        }
        if (
          hasNL && (style.whiteSpace == 'pre' || style.whiteSpace == 'pre-line' || style.whiteSpace == 'pre-wrap') ||
          (!/^inline/.test(style.display) && style.display != 'list-item' && style.display != 'table-cell') && (style.whiteSpace == 'pre' || style.whiteSpace == 'pre-line' || style.whiteSpace == 'pre-wrap')) {
          indent = 'none';
        }
        if (indent == 'none') {
          startTag = dedentText(startTag);
          endTag   = dedentText(endTag);
        }
        var res = [startTag];
        for (var i = 0; i < partials.length; i++) {
          var elem = partials[i];
          var combineTo;
          if (combineChild == 'auto') {
            if (
              i == 0 && innerNL || 
              elem.length + res[res.length - 1].length >= wrapWidth || 
              res.length > 1 && res[res.length - 1].indexOf('\n') != -1 ||
              elem.indexOf('\n') != -1 ||
              res[res.length - 1].endsWith('<br />') || 
              /^\s*<!--.*-->\s*$/.test(elem) ||
              /^\s*<!--.*-->\s*$/.test(res[res.length - 1]) ||
              /^\s*$/.test(res[res.length - 1]) )
            {
              combineTo = 'next-line';
            } else {
              combineTo = 'current-line';
            }
            if (i == 0 && !innerNL) {
              combineTo = 'current-line';
            }
          } else if (combineChild == 'next-line') {
            combineTo = 'next-line';
          } else {
            combineTo = 'current-line';
          }
          if (combineTo == 'next-line') {
            if (/^\s*$/.test(res[res.length - 1])) {
              res.pop();
            }
            var insert = elem;
            if (
              processText == 'auto' && 
              indent == 'obey' && 
              !(/^\s*</.test(insert) && />\s*$/.test(insert)) ) 
            {
              insert = indentText(cutText(dedentText(insert), false, true), indentLevel + 1);
            }
            res.push(insert);
          } else if (combineTo == 'current-line') {
            var insert = elem;
            if (
              processText == 'auto' && 
              indent == 'obey') 
            {
              if (/^\s*</.test(insert) && />\s*$/.test(insert)) {
                insert = insert.trimStart();
              } else {
                insert = cutText(insert, !/\s+$/.test(res[res.length - 1]));
              }
            }
            res[res.length - 1] += insert;
          }
        }
        if (innerNL) {
          if (/^\s*$/.test(res[res.length - 1])) {
            res.pop();
          }
          res.push(endTag);
        } else {
          res[res.length - 1] += dedentText(endTag);
        }
        return res.join('\n');
      }
    }
  };
  var exportNode = s.exportNode;

})(window.unsafeWindow, $);















