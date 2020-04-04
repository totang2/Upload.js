/** Upload.js (1.3.0) | https://github.com/georgelee1/Upload.js | MIT */(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = fileDelete;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * The delete module handles the deletion of a file by id
 */
function fileDelete(http, events, opts, queue) {
  /**
   * @private
   */
  function _peformDelete(id, done) {
    events.trigger('delete.started', { id: id });
    opts.get('delete.url', 'delete.param', 'delete.additionalParams', 'delete.headers', function (url, param, additionalParams, headers) {
      var params = Object.assign({}, additionalParams, _defineProperty({}, param, id));

      http(url, params, headers).done(function (_ref) {
        var success = _ref.success;

        if (success === true || success === 'true') {
          events.trigger('delete.done', { id: id });
        } else {
          events.trigger('delete.failed', { id: id });
        }
        done();
      }).fail(function () {
        events.trigger('delete.failed', { id: id });
        done();
      });
    });
  }

  /**
   * Delete one or more files.
   */
  function del() {
    for (var _len = arguments.length, ids = Array(_len), _key = 0; _key < _len; _key++) {
      ids[_key] = arguments[_key];
    }

    ids.forEach(function (id) {
      events.trigger('delete.added', { id: id });
      queue.offer(function (done) {
        return _peformDelete(id, done);
      });
    });
  }

  return {
    del: del
  };
}

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = types;
/**
 * Types module. Gets and parses pre-defined types and allowed types, exposes
 * an isAllowed function to test whether a type is allowed or not.
 */
function types(opts) {
  var allowed = void 0;
  var waiting = [];

  /**
   * Returns true of false if the passed type is an allowed type.
   * @private
   */
  function _checkIsAllowed(type) {
    return allowed.indexOf(type.toLowerCase()) >= 0;
  }

  /**
   * Calls the callback with true or false whether or not the type is allowed.
   */
  function isAllowed(type, callback) {
    if (waiting) {
      waiting.push([type, callback]);
      if (waiting.length === 1) {
        opts.get('allowed_types', 'types', function () {
          var optAllowedTypes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
          var optTypes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

          allowed = [].concat.apply([], optAllowedTypes.map(function (t) {
            return optTypes[t] || t;
          })).map(function (t) {
            return t.toLowerCase();
          });
          waiting.forEach(function (_ref) {
            var _ref2 = _slicedToArray(_ref, 2),
                waitingType = _ref2[0],
                waitingCallback = _ref2[1];

            return waitingCallback(_checkIsAllowed(waitingType));
          });
          waiting = undefined;
        });
      }
    } else {
      callback(_checkIsAllowed(type));
    }
  }

  return {
    isAllowed: isAllowed
  };
}

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = fileUpload;

var _types2 = require('./types');

var _types3 = _interopRequireDefault(_types2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * The upload module handles the actual file upload mechanism
 */
function fileUpload(http, events, opts, queue) {
  var _types = (0, _types3.default)(opts);

  /**
   * @private
   */
  function _peformUpload(file, id, done) {
    events.trigger('upload.started', { file: file, id: id });
    opts.get('upload.url', 'upload.param', 'upload.additionalParams', 'upload.headers', function (url, param, additionalParams, headers) {
      var params = Object.assign({}, additionalParams, _defineProperty({}, param, file));

      http(url, params, headers).progress(function (progress) {
        return events.trigger('upload.progress', { file: file, id: id, progress: progress });
      }).done(function (_ref) {
        var success = _ref.success,
            uploadImageId = _ref.uploadImageId;

        if (success === true || success === 'true') {
          events.trigger('upload.done', { file: file, id: id, uploadImageId: uploadImageId });
        } else {
          events.trigger('upload.failed', { file: file, id: id });
        }
        done();
      }).fail(function () {
        events.trigger('upload.failed', { file: file, id: id });
        done();
      });
    });
  }

  /**
   * Upload one or more files.
   */
  function upload() {
    for (var _len = arguments.length, files = Array(_len), _key = 0; _key < _len; _key++) {
      files[_key] = arguments[_key];
    }

    files.forEach(function (_ref2) {
      var file = _ref2.file,
          id = _ref2.id;

      _types.isAllowed(file.type, function (allowed) {
        if (allowed) {
          events.trigger('upload.added', { file: file, id: id });
          queue.offer(function (done) {
            return _peformUpload(file, id, done);
          });
        } else {
          console.log('reject');
          events.trigger('upload.failed', { file: file, id: id, rejected: 'type' });
        }
      });
    });
  }

  return {
    upload: upload
  };
}

},{"./types":2}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = core;

var _queue2 = require('./util/queue');

var _queue3 = _interopRequireDefault(_queue2);

var _upload = require('./actions/upload');

var _upload2 = _interopRequireDefault(_upload);

var _delete = require('./actions/delete');

var _delete2 = _interopRequireDefault(_delete);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The core is the engine that handles the uploading and deleting of files.
 */
function core(http, events, opts) {
  var _queue = (0, _queue3.default)(function (item, done) {
    item(done);
  }, { delay: 100 });

  var upload = (0, _upload2.default)(http, events, opts, _queue);
  var del = (0, _delete2.default)(http, events, opts, _queue);

  return {
    upload: upload.upload,
    del: del.del,
    destroy: function destroy() {
      _queue.clear();
    }
  };
}

},{"./actions/delete":1,"./actions/upload":3,"./util/queue":9}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = events;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ALL = '$all';

/**
 * The events module handles registering of event listeners and triggering of events.
 */
function events() {
  var known = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  var _byKey = {};
  var _emit = [];
  var _parents = [];

  function isDefined(val) {
    return val && typeof val !== 'undefined' && !((typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object' && !val);
  }

  /**
   * Register event listener
   */
  function on(key, id, listener) {
    var available = known.concat(_parents.reduce(function (val, next) {
      return val.concat(next);
    }, []));
    if (available.length && available.indexOf(key) < 0) {
      console.warn('Attemping to listen to an unknown event. ' + ('\'' + key + '\' is not one of \'' + available.join(', ') + '\''));
    }
    if (typeof id === 'function') {
      listener = id;
      id = ALL;
    }
    var actualId = isDefined(id) ? id.toString() : ALL;
    if (typeof listener === 'function') {
      if (!_byKey[key]) {
        _byKey[key] = _defineProperty({}, ALL, []);
      }
      if (!_byKey[key][actualId]) {
        _byKey[key][actualId] = [];
      }
      _byKey[key][actualId].push(listener);
    }
  }

  /**
   * Unregister event listener
   */
  function off(key, id, handler) {
    if (_byKey[key]) {
      if (typeof id === 'function') {
        handler = id;
        id = false;
      }
      var actualId = isDefined(id) ? id.toString() : false;
      if (actualId) {
        if (handler) {
          var handlers = _byKey[key][actualId];
          if (handlers) {
            var idx = handlers.indexOf(handler);
            if (idx >= 0) {
              handlers.splice(idx, 1);
            }
          }
        } else {
          delete _byKey[key][actualId];
        }
      } else if (handler) {
        Object.keys(_byKey[key]).forEach(function (i) {
          var handlers = _byKey[key][i];
          if (handlers) {
            var _idx = handlers.indexOf(handler);
            if (_idx >= 0) {
              handlers.splice(_idx, 1);
            }
          }
        });
      } else {
        _byKey[key] = _defineProperty({}, ALL, []);
      }
    }
  }

  /**
   * Triggers event with key and parameters
   */
  function trigger(key, event) {
    if (_byKey[key]) {
      var id = event && isDefined(event.id) ? event.id.toString() : false;
      if (id) {
        (_byKey[key][id] || []).forEach(function (listener) {
          return listener(Object.assign({ type: key }, event));
        });
        _byKey[key][ALL].forEach(function (listener) {
          return listener(Object.assign({ type: key }, event));
        });
      } else {
        Object.keys(_byKey[key]).forEach(function (i) {
          _byKey[key][i].forEach(function (listener) {
            return listener(Object.assign({ type: key }, event));
          });
        });
      }
    }
    _emit.forEach(function (ev) {
      return ev.trigger(key, event);
    });
  }

  /**
   * Emits events trigger in this events instance to the passed events instance.
   */
  function emit(ev) {
    if (ev && ev.trigger) {
      _emit.push(ev);
      ev._parent(known);
    }
  }

  /**
   * Removes all listeners from the events
   */
  function clear() {
    _byKey = {};
    _emit = [];
    _parents = [];
  }

  return {
    on: on,
    off: off,
    trigger: trigger,
    emit: emit,
    _parent: function _parent(ev) {
      _parents.push(ev);
    },

    clear: clear
  };
}

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = http;
var NOOP = function NOOP() {};

/**
 * Simple AJAX Http caller that expects JSON response. Handles standard parameter posting and
 * file uploading.
 *
 * Usage (POST parameters):
 * let params = {
 *     key: "value"
 * }
 * let h = http("/post", params).done(data => {
 *     // do something with data
 * }).fail(() => {
 *     // do something when failed
 * })
 *
 * Usage (file uplaod):
 * let file = ...
 * let params = {
 *     file1: file
 * }
 * let h = http("/upload", params).progress((p => {
 *     // upload progress bar, p = percentage done
 * }).done(data => {
 *     // do something with data
 * }).fail(() => {
 *     // do something when failed
 * })
 */
function http(url) {
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var headers = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var _progress = NOOP;
  var _done = NOOP;
  var _fail = NOOP;
  var _instance = {};

  /**
   * Sets a progress handler for http request. Is called multiple times, periodically with a
   * progress value between 0 and 100
   */
  function progress(handler) {
    if (typeof handler === 'function') {
      _progress = handler;
    }
    return _instance;
  }

  /**
   * Sets a done handler for when the http request is complete. Called when response returns
   * with successful status code (2xx). Passed the parsed JSON object from the response.
   */
  function done(handler) {
    if (typeof handler === 'function') {
      _done = handler;
    }
    return _instance;
  }

  /**
   * Sets a failure handler for when the request fails with a non success http status code (2xx).
   */
  function fail(handler) {
    if (typeof handler === 'function') {
      _fail = handler;
    }
    return _instance;
  }

  /**
   * @private
   */
  function _post() {
    var uploading = false;
    var data = new FormData();
    var form = [];
    Object.keys(params).forEach(function (key) {
      var val = params[key];
      if (Array.isArray(val)) {
        val.forEach(function (v) {
          if (v.type && v.name) {
            uploading = true;
            data.append(key, v, v.name);
          } else {
            data.append(key, v);
            form.push([key, v]);
          }
        });
      } else {
        if (val.type && val.name) {
          uploading = true;
          data.append(key, val, val.name);
        } else {
          data.append(key, val);
          form.push([key, val]);
        }
      }
    });

    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
      if (request.readyState === 4) {
        if (request.status >= 200 && request.status < 300) {
          try {
            _done(JSON.parse(request.response));
          } catch (e) {
            _done({});
          }
        } else {
          _fail();
        }
      }
    };

    request.upload.addEventListener('progress', function (e) {
      _progress(Math.ceil(e.loaded / e.total * 100));
    }, false);

    request.open('POST', url, true);
    if (headers) {
      Object.keys(headers).forEach(function (key) {
        request.setRequestHeader(key, headers[key]);
      });
    }
    if (!uploading) {
      request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      request.send(form.map(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            key = _ref2[0],
            val = _ref2[1];

        return encodeURIComponent(key) + '=' + encodeURIComponent(val);
      }).join('&'));
    } else {
      request.send(data);
    }
  }

  _instance.progress = progress;
  _instance.done = done;
  _instance.fail = fail;
  _post();
  return _instance;
}

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = merge;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function isObject(item) {
  return item && (typeof item === 'undefined' ? 'undefined' : _typeof(item)) === 'object' && !Array.isArray(item);
}

function merge(target, objs) {
  if (!Array.isArray(objs)) {
    objs = [objs];
  }
  if (!objs.length) return target;
  var next = objs.shift();

  if (isObject(target) && isObject(next)) {
    Object.keys(next).forEach(function (key) {
      if (isObject(next[key])) {
        if (!target[key]) {
          target[key] = {};
        }
        merge(target[key], next[key]);
      } else {
        Object.assign(target, _defineProperty({}, key, next[key]));
      }
    });
  }

  return merge(target, objs);
}

},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = options;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * The Options module provides a wrap around an option object where options can be defined as
 * functions which take an optional done callback to allow lazy asynchronous loading of option
 * values.
 *
 * Usage:
 * let opts = {
 *    key1: "val1",
 *    key2: function() {
 *       return "val2"
 *    },
 *    key3: function(done) {
 *       // some async action that takes 1s, simulated here with setTimeout
 *       setTimeout(() => {
 *           done("val3")
 *       }, 1000)
 *    }
 * }
 *
 * let o = options(opts)
 * o.get("key1") === "val1"
 * o.get("key1", v => {
 *     v === "val1"
 * })
 * o.get("key2") === "val2"
 * o.get("key2", v => {
 *     v === "val2"
 * })
 * o.get("key3") === undefined
 * o.get("key3", v => {
 *     v === "val3"
 * })
 * o.get("key1", "key2") === ["val1", "val2]
 * o.get("key1", "key2", (v1, v2) => {
 *     v1 === "val1"
 *     v2 === "val2"
 * })
 * o.get("key1", "key3") === ["val1", undefined]
 * o.get("key1", "key3", (v1, v2) => {
 *     v1 === "val1"
 *     v2 === "val3"
 * })
 */
function options(opts) {
  /**
   * @private
   */
  function _mapKeysToValues(keys) {
    return keys.map(function (key) {
      var val = void 0;
      var obj = opts;
      key.split('.').forEach(function (part) {
        val = obj[part];
        obj = val || {};
      });
      return val;
    });
  }

  /**
   * Get the option values
   */
  function get() {
    var keys = [];
    var callback = undefined;

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    args.forEach(function (a) {
      if (typeof a === 'string') {
        keys.push(a);
      } else if (typeof a === 'function') {
        callback = a;
      }
    });

    var values = _mapKeysToValues(keys);
    if (!callback) {
      values = values.map(function (v) {
        if (typeof v === 'function') {
          if (v.length === 0) {
            return v();
          }
          return undefined;
        }
        return v;
      });
      if (values.length > 1) {
        return values;
      }
      return values[0];
    }

    var toResolve = values.filter(function (v) {
      return typeof v === 'function';
    }).length;

    if (toResolve === 0) {
      callback.apply(undefined, _toConsumableArray(values));
    } else {
      var valueCallback = function valueCallback(idx) {
        return function (val) {
          values[idx] = val;
          toResolve--;
          if (toResolve === 0) {
            callback.apply(undefined, _toConsumableArray(values));
          }
        };
      };

      values.forEach(function (v, idx) {
        if (typeof v === 'function') {
          if (v.length > 0) {
            v(valueCallback(idx));
          } else {
            valueCallback(idx)(v());
          }
        }
      });
    }

    return undefined;
  }

  return {
    get: get
  };
}

},{}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = queue;
/**
 * Simple Queue that allows for a configured number of concurrent items to be executed by a handler.
 *
 * Usage:
 * let options = {
 *     // number of items that can be processed at once
 *     concurrency: 1,
 *     // delay in the start of the processing in ms
 *     delay: 200,
 *     // max size of the queue
 *     size: 100
 * }
 *
 * let q = queue((item, done) => {
 *     // do some work with item that takes 1s, simulated here with setTimeout
 *     setTimeout(() => {
 *         done()
 *     }, 1000)
 * }, options)
 *
 * let my_item = ...
 * if (!q.offer(my_item)) {
 *     throw "Unable to add item to queue"
 * }
 */
