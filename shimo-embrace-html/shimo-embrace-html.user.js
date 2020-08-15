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
// @resource     docExportTemplate  http://127.0.0.1/shimo-embrace-html/doc-export-template.html
// @resource     exportStyle        http://127.0.0.1/shimo-embrace-html/export-style.css
// @resource     onpageStyle        http://127.0.0.1/shimo-embrace-html/onpage-style.css
// @resource     fontfaceStyle      http://127.0.0.1/shimo-embrace-html/font-faces.css
// @resource     smModalTemplate    http://127.0.0.1/shimo-embrace-html/sm-modal-template.html
// @resource     importTestDoc      http://127.0.0.1/shimo-embrace-html/expr/import-test.html
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

  window.shimoEmbraceHtmlJS = {};
  var s = shimoEmbraceHtmlJS;

  s.wait = function wait(discriminant, timeout) {
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

  s.delay = function delay(ms) {
    return new Promise(function(resolve, reject) {
      setTimeout(resolve, ms);
    });
  }
  var delay = s.delay;

  s.entitize = function entitize(html) {
    var elem = document.createElement("div");
    var txt = document.createTextNode(html);
    elem.appendChild(txt);
    return elem.innerHTML;
  }
  var entitize = s.entitize;

  s.unentitize = function unentitize(str) {
    var elem = document.createElement("div");
    elem.innerHTML = str;
    return elem.innerText || elem.textContent;
  }
  var unentitize = s.unentitize;

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

  s.dedentText = function dedentText(str) {
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

  s.indentText = function indentText(str, level = 1, fill = '  ') {
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

  s.reviewCode = function reviewCode(code) {
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

  s.isChild = function isChild(inner, outer) {
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

  s.removeEmptyLines = function removeEmptyLines(code) {
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

  s.cutText = function cutText(text, start = true, end = true) {
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

  s.passOnPromise = function passOnPromise(asyncFunc, resolve, reject, ...args) {
    if (typeof resolve != 'function') {
      throw TypeError('invalid resolve callback');
    }
    var chainedPromise = asyncFunc(...args).then(function(ret) {
      resolve(ret);
    });
    if (reject) {
      chainedPromise.catch(function(e) {
        reject(e);
      });
    } else {
      chainedPromise.catch(function(e) {
        throw e;
      });
    }
  }
  var passOnPromise = s.passOnPromise;

  s.measureTextArea = function measureTextArea(text, config = {}) {
    var style = config.style || '';
    var $receptor = $('.sehJS-text-receptor');
    if (!$receptor.length) {
      $receptor = $(
        `<div class="sehJS sehJS-text-receptor"></div>`
      );
      $('body').append($receptor);
    }
    $receptor[0].style = style;
    $receptor[0].innerText = text;
    var rect = $receptor[0].getBoundingClientRect();
    return [rect.width, rect.height];
  }
  var measureTextArea = s.measureTextArea;

  s.pairPattern = function pairPattern(str, leftPatternIdx, options = {}) {
    var skipList = options.skipList || [
      ["'", "'", false],   ['"', '"', false],   ['`', '`', false], ['/', '/', false],
      ['/*', '*/', false], ['//', '\n', false]
    ];
    var escapeChar = options.escapeChar || '\\';
    var left       = options.left;
    var right      = options.right;
    var nesting    = options.nesting;
    var leftRead   = str.slice(leftPatternIdx, leftPatternIdx + left.length);
    if (leftRead != left) {
      throw TypeError(`The index ${leftPatternIdx} at the given string reads "${leftRead}" instead of "${left}"`);
    }
    var pairs   = [[left, right, nesting]].concat(skipList);
    var symbols = [];
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i];
      if (symbols.indexOf(pair[0]) == -1) {
        symbols.push(pair[0]);
      }
      if (symbols.indexOf(pair[1]) == -1) {
        symbols.push(pair[1]);
      }
    }
    symbols.sort(function (a, b) {
      return b.length - a.length;
    });
    var symbolStack = [[left, right, nesting]];
    var i = leftPatternIdx + left.length;
    while (i < str.length) {
      var symbIdx = 0;
      var curSymb;
      var view;
      view = str.slice(i, i + 1);
      if (view == escapeChar) {
        i += 2;
        continue;
      }
      while (symbIdx < symbols.length) {
        curSymb = symbols[symbIdx];
        view = str.slice(i, i + curSymb.length);
        if (curSymb == view) { break; }
        symbIdx++;
      }
      if (symbIdx >= symbols.length) { i += 1; continue; }
      var lastItem = symbolStack[symbolStack.length - 1];
      if (lastItem[1] == curSymb) {
        symbolStack.pop();
        if (!symbolStack.length) {
          return i;
        } else {
          i += view.length;
          continue;
        }
      }
      if (lastItem[2]) {
        var asLeftIdx = 0;
        var asLeftPair;
        while (asLeftIdx < pairs.length) {
          asLeftPair = pairs[asLeftIdx];
          if (asLeftPair[0] == curSymb) {
            break;
          }
          asLeftIdx++;
        }
        if (asLeftIdx < pairs.length) {
          symbolStack.push(asLeftPair.concat([i]));
        }
      }
      i += view.length;
    }
    return -1;
  }
  var pairPattern = s.pairPattern;

  s.html2Text = function html2Text(code) {
    var parser = new DOMParser();
    var doc = parser.parseFromString('<div class="_html2Text_placeholder"></div>' + code, 'text/html');
    var placeholder = doc.querySelector('._html2Text_placeholder');
    placeholder.parentNode.removeChild(placeholder);
    var text = doc.body.innerText;
    return text;
  }
  var html2Text = s.html2Text;

  s.Kwargs = function Kwargs(kwargs) {
    kwargs = kwargs || {};
    var entries = Object.entries(kwargs);
    for (var i = 0; i < entries.length; i++) {
      var key = entries[i][0];
      var val = entries[i][1];
      this[key] = val;
    }
  }
  var Kwargs = s.Kwargs;

  Kwargs.prototype.update = function update(overrides) {
    var res = new Kwargs(this);
    Object.assign(res, overrides);
    return res;
  }

  s.exportNode = function exportNode(node, config = new Kwargs()) {
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
    var voidTags = [
      "area", "base", "br", "col", "embed", "hr", "img", "input", 
      "link", "meta", "param", "source", "track", "wbr"
    ]
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
      if (voidTags.indexOf(node.tagName.toLowerCase()) != -1) {
        return startTag;
      }
      if (partials.length == 0) {
        return startTag + `</${node.tagName.toLowerCase()}>`;
      }
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
  };
  var exportNode = s.exportNode;

  s.loadAsDataURL = function loadAsDataURL(url, overrideMimeType) { return new Promise(function(resolve, reject) {
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      responseType: 'arraybuffer',
      onerror: function() {
        console.error('Error when loading ' + url);
        reject('error');
      },
      ontimeout: function() {
        console.error('Timeout exceeded when loading ' + url);
        reject('timeout');
      },
      onload: function(result) {
        resolve(result);
      }
    });
  }).then(function(result) { return new Promise(function(resolve, reject) {
    var contentType;
    var responseHeaders = result.responseHeaders.split(/[\n\r]+/);
    if (overrideMimeType) {
      contentType = overrideMimeType;
    } else {
      for (var i = 0; i < responseHeaders.length; i++) {
        var header = responseHeaders[i].trim();
        if (header.startsWith('content-type:')) {
          var [key, val] = header.split(/\s*:\s*/);
          var contentType = val;
          break;
        }
      }
    }
    var contentData = new Uint8Array(result.response);
    var binString = '';
    for (var i = 0; i < contentData.length; i++) {
      binString += String.fromCharCode(contentData[i]);
    }
    var bHead = `data:${contentType};base64`;
    var bBody = btoa(binString);
    resolve(bHead + ',' + bBody);
  }) }) };
  var loadAsDataURL = s.loadAsDataURL;

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

  s.convertImage = function convertImage(src, targetType, config = {}) { return new Promise(function(resolve, reject) {
    var img  = document.createElement('img');
    var useCredentials = config.useCredentials || false;
    img.crossOrigin = useCredentials ? 'use-credentials' : 'anonymous';
    img.src = src;
    img.onload = function(e) {
      resolve(img);
    };
    img.onerror = function(e) {
      reject(e);
    };
  }).then(function(img) { return new Promise(function(resolve, reject) {
    var canv = document.createElement('canvas');
    var width = config.width;
    var height = config.height;
    if (width == undefined && height == undefined) {
      width = img.width;
      height = img.height;
    } else if (width == undefined) {
      width = Math.round(height * img.width / img.height);
    } else if (height == undefined) {
      height = Math.round(width * img.height / img.width);
    }
    canv.width = width;
    canv.height = height;
    var ctx = canv.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    var res = canv.toDataURL(targetType);
    resolve(res);
  }) }) };
  var convertImage = s.convertImage;

  s.WebConsole = function WebConsole(config = {}) {
    this.fontSize = config.fontSize || '12px';
    this.fontFamily = config.fontFamily || 'Source Code Pro';
    this.consoleCharSize = config.consoleCharSize || [80, 30];
    this.background = config.background || '#ffffff';
    this.defaultColor = config.defaultColor || '#494949';
    this.warnBackground = config.warnBackground || '#fff3d4';
    this.warnColor = config.warnColor || '#494949';
    this.errorBackground = config.errorBackground || '#fdf2f5';
    this.errorColor = config.errorColor || '#494949';
    this.infoBackground = config.infoBackground || '#f5fffc';
    this.infoColor = config.infoColor || '#494949';
    this.lineHeight = config.lineHeight || '1.2em';
    this.syncToConsole = (config.syncToConsole == undefined) ? true : config.syncToConsole;
    this.consoleSize = measureTextArea(
      ('0'.repeat(this.consoleCharSize[0]) + '\n').repeat(this.consoleCharSize[1]).slice(0, -1), 
      { style: `font-family: ${this.fontFamily}; font-size: ${this.fontSize}; line-height: ${this.lineHeight};` }
    );
    this.contentElement = $(
      `<div class="sehJS sehJS-console-wrapper">
        <div class="sehJS-console"></div>
      </div>`
    )[0];
    this.body = $(this.contentElement).find('.sehJS-console')[0];
    $(this.contentElement).css({
      fontSize: this.fontSize,
      fontFamily: this.fontFamily,
      width: this.consoleSize[0],
      height: this.consoleSize[1],
      background: this.background,
      color: this.defaultColor
    });
    var normalWidth = measureTextArea('0'.repeat(80), {
      style: `font-family: ${this.fontFamily}; font-size: ${this.fontSize}; font-weight: normal;`
    })[0];
    var boldWidth = measureTextArea('0'.repeat(80), {
      style: `font-family: ${this.fontFamily}; font-size: ${this.fontSize}; font-weight: bolder;`
    })[0];
    var emphWidth = measureTextArea('0'.repeat(80), {
      style: `font-family: ${this.fontFamily}; font-size: ${this.fontSize}; font-style: italic;`
    })[0];
    var boldLetterSpacing = (normalWidth - boldWidth) / 80;
    var emLetterSpacing   = (normalWidth - emphWidth) / 80;
    this.body.style.setProperty('--bold-letter-spacing', boldLetterSpacing + 'px');
    this.body.style.setProperty('--em-letter-spacing', emLetterSpacing + 'px');
    this.body.style.setProperty('--warn-background', this.warnBackground);
    this.body.style.setProperty('--warn-color', this.warnColor);
    this.body.style.setProperty('--error-background', this.errorBackground);
    this.body.style.setProperty('--error-color', this.errorColor);
    this.body.style.setProperty('--info-background', this.infoBackground);
    this.body.style.setProperty('--info-color', this.infoColor);
    this.body.style.setProperty('--line-height', this.lineHeight);
  }
  var WebConsole = s.WebConsole;

  WebConsole.prototype.detectURL = function detectURL(text, maxIter = 65536) {
    var wordBoundaryLeft  = /[^\\()"'`\-:,.;<>~!$^*|\[\]{}?\s]/;
    var wordBoundaryRight = /([\\)"'`>$^*|\]}\s]|([,.:;!~?]\s+))/;
    var leftIdx = text.search(wordBoundaryLeft);
    var rightIdx = text.search(wordBoundaryRight);
    var slice;
    var res = [];
    var count = 0
    while (leftIdx != -1 && count < maxIter) {
      count++;
      if (leftIdx != -1 && rightIdx != -1) {
        slice = text.slice(leftIdx, rightIdx);
      } else {
        slice = text.slice(leftIdx);
      }
      try {
        new URL(slice);
        res.push([
          leftIdx,
          (leftIdx >= rightIdx) ? (text.length) : (rightIdx)
        ]);
      } catch (e) { 
        if (e.name == 'TypeError') { ; }
        else {
          throw e;
        }
      }
      if (leftIdx < rightIdx) {
        leftIdx = text.slice(rightIdx + 1).search(wordBoundaryLeft) + rightIdx + 1;
      } else {
        leftIdx = -1;
      }
      if (leftIdx > rightIdx) {
        rightIdx = text.slice(leftIdx + 1).search(wordBoundaryRight) + leftIdx + 1;
      } else {
        rightIdx = -1;
      }
      if (rightIdx <= leftIdx) {
        rightIdx = -1;
      }
    };
    if (count >= maxIter) {
      console.warn('WebConsole.detectURL: max iteration reached');
    }
    return res;
  }

  WebConsole.prototype.shortenText = function shortenText(text, length, splitPosition = 0.5) {
    if (text.length <= 3 || text.length <= length) {
      return text;
    } else {
      var pieceLength;
      var floatRedundancy = [
        text.length * splitPosition - (text.length - length + 3) * splitPosition,
        text.length * (1 - splitPosition) - (text.length - length + 3) * (1 - splitPosition)
      ]
      if (splitPosition < 0.5) {
        pieceLength = [ Math.floor(floatRedundancy[0]), Math.ceil(floatRedundancy[1]) ];
      } else {
        pieceLength = [ Math.ceil(floatRedundancy[0]), Math.floor(floatRedundancy[1]) ];
      }
      return text.slice(0, pieceLength[0]) + '...' + text.slice(text.length - pieceLength[1]);
    }
  }

  WebConsole.prototype.escapeText = function escapeText(text) {
    var escaped = JSON.stringify(text).slice(1, -1);
    var backslashIdx = escaped.indexOf('\\');
    var prevIdx = 0;
    var maxIter = 65536;
    var count = 0;
    while (backslashIdx != -1 && count < maxIter) {
      count++;
      var escapeLength = escaped.slice(backslashIdx, backslashIdx + 2) == '\\u' ? 6 : 2;
      var substitute = `<span class="sehJS-style-esc">${escaped.slice(backslashIdx, backslashIdx + escapeLength)}</span>`;
      escaped = escaped.slice(0, backslashIdx) + substitute + escaped.slice(backslashIdx + escapeLength);
      prevIdx = backslashIdx;
      backslashIdx = escaped.slice(backslashIdx + substitute.length).indexOf('\\') + backslashIdx + substitute.length;
      if (backslashIdx < prevIdx + substitute.length) {
        backslashIdx = -1;
      }
    }
    if (count >= maxIter) {
      console.warn('WebConsole.detectURL: max iteration reached');
    }
    return escaped;
  }

  WebConsole.prototype.getClassName = function getClassName(obj) {
    var proto = Object.getPrototypeOf(obj);
    if (proto) {
      return proto.constructor.name;
    } else {
      return '';
    }
  }

  WebConsole.prototype.abbr = function abbr(obj, config = {}) { try {
    var level = config.level || 0;
    var maxLength = config.maxLength || 72;
    var objectInfo = config.objectInfo || { name: '', object: obj, parentInfo: null };
    if (typeof obj == 'number') {
      return `<strong class="sehJS-bold sehJS-style-cl">${String(obj)}</strong>`;
    } else if (obj != null && typeof obj == 'object') {
      var objectStack = [];
      var curLevel = objectInfo.parentInfo;
      if (curLevel) {
        while (true) {
          objectStack.unshift(curLevel);
          if (curLevel.parentInfo != null) {
            curLevel = curLevel.parentInfo;
          } else {
            break;
          }
        }
        var referenceIdx = 0;
        while (referenceIdx < objectStack.length) {
          if (obj === objectStack[referenceIdx].object) {
            break;
          } else {
            referenceIdx++;
          }
        }
        if (referenceIdx == objectStack.length - 1) {
          return `<span class="sehJS-style-slf">&lt;self reference&gt;</span>`;
        } else if (referenceIdx < objectStack.length) {
          var path = '';
          for (var i = 0; i <= referenceIdx; i++) {
            var name = objectStack[i].name;
            if (name == '') {
              path += `<span class="sehJS-style-c">(root)</span>`
            } else if (!Number.isNaN(Number(name))) {
              path += `[${name}]`;
            } else {
              if (!name.match(/^(\w|\$)+$/)) {
                path += `["${entitize(name)}"]`;
              } else {
                path += `.${name}`;
              }
            }
          }
          return `<span class="sehJS-style-slf">&lt;recursive reference: ${path}&gt;</span>`;
        }
      }
      if (obj instanceof HTMLElement) {
        var repr = 
          '<span class="sehJS sehJS-style-kos">&lt;</span>' + 
          `<span class="sehJS sehJS-style-ent">${obj.tagName.toLowerCase()}</span>`;
        for (var i = 0; i < obj.attributes.length; i++) {
          var attribute = obj.attributes[i];
          var attrRepr = 
            ` <span class="sehJS sehJS-style-cl">${attribute.nodeName}</span>` + 
            `="`;
          try {
            new URL(attribute.nodeValue);
            var value = attribute.nodeValue;
            if (value.length >= 72) {
              attrRepr += 
                `<a class="sehJS-console-link" href="${
                  entitize(value)
                }"><span class="sehJS-style-s sehJS-shortened" title="${
                  entitize(value)
                }">${
                  this.escapeText(entitize(this.shortenText(value, 72)))
                }</span></a>`;
            } else {
              attrRepr += 
                `<a class="sehJS-console-link" href="${entitize(value)}"><span class="sehJS-style-s">${
                  this.escapeText(entitize(value))
                }</span></a>`;
            }
            attrRepr += `"`;
          } catch (e) {
            if (e.name == 'TypeError') {
              var value = attribute.nodeValue;
              if (value.length >= 72) {
                attrRepr += `<span class="sehJS-style-s sehJS-shortened" title="${
                  entitize(value)
                }">${
                  this.escapeText(entitize(this.shortenText(value, 72)))
                }</span>`;
              } else {
                attrRepr += `<span class="sehJS-style-s">${
                  this.escapeText(entitize(value))
                }</span>`;
              }
              attrRepr += `"`;
            } else {
              throw e;
            }
          }
          repr += attrRepr;
        }
        repr += '<span class="sehJS-style-kos">&gt;</span>';
        return repr;
      }
      if (obj instanceof DocumentType) {
        var repr = `<span class="sehJS-style-cl">&lt;!DOCTYPE ${obj.name}&gt;</span>`;
        return repr;
      }
      if (obj instanceof Text) {
        var repr = `<span class="sehJS-style-cl"># ${entitize(obj.nodeValue)}</span>`;
        return repr;
      }
      if (obj instanceof Comment) {
        var repr = `<span class="sehJS-style-c">&lt;!--${entitize(obj.nodeValue)}--&gt;</span>`;
        return repr;
      }
      if ((
        obj instanceof Array || 
        (obj[0] != undefined && obj.length > 0) || 
        (obj[0] == undefined && obj.length == 0)) &&
        !(obj instanceof Window)) 
      {
        var className;
        var length;
        var leftPair;
        var content;
        var rightPair;
        var cls = this.getClassName(obj);
        if (cls != '') {
          className = `<span class="sehJS-style-v">${this.getClassName(obj)}</span>`;
        } else {
          className = `<span class="sehJS-style-v">&lt;null class&gt;</span>`;
        }
        length = `<span class="sehJS-style-c">(${obj.length})</span>`;
        if (level == 0 || level == 1) {
          leftPair = `<span class="sehJS-style-kos">[</span>`;
          content = '';
          var entries = Object.entries(obj);
          for (var i = 0; i < entries.length; i++) {
            var [key, val] = entries[i];
            if (!Number.isNaN(Number(key))) {
              content += 
                `<span class="sehJS-style-s">${
                  this.abbr(val, {
                    level: level + 1,
                    maxLength: maxLength,
                    objectInfo: { name: key, object: val, parentInfo: objectInfo }
                  })
                }</span>`;
            } else {
              if (!key.match(/^(\w|\$)+$/)) {
                content += `<span class="sehJS-style-kos">"</span>`;
              }
              content += 
                `<span class="sehJS-style-cl">${
                  entitize(key)
                }</span>`
              if (!key.match(/^(\w|\$)+$/)) {
                content += `<span class="sehJS-style-kos">"</span>`;
              }
              content += `<span class="sehJS-style-kos">:</span> `;
              content += 
                `<span class="sehJS-style-s">${
                  this.abbr(val, {
                    level: level + 1,
                    maxLength: maxLength,
                    objectInfo: { name: key, object: val, parentInfo: objectInfo }
                  })
                }</span>`;
            }
            if (i != entries.length - 1) {
              content += `<span class="sehJS-style-kos">,</span> `;
            }
            rightPair = `<span class="sehJS-style-kos">]</span>`;
          }
        }
        if (level == 0) {
          var fullRepr = `${className} ${length} ${leftPair}${content}${rightPair}`;
          return fullRepr;
        } else if (level == 1) {
          var fullRepr = entitize(html2Text(`${className} ${length} [${content}]`));
          return `<span class="sehJS-shortened" title="${fullRepr}">${className}${length}</span>`;
        } else {
          return `${className}${length}`;
        }
      }
      if (obj instanceof Error) {
        if (obj.stack && level == 0) {
          return `<span class="sehJS-style-err">${
            entitize(obj.toString())
          }</span><br><span class="sehJS-call-stack">${
            indentText(entitize(obj.stack))
          }</span>`;
        } else {
          return `<span class="sehJS-style-err">${obj.toString()}</span>`;
        }
      }
      if (
        typeof obj.toString == 'function' && 
        obj.toString != Object.prototype.toString &&
        !obj instanceof HTMLDocument &&
        !obj instanceof History) 
      {
        return `<span class="sehJS-style-kos">${entitize(obj.toString())}</span>`;
      }
      // if all above fails
      var className;
      var leftPair;
      var content;
      var rightPair;
      var cls = this.getClassName(obj);
      if (cls != '') {
        className = `<span class="sehJS-style-v">${this.getClassName(obj)}</span>`;
      } else {
        className = `<span class="sehJS-style-v">&lt;null class&gt;</span>`;
      }
      leftPair = `<span class="sehJS-style-kos">{</span>`;
      if (level == 0 || level == 1) {
        var entries = Object.entries(obj);
        content = '';
        for (var i = 0; i < entries.length; i++) {
          var [key, val] = entries[i];
          if (!key.match(/^(\w|\$)+$/)) {
            content += `<span class="sehJS-style-kos">"</span>`;
          }
          content += 
            `<span class="sehJS-style-cl">${
              entitize(key)
            }</span>`
          if (!key.match(/^(\w|\$)+$/)) {
            content += `<span class="sehJS-style-kos">"</span>`;
          }
          content += `<span class="sehJS-style-kos">:</span> `;
          content += 
            `<span class="sehJS-style-s">${
              this.abbr(val, {
                level: level + 1,
                maxLength: maxLength,
                objectInfo: { name: key, object: val, parentInfo: objectInfo }
              })
            }</span>`;
          if (i != entries.length - 1) {
            content += `<span class="sehJS-style-kos">,</span> `;
          }
        }
      }
      rightPair = `<span class="sehJS-style-kos">}</span>`;
      if (level == 0) {
        var fullRepr = `${className} ${leftPair}${content}${rightPair}`;
        return fullRepr;
      } else if (level == 1) {
        var fullRepr = entitize(html2Text(`${className} {${content}}`));
        return `<span class="sehJS-shortened" title="${fullRepr}">${className} {...}</span>`;
      } else {
        return `${className} ${leftPair}...${rightPair}`;
      }
    } else if (typeof obj == 'string') {
      return `<span class="sehJS-style-c">"${this.escapeText(entitize(this.shortenText(obj, maxLength)))}"</span>`;
    } else if (
      typeof obj == 'boolean' || 
      typeof obj == 'undefined' || 
      obj == null || 
      typeof obj == 'symbol') 
    {
      return `<em class="sehJS-emphasis sehJS-style-cl">${String(obj)}</em>`;
    } else if (typeof obj == 'function') {
      var repr = obj.toString();
      var name = obj.name;
      var res = '';
      var argumentListBefore = repr.indexOf('(');
      if (argumentListBefore == -1) {
        res += `<span class="sehJS-style-k">function</span> `;
        res += `<span class="sehJS-style-en">${name}</span>`;
        res += `<span class="sehJS-style-kos">(</span>`;
        res += `<span class="sehJS-native">&lt;native&gt;</span>`;
        res += `<span class="sehJS-style-kos">)</span>`;
        return res;
      }
      var argumentListAfter = pairPattern(repr, argumentListBefore, {
        left: '(',
        right: ')',
        nesting: true
      });
      res += `<span class="sehJS-style-k">function</span> `;
      res += `<span class="sehJS-style-en">${name}</span>`;
      res += `<span class="sehJS-style-kos">(</span>`;
      res += `<span class="sehJS-plain">${repr.slice(argumentListBefore + 1, argumentListAfter)}</span>`;
      res += `<span class="sehJS-style-kos">)</span>`;
      return res;
    } else {
      if (typeof obj.toString == 'function') {
        return this.escapeText(entitize(obj.toString()));
      } else {
        return `<span class="sehJS-style-err">&lt;unrecognized object&gt;</span>`
      }
    }
  } catch (e) {
    console.warn('Uncaught exception: ', e);
    return `<span class="sehJS-style-err">&lt;unrecognized object&gt;</span>`;
  }}

  WebConsole.prototype.log = function log(...what) {
    if (this.syncToConsole) {
      console.log(...what);
    }
    // $(this.body).append($('<br>'));
    var logWrapper = $(`<div class="sehJS-log-wrapper"></div>`);
    $(this.body).append(logWrapper);
    for (var i = 0; i < what.length; i++) {
      var item = what[i];
      if (typeof item == 'string') {
        logWrapper.append($(`<span class="sehJS-plain">${item}</span>`));
      } else {
        logWrapper.append($(this.abbr(item)));
      }
      if (i < what.length - 1) {
        logWrapper.append(' ');
      }
    }
    this.contentElement.scrollTo(0, 65536);
    return this;
  }

  WebConsole.prototype.warn = function warn(...what) {
    if (this.syncToConsole) {
      console.warn(...what);
    }
    // $(this.body).append($('<br>'));
    var warnWrapper = $(`<div class="sehJS-warn-wrapper"></div>`);
    $(this.body).append(warnWrapper);
    for (var i = 0; i < what.length; i++) {
      var item = what[i];
      if (typeof item == 'string') {
        warnWrapper.append($(`<span class="sehJS-plain">${item}</span>`));
      } else {
        warnWrapper.append($(this.abbr(item)));
      }
      if (i < what.length - 1) {
        warnWrapper.append(' ');
      }
    }
    this.contentElement.scrollTo(0, 65536);
    return this;
  }

  WebConsole.prototype.error = function error(...what) {
    if (this.syncToConsole) {
      console.error(...what);
    }
    // $(this.body).append($('<br>'));
    var errorWrapper = $(`<div class="sehJS-error-wrapper"></div>`);
    $(this.body).append(errorWrapper);
    for (var i = 0; i < what.length; i++) {
      var item = what[i];
      if (typeof item == 'string') {
        errorWrapper.append($(`<span class="sehJS-plain">${item}</span>`));
      } else {
        errorWrapper.append($(this.abbr(item)));
      }
      if (i < what.length - 1) {
        errorWrapper.append(' ');
      }
    }
    this.contentElement.scrollTo(0, 65536);
    return this;
  }

  WebConsole.prototype.info = function info(...what) {
    if (this.syncToConsole) {
      console.info(...what);
    }
    // $(this.body).append($('<br>'));
    var infoWrapper = $(`<div class="sehJS-info-wrapper"></div>`);
    $(this.body).append(infoWrapper);
    for (var i = 0; i < what.length; i++) {
      var item = what[i];
      if (typeof item == 'string') {
        infoWrapper.append($(`<span class="sehJS-plain">${item}</span>`));
      } else {
        infoWrapper.append($(this.abbr(item)));
      }
      if (i < what.length - 1) {
        infoWrapper.append(' ');
      }
    }
    this.contentElement.scrollTo(0, 65536);
    return this;
  }

  s.ExportDialog = function ExportDialog(config = {}) {
    var modalHTML = fillTemplate(s.smModalTemplate, {
      width: 'auto',
      winTitle: '导出此文档为 HTML',
      modalBody: '',
      buttonGroup: ''
    });
    this.contentElement = $(modalHTML)[0];
    this.console = new WebConsole({
      background: 'transparent'
    });
    this.ID = genID();
    var ID = this.ID;
    $(this.contentElement).find('.sm-modal-body').append($(this.console.contentElement));
    $(this.contentElement).find('.sm-modal-close')[0].onclick = this.close.bind(this);
    ExportDialog.all.push(this);
  }
  var ExportDialog = s.ExportDialog;

  ExportDialog.prototype.close = function close() {
    $(this.contentElement).remove();
  }

  ExportDialog.all = [];

  ExportDialog.getDialogObject = function getDialogObject(id) {
    for (var i = 0; i < ExportDialog.all.length; i++) {
      var cur = ExportDialog.all[i];
      if (cur.ID == id) {
        return cur;
      }
    }
    return null;
  }

  s.patch = function patch(rootNode) { return new Promise(function(resolve, reject) {
    s.epProcWindow.console.log('applying patches');
    var $docBodyElem = $(rootNode).find('.ql-editor');
    // <p><hr></p> will result in two broken paragraph when document is re-writen
    // span.ql-hr is an alternative way to get a horizontal split line in Shimo
    var $hrs = $docBodyElem.find('p hr');
    for (var i = 0; i < $hrs.length; i++) {
      var hrElement = $hrs[i];
      $(hrElement).replaceWith('<span class="ql-hr"></span>');
    }
    s.epProcWindow.console.log('patches applied, continuing.');
    resolve();
  }) }
  var patch = s.patch;

  s.processDocument = function processDocument(source, options = {}) { return new Promise(function(resolve, reject) {
    s.epProcWindow.console.log('processing exported code');
    var parser = new DOMParser();
    var doc = parser.parseFromString(source, 'text/html');
    var loadingCount = 0;
    var add  = function() {
      loadingCount++;
    };
    var done = function() {
      loadingCount--;
      if (!loadingCount) {
        s.epProcWindow.console.log('all solidfications are done, continuing.');
        resolve(dedentText(`
          <!DOCTYPE html>
          ${doc.documentElement.outerHTML}
        `));
      }
    };
    s.epProcWindow.console.log('solidfing media');
    var contentImages = doc.querySelectorAll('.doc-root img[src]');
    for (var i = 0; i < contentImages.length; i++) { (function() {
      var imgNode = contentImages[i];
      var originalSrc = imgNode.attributes.src.value.replace(/!thumbnail/, '!original');
      s.epProcWindow.console.log(`downloading img from: ${originalSrc}`);
      loadAsDataURL(originalSrc).then(function(dataURL) {
        imgNode.setAttribute('src', dataURL);
        s.epProcWindow.console.log(`download from ${originalSrc} finished`);
        done();
      });
      add();
    })(); }
    s.epProcWindow.console.log('removing external scripts and styles');
    var contentScripts = doc.querySelectorAll('.doc-root script');
    for (var i = 0; i < contentScripts.length; i++) {
      var scriptNode = contentScripts[i];
      s.epProcWindow.console.log(`removing script:`, scriptNode);
      scriptNode.parentElement.removeChild(scriptNode);
    }
    var externalStyles = doc.querySelectorAll('.doc-root link[rel="stylesheet"]');
    for (var i = 0; i < externalStyles.length; i++) {
      var linkNode = externalStyles[i];
      s.epProcWindow.console.log(`removing external style:`, linkNode);
      linkNode.parentElement.removeChild(linkNode);
    }
    s.epProcWindow.console.log('converting hash links');
    var hyperlinks = doc.querySelectorAll('.doc-root a');
    for (var i = 0; i < hyperlinks.length; i++) {
      var aNode = hyperlinks[i];
      if (aNode.host == location.host && aNode.pathname == location.pathname) {
        s.epProcWindow.console.log('converting hyperlink:', aNode);
        aNode.setAttribute("href", aNode.search + aNode.hash);
        if (aNode.attributes.href.value == '') {
          aNode.setAttribute("href", '#');
        }
      }
      aNode.removeAttribute('target');
      aNode.removeAttribute('rel');
    }
    s.epProcWindow.console.log('converting line IDs');
    var paragraphs = doc.querySelectorAll('.doc-root [line]');
    for (var i = 0; i < paragraphs.length; i++) {
      var pNode = paragraphs[i];
      pNode.id = 'anchor-' + pNode.attributes.line.value;
      pNode.removeAttribute('line');
    }
    s.epProcWindow.console.log('removing unused items');
    var unusedElements = doc.querySelectorAll(
      `.doc-root .ql-sheet-menulist,
      .doc-root .ql-sheet-header-wrapper,
      .doc-root .ql-sheet-cell-hide,
      .doc-root .sm-docs-syntax-language`
    );
    for (var i = 0; i < unusedElements.length; i++) {
      var menuListNode = unusedElements[i];
      menuListNode.parentNode.removeChild(menuListNode);
    }
    var idGalleryImages = doc.querySelectorAll('.doc-root [id^="gallery_image_"]');
    for (var i = 0; i < idGalleryImages.length; i++) {
      var galleryImageNode = idGalleryImages[i];
      galleryImageNode.removeAttribute('id');
    }
    var imgs = doc.querySelectorAll('.doc-root img');
    for (var i = 0; i < imgs.length; i++) {
      var imgNode = imgs[i];
      imgNode.removeAttribute('ori-width');
      imgNode.removeAttribute('ori-height');
      imgNode.removeAttribute('data-src');
      imgNode.removeAttribute('data-width');
      imgNode.removeAttribute('data-height');
      imgNode.removeAttribute('data-layout');
      imgNode.removeAttribute('data-margin');
      imgNode.removeAttribute('data-frame');
      imgNode.removeAttribute('data-ori-height');
      imgNode.removeAttribute('data-ori-width');
      if (!imgNode.getAttribute('alt') || imgNode.getAttribute('alt') == '') {
        imgNode.removeAttribute('alt');
      }
    }
    var sheetDragLayers = doc.querySelectorAll('.doc-root .ql-sheet-drag-layer');
    for (var i = 0; i < sheetDragLayers.length; i++) {
      var dragLayerNode = sheetDragLayers[i];
      dragLayerNode.removeAttribute('style');
      dragLayerNode.removeAttribute('data-row');
      dragLayerNode.removeAttribute('data-col');
      dragLayerNode.removeAttribute('data-rowspan');
      dragLayerNode.removeAttribute('data-colspan');
      dragLayerNode.removeAttribute('data-type');
    }
    var commonUnusedAttributes = [
      'contenteditable', 'autocorrect', 'autocomplete', 'spellcheck'
    ];
    for (var i = 0; i < commonUnusedAttributes.length; i++) {
      var unusedAttribute = commonUnusedAttributes[i];
      var hasAttrElements = doc.querySelectorAll(`.doc-root [${unusedAttribute}]`);
      for (var j = 0; j < hasAttrElements.length; j++) {
        var curElem = hasAttrElements[j];
        curElem.removeAttribute(unusedAttribute);
      }
    }
    if (loadingCount == 0) {
      s.epProcWindow.console.log('nothing to solidfy, continuing.');
      resolve('<!DOCTYPE html>\n' + doc.documentElement.outerHTML);
    }
  }).then(function(solidfiedSource) { return new Promise(function(resolve, reject) {
    s.epProcWindow.console.log('Injecting processed code');
    var $containerFrame = $('<iframe class="sehJS" src="about:blank" />');
    $('body').append($containerFrame);
    var doc = $containerFrame[0].contentDocument;
    doc.write(solidfiedSource);
    doc.close();
    s.epProcWindow.console.log('Adding styles');
    var exportStyle = s.exportStyle;
    var exportStyleNode = doc.createElement('style');
    exportStyleNode.innerHTML = exportStyle;
    doc.documentElement.appendChild(exportStyleNode);
    var fontfaceStyle = s.fontfaceStyle;
    var fontfaceStyleNode = doc.createElement('style');
    fontfaceStyleNode.innerHTML = fontfaceStyle;
    doc.documentElement.appendChild(fontfaceStyleNode);
    s.epProcWindow.console.log('Final exportation');
    var exported = exportNode(doc.documentElement);
    $containerFrame.remove();
    resolve('<!DOCTYPE html>\n' + exported);
  }) }) }
  var processDocument = s.processDocument;

  s.exportCurrentFile = function exportCurrentFile() { return new Promise(function(resolve, reject) {
    if (!s.epProcWindow) {
      s.epProcWindow = new ExportDialog();
    }
    document.body.appendChild(s.epProcWindow.contentElement);
    s.epProcWindow.console.info('starting...');
    var $editorRoot = $('#editor');
    passOnPromise(patch, resolve, reject, $editorRoot[0]);
  }).then(function() { return new Promise(function(resolve, reject) {
    s.epProcWindow.console.log('getting document infomation');
    s.docTitle = $('#editor .ql-title input').val();
    s.rawDocContent = $('#editor .ql-editor').html();
    s.docRobotInstruction = 'index, follow';
    s.rawIconSource = $('link[rel~="icon"]').attr('href');
    s.epProcWindow.console.log('converting icon format');
    passOnPromise(convertImage, resolve, reject, s.rawIconSource, 'image/png');
  }) }).then(function(docIcon) { return new Promise(function(resolve, reject) {
    s.docIcon = docIcon;
    s.epProcWindow.console.log('filling export template');
    var docString = fillTemplate(s.docExportTemplate, {
      docTitle: s.docTitle,
      docIcon: s.docIcon,
      docRobotInstruction: s.docRobotInstruction,
      docBody: s.rawDocContent
    });
    passOnPromise(processDocument, resolve, reject, docString);
  }) }).then(function(finalDocument) { return new Promise(function (resolve, reject) {
    s.epProcWindow.console.log('document is ready. downloading...');
    passOnPromise(downloadAsTextFile, resolve, reject, finalDocument, `${s.docTitle}.html`);
  }) }).then(function() {
    s.epProcWindow.console.info('Download succeeded. View in download list.');
  }).catch(function(e) {
    if (e.error && e.details) {
      s.epProcWindow.console.error(`${e.error}: ${e.details}`);
    } else {
      s.epProcWindow.console.error(e);
    }
  }) };
  var exportCurrentFile = s.exportCurrentFile;

  s.injectIntoCurrent = function injectIntoCurrent(source, config) { return new Promise(function (resolve, reject) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(source, 'text/html');
    var docTitleText = doc.querySelector('.doc-title').value;
    var docBodyElems = doc.querySelectorAll('.doc-body > *');
    var $titleInput = $('#editor #ql-title-input');
    $titleInput.value(docTitleText);
    var $qlEditor = $('')
  }) }

  s.docExportTemplate = GM_getResourceText('docExportTemplate');
  s.exportStyle       = GM_getResourceText('exportStyle');
  s.onpageStyle       = GM_getResourceText('onpageStyle');
  s.fontfaceStyle     = GM_getResourceText('fontfaceStyle');
  s.smModalTemplate   = GM_getResourceText('smModalTemplate');
  s.importTestDoc     = GM_getResourceText('importTestDoc');

  $('html').append($('<style class="sehJS" />').html(s.onpageStyle));

})(window.unsafeWindow, $);















