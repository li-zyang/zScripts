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

  s.patchPage = function patchPage() { return new Promise(function(resolve, reject) {
    console.log('apply patches');
    var $docBodyElem = $('.ql-editor');
    // <p><hr></p> will result in two broken paragraph when document is re-writen
    // span.ql-hr is an alternative way to get a horizontal split line in Shimo
    var $hrs = $docBodyElem.find('p hr');
    for (var i = 0; i < $hrs.length; i++) {
      var hrElement = $hrs[i];
      $(hrElement).replaceWith('<span class="ql-hr"></span>');
    }
    console.log('patches applied, continuing.');
    resolve();
  }) }
  var patchPage = s.patchPage;

  s.processDocument = function processDocument(source, options = {}) { return new Promise(function(resolve, reject) {
    console.log('processing exported code');
    var parser = new DOMParser();
    var doc = parser.parseFromString(source, 'text/html');
    var loadingCount = 0;
    var add  = function() {
      loadingCount++;
    };
    var done = function() {
      loadingCount--;
      if (!loadingCount) {
        console.log('all solidfications are done, continuing.');
        resolve(dedentText(`
          <!DOCTYPE html>
          ${doc.documentElement.outerHTML}
        `));
      }
    };
    console.log('solidfing media');
    var contentImages = doc.querySelectorAll('.doc-root img[src]');
    for (var i = 0; i < contentImages.length; i++) { (function() {
      var imgNode = contentImages[i];
      var originalSrc = imgNode.attributes.src.value.replace(/!thumbnail/, '!original');
      console.log(`downloading img from: ${originalSrc}`);
      loadAsDataURL(originalSrc).then(function(dataURL) {
        imgNode.setAttribute('src', dataURL);
        console.log(`download from ${originalSrc} finished`);
        done();
      });
      add();
    })(); }
    console.log('removing external scripts and styles');
    var contentScripts = doc.querySelectorAll('.doc-root script');
    for (var i = 0; i < contentScripts.length; i++) {
      var scriptNode = contentScripts[i];
      console.log(`removing script:`, scriptNode);
      scriptNode.parentElement.removeChild(scriptNode);
    }
    var externalStyles = doc.querySelectorAll('.doc-root link[rel="stylesheet"]');
    for (var i = 0; i < externalStyles.length; i++) {
      var linkNode = externalStyles[i];
      console.log(`removing external style:`, linkNode);
      linkNode.parentElement.removeChild(linkNode);
    }
    console.log('converting hash links');
    var hyperlinks = doc.querySelectorAll('.doc-root a');
    for (var i = 0; i < hyperlinks.length; i++) {
      var aNode = hyperlinks[i];
      if (aNode.host == location.host && aNode.pathname == location.pathname) {
        console.log('converting hyperlink:', aNode);
        aNode.setAttribute("href", aNode.search + aNode.hash);
        if (aNode.attributes.href.value == '') {
          aNode.setAttribute("href", '#');
        }
      }
      aNode.removeAttribute('target');
      aNode.removeAttribute('rel');
    }
    var paragraphs = doc.querySelectorAll('.doc-root [line]');
    for (var i = 0; i < paragraphs.length; i++) {
      var pNode = paragraphs[i];
      console.log('converting line IDs:', pNode);
      pNode.id = 'anchor-' + pNode.attributes.line.value;
      pNode.removeAttribute('line');
    }
    console.log('removing unused items');
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
      console.log('nothing to solidfy, continuing.');
      resolve('<!DOCTYPE html>\n' + doc.documentElement.outerHTML);
    }
  }).then(function(solidfiedSource) { return new Promise(function(resolve, reject) {
    console.log('Injecting processed code');
    var $containerFrame = $('<iframe class="shimo-embrace-html-js" src="about:blank" />');
    $('body').append($containerFrame);
    var doc = $containerFrame[0].contentDocument;
    doc.write(solidfiedSource);
    doc.close();
    console.log('Adding styles');
    var exportStyle = s.exportStyle;
    var exportStyleNode = doc.createElement('style');
    exportStyleNode.innerHTML = exportStyle;
    doc.documentElement.appendChild(exportStyleNode);
    var fontfaceStyle = s.fontfaceStyle;
    var fontfaceStyleNode = doc.createElement('style');
    fontfaceStyleNode.innerHTML = fontfaceStyle;
    doc.documentElement.appendChild(fontfaceStyleNode);
    console.log('Final exportation');
    var exported = exportNode(doc.documentElement);
    resolve('<!DOCTYPE html>\n' + exported);
  }) }) }
  var processDocument = s.processDocument;

  s.exportCurrentFile = function exportCurrentFile() { return new Promise(function(resolve, reject) {
    passOnPromise(patchPage, resolve, reject);
  }).then(function() { return new Promise(function(resolve, reject) {
    // debugger;
    console.log('getting document infomation');
    s.docTitle = $('#editor .ql-title input').val();
    s.rawDocContent = $('#editor .ql-editor').html();
    s.docRobotInstruction = 'index, follow';
    s.rawIconSource = $('link[rel~="icon"]').attr('href');
    console.log('converting icon format');
    passOnPromise(convertImage, resolve, reject, s.rawIconSource, 'image/png');
  }) }).then(function(docIcon) { return new Promise(function(resolve, reject) {
    s.docIcon = docIcon;
    console.log('filling export template');
    var docString = fillTemplate(s.docExportTemplate, {
      docTitle: s.docTitle,
      docIcon: s.docIcon,
      docRobotInstruction: s.docRobotInstruction,
      docBody: s.rawDocContent
    });
    passOnPromise(processDocument, resolve, reject, docString);
  }) }).then(function(finalDocument) { return new Promise(function (resolve, reject) {
    console.log('document is ready. downloading...');
    passOnPromise(downloadAsTextFile, resolve, reject, finalDocument, `${s.docTitle}.html`);
  }) }).then(function() {
    console.log('Download succeeded. View in download list.');
  }).catch(function(e) {
    if (e.error && e.details) {
      console.error(`${e.error}: ${e.details}`);
    } else {
      console.error(e);
    }
  }) };
  var exportCurrentFile = s.exportCurrentFile;

  s.docExportTemplate = GM_getResourceText('docExportTemplate');
  s.exportStyle = GM_getResourceText('exportStyle');
  s.onpageStyle = GM_getResourceText('onpageStyle');
  s.fontfaceStyle = GM_getResourceText('fontfaceStyle');

  $('html').append($('<style class="shimo-embrace-html-js" />').html(s.onpageStyle));

})(window.unsafeWindow, $);