function queue(handler) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var _handler = handler;
  var _concurrency = Math.max(options.concurrency, 1) || 1;
  var _delay = Math.max(options.delay, 0) || 0;
  var _size = Math.max(options.size, 0) || 0;
  var _queue = [];
  var _working = [];
  var _id = 0;

  /**
   * @private
   */
  function _next() {
    if (_working.length < _concurrency) {
      var next = _queue.shift();
      if (next !== undefined) {
        var id = ++_id;
        var done = function done() {
          var index = _working.indexOf(id);
          if (index >= 0) {
            _working.splice(index, 1);
            _next();
          }
        };
        var fire = function fire() {
          return _handler.apply(undefined, [next.item, done]);
        };
        _working.push(id);
        if (_delay) {
          setTimeout(fire, _delay);
        } else {
          fire();
        }
      }
    }
  }

  /**
   * Offer a item to the queue to be processed by the handler. Returns True if the queue
   * accepted the item, False if the queue has reached it's max size.
   */
  function offer(item) {
    if (!_size || _queue.length < _size) {
      _queue.push({
        item: item
      });
      _next();
      return true;
    }
    return false;
  }

  /**
   * Empties the queue
   */
  function clear() {
    _queue = [];
    _working = [];
  }

  return {
    offer: offer,
    clear: clear
  };
}

},{}],10:[function(require,module,exports){
'use strict';

module.exports = {
  /**
   * number | Maxiumum number of files that UploadJs will allow to contain.
   */
  max: Infinity,

  /**
   * object: {
   *   key: array
   * }
   * defined grouping of file types for allowed_types by MIME type
   */
  types: {
    images: ['image/jpg', 'image/jpeg', 'image/png', 'image/gif']
  },
  /**
   * array | The allowed file types that can be uploaded. Either MIME type of grouping key (see
   *         types)
   */
  allowed_types: ['images'],

  /**
   * Http upload options
   */
  upload: {
    /**
     * string | The URL that is called when uploading a file
     */
    url: '',
    /**
     * string | The name of the parameter that each file is set as in the upload request.
     */
    param: 'file',
    /**
     * object | Keyed object of additional parameters to send with the upload request.
     */
    additionalParams: {},
    /**
     * object | Keyed object of additional headers to send with the upload request.
     */
    headers: {}
  },

  /**
   * Http delete options
   */
  delete: {
    /**
     * string | The URL that is called when deleting a file
     */
    url: '',
    /**
     * string | The name of the parameter set with the file id that is set on the deletion request.
     */
    param: 'file',
    /**
     * object | Keyed object of additional parameters to send with the delete request.
     */
    additionalParams: {},
    /**
     * object | Keyed object of additional headers to send with the delete request.
     */
    headers: {}
  }
};

},{}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = container;

var _dom = require('./dom');

var _item = require('./item');

var _item2 = _interopRequireDefault(_item);

var _options = require('../core/util/options');

var _options2 = _interopRequireDefault(_options);

var _merge = require('../core/util/merge');

var _merge2 = _interopRequireDefault(_merge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function makeAdd() {
  var ele = (0, _dom.make)('div', { class: 'item new' });
  var icon = (0, _dom.make)('div', { class: 'icon plus' });
  (0, _dom.append)(ele, icon);
  return ele;
}

function makePicker(trigger, events, state, max) {
  var ele = (0, _dom.make)('input', {
    type: 'file',
    multiple: 'multiple'
  });
  (0, _dom.on)(ele, 'change', function () {
    var id = Date.now();
    for (var x = 0; x < ele.files.length && state.count + x < max; x++) {
      events.trigger('file.picked', { file: ele.files.item(x), id: x + '_' + id });
    }
  });

  var onClick = function onClick() {
    return ele.click();
  };
  (0, _dom.on)(trigger, 'click', onClick);

  events.on('destroy', function () {
    (0, _dom.off)(trigger, 'click', onClick);
  });

  return ele;
}

/**
 * The container module is a wrapper around the upload container.
 */
function container(ele, items, events, defaultOpt, opts) {
  var _state = {
    count: 0
  };
  (0, _dom.addClass)(ele, 'uploadjs');

  var _dataOpts = (0, _dom.data)(ele, 'upload', {
    url: 'upload.url',
    param: 'upload.param',
    deleteUrl: 'delete.url',
    deleteParam: 'delete.param',
    allowedTypes: 'allowed_types',
    additionalParam: 'upload.additionalParams',
    header: 'upload.headers',
    deleteAdditionalParam: 'delete.additionalParams',
    deleteHeader: 'delete.headers'
  });
  var _opts = (0, _options2.default)((0, _merge2.default)({}, [defaultOpt, _dataOpts, opts]));

  _opts.get('max', function (max) {
    var _items = (0, _dom.make)('div', { class: 'uploadjs-container' });
    var _actions = (0, _dom.make)('div', { class: 'uploadjs-container' });

    var _toAdd = items.slice(0, max);
    _state.count = _toAdd.length;
    _dom.append.apply(undefined, [_items].concat(_toConsumableArray(_toAdd)));
    (0, _dom.append)(ele, _items, _actions);

    var _add = makeAdd();
    (0, _dom.append)(_actions, _add);
    (0, _dom.append)(ele, makePicker(_add, events, _state, max));

    events.on('upload.added', function (_ref) {
      var file = _ref.file,
          id = _ref.id;

      console.log('item added');
      var i = (0, _item2.default)({ type: _item.TYPE_IMAGE, fileId: id, file: file, events: events });
      (0, _dom.append)(_items, i);
    });

    var hideShowAdd = function hideShowAdd(change) {
      console.log('hide show' + change);
      if (_state.count + change < max) {
        (0, _dom.removeClass)(_add, 'hide');
      } else {
        (0, _dom.addClass)(_add, 'hide');
      }
    };

    events.on('file.picked', hideShowAdd.bind(null, 1));
    events.on('item.removed', hideShowAdd.bind(null, -1));
    events.on('upload.failed', hideShowAdd.bind(null, -1));
    items.splice(0, items.length);
  });

  events.on('destroy', function () {
    ele.parentNode.removeChild(ele);
  });

  return _opts;
}

},{"../core/util/merge":7,"../core/util/options":8,"./dom":12,"./item":13}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.children = children;
exports.addClass = addClass;
exports.removeClass = removeClass;
exports.make = make;
exports.append = append;
exports.marker = marker;
exports.replaceMarker = replaceMarker;
exports.empty = empty;
exports.attrs = attrs;
exports.on = on;
exports.off = off;
exports.set = set;
exports.data = data;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * Returns a array of child elements of the passed element that match the passed type. Type is
 * optional, if not defined will match all children.
 */
function children(ele, type) {
  var result = [];
  var c = ele.children;
  var name = (type || '').toLowerCase();
  for (var x = 0; x < c.length; x++) {
    var child = c.item(x);
    if (!type || child.nodeName.toLowerCase() === name) {
      result.push(child);
    }
  }
  return result;
}

/**
 * Adds the passed classes to the passed DOM element.
 */
function addClass(ele) {
  var classes = !!ele.className ? ele.className.split(' ') : [];

  for (var _len = arguments.length, cls = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    cls[_key - 1] = arguments[_key];
  }

  cls.forEach(function (c) {
    if (classes.indexOf(c) < 0) {
      classes.push(c);
    }
  });
  ele.className = classes.join(' ');
}

/**
 * Removes the passed classes from the passed DOM element.
 */
function removeClass(ele) {
  var classes = !!ele.className ? ele.className.split(' ') : [];

  for (var _len2 = arguments.length, cls = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    cls[_key2 - 1] = arguments[_key2];
  }

  cls.forEach(function (c) {
    var index = classes.indexOf(c);
    if (index >= 0) {
      classes.splice(index, 1);
    }
  });
  ele.className = classes.join(' ');
}

/**
 * Creates and retusn a new DOM element with the defined name. Attributes is optional, must be an
 * object, if defined sets the attribute key and value from the enumerable properties on the object.
 */
function make(name, attributes) {
  var ele = document.createElement(name);
  if (attributes) {
    Object.keys(attributes).forEach(function (key) {
      if (key === 'class') {
        addClass.apply(undefined, [ele].concat(_toConsumableArray((attributes[key] || '').split(' '))));
      } else {
        ele.setAttribute(key, attributes[key]);
      }
    });
  }
  return ele;
}

/**
 * Appends the passed children to the passed element.
 */
function append(ele) {
  for (var _len3 = arguments.length, appendChildren = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
    appendChildren[_key3 - 1] = arguments[_key3];
  }

  appendChildren.forEach(function (child) {
    ele.appendChild(child);
  });
}

function makeMarkerKey(key, postfix) {
  return 'up-marker-' + key + '-' + postfix;
}

/**
 * Creates a marker that is appended to the element with the defined key.
 */
function marker(ele, key) {
  append(ele, document.createComment(makeMarkerKey(key, 'start')), document.createComment(makeMarkerKey(key, 'end')));
}

/**
 * Replaces the content inside the marker and replaces it with the supplied contents
 */
function replaceMarker(ele, key) {
  var markerStart = makeMarkerKey(key, 'start');
  var markerEnd = makeMarkerKey(key, 'end');
  var processing = false;

  var node = ele.firstChild;
  var insert = function insert(to, n) {
    return node.parentNode.insertBefore(n, to);
  };

  for (var _len4 = arguments.length, contents = Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
    contents[_key4 - 2] = arguments[_key4];
  }

  while (node) {
    if (node.nodeType === 8) {
      if (node.nodeValue === markerStart) {
        processing = true;
        node = node.nextSibling;
        continue;
      } else if (node.nodeValue === markerEnd) {
        contents.forEach(insert.bind(undefined, node));
        return;
      }
    }

    if (processing) {
      var next = node.nextSibling;
      node.parentNode.removeChild(node);
      node = next;
      continue;
    }

    node = node.nextSibling;
  }
}

/**
 * Removes all child nodes from the passed element.
 */
function empty(ele) {
  while (ele.firstChild) {
    ele.removeChild(ele.firstChild);
  }
}

/**
 * Gets the attributes from the passed element and returns a keyed object.
 */
function attrs(ele) {
  var result = {};

  for (var _len5 = arguments.length, attributes = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
    attributes[_key5 - 1] = arguments[_key5];
  }

  attributes.forEach(function (attr) {
    result[attr] = ele.getAttribute(attr);
  });
  return result;
}

/**
 * Adds event listener to the passed element.
 */
function on(ele, event, handler) {
  ele.addEventListener(event, handler);
}

/**
 * Remove event listener from the passed element.
 */
function off(ele, event, handler) {
  ele.removeEventListener(ele, event, handler);
}

/**
 * Sets the value on the object using the path. Grows the object deep until the end of the path is
 * reached.
 */
function set(obj, path, val) {
  var setOn = obj;
  var parts = path.split('.');
  var last = parts.pop();
  parts.forEach(function (part) {
    var next = setOn[part];
    if (!next) {
      next = {};
      setOn[part] = next;
    }
    setOn = next;
  });
  if ((typeof setOn === 'undefined' ? 'undefined' : _typeof(setOn)) === 'object') {
    setOn[last] = val;
  }
}

/**
 * Extracts data attributes from the passed element where they start with the prefix and returns a
 * key object. An optional shape parameter can be defined that defines the shape of the result.
 * For example:
 * shape = { test: 'some.bit', other: 'thing' }
 * <... data-test-key1="val" data-other="val2" />
 * result = { some: { bit: { key1: 'val' } }, thing: 'val2' }
 */
function data(ele) {
  var prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var shape = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var result = {};
  Object.keys(ele.dataset).filter(function (key) {
    return key.startsWith(prefix);
  }).forEach(function (key) {
    var adjusted = key.substr(prefix.length);
    adjusted = adjusted.charAt(0).toLowerCase() + adjusted.slice(1);
    var path = '';
    var best = 0;
    Object.keys(shape).forEach(function (sk) {
      var idx = adjusted.indexOf(sk);
      if (idx >= 0 && best < sk.length) {
        best = sk.length;
        var rest = adjusted.slice(sk.length);
        path = shape[sk] + (rest ? '.' + (rest.charAt(0).toLowerCase() + rest.slice(1)) : '');
      }
    });
    set(result, path || adjusted, ele.dataset[key]);
  });
  return result;
}

},{}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TYPE_IMAGE = undefined;
exports.imageRenderer = imageRenderer;
exports.default = item;

var _dom = require('./dom');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var TYPE_IMAGE = exports.TYPE_IMAGE = 'image';

/**
 * Renders a item type of image.
 */
function imageRenderer(data) {
  if (data.file) {
    var ele = (0, _dom.make)('img');
    var reader = new FileReader();
    reader.onload = function (e) {
      ele.setAttribute('src', e.target.result);
    };
    reader.readAsDataURL(data.file);
    return Object.assign({}, data, { ele: ele });
  }
  return Object.assign({}, data, { ele: (0, _dom.make)('img', { src: data.src }) });
}

/**
 * Map of renderers by type.
 */
var renderers = _defineProperty({
  NOOP: function NOOP() {
    return (0, _dom.make)('div');
  }
}, TYPE_IMAGE, imageRenderer);

/**
 * Wrapping DOM around the item DOM
 */
function wrap(data) {
  var isUploading = !!data.file;
  var root = (0, _dom.make)('div', {
    class: ['item'].concat(isUploading ? ['uploading'] : []).join(' ')
  });
  (0, _dom.append)(root, data.ele);
  (0, _dom.marker)(root, 'status');
  (0, _dom.marker)(root, 'actions');

  var _progress = void 0;
  if (isUploading) {
    _progress = (0, _dom.make)('div', { class: 'progress' });
    (0, _dom.replaceMarker)(root, 'status', (0, _dom.make)('div', { class: 'spinner' }), (0, _dom.make)('div', { class: 'icon upload' }), _progress);
  }

  return Object.assign({}, data, { ele: root, _progress: _progress });
}

/**
 * Makes the appropriate status icon and appends to the status marker. Then removes after a short
 * period.
 */
function status(ele, st, done) {
  var s = (0, _dom.make)('div', { class: 'icon ' + st });
  (0, _dom.append)(s, (0, _dom.make)('i'));
  (0, _dom.replaceMarker)(ele, 'status', s);

  setTimeout(function () {
    (0, _dom.addClass)(s, 'going');
    setTimeout(function () {
      (0, _dom.replaceMarker)(ele, 'status');
      (0, _dom.removeClass)(s, 'going');

      if (done) {
        done();
      }
    }, 2000);
  }, 2000);
}

/**
 * Remove all upload events
 */
function removeUploadEvents(data) {
  if (data.fileId) {
    data.events.off('upload.added', data.fileId);
    data.events.off('upload.started', data.fileId);
    data.events.off('upload.progress', data.fileId);
    data.events.off('upload.done', data.fileId);
    data.events.off('upload.failed', data.fileId);
  }
}

/**
 * Remove all delete events
 */
function removeDeleteEvents(data) {
  if (data.id) {
    data.events.off('delete.added', data.id);
    data.events.off('delete.started', data.id);
    data.events.off('delete.done', data.id);
    data.events.off('delete.failed', data.id);
  }
}

/**
 * Remove the item
 */
function remove(ele, data) {
  (0, _dom.addClass)(ele, 'removed');
  setTimeout(function () {
    ele.parentNode.removeChild(ele);
    data.events.trigger('item.removed', { id: data.id });
  }, 600);

  removeUploadEvents(data);
  removeDeleteEvents(data);
  data.events.off('destroy', data.id);
}

/**
 * Add deletion listeners to the events
 */
function onDelete(ele, data) {
  data.events.on('delete.added', data.id, function () {
    (0, _dom.addClass)(ele, 'removing');

    (0, _dom.replaceMarker)(ele, 'status', (0, _dom.make)('div', { class: 'spinner' }), (0, _dom.make)('div', { class: 'icon trash' }));
  });

  data.events.on('delete.done', data.id, function () {
    setTimeout(function () {
      (0, _dom.removeClass)(ele, 'removing');
      remove(ele, data);
    }, 500);
  });

  data.events.on('delete.failed', data.id, function () {
    setTimeout(function () {
      (0, _dom.removeClass)(ele, 'removing');
      status(ele, 'error');
    }, 500);
  });

  if (data.fileId) {
    data.events.off('destroy', data.fileId);
  }
  data.events.on('destroy', data.id, data._onDestroy);
}

/**
 * Makes the actions bar DOM
 */
function makeActions(ele, data) {
  if (data.id) {
    var actions = (0, _dom.make)('div', { class: 'actions' });
    var del = (0, _dom.make)('div', { class: 'action del' });
    (0, _dom.append)(actions, del);
    (0, _dom.append)(del, (0, _dom.make)('div', { class: 'trash' }));
    (0, _dom.replaceMarker)(ele, 'actions', actions);

    var onDeleteClick = function onDeleteClick() {
      return data.events.trigger('file.delete', { id: data.id });
    };
    (0, _dom.on)(del, 'click', onDeleteClick);

    data.onDestroyEvents.push(function () {
      (0, _dom.off)(del, 'click', onDeleteClick);
    });

    onDelete(ele, data);
  } else {
    (0, _dom.addClass)(ele, 'static');
    data.events.on('destroy', data._onDestroy);
  }
}

