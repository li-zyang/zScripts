function RelativeURL(urlString) {
  this.password = '';
  var remain = urlString;
  var matchedProto = remain.match(/^(\w|-)+:/);
  (function() {
    var protocol = null;
    if (matchedProto) {
      protocol = matchedProto[0];
    }
    Object.defineProperty(this, 'protocol', {
      get: function() {
        return protocol;
      },
      set: function(val) {
        if (!val.endsWith(':')) {
          val = val + ':';
        }
        if (val == protocol) {
          return;
        } else {
          protocol = val;
          var stringRepr = this.toString();
          if (this.protocol) {
            var rest = stringRepr.slice(this.protocol.length + 1);
            if (rest.startsWith('//')) {
              rest = rest.slice(2);
            }
          }
          if (RelativeURL.unhostedProtocols.indexOf(val) == -1) {
            rest = '//' + rest;
          }
          this.imitate(new RelativeURL(val + rest), ['protocol']);
        }
      },
      configurable: true,
      enumerable: true
    });
  }).call(this);
  if (matchedProto) {
    remain = remain.slice(matchedProto[0].length);
  }
  Object.defineProperty(this, 'origin', {
    get: function() {
      if (this.unhosted) {
        return this._origin;
      } else if (this.protocol && this.hostname) {
        return `${this.protocol}//${this.host}`;
      } else {
        return null;
      }
    },
    set: function(val) {
      if (this.unhosted) {
        this._origin = val;
      } else {
        var parsedOrigin = new RelativeURL(val);
        this.port = parsedOrigin.port;
        this.hostname = parsedOrigin.hostname;
        this.protocol = parsedOrigin.protocol;
      }
    },
    configurable: true,
    enumerable: true
  });
  (function() {
    var unhosted;
    Object.defineProperty(this, 'unhosted', {
      get: function() {
        return unhosted;
      },
      set: function(val) {
        if (val == unhosted) {
          return;
        } else if (val == false && this._origin) {
          unhosted = val;
          this.origin = this._origin;
        } else {
          unhosted = val;
        }
      },
      configurable: true,
      enumerable: false
    });
  }).call(this);
  Object.defineProperty(this, '_origin', {
    value: undefined,
    configurable: true,
    writable: true,
    enumerable: false
  });
  (function() {
    var username;
    Object.defineProperty(this, 'username', {
      get: function() {
        if (username) {
          return username;
        } else if (this.hostname) {
          return '';
        } else {
          return null;
        }
      },
      set: function(val) {
        username = val;
      },
      configurable: true,
      enumerable: true
    });
  }).call(this);
  (function() {
    var port;
    Object.defineProperty(this, 'port', {
      get: function() {
        if (port) {
          return port;
        } else if (this.hostname) {
          return '';
        } else {
          return null;
        }
      },
      set: function(val) {
        port = val;
      },
      configurable: true,
      enumerable: true
    });
  }).call(this);
  (function() {
    var pathname;
    Object.defineProperty(this, 'pathname', {
      get: function() {
        if (pathname) {
          return pathname;
        } else if (this.hostname && !this.unhosted) {
          return '/';
        } else if (this.hostname) {
          return '';
        } else {
          return null;
        }
      },
      set: function(val) {
        pathname = val;
      },
      configurable: true,
      enumerable: true
    });
  }).call(this);
  (function() {
    var hash;
    Object.defineProperty(this, 'hash', {
      get: function() {
        if (hash) {
          return hash;
        } else if (this.hostname || this.pathname || this.search) {
          return '';
        } else {
          return null;
        }
      },
      set: function(val) {
        hash = val;
      },
      configurable: true,
      enumerable: true
    });
  }).call(this);
  Object.defineProperty(this, 'host', {
    get: function() {
      if (this.hostname) {
        if (this.port && this.port != '') {
          return `${this.hostname}:${this.port}`;
        } else {
          return this.hostname;
        }
      } else {
        return null;
      }
    },
    set: function(val) {
      var [hostname, port] = val.split(':');
      this.hostname = hostname;
      this.port = port;
    },
    configurable: true,
    enumerable: true
  });
  Object.defineProperty(this, 'href', {
    get: function() {
      return this.toString();
    },
    set: function(val) {
      this.imitate(new RelativeURL(val));
    },
    configurable: true,
    enumerable: true
  });
  Object.defineProperty(this, 'search', {
    get: function() {
      var searchString = this.searchParams.toString();
      if (searchString != '') {
        return `?${searchString}`;
      } else if (this.hostname || this.pathname) {
        return '';
      } else {
        return null;
      }
    },
    set: function(val) {
      this.searchParams = new URLSearchParams(val);
    },
    configurable: true,
    enumerable: true
  });
  if (RelativeURL.presetParser[this.protocol]) {
    RelativeURL.presetParser[this.protocol](urlString);
  } else {
    if (remain.startsWith('//')) {
      this.unhosted = false;
      remain = remain.slice(2);
      var matchedUsername = remain.match(/^[^@:/?#]+@/);
      if (matchedUsername) {
        this.username = matchedUsername[0].slice(0, -1);
        remain = remain.slice(matchedUsername[0].length);
      }
      var matchedHostname = remain.match(/^[^:/?#]+/);
      if (matchedHostname) {
        this.hostname = matchedHostname[0];
        remain = remain.slice(matchedHostname[0].length);
      }
      var matchedPort = remain.match(/^:\d+/);
      if (matchedPort) {
        this.port = matchedPort[0].slice(1);
        remain = remain.slice(matchedPort[0].length);
      }
      if (!this.hostname && (this.username || this.port)) {
          throw TypeError(`RelativeURL constructor: ${urlString} is not a valid relative URL`);
      }
    } else {
      this.unhosted = true;
      try {
        var originURL = new URL(remain);
        this.origin = originURL.origin;
      } catch (e) { if (e.name == 'TypeError') {
        this.origin = 'null';
      } else {
        throw e;
      }}
      this.username = '';
      this.hostname = '';
      this.port = '';
    }
    if (!this.unhosted) {    // false or undefined
      var matchedPathname = remain.match(/^[^?#]+/);
      if (matchedPathname) {
        this.pathname = matchedPathname[0];
        remain = remain.slice(matchedPathname[0].length);
      }
      var matchedSearch = remain.match(/^\?[^#]+/);
      if (matchedSearch) {
        this.searchParams = new URLSearchParams(matchedSearch[0]);
        remain = remain.slice(matchedSearch[0].length);
      } else {
        this.searchParams = new URLSearchParams();
      }
      var matchedHash = remain.match(/^#.+/);
      if (matchedHash) {
        this.hash = matchedHash[0];
      }
    } else {
      this.pathname = remain;
      this.search = '';
      this.hash = '';
    }
  }
}

RelativeURL.presetParser = {};
RelativeURL.unhostedProtocols = ['data:', 'about:', 'blob:', 'mailto:'];

RelativeURL.prototype.toString = function() {

}

RelativeURL.prototype.applyOn = function(baseURL) {

}

RelativeURL.prototype.imitate = function(another, excludeKeys) {
  var keyProperties = ['protocol', 'hostname', 'host', 'unhosted', 'origin', 'pathname', 'search', 'hash'];
  for (var i = 0; i < keyProperties.length; i++) {
    var key = keyProperties[i];
    this[key] = another[key];
  }
  return this;
}

var absoluteURLs = [
'https://motherfucker@shimo.im:512/docs/b96fc235a1ad43be?hello=meow&msg=urabitch',
'data:text/plain;base64,SGVsbG8gY29zbW9zIQ==',
'moz-extension://6549ad38-7548-4564-8248-de64dbdd1b8f/options.html',
'about:blank',
'mailto:Stray@163.com',
'blob:http://127.0.0.1/4eae1bfd-e2ef-4c13-b2f8-7460251b0b88'
];
var relativeURLs = [
'//motherfucker@shimo.im:512/docs/b96fc235a1ad43be?hello=meow&msg=urabitch#what',
'//shimo.im/docs/b96fc235a1ad43be?hello=meow&msg=urabitch#what',
'/docs/b96fc235a1ad43be?hello=meow&msg=urabitch#what',
'b96fc235a1ad43be?hello=meow&msg=urabitch',
'?hello=meow&msg=urabitch#what',
'#what'
];

function indentText(str, level = 1, fill = '  ') {
  var splitted = str.split('\n');
  for (var i = 0; i < splitted.length; i++) {
    var line = splitted[i];
    if (!/^\s*$/.test(line)) {
      splitted[i] = fill.repeat(level) + line;
    }
  }
  return splitted.join('\n');
}

function pairPattern(str, leftPatternIdx, options = {}) {
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
      if (asLeftIdx >= pairs.length) {
        throw SyntaxError(`Unmatched symbol: "${curSymb}" at position ${i} (Symbol "${lastItem[0]}" opened at ${lastItem[3]})`);
      }
      symbolStack.push(asLeftPair.concat([i]));
    }
    i += view.length;
  }
  return -1;
}

function prettify(Obj) {
  if (Obj != null && typeof Obj == 'object') {
    var res = [];
    var className = Obj.constructor.name;
    if (className == '') {
      className = 'Object';
    }
    var head = `${className} {`;
    var entries = Object.entries(Obj);
    for (var i = 0; i < entries.length; i++) {
      var [key, val] = entries[i];
      if (/^(\w|\$)+$/.test(key)) {
        var valRepr;
        if (typeof val == 'function') {
          var matchedProto = val.toString().split('\n')[0].match(/^function\s*((\w|\$)*)\s*\(.*?\)/);
          valRepr = `function ${}`
        } else if (typeof val.toString == 'function' && val.toString != Object.prototype.toString) {
          valRepr = val.toString();
        }
        var entryRepr = `${key}: ${indentText(prettify(val)).trim()}`;
        if (i != entries.length - 1) {
          entryRepr += ',';
        }
        res.push(entryRepr);
      } else {
        var entryRepr = `"${key}": ${indentText(prettify(val)).trim()}`;
        if (i != entries.length - 1) {
          entryRepr += ',';
        }
        res.push(entryRepr);
      }
    }
    var foot = `}`;
    var charCount = 0;
    for (var i = 0; i < res.length; i++) {
      var itm = res[i];
      charCount += itm.length;
    }
    if (charCount <= 80 - res.length + 1) {
      var logString = head;
      logString += ' ';
      logString += indentText(res.join(' '));
      logString += ' ';
      logString += foot;
      return logString;
    } else {
      var logString = head;
      logString += '\n';
      logString += indentText(res.join('\n'));
      logString += '\n';
      logString += foot;
      return logString;
    }
  } else {
    return String(Obj);
  }
}