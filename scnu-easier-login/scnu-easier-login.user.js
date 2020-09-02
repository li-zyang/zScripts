// ==UserScript==
// @name         scnu-easier-login
// @namespace    https://github.com/li-zyang/
// @version      0.1.0
// @description  Automatically complete the fields on sso platform of scnu
// @author       阿昭
// @include      https://sso.scnu.edu.cn/*/login.html*
// @include      https://jwxt.scnu.edu.cn/xtgl/login_slogin.html*
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

(function(window, $) {

  'use strict';

  window.scnuEasierLoginJS = {};
  var s = scnuEasierLoginJS;

  var accounts = GM_getValue('accounts') || {};

  s.setAccount = function setAccount(name, field, value) {
    accounts[name] = accounts[name] || {};
    accounts[name][field] = value;
    GM_setValue('accounts', accounts);
  }
  var setAccount = s.setAccount;
  // account structure: { account, password }

  s.delAccount = function delAccount(name) {
    delete accounts[name];
    GM_setValue('accounts', accounts);
  }
  var delAccount = s.delAccount;

  if (/https:\/\/sso.scnu.edu.cn\/.+\/login.html.*/.test(location.toString())) {

    console.log('Working on sso.scnu.edu.cn');
    var extraCSS = `
      #codeimg {
        height: 80px;
        border-radius: 0px;
        top: auto;
        bottom: 0px;
      }
      #rancode {
        width: 200px;
        padding: 0px 18px 0px 18px;
      }
      .container .right {
        padding: 50px 25px 0px 25px;
        right: auto;
        position: absolute;
        left: calc(50% - 210px);
        width: 425px !important;
        min-width: 425px !important;
        max-width: 425px !important;
      }
      .container .left {
        display: none;
      }
    `
    $('body').append($('<style></style>').html(extraCSS));
    if (!accounts['sso']) {
      console.warn('scnu-easier-login.user.js: Account on sso.scnu.edu.cn has not been set yet');
      return 1;
    }
    var $accountInput  = $('#account');
    var $pswInput = $('#password');
    window.$captchaInput  = $('#rancode');
    window.$captchaImg    = $('#codeimg');
    window.$loginBtn = $('button.login');
    $accountInput.val(accounts['sso']['account']);
    $pswInput.val(accounts['sso']['password']);
    setTimeout(function() {
      console.log('focusing...');
      window.$captchaInput.focus();
    }, 100);
    window.$captchaImg.on('load', function() {
      setTimeout(function() {
        console.log('clear & focusing...');
        window.$captchaInput.val('');
        window.$captchaInput.focus();
      }, 0);
    });
    window.$captchaInput.on('input', function() {
      console.log(window.$loginTimeout);
      if (typeof(window.$loginTimeout) != 'undefined') {
        console.log('clear timeout');
        clearTimeout(window.$loginTimeout);
        delete window.$loginTimeout;
      }
      if (window.$captchaInput.val().length == 4) {
        window.$loginTimeout = setTimeout(function() {
          console.log('auto click login');
          window.$loginBtn.click();
        }, 500);
      } else {
        console.log('input detected, waiting for completion');
      }
    })

  } else if (/https:\/\/jwxt.scnu.edu.cn\/xtgl\/login_slogin.html.*/.test(location.toString())) {

    console.log('Working on jwxt.scnu.edu.cn');
    if (!accounts['jwxt']) {
      console.warn('scnu-easier-login.user.js: Account on jwxt.scnu.edu.cn has not been set yet');
      return 1;
    }
    var $accountInput = $('#yhm');
    var $pswInput = $('#mm');
    var $loginBtn = $('#dl');
    $accountInput.val(accounts['jwxt']['account']);
    $pswInput.val(accounts['jwxt']['password']);
    setTimeout(function() {
      console.log('Logging in...');
      // $loginBtn.click();
    }, 0);
  }
})(window.unsafeWindow, $);