/**
 * Add upload listeners to the events
 */
function onUpload(ele, progressEle, data) {
  data.events.on('upload.progress', data.fileId, function (_ref) {
    var progress = _ref.progress;

    var val = 0 - (100 - progress);
    progressEle.style.transform = 'translateX(' + val + '%)';
  });

  data.events.on('upload.done', data.fileId, function (_ref2) {
    var id = _ref2.id;

    data.id = id;
    status(ele, 'done');
    (0, _dom.removeClass)(ele, 'uploading');
    makeActions(ele, data);

    removeUploadEvents(data);
  });

  data.events.on('upload.failed', data.fileId, function () {
    (0, _dom.addClass)(ele, 'stopped');
    status(ele, 'error', function () {
      remove(ele, data);
    });
  });

  data.events.on('destroy', data.fileId, data._onDestroy);
}

/**
 * The item module is a wrapper around an item in the container that the user can interact with.
 */
function item(data) {
  data.onDestroyEvents = [];
  var _wrapper = wrap((renderers[data.type] || renderers.NOOP)(data));

  data.onDestroyEvents.push(function () {
    _wrapper.ele.parentNode.removeChild(_wrapper.ele);
    _wrapper.ele = undefined;
  });
  data._onDestroy = function () {
    data.onDestroyEvents.forEach(function (d) {
      return d();
    });
    data.onDestroyEvents = [];
  };

  if (data.fileId) {
    onUpload(_wrapper.ele, _wrapper._progress, data);
  } else {
    makeActions(_wrapper.ele, data);
  }

  return _wrapper.ele;
}

},{"./dom":12}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parse;

var _dom = require('./dom');

var _item = require('./item');

var _item2 = _interopRequireDefault(_item);

var _container = require('./container');

var _container2 = _interopRequireDefault(_container);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parseImage(ele, events) {
  return (0, _item2.default)(Object.assign({ type: _item.TYPE_IMAGE }, (0, _dom.attrs)(ele, 'src'), { id: ele.dataset.uploadImageId, events: events }));
}

/**
 * The parse module parses the DOM element and returns a container wrapper element.
 */
function parse(ele, events, defaultOpt, opts) {
  var items = (0, _dom.children)(ele, 'img').map(function (img) {
    return parseImage(img, events);
  });
  (0, _dom.empty)(ele);
  return (0, _container2.default)(ele, items, events, defaultOpt, opts);
}

},{"./container":11,"./dom":12,"./item":13}],15:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _parse = require('./render/parse');

var _parse2 = _interopRequireDefault(_parse);

var _core2 = require('./core');

var _core3 = _interopRequireDefault(_core2);

var _http = require('./core/util/http');

var _http2 = _interopRequireDefault(_http);

var _events2 = require('./core/util/events');

var _events3 = _interopRequireDefault(_events2);

var _defaults = require('./defaults');

var _defaults2 = _interopRequireDefault(_defaults);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function up(ele) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var _events = (0, _events3.default)(['upload.added', 'upload.started', 'upload.progress', 'upload.done', 'upload.failed', 'delete.added', 'delete.started', 'delete.done', 'delete.failed']);
  var _uiEvents = (0, _events3.default)(['file.picked', 'file.delete', 'item.removed', 'destroy']);
  _events.emit(_uiEvents);

  var _opts = (0, _parse2.default)(ele, _uiEvents, _defaults2.default, opts);
  var _core = (0, _core3.default)(_http2.default, _events, _opts);

  _uiEvents.on('file.picked', function (ev) {
    return _core.upload(ev);
  });
  _uiEvents.on('file.delete', function (ev) {
    return _core.del(ev.id);
  });

  return {
    on: function on(event, handler) {
      if (_events) {
        event.split(' ').forEach(function (ev) {
          _events.on(ev, handler);
        });
      }
      return this;
    },
    destroy: function destroy() {
      if (_uiEvents) {
        _uiEvents.trigger('destroy');

        _events.clear();
        _uiEvents.clear();
        _core.destroy();

        _events = undefined;
        _uiEvents = undefined;
        _opts = undefined;
        _core = undefined;
      }
    }
  };
}

/**
 * Allows plain vanilla JavaScript access to the UploadJs Widget.
 *
 * Usage:
 * var ele = document.getElementById("myid");
 * var options = { ... }
 * new UploadJs(ele, options)
 *
 * @constructor
 */
