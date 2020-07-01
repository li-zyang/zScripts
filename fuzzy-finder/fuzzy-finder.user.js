// ==UserScript==
// @name         fuzzy-finder
// @name:ZH-CN   模糊查找
// @name:ZH-TW   模糊查找
// @namespace    https://github.com/li-zyang
// @version      0.1.0
// @description  Fuzzy search on an web page
// @description:ZH-CN  在网页上进行模糊查找
// @description:ZH-TW  在網頁上進行模糊查找
// @author       阿昭
// @include      *://*
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

  window.fuzzyFinderJS = {};
  var s = fuzzyFinderJS;

  s.SearchToken = function(keyword, action = "include") {
    this.keyword = keyword;
    this.action = action;    // include, exclude, require
  }
  var SearchToken = s.SearchToken;
  
  s.SearchResult = function(element, marks) {
    this.element = element;
    this.marks = marks;    // [[searchToken, position]]
  }
  var SearchResult = s.SearchResult;

  s.crushText = function(text) {
    var lines = text.split('\n');
    var i = 0;
    while (i < lines.length) {
      var line = lines[i];
      if (/^\s*$/.test(line)) {
        lines.splice(i, 1);
      } else {
        lines[i] = line.trim();
        i++;
      }
    }
    return lines.join(' ');
  }
  var crushText = s.crushText;

  s.f1 = function(foundRelated, allRelated, foundAll) {
    // for keyword matching, foundRelated is the number of found 
    // keywords, allRelated is the number of search keywords, foundAll 
    // is the number of all words in target string
    var precision = foundRelated / foundAll;
    var recall    = foundRelated / allRelated;
    return 2 * precision * recall / (precision + recall);
  }
  var f1 = s.f1;

  s.levenshteinDistance = function(sequenceA, sequenceB) {
    if (!sequenceA.length || !sequenceB.length) {
      return sequenceA.length || sequenceB.length;
    } else {
      return Math.min(
        s.levenshteinDistance(
          sequenceA.slice(0, sequenceA.length - 1), 
          sequenceB
        ) + 1,
        s.levenshteinDistance(
          sequenceA, 
          sequenceB.slice(0, sequenceB.length - 1)
        ) + 1,
        s.levenshteinDistance(
          sequenceA.slice(0, sequenceA.length - 1), 
          sequenceB.slice(0, sequenceB.length - 1)
        ) + (sequenceA[sequenceA.length - 1] == sequenceB[sequenceB.length - 1] ? 0 : 1)
      );
    }
  }
  var levenshteinDistance = s.levenshteinDistance;

  s.word2id = (function() {
    var lastID = -1;
    var assigned = {};
    return function(word) {
      var trimed = word.trim();
      if (assigned[trimed] != undefined) {
        return assigned[trimed];
      } else {
        lastID++;
        assigned[trimed] = lastID;
        return assigned[trimed];
      }
    }
  })();
  var word2id = s.word2id;

  s.match = function(text, searchTokens) {
    // calculate matching degree: 
    // - proportion of matched words in included words (recall)
    // - proportion of matched words in the whole paragraph (precision)
    // the above two can be taken into account together by calculating 
    // F1
    // - distance of matched keywords
    // - proportion of matched keyword pairs obeying the original order
    // the above tow can be taken into account together by assigning 
    // each word an id and calculate the levenshtein distance between 
    // the minimum matching segment (removing the unmatched keywords in
    // the id sequence of search string)
    // (maybe take the importance of different keywords into 
    // consideration?) emmm ... not for now ...

  }

  s.fuzzySearch = function(element, tokens) {
    var res = [];
    // [{element: HTMLElement, unprocessed}]
    var forwardStack = [{
      element: element, 
      unprocessed: $(element).children()
    }];
    var backwardStack = [];
    while (forwardStack.length || backwardStack.length) {
      var backwardItem = backwardStack.pop();
      if (backwardItem) {
        if (!backwardItem.unprocessed) {
          // process it here
        } else {
          backwardStack.push(backwardItem);
        }
      }
    }
  }
  var fuzzySearch = s.fuzzySearch;
  
})(window.unsafeWindow, $);













