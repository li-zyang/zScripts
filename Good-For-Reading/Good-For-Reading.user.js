// ==UserScript==
// @name         Good-For-Reading
// @name:zh-CN   旧式网页阅读优化
// @name:zh-TW   舊式網頁閲讀優化
// @namespace    https://github.com/li-zyang/
// @version      1.0 beta
// @description  Limit the width of old-styled websites (which has it's text content expand across the whole wide window) and add a catalogue sidebar for a comfortble reading. This script does not affect those "modern" web pages (At least I tried to avoid that. If it fails, you can report the bug on github).
// @description:zh-CN 调整旧式网页（指那些几乎没有排版，直接用 <h1>、<p> 等等标签从上到下堆下来的网页）的排版，将内容宽度限制为适合阅读的宽度，添加目录侧栏，点击可以跳转到对应位置。此脚本不影响“现代化的”网页（至少我写的时候是这么想的，如果有误伤，可以到 github 上告诉我）。
// @author       阿昭
// @require      https://cdn.bootcss.com/jquery/3.4.1/jquery.min.js
// @include      *://*
// @grant        none
// @noframes
// ==/UserScript==
(function() {
  function addSidebarTags(jQ_sidebar) {
    function hlevel(DOM_hNode) {
      return Number.parseInt(DOM_hNode.tagName.slice(1));
    }
    let pagetitles = $('.page-content').find('h1, h2, h3, h4, h5, h6');
    let base_hlevel = 6;
    for (let i = 0; i < pagetitles.length; i++) {
      let title = pagetitles[i];
      if (hlevel(title) < base_hlevel) {
        base_hlevel = hlevel(title);
      }
    }
    let cur_hlevel = base_hlevel;
    let cur_clevel = 1;
    for (let i = 0; i < pagetitles.length; i++) {
      let title = pagetitles[i];
      if (hlevel(title) > cur_hlevel) {
        cur_hlevel = hlevel(title);
        cur_clevel++;
      } else if (hlevel(title) < cur_hlevel) {
        cur_hlevel = hlevel(title);
        cur_clevel--;
      }
      let cata_element = $('<a class="title-' + cur_clevel + '" href=javascript:void(0);></a>').text($(title).text().trim());
      window.last_title_id++;
      $(title).attr('data-title-id', window.last_title_id);
      cata_element.attr('data-title-id', window.last_title_id);
      cata_element.click({ 'titleID': cata_element.attr('data-title-id'), 'element': cata_element },
        function(e) {
          $('body').animate({
            'scrollTop': $('.page-content *[data-title-id="' + e.data.titleID + '"]').offset().top - 50
          }, 500);
        }
      )
      jQ_sidebar.append(cata_element);
    }
  }
  let pagestyle = `
  @media screen
    and (min-width: 1280px) {
      :root {
        --main-width: 832px;
        --side-width: 256px;
      }
  }
  @media screen
    and (min-width: 640px)
    and (max-width: 1280px) {
    :root {
      --main-width: 65%;
      --side-width: 20%;
    }
  }
  @media screen
    and (max-width: 640px) {
      :root {
        --main-width: 100%;
        --side-width: 0px;
      }
  }
  html {
    display: grid;
    grid-template-columns: 100%;
    justify-items: stretch;
  }
  body {
    display: grid;
    grid-template-columns: var(--side-width) var(--main-width);
    grid-auto-flow: row dense;
    justify-content: center;
    align-content: start;
    align-items: start;
    grid-column-gap: 10px;
    background: #f0f0f0;
  }
  body > .page-content {
    grid-column: 2;
    background: rgba(127, 127, 127, 0.1);
    padding: 10px 10px 10px 10px;
  }
  body > .side-bar {
    background: rgba(127, 127, 127, 0.1);
    width: 100%;
    grid-column: 1;
    grid-row: 1;
    overflow: scroll;
    padding: 0px 0px 20px 0px;
  }
  body > .side-bar .side-bar-header {
    padding: 20px 10px 9px 10px;
    font-size: 2em;
    font-weight: bold;
    white-space: pre;
  }
  body > .side-bar a {
    text-decoration: none;
    display: block;
    line-height: 1.5em;
    color: inherit;
  }
  body > .side-bar .title-1 {
    padding: 3px 10px 0px 10px;
    font-size: 1em;
    font-weight: bold;
    white-space: pre;
  }
  body > .side-bar .title-2 {
    padding: 3px 30px 0px 10px;
    font-size: 0.9em;
    white-space: pre;
  }
  body > .side-bar .title-3 {
    padding: 3px 50px 0px 10px;
    font-size: 0.9em;
    white-space: pre;
  }
  body > .side-bar .title-4 {
    padding: 3px 70px 0px 10px;
    font-size: 0.9em;
    white-space: pre;
  }
  body > .side-bar .title-5 {
    padding: 3px 90px 0px 10px;
    font-size: 0.9em;
    white-space: pre;
  }
  body > .side-bar .title-6 {
    padding: 3px 110px 0px 10px;
    font-size: 0.9em;
    white-space: pre;
  }
`
  console.log("body > div: ");
  console.log($('body > div'))
  console.log("body > table:first: ");
  console.log($('body > table:first'));
  if (!$('body > div').length && !$('body > table:first').length) {
    let pagecontent = $('<div class="page-content"></div>').html($('body').html());
    $('body > *').remove();
    $('body').append(pagecontent);
    $('body').append($("<style></style>").text(pagestyle));
    let sidebar = $(`
<div class="side-bar">
  <div class="side-bar-header">Catalogue</div>
</div>`)
    console.log('sidebar: ');
    console.log(sidebar);
    window.last_title_id = 0;
    addSidebarTags(sidebar);
    $('body').prepend(sidebar);
  }
})();