window.UploadJs = function () {
  function UploadJs(ele) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, UploadJs);

    this._up = up(ele, opts);
  }

  _createClass(UploadJs, [{
    key: 'on',
    value: function on(event, handler) {
      this._up.on(event, handler);
      return this;
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this._up.destroy();
      return this;
    }
  }]);

  return UploadJs;
}();

},{"./core":4,"./core/util/events":5,"./core/util/http":6,"./defaults":10,"./render/parse":14}]},{},[15])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvY29yZS9hY3Rpb25zL2RlbGV0ZS5qcyIsInNyYy9qcy9jb3JlL2FjdGlvbnMvdHlwZXMuanMiLCJzcmMvanMvY29yZS9hY3Rpb25zL3VwbG9hZC5qcyIsInNyYy9qcy9jb3JlL2luZGV4LmpzIiwic3JjL2pzL2NvcmUvdXRpbC9ldmVudHMuanMiLCJzcmMvanMvY29yZS91dGlsL2h0dHAuanMiLCJzcmMvanMvY29yZS91dGlsL21lcmdlLmpzIiwic3JjL2pzL2NvcmUvdXRpbC9vcHRpb25zLmpzIiwic3JjL2pzL2NvcmUvdXRpbC9xdWV1ZS5qcyIsInNyYy9qcy9kZWZhdWx0cy5qcyIsInNyYy9qcy9yZW5kZXIvY29udGFpbmVyLmpzIiwic3JjL2pzL3JlbmRlci9kb20uanMiLCJzcmMvanMvcmVuZGVyL2l0ZW0uanMiLCJzcmMvanMvcmVuZGVyL3BhcnNlLmpzIiwic3JjL2pzL3VwbG9hZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O2tCQ0d3QixVOzs7O0FBSHhCOzs7QUFHZSxTQUFTLFVBQVQsQ0FBb0IsSUFBcEIsRUFBMEIsTUFBMUIsRUFBa0MsSUFBbEMsRUFBd0MsS0FBeEMsRUFBK0M7QUFDNUQ7OztBQUdBLFdBQVMsYUFBVCxDQUF1QixFQUF2QixFQUEyQixJQUEzQixFQUFpQztBQUMvQixXQUFPLE9BQVAsQ0FBZSxnQkFBZixFQUFpQyxFQUFFLE1BQUYsRUFBakM7QUFDQSxTQUFLLEdBQUwsQ0FBUyxZQUFULEVBQXVCLGNBQXZCLEVBQXVDLHlCQUF2QyxFQUFrRSxnQkFBbEUsRUFDRSxVQUFDLEdBQUQsRUFBTSxLQUFOLEVBQWEsZ0JBQWIsRUFBK0IsT0FBL0IsRUFBMkM7QUFDekMsVUFBTSxTQUFTLE9BQU8sTUFBUCxDQUFjLEVBQWQsRUFBa0IsZ0JBQWxCLHNCQUNaLEtBRFksRUFDSixFQURJLEVBQWY7O0FBSUEsV0FBSyxHQUFMLEVB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QkFLSyxLQUxMLEVBS1ksT0FMWixFQUtxQjtBQUNqQixXQUFLLEdBQUwsQ0FBUyxFQUFULENBQVksS0FBWixFQUFtQixPQUFuQjtBQUNBLGFBQU8sSUFBUDtBQUNEO0FBUkg7QUFBQTtBQUFBLDhCQVVZO0FBQ1IsV0FBSyxHQUFMLENBQVMsT0FBVDtBQUNBLGFBQU8sSUFBUDtBQUNEO0FBYkg7O0FBQUE7QUFBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qKlxuICogVGhlIGRlbGV0ZSBtb2R1bGUgaGFuZGxlcyB0aGUgZGVsZXRpb24gb2YgYSBmaWxlIGJ5IGlkXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZpbGVEZWxldGUoaHR0cCwgZXZlbnRzLCBvcHRzLCBxdWV1ZSkge1xuICAvKipcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGZ1bmN0aW9uIF9wZWZvcm1EZWxldGUoaWQsIGRvbmUpIHtcbiAgICBldmVudHMudHJpZ2dlcignZGVsZXRlLnN0YXJ0ZWQnLCB7IGlkIH0pO1xuICAgIG9wdHMuZ2V0KCdkZWxldGUudXJsJywgJ2RlbGV0ZS5wYXJhbScsICdkZWxldGUuYWRkaXRpb25hbFBhcmFtcycsICdkZWxldGUuaGVhZGVycycsXG4gICAgICAodXJsLCBwYXJhbSwgYWRkaXRpb25hbFBhcmFtcywgaGVhZGVycykgPT4ge1xuICAgICAgICBjb25zdCBwYXJhbXMgPSBPYmplY3QuYXNzaWduKHt9LCBhZGRpdGlvbmFsUGFyYW1zLCB7XG4gICAgICAgICAgW3BhcmFtXTogaWQsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGh0dHAodXJsLCBwYXJhbXMsIGhlYWRlcnMpXG4gICAgICAgICAgLmRvbmUoKHsgc3VjY2VzcyB9KSA9PiB7XG4gICAgICAgICAgICBpZiAoc3VjY2VzcyA9PT0gdHJ1ZSB8fCBzdWNjZXNzID09PSAndHJ1ZScpIHtcbiAgICAgICAgICAgICAgZXZlbnRzLnRyaWdnZXIoJ2RlbGV0ZS5kb25lJywgeyBpZCB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGV2ZW50cy50cmlnZ2VyKCdkZWxldGUuZmFpbGVkJywgeyBpZCB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5mYWlsKCgpID0+IHtcbiAgICAgICAgICAgIGV2ZW50cy50cmlnZ2VyKCdkZWxldGUuZmFpbGVkJywgeyBpZCB9KTtcbiAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIERlbGV0ZSBvbmUgb3IgbW9yZSBmaWxlcy5cbiAgICovXG4gIGZ1bmN0aW9uIGRlbCguLi5pZHMpIHtcbiAgICBpZHMuZm9yRWFjaCgoaWQpID0+IHtcbiAgICAgIGV2ZW50cy50cmlnZ2VyKCdkZWxldGUuYWRkZWQnLCB7IGlkIH0pO1xuICAgICAgcXVldWUub2ZmZXIoKGRvbmUpID0+IF9wZWZvcm1EZWxldGUoaWQsIGRvbmUpKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZGVsLFxuICB9O1xufVxuIiwiLyoqXG4gKiBUeXBlcyBtb2R1bGUuIEdldHMgYW5kIHBhcnNlcyBwcmUtZGVmaW5lZCB0eXBlcyBhbmQgYWxsb3dlZCB0eXBlcywgZXhwb3Nlc1xuICogYW4gaXNBbGxvd2VkIGZ1bmN0aW9uIHRvIHRlc3Qgd2hldGhlciBhIHR5cGUgaXMgYWxsb3dlZCBvciBub3QuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHR5cGVzKG9wdHMpIHtcbiAgbGV0IGFsbG93ZWQ7XG4gIGxldCB3YWl0aW5nID0gW107XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBvZiBmYWxzZSBpZiB0aGUgcGFzc2VkIHR5cGUgaXMgYW4gYWxsb3dlZCB0eXBlLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZnVuY3Rpb24gX2NoZWNrSXNBbGxvd2VkKHR5cGUpIHtcbiAgICByZXR1cm4gYWxsb3dlZC5pbmRleE9mKHR5cGUudG9Mb3dlckNhc2UoKSkgPj0gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxscyB0aGUgY2FsbGJhY2sgd2l0aCB0cnVlIG9yIGZhbHNlIHdoZXRoZXIgb3Igbm90IHRoZSB0eXBlIGlzIGFsbG93ZWQuXG4gICAqL1xuICBmdW5jdGlvbiBpc0FsbG93ZWQodHlwZSwgY2FsbGJhY2spIHtcbiAgICBpZiAod2FpdGluZykge1xuICAgICAgd2FpdGluZy5wdXNoKFt0eXBlLCBjYWxsYmFja10pO1xuICAgICAgaWYgKHdhaXRpbmcubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIG9wdHMuZ2V0KCdhbGxvd2VkX3R5cGVzJywgJ3R5cGVzJywgKG9wdEFsbG93ZWRUeXBlcyA9IFtdLCBvcHRUeXBlcyA9IHt9KSA9PiB7XG4gICAgICAgICAgYWxsb3dlZCA9IFtdLmNvbmNhdC5hcHBseShbXSwgb3B0QWxsb3dlZFR5cGVzLm1hcCh0ID0+IG9wdFR5cGVzW3RdIHx8IHQpKVxuICAgICAgICAgICAgLm1hcCh0ID0+IHQudG9Mb3dlckNhc2UoKSk7XG4gICAgICAgICAgd2FpdGluZy5mb3JFYWNoKChbd2FpdGluZ1R5cGUsIHdhaXRpbmdDYWxsYmFja10pID0+XG4gICAgICAgICAgICB3YWl0aW5nQ2FsbGJhY2soX2NoZWNrSXNBbGxvd2VkKHdhaXRpbmdUeXBlKSkpO1xuICAgICAgICAgIHdhaXRpbmcgPSB1bmRlZmluZWQ7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjYWxsYmFjayhfY2hlY2tJc0FsbG93ZWQodHlwZSkpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgaXNBbGxvd2VkLFxuICB9O1xufVxuIiwiaW1wb3J0IHR5cGVzIGZyb20gJy4vdHlwZXMnO1xuXG4vKipcbiAqIFRoZSB1cGxvYWQgbW9kdWxlIGhhbmRsZXMgdGhlIGFjdHVhbCBmaWxlIHVwbG9hZCBtZWNoYW5pc21cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZmlsZVVwbG9hZChodHRwLCBldmVudHMsIG9wdHMsIHF1ZXVlKSB7XG4gIGNvbnN0IF90eXBlcyA9IHR5cGVzKG9wdHMpO1xuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZnVuY3Rpb24gX3BlZm9ybVVwbG9hZChmaWxlLCBpZCwgZG9uZSkge1xuICAgIGV2ZW50cy50cmlnZ2VyKCd1cGxvYWQuc3RhcnRlZCcsIHsgZmlsZSwgaWQgfSk7XG4gICAgb3B0cy5nZXQoJ3VwbG9hZC51cmwnLCAndXBsb2FkLnBhcmFtJywgJ3VwbG9hZC5hZGRpdGlvbmFsUGFyYW1zJywgJ3VwbG9hZC5oZWFkZXJzJyxcbiAgICAgICh1cmwsIHBhcmFtLCBhZGRpdGlvbmFsUGFyYW1zLCBoZWFkZXJzKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IE9iamVjdC5hc3NpZ24oe30sIGFkZGl0aW9uYWxQYXJhbXMsIHtcbiAgICAgICAgICBbcGFyYW1dOiBmaWxlLFxuICAgICAgICB9KTtcblxuICAgICAgICBodHRwKHVybCwgcGFyYW1zLCBoZWFkZXJzKVxuICAgICAgICAgIC5wcm9ncmVzcyhwcm9ncmVzcyA9PiBldmVudHMudHJpZ2dlcigndXBsb2FkLnByb2dyZXNzJywgeyBmaWxlLCBpZCwgcHJvZ3Jlc3MgfSkpXG4gICAgICAgICAgLmRvbmUoKHsgc3VjY2VzcywgdXBsb2FkSW1hZ2VJZCB9KSA9PiB7XG4gICAgICAgICAgICBpZiAoc3VjY2VzcyA9PT0gdHJ1ZSB8fCBzdWNjZXNzID09PSAndHJ1ZScpIHtcbiAgICAgICAgICAgICAgZXZlbnRzLnRyaWdnZXIoJ3VwbG9hZC5kb25lJywgeyBmaWxlLCBpZCwgdXBsb2FkSW1hZ2VJZCB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGV2ZW50cy50cmlnZ2VyKCd1cGxvYWQuZmFpbGVkJywgeyBmaWxlLCBpZCB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5mYWlsKCgpID0+IHtcbiAgICAgICAgICAgIGV2ZW50cy50cmlnZ2VyKCd1cGxvYWQuZmFpbGVkJywgeyBmaWxlLCBpZCB9KTtcbiAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwbG9hZCBvbmUgb3IgbW9yZSBmaWxlcy5cbiAgICovXG4gIGZ1bmN0aW9uIHVwbG9hZCguLi5maWxlcykge1xuICAgIGZpbGVzLmZvckVhY2goKHsgZmlsZSwgaWQgfSkgPT4ge1xuICAgICAgX3R5cGVzLmlzQWxsb3dlZChmaWxlLnR5cGUsIChhbGxvd2VkKSA9PiB7XG4gICAgICAgIGlmIChhbGxvd2VkKSB7XG4gICAgICAgICAgZXZlbnRzLnRyaWdnZXIoJ3VwbG9hZC5hZGRlZCcsIHsgZmlsZSwgaWQgfSk7XG4gICAgICAgICAgcXVldWUub2ZmZXIoKGRvbmUpID0+IF9wZWZvcm1VcGxvYWQoZmlsZSwgaWQsIGRvbmUpKTtcbiAgICAgICAgfSBlbHNlIHtcbmNvbnNvbGUubG9nKCdyZWplY3QnKTtcbiAgICAgICAgICBldmVudHMudHJpZ2dlcigndXBsb2FkLmZhaWxlZCcsIHsgZmlsZSwgaWQsIHJlamVjdGVkOiAndHlwZScgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICB1cGxvYWQsXG4gIH07XG59XG4iLCJpbXBvcnQgcXVldWUgZnJvbSAnLi91dGlsL3F1ZXVlJztcbmltcG9ydCBmaWxlVXBsb2FkIGZyb20gJy4vYWN0aW9ucy91cGxvYWQnO1xuaW1wb3J0IGZpbGVEZWxldGUgZnJvbSAnLi9hY3Rpb25zL2RlbGV0ZSc7XG5cbi8qKlxuICogVGhlIGNvcmUgaXMgdGhlIGVuZ2luZSB0aGF0IGhhbmRsZXMgdGhlIHVwbG9hZGluZyBhbmQgZGVsZXRpbmcgb2YgZmlsZXMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNvcmUoaHR0cCwgZXZlbnRzLCBvcHRzKSB7XG4gIGNvbnN0IF9xdWV1ZSA9IHF1ZXVlKChpdGVtLCBkb25lKSA9PiB7XG4gICAgaXRlbShkb25lKTtcbiAgfSwgeyBkZWxheTogMTAwIH0pO1xuXG4gIGNvbnN0IHVwbG9hZCA9IGZpbGVVcGxvYWQoaHR0cCwgZXZlbnRzLCBvcHRzLCBfcXVldWUpO1xuICBjb25zdCBkZWwgPSBmaWxlRGVsZXRlKGh0dHAsIGV2ZW50cywgb3B0cywgX3F1ZXVlKTtcblxuICByZXR1cm4ge1xuICAgIHVwbG9hZDogdXBsb2FkLnVwbG9hZCxcbiAgICBkZWw6IGRlbC5kZWwsXG4gICAgZGVzdHJveSgpIHtcbiAgICAgIF9xdWV1ZS5jbGVhcigpO1xuICAgIH0sXG4gIH07XG59XG4iLCJjb25zdCBBTEwgPSAnJGFsbCc7XG5cbi8qKlxuICogVGhlIGV2ZW50cyBtb2R1bGUgaGFuZGxlcyByZWdpc3RlcmluZyBvZiBldmVudCBsaXN0ZW5lcnMgYW5kIHRyaWdnZXJpbmcgb2YgZXZlbnRzLlxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBldmVudHMoa25vd24gPSBbXSkge1xuICBsZXQgX2J5S2V5ID0ge307XG4gIGxldCBfZW1pdCA9IFtdO1xuICBsZXQgX3BhcmVudHMgPSBbXTtcblxuICBmdW5jdGlvbiBpc0RlZmluZWQodmFsKSB7XG4gICAgcmV0dXJuIHZhbCAmJiB0eXBlb2YgdmFsICE9PSAndW5kZWZpbmVkJyAmJiAhKHR5cGVvZiB2YWwgPT09ICdvYmplY3QnICYmICF2YWwpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGV2ZW50IGxpc3RlbmVyXG4gICAqL1xuICBmdW5jdGlvbiBvbihrZXksIGlkLCBsaXN0ZW5lcikge1xuICAgIGNvbnN0IGF2YWlsYWJsZSA9IGtub3duLmNvbmNhdChfcGFyZW50cy5yZWR1Y2UoKHZhbCwgbmV4dCkgPT4gdmFsLmNvbmNhdChuZXh0KSwgW10pKTtcbiAgICBpZiAoYXZhaWxhYmxlLmxlbmd0aCAmJiBhdmFpbGFibGUuaW5kZXhPZihrZXkpIDwgMCkge1xuICAgICAgY29uc29sZS53YXJuKCdBdHRlbXBpbmcgdG8gbGlzdGVuIHRvIGFuIHVua25vd24gZXZlbnQuICcgK1xuICAgICAgICBgJyR7a2V5fScgaXMgbm90IG9uZSBvZiAnJHthdmFpbGFibGUuam9pbignLCAnKX0nYCk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgaWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGxpc3RlbmVyID0gaWQ7XG4gICAgICBpZCA9IEFMTDtcbiAgICB9XG4gICAgY29uc3QgYWN0dWFsSWQgPSBpc0RlZmluZWQoaWQpID8gKGlkKS50b1N0cmluZygpIDogQUxMO1xuICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGlmICghX2J5S2V5W2tleV0pIHtcbiAgICAgICAgX2J5S2V5W2tleV0gPSB7XG4gICAgICAgICAgW0FMTF06IFtdLFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKCFfYnlLZXlba2V5XVthY3R1YWxJZF0pIHtcbiAgICAgICAgX2J5S2V5W2tleV1bYWN0dWFsSWRdID0gW107XG4gICAgICB9XG4gICAgICBfYnlLZXlba2V5XVthY3R1YWxJZF0ucHVzaChsaXN0ZW5lcik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFVucmVnaXN0ZXIgZXZlbnQgbGlzdGVuZXJcbiAgICovXG4gIGZ1bmN0aW9uIG9mZihrZXksIGlkLCBoYW5kbGVyKSB7XG4gICAgaWYgKF9ieUtleVtrZXldKSB7XG4gICAgICBpZiAodHlwZW9mIGlkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGhhbmRsZXIgPSBpZDtcbiAgICAgICAgaWQgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGFjdHVhbElkID0gaXNEZWZpbmVkKGlkKSA/IChpZCkudG9TdHJpbmcoKSA6IGZhbHNlO1xuICAgICAgaWYgKGFjdHVhbElkKSB7XG4gICAgICAgIGlmIChoYW5kbGVyKSB7XG4gICAgICAgICAgY29uc3QgaGFuZGxlcnMgPSBfYnlLZXlba2V5XVthY3R1YWxJZF07XG4gICAgICAgICAgaWYgKGhhbmRsZXJzKSB7XG4gICAgICAgICAgICBjb25zdCBpZHggPSBoYW5kbGVycy5pbmRleE9mKGhhbmRsZXIpO1xuICAgICAgICAgICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICAgICAgICAgIGhhbmRsZXJzLnNwbGljZShpZHgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWxldGUgX2J5S2V5W2tleV1bYWN0dWFsSWRdO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGhhbmRsZXIpIHtcbiAgICAgICAgT2JqZWN0LmtleXMoX2J5S2V5W2tleV0pLmZvckVhY2goKGkpID0+IHtcbiAgICAgICAgICBjb25zdCBoYW5kbGVycyA9IF9ieUtleVtrZXldW2ldO1xuICAgICAgICAgIGlmIChoYW5kbGVycykge1xuICAgICAgICAgICAgY29uc3QgaWR4ID0gaGFuZGxlcnMuaW5kZXhPZihoYW5kbGVyKTtcbiAgICAgICAgICAgIGlmIChpZHggPj0gMCkge1xuICAgICAgICAgICAgICBoYW5kbGVycy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgX2J5S2V5W2tleV0gPSB7XG4gICAgICAgICAgW0FMTF06IFtdLFxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VycyBldmVudCB3aXRoIGtleSBhbmQgcGFyYW1ldGVyc1xuICAgKi9cbiAgZnVuY3Rpb24gdHJpZ2dlcihrZXksIGV2ZW50KSB7XG4gICAgaWYgKF9ieUtleVtrZXldKSB7XG4gICAgICBjb25zdCBpZCA9IGV2ZW50ICYmIGlzRGVmaW5lZChldmVudC5pZCkgPyAoZXZlbnQuaWQpLnRvU3RyaW5nKCkgOiBmYWxzZTtcbiAgICAgIGlmIChpZCkge1xuICAgICAgICAoX2J5S2V5W2tleV1baWRdIHx8IFtdKS5mb3JFYWNoKGxpc3RlbmVyID0+IGxpc3RlbmVyKE9iamVjdC5hc3NpZ24oeyB0eXBlOiBrZXkgfSwgZXZlbnQpKSk7XG4gICAgICAgIF9ieUtleVtrZXldW0FMTF0uZm9yRWFjaChsaXN0ZW5lciA9PiBsaXN0ZW5lcihPYmplY3QuYXNzaWduKHsgdHlwZToga2V5IH0sIGV2ZW50KSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgT2JqZWN0LmtleXMoX2J5S2V5W2tleV0pLmZvckVhY2goKGkpID0+IHtcbiAgICAgICAgICBfYnlLZXlba2V5XVtpXS5mb3JFYWNoKGxpc3RlbmVyID0+IGxpc3RlbmVyKE9iamVjdC5hc3NpZ24oeyB0eXBlOiBrZXkgfSwgZXZlbnQpKSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICBfZW1pdC5mb3JFYWNoKGV2ID0+IGV2LnRyaWdnZXIoa2V5LCBldmVudCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEVtaXRzIGV2ZW50cyB0cmlnZ2VyIGluIHRoaXMgZXZlbnRzIGluc3RhbmNlIHRvIHRoZSBwYXNzZWQgZXZlbnRzIGluc3RhbmNlLlxuICAgKi9cbiAgZnVuY3Rpb24gZW1pdChldikge1xuICAgIGlmIChldiAmJiBldi50cmlnZ2VyKSB7XG4gICAgICBfZW1pdC5wdXNoKGV2KTtcbiAgICAgIGV2Ll9wYXJlbnQoa25vd24pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGFsbCBsaXN0ZW5lcnMgZnJvbSB0aGUgZXZlbnRzXG4gICAqL1xuICBmdW5jdGlvbiBjbGVhcigpIHtcbiAgICBfYnlLZXkgPSB7fTtcbiAgICBfZW1pdCA9IFtdO1xuICAgIF9wYXJlbnRzID0gW107XG4gIH1cblxuICByZXR1cm4ge1xuICAgIG9uLFxuICAgIG9mZixcbiAgICB0cmlnZ2VyLFxuICAgIGVtaXQsXG4gICAgX3BhcmVudChldikge1xuICAgICAgX3BhcmVudHMucHVzaChldik7XG4gICAgfSxcbiAgICBjbGVhcixcbiAgfTtcbn1cbiIsImNvbnN0IE5PT1AgPSAoKSA9PiB7fTtcblxuLyoqXG4gKiBTaW1wbGUgQUpBWCBIdHRwIGNhbGxlciB0aGF0IGV4cGVjdHMgSlNPTiByZXNwb25zZS4gSGFuZGxlcyBzdGFuZGFyZCBwYXJhbWV0ZXIgcG9zdGluZyBhbmRcbiAqIGZpbGUgdXBsb2FkaW5nLlxuICpcbiAqIFVzYWdlIChQT1NUIHBhcmFtZXRlcnMpOlxuICogbGV0IHBhcmFtcyA9IHtcbiAqICAgICBrZXk6IFwidmFsdWVcIlxuICogfVxuICogbGV0IGggPSBodHRwKFwiL3Bvc3RcIiwgcGFyYW1zKS5kb25lKGRhdGEgPT4ge1xuICogICAgIC8vIGRvIHNvbWV0aGluZyB3aXRoIGRhdGFcbiAqIH0pLmZhaWwoKCkgPT4ge1xuICogICAgIC8vIGRvIHNvbWV0aGluZyB3aGVuIGZhaWxlZFxuICogfSlcbiAqXG4gKiBVc2FnZSAoZmlsZSB1cGxhb2QpOlxuICogbGV0IGZpbGUgPSAuLi5cbiAqIGxldCBwYXJhbXMgPSB7XG4gKiAgICAgZmlsZTE6IGZpbGVcbiAqIH1cbiAqIGxldCBoID0gaHR0cChcIi91cGxvYWRcIiwgcGFyYW1zKS5wcm9ncmVzcygocCA9PiB7XG4gKiAgICAgLy8gdXBsb2FkIHByb2dyZXNzIGJhciwgcCA9IHBlcmNlbnRhZ2UgZG9uZVxuICogfSkuZG9uZShkYXRhID0+IHtcbiAqICAgICAvLyBkbyBzb21ldGhpbmcgd2l0aCBkYXRhXG4gKiB9KS5mYWlsKCgpID0+IHtcbiAqICAgICAvLyBkbyBzb21ldGhpbmcgd2hlbiBmYWlsZWRcbiAqIH0pXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGh0dHAodXJsLCBwYXJhbXMgPSB7fSwgaGVhZGVycyA9IHt9KSB7XG4gIGxldCBfcHJvZ3Jlc3MgPSBOT09QO1xuICBsZXQgX2RvbmUgPSBOT09QO1xuICBsZXQgX2ZhaWwgPSBOT09QO1xuICBjb25zdCBfaW5zdGFuY2UgPSB7fTtcblxuICAvKipcbiAgICogU2V0cyBhIHByb2dyZXNzIGhhbmRsZXIgZm9yIGh0dHAgcmVxdWVzdC4gSXMgY2FsbGVkIG11bHRpcGxlIHRpbWVzLCBwZXJpb2RpY2FsbHkgd2l0aCBhXG4gICAqIHByb2dyZXNzIHZhbHVlIGJldHdlZW4gMCBhbmQgMTAwXG4gICAqL1xuICBmdW5jdGlvbiBwcm9ncmVzcyhoYW5kbGVyKSB7XG4gICAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBfcHJvZ3Jlc3MgPSBoYW5kbGVyO1xuICAgIH1cbiAgICByZXR1cm4gX2luc3RhbmNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgYSBkb25lIGhhbmRsZXIgZm9yIHdoZW4gdGhlIGh0dHAgcmVxdWVzdCBpcyBjb21wbGV0ZS4gQ2FsbGVkIHdoZW4gcmVzcG9uc2UgcmV0dXJuc1xuICAgKiB3aXRoIHN1Y2Nlc3NmdWwgc3RhdHVzIGNvZGUgKDJ4eCkuIFBhc3NlZCB0aGUgcGFyc2VkIEpTT04gb2JqZWN0IGZyb20gdGhlIHJlc3BvbnNlLlxuICAgKi9cbiAgZnVuY3Rpb24gZG9uZShoYW5kbGVyKSB7XG4gICAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBfZG9uZSA9IGhhbmRsZXI7XG4gICAgfVxuICAgIHJldHVybiBfaW5zdGFuY2U7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBhIGZhaWx1cmUgaGFuZGxlciBmb3Igd2hlbiB0aGUgcmVxdWVzdCBmYWlscyB3aXRoIGEgbm9uIHN1Y2Nlc3MgaHR0cCBzdGF0dXMgY29kZSAoMnh4KS5cbiAgICovXG4gIGZ1bmN0aW9uIGZhaWwoaGFuZGxlcikge1xuICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgX2ZhaWwgPSBoYW5kbGVyO1xuICAgIH1cbiAgICByZXR1cm4gX2luc3RhbmNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBmdW5jdGlvbiBfcG9zdCgpIHtcbiAgICBsZXQgdXBsb2FkaW5nID0gZmFsc2U7XG4gICAgY29uc3QgZGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuICAgIGNvbnN0IGZvcm0gPSBbXTtcbiAgICBPYmplY3Qua2V5cyhwYXJhbXMpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgY29uc3QgdmFsID0gcGFyYW1zW2tleV07XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWwpKSB7XG4gICAgICAgIHZhbC5mb3JFYWNoKHYgPT4ge1xuICAgICAgICAgIGlmICh2LnR5cGUgJiYgdi5uYW1lKSB7XG4gICAgICAgICAgICB1cGxvYWRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgZGF0YS5hcHBlbmQoa2V5LCB2LCB2Lm5hbWUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkYXRhLmFwcGVuZChrZXksIHYpO1xuICAgICAgICAgICAgZm9ybS5wdXNoKFtrZXksIHZdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHZhbC50eXBlICYmIHZhbC5uYW1lKSB7XG4gICAgICAgICAgdXBsb2FkaW5nID0gdHJ1ZTtcbiAgICAgICAgICBkYXRhLmFwcGVuZChrZXksIHZhbCwgdmFsLm5hbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRhdGEuYXBwZW5kKGtleSwgdmFsKTtcbiAgICAgICAgICBmb3JtLnB1c2goW2tleSwgdmFsXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnN0IHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9ICgpID0+IHtcbiAgICAgIGlmIChyZXF1ZXN0LnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgaWYgKHJlcXVlc3Quc3RhdHVzID49IDIwMCAmJiByZXF1ZXN0LnN0YXR1cyA8IDMwMCkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBfZG9uZShKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2UpKTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBfZG9uZSh7fSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIF9mYWlsKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVxdWVzdC51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBlID0+IHtcbiAgICAgIF9wcm9ncmVzcyhNYXRoLmNlaWwoKGUubG9hZGVkIC8gZS50b3RhbCkgKiAxMDApKTtcbiAgICB9LCBmYWxzZSk7XG5cbiAgICByZXF1ZXN0Lm9wZW4oJ1BPU1QnLCB1cmwsIHRydWUpO1xuICAgIGlmIChoZWFkZXJzKSB7XG4gICAgICBPYmplY3Qua2V5cyhoZWFkZXJzKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKGtleSwgaGVhZGVyc1trZXldKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoIXVwbG9hZGluZykge1xuICAgICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LXR5cGUnLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyk7XG4gICAgICByZXF1ZXN0LnNlbmQoZm9ybVxuICAgICAgICAubWFwKChba2V5LCB2YWxdKSA9PiBgJHtlbmNvZGVVUklDb21wb25lbnQoa2V5KX09JHtlbmNvZGVVUklDb21wb25lbnQodmFsKX1gKVxuICAgICAgICAuam9pbignJicpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVxdWVzdC5zZW5kKGRhdGEpO1xuICAgIH1cbiAgfVxuXG4gIF9pbnN0YW5jZS5wcm9ncmVzcyA9IHByb2dyZXNzO1xuICBfaW5zdGFuY2UuZG9uZSA9IGRvbmU7XG4gIF9pbnN0YW5jZS5mYWlsID0gZmFpbDtcbiAgX3Bvc3QoKTtcbiAgcmV0dXJuIF9pbnN0YW5jZTtcbn1cbiIsImZ1bmN0aW9uIGlzT2JqZWN0KGl0ZW0pIHtcbiAgcmV0dXJuIChpdGVtICYmIHR5cGVvZiBpdGVtID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShpdGVtKSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG1lcmdlKHRhcmdldCwgb2Jqcykge1xuICBpZiAoIUFycmF5LmlzQXJyYXkob2JqcykpIHtcbiAgICBvYmpzID0gW29ianNdO1xuICB9XG4gIGlmICghb2Jqcy5sZW5ndGgpIHJldHVybiB0YXJnZXQ7XG4gIGNvbnN0IG5leHQgPSBvYmpzLnNoaWZ0KCk7XG5cbiAgaWYgKGlzT2JqZWN0KHRhcmdldCkgJiYgaXNPYmplY3QobmV4dCkpIHtcbiAgICBPYmplY3Qua2V5cyhuZXh0KVxuICAgICAgLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICBpZiAoaXNPYmplY3QobmV4dFtrZXldKSkge1xuICAgICAgICAgIGlmICghdGFyZ2V0W2tleV0pIHtcbiAgICAgICAgICAgIHRhcmdldFtrZXldID0ge307XG4gICAgICAgICAgfVxuICAgICAgICAgIG1lcmdlKHRhcmdldFtrZXldLCBuZXh0W2tleV0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIE9iamVjdC5hc3NpZ24odGFyZ2V0LCB7XG4gICAgICAgICAgICBba2V5XTogbmV4dFtrZXldLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBtZXJnZSh0YXJnZXQsIG9ianMpO1xufVxuIiwiLyoqXG4gKiBUaGUgT3B0aW9ucyBtb2R1bGUgcHJvdmlkZXMgYSB3cmFwIGFyb3VuZCBhbiBvcHRpb24gb2JqZWN0IHdoZXJlIG9wdGlvbnMgY2FuIGJlIGRlZmluZWQgYXNcbiAqIGZ1bmN0aW9ucyB3aGljaCB0YWtlIGFuIG9wdGlvbmFsIGRvbmUgY2FsbGJhY2sgdG8gYWxsb3cgbGF6eSBhc3luY2hyb25vdXMgbG9hZGluZyBvZiBvcHRpb25cbiAqIHZhbHVlcy5cbiAqXG4gKiBVc2FnZTpcbiAqIGxldCBvcHRzID0ge1xuICogICAga2V5MTogXCJ2YWwxXCIsXG4gKiAgICBrZXkyOiBmdW5jdGlvbigpIHtcbiAqICAgICAgIHJldHVybiBcInZhbDJcIlxuICogICAgfSxcbiAqICAgIGtleTM6IGZ1bmN0aW9uKGRvbmUpIHtcbiAqICAgICAgIC8vIHNvbWUgYXN5bmMgYWN0aW9uIHRoYXQgdGFrZXMgMXMsIHNpbXVsYXRlZCBoZXJlIHdpdGggc2V0VGltZW91dFxuICogICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gKiAgICAgICAgICAgZG9uZShcInZhbDNcIilcbiAqICAgICAgIH0sIDEwMDApXG4gKiAgICB9XG4gKiB9XG4gKlxuICogbGV0IG8gPSBvcHRpb25zKG9wdHMpXG4gKiBvLmdldChcImtleTFcIikgPT09IFwidmFsMVwiXG4gKiBvLmdldChcImtleTFcIiwgdiA9PiB7XG4gKiAgICAgdiA9PT0gXCJ2YWwxXCJcbiAqIH0pXG4gKiBvLmdldChcImtleTJcIikgPT09IFwidmFsMlwiXG4gKiBvLmdldChcImtleTJcIiwgdiA9PiB7XG4gKiAgICAgdiA9PT0gXCJ2YWwyXCJcbiAqIH0pXG4gKiBvLmdldChcImtleTNcIikgPT09IHVuZGVmaW5lZFxuICogby5nZXQoXCJrZXkzXCIsIHYgPT4ge1xuICogICAgIHYgPT09IFwidmFsM1wiXG4gKiB9KVxuICogby5nZXQoXCJrZXkxXCIsIFwia2V5MlwiKSA9PT0gW1widmFsMVwiLCBcInZhbDJdXG4gKiBvLmdldChcImtleTFcIiwgXCJrZXkyXCIsICh2MSwgdjIpID0+IHtcbiAqICAgICB2MSA9PT0gXCJ2YWwxXCJcbiAqICAgICB2MiA9PT0gXCJ2YWwyXCJcbiAqIH0pXG4gKiBvLmdldChcImtleTFcIiwgXCJrZXkzXCIpID09PSBbXCJ2YWwxXCIsIHVuZGVmaW5lZF1cbiAqIG8uZ2V0KFwia2V5MVwiLCBcImtleTNcIiwgKHYxLCB2MikgPT4ge1xuICogICAgIHYxID09PSBcInZhbDFcIlxuICogICAgIHYyID09PSBcInZhbDNcIlxuICogfSlcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gb3B0aW9ucyhvcHRzKSB7XG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZnVuY3Rpb24gX21hcEtleXNUb1ZhbHVlcyhrZXlzKSB7XG4gICAgcmV0dXJuIGtleXMubWFwKChrZXkpID0+IHtcbiAgICAgIGxldCB2YWw7XG4gICAgICBsZXQgb2JqID0gb3B0cztcbiAgICAgIGtleS5zcGxpdCgnLicpLmZvckVhY2goKHBhcnQpID0+IHtcbiAgICAgICAgdmFsID0gb2JqW3BhcnRdO1xuICAgICAgICBvYmogPSB2YWwgfHwge307XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB2YWw7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBvcHRpb24gdmFsdWVzXG4gICAqL1xuICBmdW5jdGlvbiBnZXQoLi4uYXJncykge1xuICAgIGNvbnN0IGtleXMgPSBbXTtcbiAgICBsZXQgY2FsbGJhY2sgPSB1bmRlZmluZWQ7XG4gICAgYXJncy5mb3JFYWNoKGEgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBhID09PSAnc3RyaW5nJykge1xuICAgICAgICBrZXlzLnB1c2goYSk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBhID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNhbGxiYWNrID0gYTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGxldCB2YWx1ZXMgPSBfbWFwS2V5c1RvVmFsdWVzKGtleXMpO1xuICAgIGlmICghY2FsbGJhY2spIHtcbiAgICAgIHZhbHVlcyA9IHZhbHVlcy5tYXAoKHYpID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiB2ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgaWYgKHYubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdigpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2O1xuICAgICAgfSk7XG4gICAgICBpZiAodmFsdWVzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlcztcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZXNbMF07XG4gICAgfVxuXG4gICAgbGV0IHRvUmVzb2x2ZSA9IHZhbHVlcy5maWx0ZXIodiA9PiB0eXBlb2YgdiA9PT0gJ2Z1bmN0aW9uJykubGVuZ3RoO1xuXG4gICAgaWYgKHRvUmVzb2x2ZSA9PT0gMCkge1xuICAgICAgY2FsbGJhY2soLi4udmFsdWVzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgdmFsdWVDYWxsYmFjayA9IGlkeCA9PiAodmFsKSA9PiB7XG4gICAgICAgIHZhbHVlc1tpZHhdID0gdmFsO1xuICAgICAgICB0b1Jlc29sdmUtLTtcbiAgICAgICAgaWYgKHRvUmVzb2x2ZSA9PT0gMCkge1xuICAgICAgICAgIGNhbGxiYWNrKC4uLnZhbHVlcyk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHZhbHVlcy5mb3JFYWNoKCh2LCBpZHgpID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiB2ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgaWYgKHYubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdih2YWx1ZUNhbGxiYWNrKGlkeCkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YWx1ZUNhbGxiYWNrKGlkeCkodigpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGdldCxcbiAgfTtcbn1cbiIsIi8qKlxuICogU2ltcGxlIFF1ZXVlIHRoYXQgYWxsb3dzIGZvciBhIGNvbmZpZ3VyZWQgbnVtYmVyIG9mIGNvbmN1cnJlbnQgaXRlbXMgdG8gYmUgZXhlY3V0ZWQgYnkgYSBoYW5kbGVyLlxuICpcbiAqIFVzYWdlOlxuICogbGV0IG9wdGlvbnMgPSB7XG4gKiAgICAgLy8gbnVtYmVyIG9mIGl0ZW1zIHRoYXQgY2FuIGJlIHByb2Nlc3NlZCBhdCBvbmNlXG4gKiAgICAgY29uY3VycmVuY3k6IDEsXG4gKiAgICAgLy8gZGVsYXkgaW4gdGhlIHN0YXJ0IG9mIHRoZSBwcm9jZXNzaW5nIGluIG1zXG4gKiAgICAgZGVsYXk6IDIwMCxcbiAqICAgICAvLyBtYXggc2l6ZSBvZiB0aGUgcXVldWVcbiAqICAgICBzaXplOiAxMDBcbiAqIH1cbiAqXG4gKiBsZXQgcSA9IHF1ZXVlKChpdGVtLCBkb25lKSA9PiB7XG4gKiAgICAgLy8gZG8gc29tZSB3b3JrIHdpdGggaXRlbSB0aGF0IHRha2VzIDFzLCBzaW11bGF0ZWQgaGVyZSB3aXRoIHNldFRpbWVvdXRcbiAqICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAqICAgICAgICAgZG9uZSgpXG4gKiAgICAgfSwgMTAwMClcbiAqIH0sIG9wdGlvbnMpXG4gKlxuICogbGV0IG15X2l0ZW0gPSAuLi5cbiAqIGlmICghcS5vZmZlcihteV9pdGVtKSkge1xuICogICAgIHRocm93IFwiVW5hYmxlIHRvIGFkZCBpdGVtIHRvIHF1ZXVlXCJcbiAqIH1cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcXVldWUoaGFuZGxlciwgb3B0aW9ucyA9IHt9KSB7XG4gIGNvbnN0IF9oYW5kbGVyID0gaGFuZGxlcjtcbiAgY29uc3QgX2NvbmN1cnJlbmN5ID0gTWF0aC5tYXgob3B0aW9ucy5jb25jdXJyZW5jeSwgMSkgfHwgMTtcbiAgY29uc3QgX2RlbGF5ID0gTWF0aC5tYXgob3B0aW9ucy5kZWxheSwgMCkgfHwgMDtcbiAgY29uc3QgX3NpemUgPSBNYXRoLm1heChvcHRpb25zLnNpemUsIDApIHx8IDA7XG4gIGxldCBfcXVldWUgPSBbXTtcbiAgbGV0IF93b3JraW5nID0gW107XG4gIGxldCBfaWQgPSAwO1xuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZnVuY3Rpb24gX25leHQoKSB7XG4gICAgaWYgKF93b3JraW5nLmxlbmd0aCA8IF9jb25jdXJyZW5jeSkge1xuICAgICAgY29uc3QgbmV4dCA9IF9xdWV1ZS5zaGlmdCgpO1xuICAgICAgaWYgKG5leHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb25zdCBpZCA9ICsrX2lkO1xuICAgICAgICBjb25zdCBkb25lID0gKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGluZGV4ID0gX3dvcmtpbmcuaW5kZXhPZihpZCk7XG4gICAgICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgICAgIF93b3JraW5nLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICBfbmV4dCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgZmlyZSA9ICgpID0+IF9oYW5kbGVyLmFwcGx5KHVuZGVmaW5lZCwgW25leHQuaXRlbSwgZG9uZV0pO1xuICAgICAgICBfd29ya2luZy5wdXNoKGlkKTtcbiAgICAgICAgaWYgKF9kZWxheSkge1xuICAgICAgICAgIHNldFRpbWVvdXQoZmlyZSwgX2RlbGF5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmaXJlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogT2ZmZXIgYSBpdGVtIHRvIHRoZSBxdWV1ZSB0byBiZSBwcm9jZXNzZWQgYnkgdGhlIGhhbmRsZXIuIFJldHVybnMgVHJ1ZSBpZiB0aGUgcXVldWVcbiAgICogYWNjZXB0ZWQgdGhlIGl0ZW0sIEZhbHNlIGlmIHRoZSBxdWV1ZSBoYXMgcmVhY2hlZCBpdCdzIG1heCBzaXplLlxuICAgKi9cbiAgZnVuY3Rpb24gb2ZmZXIoaXRlbSkge1xuICAgIGlmICghX3NpemUgfHwgX3F1ZXVlLmxlbmd0aCA8IF9zaXplKSB7XG4gICAgICBfcXVldWUucHVzaCh7XG4gICAgICAgIGl0ZW0sXG4gICAgICB9KTtcbiAgICAgIF9uZXh0KCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEVtcHRpZXMgdGhlIHF1ZXVlXG4gICAqL1xuICBmdW5jdGlvbiBjbGVhcigpIHtcbiAgICBfcXVldWUgPSBbXTtcbiAgICBfd29ya2luZyA9IFtdO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBvZmZlcixcbiAgICBjbGVhcixcbiAgfTtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAvKipcbiAgICogbnVtYmVyIHwgTWF4aXVtdW0gbnVtYmVyIG9mIGZpbGVzIHRoYXQgVXBsb2FkSnMgd2lsbCBhbGxvdyB0byBjb250YWluLlxuICAgKi9cbiAgbWF4OiBJbmZpbml0eSxcblxuICAvKipcbiAgICogb2JqZWN0OiB7XG4gICAqICAga2V5OiBhcnJheVxuICAgKiB9XG4gICAqIGRlZmluZWQgZ3JvdXBpbmcgb2YgZmlsZSB0eXBlcyBmb3IgYWxsb3dlZF90eXBlcyBieSBNSU1FIHR5cGVcbiAgICovXG4gIHR5cGVzOiB7XG4gICAgaW1hZ2VzOiBbJ2ltYWdlL2pwZycsICdpbWFnZS9qcGVnJywgJ2ltYWdlL3BuZycsICdpbWFnZS9naWYnXSxcbiAgfSxcbiAgLyoqXG4gICAqIGFycmF5IHwgVGhlIGFsbG93ZWQgZmlsZSB0eXBlcyB0aGF0IGNhbiBiZSB1cGxvYWRlZC4gRWl0aGVyIE1JTUUgdHlwZSBvZiBncm91cGluZyBrZXkgKHNlZVxuICAgKiAgICAgICAgIHR5cGVzKVxuICAgKi9cbiAgYWxsb3dlZF90eXBlczogWydpbWFnZXMnXSxcblxuICAvKipcbiAgICogSHR0cCB1cGxvYWQgb3B0aW9uc1xuICAgKi9cbiAgdXBsb2FkOiB7XG4gICAgLyoqXG4gICAgICogc3RyaW5nIHwgVGhlIFVSTCB0aGF0IGlzIGNhbGxlZCB3aGVuIHVwbG9hZGluZyBhIGZpbGVcbiAgICAgKi9cbiAgICB1cmw6ICcnLFxuICAgIC8qKlxuICAgICAqIHN0cmluZyB8IFRoZSBuYW1lIG9mIHRoZSBwYXJhbWV0ZXIgdGhhdCBlYWNoIGZpbGUgaXMgc2V0IGFzIGluIHRoZSB1cGxvYWQgcmVxdWVzdC5cbiAgICAgKi9cbiAgICBwYXJhbTogJ2ZpbGUnLFxuICAgIC8qKlxuICAgICAqIG9iamVjdCB8IEtleWVkIG9iamVjdCBvZiBhZGRpdGlvbmFsIHBhcmFtZXRlcnMgdG8gc2VuZCB3aXRoIHRoZSB1cGxvYWQgcmVxdWVzdC5cbiAgICAgKi9cbiAgICBhZGRpdGlvbmFsUGFyYW1zOiB7fSxcbiAgICAvKipcbiAgICAgKiBvYmplY3QgfCBLZXllZCBvYmplY3Qgb2YgYWRkaXRpb25hbCBoZWFkZXJzIHRvIHNlbmQgd2l0aCB0aGUgdXBsb2FkIHJlcXVlc3QuXG4gICAgICovXG4gICAgaGVhZGVyczoge30sXG4gIH0sXG5cbiAgLyoqXG4gICAqIEh0dHAgZGVsZXRlIG9wdGlvbnNcbiAgICovXG4gIGRlbGV0ZToge1xuICAgIC8qKlxuICAgICAqIHN0cmluZyB8IFRoZSBVUkwgdGhhdCBpcyBjYWxsZWQgd2hlbiBkZWxldGluZyBhIGZpbGVcbiAgICAgKi9cbiAgICB1cmw6ICcnLFxuICAgIC8qKlxuICAgICAqIHN0cmluZyB8IFRoZSBuYW1lIG9mIHRoZSBwYXJhbWV0ZXIgc2V0IHdpdGggdGhlIGZpbGUgaWQgdGhhdCBpcyBzZXQgb24gdGhlIGRlbGV0aW9uIHJlcXVlc3QuXG4gICAgICovXG4gICAgcGFyYW06ICdmaWxlJyxcbiAgICAvKipcbiAgICAgKiBvYmplY3QgfCBLZXllZCBvYmplY3Qgb2YgYWRkaXRpb25hbCBwYXJhbWV0ZXJzIHRvIHNlbmQgd2l0aCB0aGUgZGVsZXRlIHJlcXVlc3QuXG4gICAgICovXG4gICAgYWRkaXRpb25hbFBhcmFtczoge30sXG4gICAgLyoqXG4gICAgICogb2JqZWN0IHwgS2V5ZWQgb2JqZWN0IG9mIGFkZGl0aW9uYWwgaGVhZGVycyB0byBzZW5kIHdpdGggdGhlIGRlbGV0ZSByZXF1ZXN0LlxuICAgICAqL1xuICAgIGhlYWRlcnM6IHt9LFxuICB9LFxufTtcbiIsImltcG9ydCB7IGFkZENsYXNzLCByZW1vdmVDbGFzcywgYXBwZW5kLCBtYWtlLCBvbiwgb2ZmLCBkYXRhIH0gZnJvbSAnLi9kb20nO1xuaW1wb3J0IGl0ZW0sIHsgVFlQRV9JTUFHRSB9IGZyb20gJy4vaXRlbSc7XG5pbXBvcnQgb3B0aW9ucyBmcm9tICcuLi9jb3JlL3V0aWwvb3B0aW9ucyc7XG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vY29yZS91dGlsL21lcmdlJztcblxuZnVuY3Rpb24gbWFrZUFkZCgpIHtcbiAgY29uc3QgZWxlID0gbWFrZSgnZGl2JywgeyBjbGFzczogJ2l0ZW0gbmV3JyB9KTtcbiAgY29uc3QgaWNvbiA9IG1ha2UoJ2RpdicsIHsgY2xhc3M6ICdpY29uIHBsdXMnIH0pO1xuICBhcHBlbmQoZWxlLCBpY29uKTtcbiAgcmV0dXJuIGVsZTtcbn1cblxuZnVuY3Rpb24gbWFrZVBpY2tlcih0cmlnZ2VyLCBldmVudHMsIHN0YXRlLCBtYXgpIHtcbiAgY29uc3QgZWxlID0gbWFrZSgnaW5wdXQnLCB7XG4gICAgdHlwZTogJ2ZpbGUnLFxuICAgIG11bHRpcGxlOiAnbXVsdGlwbGUnLFxuICB9KTtcbiAgb24oZWxlLCAnY2hhbmdlJywgKCkgPT4ge1xuICAgIGNvbnN0IGlkID0gRGF0ZS5ub3coKTtcbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IGVsZS5maWxlcy5sZW5ndGggJiYgc3RhdGUuY291bnQgKyB4IDwgbWF4OyB4KyspIHtcbiAgICAgIGV2ZW50cy50cmlnZ2VyKCdmaWxlLnBpY2tlZCcsIHsgZmlsZTogZWxlLmZpbGVzLml0ZW0oeCksIGlkOiBgJHt4fV8ke2lkfWAgfSk7XG4gICAgfVxuICB9KTtcblxuICBjb25zdCBvbkNsaWNrID0gKCkgPT4gZWxlLmNsaWNrKCk7XG4gIG9uKHRyaWdnZXIsICdjbGljaycsIG9uQ2xpY2spO1xuXG4gIGV2ZW50cy5vbignZGVzdHJveScsICgpID0+IHtcbiAgICBvZmYodHJpZ2dlciwgJ2NsaWNrJywgb25DbGljayk7XG4gIH0pO1xuXG4gIHJldHVybiBlbGU7XG59XG5cbi8qKlxuICogVGhlIGNvbnRhaW5lciBtb2R1bGUgaXMgYSB3cmFwcGVyIGFyb3VuZCB0aGUgdXBsb2FkIGNvbnRhaW5lci5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY29udGFpbmVyKGVsZSwgaXRlbXMsIGV2ZW50cywgZGVmYXVsdE9wdCwgb3B0cykge1xuICBjb25zdCBfc3RhdGUgPSB7XG4gICAgY291bnQ6IDAsXG4gIH07XG4gIGFkZENsYXNzKGVsZSwgJ3VwbG9hZGpzJyk7XG5cbiAgY29uc3QgX2RhdGFPcHRzID0gZGF0YShlbGUsICd1cGxvYWQnLCB7XG4gICAgdXJsOiAndXBsb2FkLnVybCcsXG4gICAgcGFyYW06ICd1cGxvYWQucGFyYW0nLFxuICAgIGRlbGV0ZVVybDogJ2RlbGV0ZS51cmwnLFxuICAgIGRlbGV0ZVBhcmFtOiAnZGVsZXRlLnBhcmFtJyxcbiAgICBhbGxvd2VkVHlwZXM6ICdhbGxvd2VkX3R5cGVzJyxcbiAgICBhZGRpdGlvbmFsUGFyYW06ICd1cGxvYWQuYWRkaXRpb25hbFBhcmFtcycsXG4gICAgaGVhZGVyOiAndXBsb2FkLmhlYWRlcnMnLFxuICAgIGRlbGV0ZUFkZGl0aW9uYWxQYXJhbTogJ2RlbGV0ZS5hZGRpdGlvbmFsUGFyYW1zJyxcbiAgICBkZWxldGVIZWFkZXI6ICdkZWxldGUuaGVhZGVycycsXG4gIH0pO1xuICBjb25zdCBfb3B0cyA9IG9wdGlvbnMobWVyZ2Uoe30sIFtkZWZhdWx0T3B0LCBfZGF0YU9wdHMsIG9wdHNdKSk7XG5cbiAgX29wdHMuZ2V0KCdtYXgnLCAobWF4KSA9PiB7XG4gICAgY29uc3QgX2l0ZW1zID0gbWFrZSgnZGl2JywgeyBjbGFzczogJ3VwbG9hZGpzLWNvbnRhaW5lcicgfSk7XG4gICAgY29uc3QgX2FjdGlvbnMgPSBtYWtlKCdkaXYnLCB7IGNsYXNzOiAndXBsb2FkanMtY29udGFpbmVyJyB9KTtcblxuICAgIGNvbnN0IF90b0FkZCA9IGl0ZW1zLnNsaWNlKDAsIG1heCk7XG4gICAgX3N0YXRlLmNvdW50ID0gX3RvQWRkLmxlbmd0aDtcbiAgICBhcHBlbmQoX2l0ZW1zLCAuLi5fdG9BZGQpO1xuICAgIGFwcGVuZChlbGUsIF9pdGVtcywgX2FjdGlvbnMpO1xuXG4gICAgY29uc3QgX2FkZCA9IG1ha2VBZGQoKTtcbiAgICBhcHBlbmQoX2FjdGlvbnMsIF9hZGQpO1xuICAgIGFwcGVuZChlbGUsIG1ha2VQaWNrZXIoX2FkZCwgZXZlbnRzLCBfc3RhdGUsIG1heCkpO1xuXG4gICAgZXZlbnRzLm9uKCd1cGxvYWQuYWRkZWQnLCAoeyBmaWxlLCBpZCB9KSA9PiB7XG5jb25zb2xlLmxvZygnaXRlbSBhZGRlZCcpO1xuICAgICAgY29uc3QgaSA9IGl0ZW0oeyB0eXBlOiBUWVBFX0lNQUdFLCBmaWxlSWQ6IGlkLCBmaWxlLCBldmVudHMgfSk7XG4gICAgICBhcHBlbmQoX2l0ZW1zLCBpKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGhpZGVTaG93QWRkID0gKGNoYW5nZSkgPT4ge1xuY29uc29sZS5sb2coJ2hpZGUgc2hvdycrY2hhbmdlKTsgICAgIFxuIGlmIChfc3RhdGUuY291bnQgKyBjaGFuZ2UgPCBtYXgpIHtcbiAgICAgICAgcmVtb3ZlQ2xhc3MoX2FkZCwgJ2hpZGUnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFkZENsYXNzKF9hZGQsICdoaWRlJyk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGV2ZW50cy5vbignZmlsZS5waWNrZWQnLCBoaWRlU2hvd0FkZC5iaW5kKG51bGwsIDEpKTtcbiAgICBldmVudHMub24oJ2l0ZW0ucmVtb3ZlZCcsIGhpZGVTaG93QWRkLmJpbmQobnVsbCwgLTEpKTtcbiAgICBldmVudHMub24oJ3VwbG9hZC5mYWlsZWQnLCBoaWRlU2hvd0FkZC5iaW5kKG51bGwsIC0xKSk7XG4gICAgaXRlbXMuc3BsaWNlKDAsIGl0ZW1zLmxlbmd0aCk7XG4gIH0pO1xuXG4gIGV2ZW50cy5vbignZGVzdHJveScsICgpID0+IHtcbiAgICBlbGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlbGUpO1xuICB9KTtcblxuICByZXR1cm4gX29wdHM7XG59XG4iLCIvKipcbiAqIFJldHVybnMgYSBhcnJheSBvZiBjaGlsZCBlbGVtZW50cyBvZiB0aGUgcGFzc2VkIGVsZW1lbnQgdGhhdCBtYXRjaCB0aGUgcGFzc2VkIHR5cGUuIFR5cGUgaXNcbiAqIG9wdGlvbmFsLCBpZiBub3QgZGVmaW5lZCB3aWxsIG1hdGNoIGFsbCBjaGlsZHJlbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoaWxkcmVuKGVsZSwgdHlwZSkge1xuICBjb25zdCByZXN1bHQgPSBbXTtcbiAgY29uc3QgYyA9IGVsZS5jaGlsZHJlbjtcbiAgY29uc3QgbmFtZSA9ICh0eXBlIHx8ICcnKS50b0xvd2VyQ2FzZSgpO1xuICBmb3IgKGxldCB4ID0gMDsgeCA8IGMubGVuZ3RoOyB4KyspIHtcbiAgICBjb25zdCBjaGlsZCA9IGMuaXRlbSh4KTtcbiAgICBpZiAoIXR5cGUgfHwgY2hpbGQubm9kZU5hbWUudG9Mb3dlckNhc2UoKSA9PT0gbmFtZSkge1xuICAgICAgcmVzdWx0LnB1c2goY2hpbGQpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEFkZHMgdGhlIHBhc3NlZCBjbGFzc2VzIHRvIHRoZSBwYXNzZWQgRE9NIGVsZW1lbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGRDbGFzcyhlbGUsIC4uLmNscykge1xuICBjb25zdCBjbGFzc2VzID0gISFlbGUuY2xhc3NOYW1lID8gZWxlLmNsYXNzTmFtZS5zcGxpdCgnICcpIDogW107XG4gIGNscy5mb3JFYWNoKChjKSA9PiB7XG4gICAgaWYgKGNsYXNzZXMuaW5kZXhPZihjKSA8IDApIHtcbiAgICAgIGNsYXNzZXMucHVzaChjKTtcbiAgICB9XG4gIH0pO1xuICBlbGUuY2xhc3NOYW1lID0gY2xhc3Nlcy5qb2luKCcgJyk7XG59XG5cbi8qKlxuICogUmVtb3ZlcyB0aGUgcGFzc2VkIGNsYXNzZXMgZnJvbSB0aGUgcGFzc2VkIERPTSBlbGVtZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlQ2xhc3MoZWxlLCAuLi5jbHMpIHtcbiAgY29uc3QgY2xhc3NlcyA9ICEhZWxlLmNsYXNzTmFtZSA/IGVsZS5jbGFzc05hbWUuc3BsaXQoJyAnKSA6IFtdO1xuICBjbHMuZm9yRWFjaCgoYykgPT4ge1xuICAgIGNvbnN0IGluZGV4ID0gY2xhc3Nlcy5pbmRleE9mKGMpO1xuICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICBjbGFzc2VzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICB9KTtcbiAgZWxlLmNsYXNzTmFtZSA9IGNsYXNzZXMuam9pbignICcpO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYW5kIHJldHVzbiBhIG5ldyBET00gZWxlbWVudCB3aXRoIHRoZSBkZWZpbmVkIG5hbWUuIEF0dHJpYnV0ZXMgaXMgb3B0aW9uYWwsIG11c3QgYmUgYW5cbiAqIG9iamVjdCwgaWYgZGVmaW5lZCBzZXRzIHRoZSBhdHRyaWJ1dGUga2V5IGFuZCB2YWx1ZSBmcm9tIHRoZSBlbnVtZXJhYmxlIHByb3BlcnRpZXMgb24gdGhlIG9iamVjdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1ha2UobmFtZSwgYXR0cmlidXRlcykge1xuICBjb25zdCBlbGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KG5hbWUpO1xuICBpZiAoYXR0cmlidXRlcykge1xuICAgIE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMpXG4gICAgICAuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgIGlmIChrZXkgPT09ICdjbGFzcycpIHtcbiAgICAgICAgICBhZGRDbGFzcyhlbGUsIC4uLihhdHRyaWJ1dGVzW2tleV0gfHwgJycpLnNwbGl0KCcgJykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVsZS5zZXRBdHRyaWJ1dGUoa2V5LCBhdHRyaWJ1dGVzW2tleV0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxuICByZXR1cm4gZWxlO1xufVxuXG4vKipcbiAqIEFwcGVuZHMgdGhlIHBhc3NlZCBjaGlsZHJlbiB0byB0aGUgcGFzc2VkIGVsZW1lbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBlbmQoZWxlLCAuLi5hcHBlbmRDaGlsZHJlbikge1xuICBhcHBlbmRDaGlsZHJlbi5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICAgIGVsZS5hcHBlbmRDaGlsZChjaGlsZCk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBtYWtlTWFya2VyS2V5KGtleSwgcG9zdGZpeCkge1xuICByZXR1cm4gYHVwLW1hcmtlci0ke2tleX0tJHtwb3N0Zml4fWA7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG1hcmtlciB0aGF0IGlzIGFwcGVuZGVkIHRvIHRoZSBlbGVtZW50IHdpdGggdGhlIGRlZmluZWQga2V5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFya2VyKGVsZSwga2V5KSB7XG4gIGFwcGVuZChcbiAgICBlbGUsXG4gICAgZG9jdW1lbnQuY3JlYXRlQ29tbWVudChtYWtlTWFya2VyS2V5KGtleSwgJ3N0YXJ0JykpLFxuICAgIGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQobWFrZU1hcmtlcktleShrZXksICdlbmQnKSlcbiAgKTtcbn1cblxuLyoqXG4gKiBSZXBsYWNlcyB0aGUgY29udGVudCBpbnNpZGUgdGhlIG1hcmtlciBhbmQgcmVwbGFjZXMgaXQgd2l0aCB0aGUgc3VwcGxpZWQgY29udGVudHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlcGxhY2VNYXJrZXIoZWxlLCBrZXksIC4uLmNvbnRlbnRzKSB7XG4gIGNvbnN0IG1hcmtlclN0YXJ0ID0gbWFrZU1hcmtlcktleShrZXksICdzdGFydCcpO1xuICBjb25zdCBtYXJrZXJFbmQgPSBtYWtlTWFya2VyS2V5KGtleSwgJ2VuZCcpO1xuICBsZXQgcHJvY2Vzc2luZyA9IGZhbHNlO1xuXG4gIGxldCBub2RlID0gZWxlLmZpcnN0Q2hpbGQ7XG4gIGNvbnN0IGluc2VydCA9ICh0bywgbikgPT4gbm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShuLCB0byk7XG5cbiAgd2hpbGUgKG5vZGUpIHtcbiAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gOCkge1xuICAgICAgaWYgKG5vZGUubm9kZVZhbHVlID09PSBtYXJrZXJTdGFydCkge1xuICAgICAgICBwcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgICAgbm9kZSA9IG5vZGUubmV4dFNpYmxpbmc7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfSBlbHNlIGlmIChub2RlLm5vZGVWYWx1ZSA9PT0gbWFya2VyRW5kKSB7XG4gICAgICAgIGNvbnRlbnRzLmZvckVhY2goaW5zZXJ0LmJpbmQodW5kZWZpbmVkLCBub2RlKSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocHJvY2Vzc2luZykge1xuICAgICAgY29uc3QgbmV4dCA9IG5vZGUubmV4dFNpYmxpbmc7XG4gICAgICBub2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZSk7XG4gICAgICBub2RlID0gbmV4dDtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIG5vZGUgPSBub2RlLm5leHRTaWJsaW5nO1xuICB9XG59XG5cbi8qKlxuICogUmVtb3ZlcyBhbGwgY2hpbGQgbm9kZXMgZnJvbSB0aGUgcGFzc2VkIGVsZW1lbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbXB0eShlbGUpIHtcbiAgd2hpbGUgKGVsZS5maXJzdENoaWxkKSB7XG4gICAgZWxlLnJlbW92ZUNoaWxkKGVsZS5maXJzdENoaWxkKTtcbiAgfVxufVxuXG4vKipcbiAqIEdldHMgdGhlIGF0dHJpYnV0ZXMgZnJvbSB0aGUgcGFzc2VkIGVsZW1lbnQgYW5kIHJldHVybnMgYSBrZXllZCBvYmplY3QuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhdHRycyhlbGUsIC4uLmF0dHJpYnV0ZXMpIHtcbiAgY29uc3QgcmVzdWx0ID0ge307XG4gIGF0dHJpYnV0ZXMuZm9yRWFjaCgoYXR0cikgPT4ge1xuICAgIHJlc3VsdFthdHRyXSA9IGVsZS5nZXRBdHRyaWJ1dGUoYXR0cik7XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEFkZHMgZXZlbnQgbGlzdGVuZXIgdG8gdGhlIHBhc3NlZCBlbGVtZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gb24oZWxlLCBldmVudCwgaGFuZGxlcikge1xuICBlbGUuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgaGFuZGxlcik7XG59XG5cbi8qKlxuICogUmVtb3ZlIGV2ZW50IGxpc3RlbmVyIGZyb20gdGhlIHBhc3NlZCBlbGVtZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gb2ZmKGVsZSwgZXZlbnQsIGhhbmRsZXIpIHtcbiAgZWxlLnJlbW92ZUV2ZW50TGlzdGVuZXIoZWxlLCBldmVudCwgaGFuZGxlcik7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgdmFsdWUgb24gdGhlIG9iamVjdCB1c2luZyB0aGUgcGF0aC4gR3Jvd3MgdGhlIG9iamVjdCBkZWVwIHVudGlsIHRoZSBlbmQgb2YgdGhlIHBhdGggaXNcbiAqIHJlYWNoZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXQob2JqLCBwYXRoLCB2YWwpIHtcbiAgbGV0IHNldE9uID0gb2JqO1xuICBjb25zdCBwYXJ0cyA9IHBhdGguc3BsaXQoJy4nKTtcbiAgY29uc3QgbGFzdCA9IHBhcnRzLnBvcCgpO1xuICBwYXJ0cy5mb3JFYWNoKChwYXJ0KSA9PiB7XG4gICAgbGV0IG5leHQgPSBzZXRPbltwYXJ0XTtcbiAgICBpZiAoIW5leHQpIHtcbiAgICAgIG5leHQgPSB7fTtcbiAgICAgIHNldE9uW3BhcnRdID0gbmV4dDtcbiAgICB9XG4gICAgc2V0T24gPSBuZXh0O1xuICB9KTtcbiAgaWYgKHR5cGVvZiBzZXRPbiA9PT0gJ29iamVjdCcpIHtcbiAgICBzZXRPbltsYXN0XSA9IHZhbDtcbiAgfVxufVxuXG4vKipcbiAqIEV4dHJhY3RzIGRhdGEgYXR0cmlidXRlcyBmcm9tIHRoZSBwYXNzZWQgZWxlbWVudCB3aGVyZSB0aGV5IHN0YXJ0IHdpdGggdGhlIHByZWZpeCBhbmQgcmV0dXJucyBhXG4gKiBrZXkgb2JqZWN0LiBBbiBvcHRpb25hbCBzaGFwZSBwYXJhbWV0ZXIgY2FuIGJlIGRlZmluZWQgdGhhdCBkZWZpbmVzIHRoZSBzaGFwZSBvZiB0aGUgcmVzdWx0LlxuICogRm9yIGV4YW1wbGU6XG4gKiBzaGFwZSA9IHsgdGVzdDogJ3NvbWUuYml0Jywgb3RoZXI6ICd0aGluZycgfVxuICogPC4uLiBkYXRhLXRlc3Qta2V5MT1cInZhbFwiIGRhdGEtb3RoZXI9XCJ2YWwyXCIgLz5cbiAqIHJlc3VsdCA9IHsgc29tZTogeyBiaXQ6IHsga2V5MTogJ3ZhbCcgfSB9LCB0aGluZzogJ3ZhbDInIH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRhdGEoZWxlLCBwcmVmaXggPSAnJywgc2hhcGUgPSB7fSkge1xuICBjb25zdCByZXN1bHQgPSB7fTtcbiAgT2JqZWN0LmtleXMoZWxlLmRhdGFzZXQpXG4gICAgLmZpbHRlcihrZXkgPT4ga2V5LnN0YXJ0c1dpdGgocHJlZml4KSlcbiAgICAuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICBsZXQgYWRqdXN0ZWQgPSBrZXkuc3Vic3RyKHByZWZpeC5sZW5ndGgpO1xuICAgICAgYWRqdXN0ZWQgPSBhZGp1c3RlZC5jaGFyQXQoMCkudG9Mb3dlckNhc2UoKSArIGFkanVzdGVkLnNsaWNlKDEpO1xuICAgICAgbGV0IHBhdGggPSAnJztcbiAgICAgIGxldCBiZXN0ID0gMDtcbiAgICAgIE9iamVjdC5rZXlzKHNoYXBlKS5mb3JFYWNoKChzaykgPT4ge1xuICAgICAgICBjb25zdCBpZHggPSBhZGp1c3RlZC5pbmRleE9mKHNrKTtcbiAgICAgICAgaWYgKGlkeCA+PSAwICYmIGJlc3QgPCBzay5sZW5ndGgpIHtcbiAgICAgICAgICBiZXN0ID0gc2subGVuZ3RoO1xuICAgICAgICAgIGNvbnN0IHJlc3QgPSBhZGp1c3RlZC5zbGljZShzay5sZW5ndGgpO1xuICAgICAgICAgIHBhdGggPSBzaGFwZVtza10gKyAocmVzdCA/IGAuJHtyZXN0LmNoYXJBdCgwKS50b0xvd2VyQ2FzZSgpICsgcmVzdC5zbGljZSgxKX1gIDogJycpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHNldChyZXN1bHQsIHBhdGggfHwgYWRqdXN0ZWQsIGVsZS5kYXRhc2V0W2tleV0pO1xuICAgIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuIiwiaW1wb3J0IHsgbWFrZSwgYXBwZW5kLCBtYXJrZXIsIHJlcGxhY2VNYXJrZXIsIGFkZENsYXNzLCByZW1vdmVDbGFzcywgb24sIG9mZiB9IGZyb20gJy4vZG9tJztcblxuZXhwb3J0IGNvbnN0IFRZUEVfSU1BR0UgPSAnaW1hZ2UnO1xuXG4vKipcbiAqIFJlbmRlcnMgYSBpdGVtIHR5cGUgb2YgaW1hZ2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbWFnZVJlbmRlcmVyKGRhdGEpIHtcbiAgaWYgKGRhdGEuZmlsZSkge1xuICAgIGNvbnN0IGVsZSA9IG1ha2UoJ2ltZycpO1xuICAgIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgcmVhZGVyLm9ubG9hZCA9IChlKSA9PiB7XG4gICAgICBlbGUuc2V0QXR0cmlidXRlKCdzcmMnLCBlLnRhcmdldC5yZXN1bHQpO1xuICAgIH07XG4gICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoZGF0YS5maWxlKTtcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgZGF0YSwgeyBlbGUgfSk7XG4gIH1cbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIGRhdGEsIHsgZWxlOiBtYWtlKCdpbWcnLCB7IHNyYzogZGF0YS5zcmMgfSkgfSk7XG59XG5cbi8qKlxuICogTWFwIG9mIHJlbmRlcmVycyBieSB0eXBlLlxuICovXG5jb25zdCByZW5kZXJlcnMgPSB7XG4gIE5PT1A6ICgpID0+IG1ha2UoJ2RpdicpLFxuICBbVFlQRV9JTUFHRV06IGltYWdlUmVuZGVyZXIsXG59O1xuXG4vKipcbiAqIFdyYXBwaW5nIERPTSBhcm91bmQgdGhlIGl0ZW0gRE9NXG4gKi9cbmZ1bmN0aW9uIHdyYXAoZGF0YSkge1xuICBjb25zdCBpc1VwbG9hZGluZyA9ICEhZGF0YS5maWxlO1xuICBjb25zdCByb290ID0gbWFrZSgnZGl2Jywge1xuICAgIGNsYXNzOiBbJ2l0ZW0nXS5jb25jYXQoaXNVcGxvYWRpbmcgPyBbJ3VwbG9hZGluZyddIDogW10pLmpvaW4oJyAnKSxcbiAgfSk7XG4gIGFwcGVuZChyb290LCBkYXRhLmVsZSk7XG4gIG1hcmtlcihyb290LCAnc3RhdHVzJyk7XG4gIG1hcmtlcihyb290LCAnYWN0aW9ucycpO1xuXG4gIGxldCBfcHJvZ3Jlc3M7XG4gIGlmIChpc1VwbG9hZGluZykge1xuICAgIF9wcm9ncmVzcyA9IG1ha2UoJ2RpdicsIHsgY2xhc3M6ICdwcm9ncmVzcycgfSk7XG4gICAgcmVwbGFjZU1hcmtlcihcbiAgICAgIHJvb3QsXG4gICAgICAnc3RhdHVzJyxcbiAgICAgIG1ha2UoJ2RpdicsIHsgY2xhc3M6ICdzcGlubmVyJyB9KSxcbiAgICAgIG1ha2UoJ2RpdicsIHsgY2xhc3M6ICdpY29uIHVwbG9hZCcgfSksXG4gICAgICBfcHJvZ3Jlc3NcbiAgICApO1xuICB9XG5cbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIGRhdGEsIHsgZWxlOiByb290LCBfcHJvZ3Jlc3MgfSk7XG59XG5cbi8qKlxuICogTWFrZXMgdGhlIGFwcHJvcHJpYXRlIHN0YXR1cyBpY29uIGFuZCBhcHBlbmRzIHRvIHRoZSBzdGF0dXMgbWFya2VyLiBUaGVuIHJlbW92ZXMgYWZ0ZXIgYSBzaG9ydFxuICogcGVyaW9kLlxuICovXG5mdW5jdGlvbiBzdGF0dXMoZWxlLCBzdCwgZG9uZSkge1xuICBjb25zdCBzID0gbWFrZSgnZGl2JywgeyBjbGFzczogYGljb24gJHtzdH1gIH0pO1xuICBhcHBlbmQocywgbWFrZSgnaScpKTtcbiAgcmVwbGFjZU1hcmtlcihlbGUsICdzdGF0dXMnLCBzKTtcblxuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBhZGRDbGFzcyhzLCAnZ29pbmcnKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHJlcGxhY2VNYXJrZXIoZWxlLCAnc3RhdHVzJyk7XG4gICAgICByZW1vdmVDbGFzcyhzLCAnZ29pbmcnKTtcblxuICAgICAgaWYgKGRvbmUpIHtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgfVxuICAgIH0sIDIwMDApO1xuICB9LCAyMDAwKTtcbn1cblxuLyoqXG4gKiBSZW1vdmUgYWxsIHVwbG9hZCBldmVudHNcbiAqL1xuZnVuY3Rpb24gcmVtb3ZlVXBsb2FkRXZlbnRzKGRhdGEpIHtcbiAgaWYgKGRhdGEuZmlsZUlkKSB7XG4gICAgZGF0YS5ldmVudHMub2ZmKCd1cGxvYWQuYWRkZWQnLCBkYXRhLmZpbGVJZCk7XG4gICAgZGF0YS5ldmVudHMub2ZmKCd1cGxvYWQuc3RhcnRlZCcsIGRhdGEuZmlsZUlkKTtcbiAgICBkYXRhLmV2ZW50cy5vZmYoJ3VwbG9hZC5wcm9ncmVzcycsIGRhdGEuZmlsZUlkKTtcbiAgICBkYXRhLmV2ZW50cy5vZmYoJ3VwbG9hZC5kb25lJywgZGF0YS5maWxlSWQpO1xuICAgIGRhdGEuZXZlbnRzLm9mZigndXBsb2FkLmZhaWxlZCcsIGRhdGEuZmlsZUlkKTtcbiAgfVxufVxuXG4vKipcbiAqIFJlbW92ZSBhbGwgZGVsZXRlIGV2ZW50c1xuICovXG5mdW5jdGlvbiByZW1vdmVEZWxldGVFdmVudHMoZGF0YSkge1xuICBpZiAoZGF0YS5pZCkge1xuICAgIGRhdGEuZXZlbnRzLm9mZignZGVsZXRlLmFkZGVkJywgZGF0YS5pZCk7XG4gICAgZGF0YS5ldmVudHMub2ZmKCdkZWxldGUuc3RhcnRlZCcsIGRhdGEuaWQpO1xuICAgIGRhdGEuZXZlbnRzLm9mZignZGVsZXRlLmRvbmUnLCBkYXRhLmlkKTtcbiAgICBkYXRhLmV2ZW50cy5vZmYoJ2RlbGV0ZS5mYWlsZWQnLCBkYXRhLmlkKTtcbiAgfVxufVxuXG4vKipcbiAqIFJlbW92ZSB0aGUgaXRlbVxuICovXG5mdW5jdGlvbiByZW1vdmUoZWxlLCBkYXRhKSB7XG4gIGFkZENsYXNzKGVsZSwgJ3JlbW92ZWQnKTtcbiAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgZWxlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWxlKTtcbiAgICBkYXRhLmV2ZW50cy50cmlnZ2VyKCdpdGVtLnJlbW92ZWQnLCB7IGlkOiBkYXRhLmlkIH0pO1xuICB9LCA2MDApO1xuXG4gIHJlbW92ZVVwbG9hZEV2ZW50cyhkYXRhKTtcbiAgcmVtb3ZlRGVsZXRlRXZlbnRzKGRhdGEpO1xuICBkYXRhLmV2ZW50cy5vZmYoJ2Rlc3Ryb3knLCBkYXRhLmlkKTtcbn1cblxuLyoqXG4gKiBBZGQgZGVsZXRpb24gbGlzdGVuZXJzIHRvIHRoZSBldmVudHNcbiAqL1xuZnVuY3Rpb24gb25EZWxldGUoZWxlLCBkYXRhKSB7XG4gIGRhdGEuZXZlbnRzLm9uKCdkZWxldGUuYWRkZWQnLCBkYXRhLmlkLCAoKSA9PiB7XG4gICAgYWRkQ2xhc3MoZWxlLCAncmVtb3ZpbmcnKTtcblxuICAgIHJlcGxhY2VNYXJrZXIoXG4gICAgICBlbGUsXG4gICAgICAnc3RhdHVzJyxcbiAgICAgIG1ha2UoJ2RpdicsIHsgY2xhc3M6ICdzcGlubmVyJyB9KSxcbiAgICAgIG1ha2UoJ2RpdicsIHsgY2xhc3M6ICdpY29uIHRyYXNoJyB9KVxuICAgICk7XG4gIH0pO1xuXG4gIGRhdGEuZXZlbnRzLm9uKCdkZWxldGUuZG9uZScsIGRhdGEuaWQsICgpID0+IHtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHJlbW92ZUNsYXNzKGVsZSwgJ3JlbW92aW5nJyk7XG4gICAgICByZW1vdmUoZWxlLCBkYXRhKTtcbiAgICB9LCA1MDApO1xuICB9KTtcblxuICBkYXRhLmV2ZW50cy5vbignZGVsZXRlLmZhaWxlZCcsIGRhdGEuaWQsICgpID0+IHtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHJlbW92ZUNsYXNzKGVsZSwgJ3JlbW92aW5nJyk7XG4gICAgICBzdGF0dXMoZWxlLCAnZXJyb3InKTtcbiAgICB9LCA1MDApO1xuICB9KTtcblxuICBpZiAoZGF0YS5maWxlSWQpIHtcbiAgICBkYXRhLmV2ZW50cy5vZmYoJ2Rlc3Ryb3knLCBkYXRhLmZpbGVJZCk7XG4gIH1cbiAgZGF0YS5ldmVudHMub24oJ2Rlc3Ryb3knLCBkYXRhLmlkLCBkYXRhLl9vbkRlc3Ryb3kpO1xufVxuXG4vKipcbiAqIE1ha2VzIHRoZSBhY3Rpb25zIGJhciBET01cbiAqL1xuZnVuY3Rpb24gbWFrZUFjdGlvbnMoZWxlLCBkYXRhKSB7XG4gIGlmIChkYXRhLmlkKSB7XG4gICAgY29uc3QgYWN0aW9ucyA9IG1ha2UoJ2RpdicsIHsgY2xhc3M6ICdhY3Rpb25zJyB9KTtcbiAgICBjb25zdCBkZWwgPSBtYWtlKCdkaXYnLCB7IGNsYXNzOiAnYWN0aW9uIGRlbCcgfSk7XG4gICAgYXBwZW5kKGFjdGlvbnMsIGRlbCk7XG4gICAgYXBwZW5kKGRlbCwgbWFrZSgnZGl2JywgeyBjbGFzczogJ3RyYXNoJyB9KSk7XG4gICAgcmVwbGFjZU1hcmtlcihlbGUsICdhY3Rpb25zJywgYWN0aW9ucyk7XG5cbiAgICBjb25zdCBvbkRlbGV0ZUNsaWNrID0gKCkgPT4gZGF0YS5ldmVudHMudHJpZ2dlcignZmlsZS5kZWxldGUnLCB7IGlkOiBkYXRhLmlkIH0pO1xuICAgIG9uKGRlbCwgJ2NsaWNrJywgb25EZWxldGVDbGljayk7XG5cbiAgICBkYXRhLm9uRGVzdHJveUV2ZW50cy5wdXNoKCgpID0+IHtcbiAgICAgIG9mZihkZWwsICdjbGljaycsIG9uRGVsZXRlQ2xpY2spO1xuICAgIH0pO1xuXG4gICAgb25EZWxldGUoZWxlLCBkYXRhKTtcbiAgfSBlbHNlIHtcbiAgICBhZGRDbGFzcyhlbGUsICdzdGF0aWMnKTtcbiAgICBkYXRhLmV2ZW50cy5vbignZGVzdHJveScsIGRhdGEuX29uRGVzdHJveSk7XG4gIH1cbn1cblxuLyoqXG4gKiBBZGQgdXBsb2FkIGxpc3RlbmVycyB0byB0aGUgZXZlbnRzXG4gKi9cbmZ1bmN0aW9uIG9uVXBsb2FkKGVsZSwgcHJvZ3Jlc3NFbGUsIGRhdGEpIHtcbiAgZGF0YS5ldmVudHMub24oJ3VwbG9hZC5wcm9ncmVzcycsIGRhdGEuZmlsZUlkLCAoeyBwcm9ncmVzcyB9KSA9PiB7XG4gICAgY29uc3QgdmFsID0gMCAtICgxMDAgLSBwcm9ncmVzcyk7XG4gICAgcHJvZ3Jlc3NFbGUuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZVgoJHt2YWx9JSlgO1xuICB9KTtcblxuICBkYXRhLmV2ZW50cy5vbigndXBsb2FkLmRvbmUnLCBkYXRhLmZpbGVJZCwgKHsgaWQgfSkgPT4ge1xuICAgIGRhdGEuaWQgPSBpZDtcbiAgICBzdGF0dXMoZWxlLCAnZG9uZScpO1xuICAgIHJlbW92ZUNsYXNzKGVsZSwgJ3VwbG9hZGluZycpO1xuICAgIG1ha2VBY3Rpb25zKGVsZSwgZGF0YSk7XG5cbiAgICByZW1vdmVVcGxvYWRFdmVudHMoZGF0YSk7XG4gIH0pO1xuXG4gIGRhdGEuZXZlbnRzLm9uKCd1cGxvYWQuZmFpbGVkJywgZGF0YS5maWxlSWQsICgpID0+IHtcbiAgICBhZGRDbGFzcyhlbGUsICdzdG9wcGVkJyk7XG4gICAgc3RhdHVzKGVsZSwgJ2Vycm9yJywgKCkgPT4ge1xuICAgICAgcmVtb3ZlKGVsZSwgZGF0YSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRhdGEuZXZlbnRzLm9uKCdkZXN0cm95JywgZGF0YS5maWxlSWQsIGRhdGEuX29uRGVzdHJveSk7XG59XG5cbi8qKlxuICogVGhlIGl0ZW0gbW9kdWxlIGlzIGEgd3JhcHBlciBhcm91bmQgYW4gaXRlbSBpbiB0aGUgY29udGFpbmVyIHRoYXQgdGhlIHVzZXIgY2FuIGludGVyYWN0IHdpdGguXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGl0ZW0oZGF0YSkge1xuICBkYXRhLm9uRGVzdHJveUV2ZW50cyA9IFtdO1xuICBjb25zdCBfd3JhcHBlciA9IHdyYXAoKHJlbmRlcmVyc1tkYXRhLnR5cGVdIHx8IHJlbmRlcmVycy5OT09QKShkYXRhKSk7XG5cbiAgZGF0YS5vbkRlc3Ryb3lFdmVudHMucHVzaCgoKSA9PiB7XG4gICAgX3dyYXBwZXIuZWxlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoX3dyYXBwZXIuZWxlKTtcbiAgICBfd3JhcHBlci5lbGUgPSB1bmRlZmluZWQ7XG4gIH0pO1xuICBkYXRhLl9vbkRlc3Ryb3kgPSAoKSA9PiB7XG4gICAgZGF0YS5vbkRlc3Ryb3lFdmVudHMuZm9yRWFjaChkID0+IGQoKSk7XG4gICAgZGF0YS5vbkRlc3Ryb3lFdmVudHMgPSBbXTtcbiAgfTtcblxuICBpZiAoZGF0YS5maWxlSWQpIHtcbiAgICBvblVwbG9hZChfd3JhcHBlci5lbGUsIF93cmFwcGVyLl9wcm9ncmVzcywgZGF0YSk7XG4gIH0gZWxzZSB7XG4gICAgbWFrZUFjdGlvbnMoX3dyYXBwZXIuZWxlLCBkYXRhKTtcbiAgfVxuXG4gIHJldHVybiBfd3JhcHBlci5lbGU7XG59XG4iLCJpbXBvcnQgeyBjaGlsZHJlbiwgZW1wdHksIGF0dHJzIH0gZnJvbSAnLi9kb20nO1xuaW1wb3J0IGl0ZW0sIHsgVFlQRV9JTUFHRSB9IGZyb20gJy4vaXRlbSc7XG5pbXBvcnQgY29udGFpbmVyIGZyb20gJy4vY29udGFpbmVyJztcblxuZnVuY3Rpb24gcGFyc2VJbWFnZShlbGUsIGV2ZW50cykge1xuICByZXR1cm4gaXRlbShcbiAgICBPYmplY3QuYXNzaWduKHsgdHlwZTogVFlQRV9JTUFHRSB9LFxuICAgICAgYXR0cnMoZWxlLCAnc3JjJyksIHsgaWQ6IGVsZS5kYXRhc2V0LnVwbG9hZEltYWdlSWQsIGV2ZW50cyB9XG4gICAgKVxuICApO1xufVxuXG4vKipcbiAqIFRoZSBwYXJzZSBtb2R1bGUgcGFyc2VzIHRoZSBET00gZWxlbWVudCBhbmQgcmV0dXJucyBhIGNvbnRhaW5lciB3cmFwcGVyIGVsZW1lbnQuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlKGVsZSwgZXZlbnRzLCBkZWZhdWx0T3B0LCBvcHRzKSB7XG4gIGNvbnN0IGl0ZW1zID0gY2hpbGRyZW4oZWxlLCAnaW1nJykubWFwKGltZyA9PiBwYXJzZUltYWdlKGltZywgZXZlbnRzKSk7XG4gIGVtcHR5KGVsZSk7XG4gIHJldHVybiBjb250YWluZXIoZWxlLCBpdGVtcywgZXZlbnRzLCBkZWZhdWx0T3B0LCBvcHRzKTtcbn1cbiIsImltcG9ydCBwYXJzZSBmcm9tICcuL3JlbmRlci9wYXJzZSc7XG5pbXBvcnQgY29yZSBmcm9tICcuL2NvcmUnO1xuaW1wb3J0IGh0dHAgZnJvbSAnLi9jb3JlL3V0aWwvaHR0cCc7XG5pbXBvcnQgZXZlbnRzIGZyb20gJy4vY29yZS91dGlsL2V2ZW50cyc7XG5pbXBvcnQgZGVmYXVsdE9wdHMgZnJvbSAnLi9kZWZhdWx0cyc7XG5cbmZ1bmN0aW9uIHVwKGVsZSwgb3B0cyA9IHt9KSB7XG4gIGxldCBfZXZlbnRzID0gZXZlbnRzKFtcbiAgICAndXBsb2FkLmFkZGVkJyxcbiAgICAndXBsb2FkLnN0YXJ0ZWQnLFxuICAgICd1cGxvYWQucHJvZ3Jlc3MnLFxuICAgICd1cGxvYWQuZG9uZScsXG4gICAgJ3VwbG9hZC5mYWlsZWQnLFxuICAgICdkZWxldGUuYWRkZWQnLFxuICAgICdkZWxldGUuc3RhcnRlZCcsXG4gICAgJ2RlbGV0ZS5kb25lJyxcbiAgICAnZGVsZXRlLmZhaWxlZCcsXG4gIF0pO1xuICBsZXQgX3VpRXZlbnRzID0gZXZlbnRzKFtcbiAgICAnZmlsZS5waWNrZWQnLFxuICAgICdmaWxlLmRlbGV0ZScsXG4gICAgJ2l0ZW0ucmVtb3ZlZCcsXG4gICAgJ2Rlc3Ryb3knLFxuICBdKTtcbiAgX2V2ZW50cy5lbWl0KF91aUV2ZW50cyk7XG5cbiAgbGV0IF9vcHRzID0gcGFyc2UoZWxlLCBfdWlFdmVudHMsIGRlZmF1bHRPcHRzLCBvcHRzKTtcbiAgbGV0IF9jb3JlID0gY29yZShodHRwLCBfZXZlbnRzLCBfb3B0cyk7XG5cbiAgX3VpRXZlbnRzLm9uKCdmaWxlLnBpY2tlZCcsIGV2ID0+IF9jb3JlLnVwbG9hZChldikpO1xuICBfdWlFdmVudHMub24oJ2ZpbGUuZGVsZXRlJywgZXYgPT4gX2NvcmUuZGVsKGV2LmlkKSk7XG5cbiAgcmV0dXJuIHtcbiAgICBvbihldmVudCwgaGFuZGxlcikge1xuICAgICAgaWYgKF9ldmVudHMpIHtcbiAgICAgICAgZXZlbnQuc3BsaXQoJyAnKS5mb3JFYWNoKChldikgPT4ge1xuICAgICAgICAgIF9ldmVudHMub24oZXYsIGhhbmRsZXIpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgZGVzdHJveSgpIHtcbiAgICAgIGlmIChfdWlFdmVudHMpIHtcbiAgICAgICAgX3VpRXZlbnRzLnRyaWdnZXIoJ2Rlc3Ryb3knKTtcblxuICAgICAgICBfZXZlbnRzLmNsZWFyKCk7XG4gICAgICAgIF91aUV2ZW50cy5jbGVhcigpO1xuICAgICAgICBfY29yZS5kZXN0cm95KCk7XG5cbiAgICAgICAgX2V2ZW50cyA9IHVuZGVmaW5lZDtcbiAgICAgICAgX3VpRXZlbnRzID0gdW5kZWZpbmVkO1xuICAgICAgICBfb3B0cyA9IHVuZGVmaW5lZDtcbiAgICAgICAgX2NvcmUgPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfSxcbiAgfTtcbn1cblxuLyoqXG4gKiBBbGxvd3MgcGxhaW4gdmFuaWxsYSBKYXZhU2NyaXB0IGFjY2VzcyB0byB0aGUgVXBsb2FkSnMgV2lkZ2V0LlxuICpcbiAqIFVzYWdlOlxuICogdmFyIGVsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibXlpZFwiKTtcbiAqIHZhciBvcHRpb25zID0geyAuLi4gfVxuICogbmV3IFVwbG9hZEpzKGVsZSwgb3B0aW9ucylcbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqL1xud2luZG93LlVwbG9hZEpzID0gY2xhc3MgVXBsb2FkSnMge1xuICBjb25zdHJ1Y3RvcihlbGUsIG9wdHMgPSB7fSkge1xuICAgIHRoaXMuX3VwID0gdXAoZWxlLCBvcHRzKTtcbiAgfVxuXG4gIG9uKGV2ZW50LCBoYW5kbGVyKSB7XG4gICAgdGhpcy5fdXAub24oZXZlbnQsIGhhbmRsZXIpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl91cC5kZXN0cm95KCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn07XG4iXX0=
