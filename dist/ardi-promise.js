'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*eslint no-invalid-regexp: ["error", { "allowConstructorFlags": ["u", "y"] }]*/
var ArdiPromise = function () {
  var PROMISE_STATE = {
    PENDING: 'pending',
    RESOLVED: 'resolved',
    REJECTED: 'rejected'
  };

  var isPromise = function isPromise(value) {
    return (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && (value instanceof Promise || 'then' in value);
  };

  var Promise = function () {
    function Promise() {
      var promiseResolver = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

      _classCallCheck(this, Promise);

      this._state = Promise.PROMISE_STATE.PENDING;
      this.promiseResolver = promiseResolver;

      this._invokeResolver();
    }

    _createClass(Promise, [{
      key: 'then',
      value: function then(didFullfill, didReject) {
        if (typeof didFullfill !== 'function' && typeof didReject !== 'function') {
          throw new Error('then() only accepts functions');
        }

        return this._then(didFullfill, didReject);
      }
    }, {
      key: '_then',
      value: function _then(didFullfill, didReject) {
        this.setCallbacks(didFullfill, didReject);
        this.nextPromise = new Promise();

        if (this.isConcluded()) {
          if (this._state === Promise.PROMISE_STATE.RESOLVED) {
            if (typeof this._fullfill === 'function') {
              this.resolve(this._fullfilledValue);
            } else {
              this.nextPromise(this._fullfilledValue);
            }
          }

          if (this._state === Promise.PROMISE_STATE.REJECTED) {
            if (this._rejectionCallback) {
              this.reject(this._rejectReason);
            } else {
              this.nextPromise.reject(this._rejectReason);
            }
          }
        }

        return this.nextPromise;
      }
    }, {
      key: 'setCallbacks',
      value: function setCallbacks(fullfill, reject) {
        if (typeof fullfill === 'function') {
          this._fullfillCallback = fullfill;
        }

        if (typeof reject === 'function') {
          this._rejectionCallback = reject;
        }
      }
    }, {
      key: 'catch',
      value: function _catch(fn) {
        return this.then(undefined, fn);
      }
    }, {
      key: 'resolve',
      value: function resolve(value) {
        return this._fullfill(value);
      }
    }, {
      key: 'reject',
      value: function reject(reason) {
        return this._reject(reason);
      }
    }, {
      key: '_invokeResolver',
      value: function _invokeResolver() {
        this.promiseResolver(this._fullfill.bind(this), this._reject.bind(this));
      }
    }, {
      key: '_fullfill',
      value: function _fullfill(value) {
        var _this = this;

        this._fullfilledValue = value;

        this.setResolved();

        if (this._fullfillCallback) {
          var result = this.settlePromise();

          if (isPromise(result)) {
            return result.then(function (newValue) {
              return _this.nextPromise.resolve(newValue);
            });
          } else {
            return this.nextPromise.resolve(result);
          }
        }
      }
    }, {
      key: '_reject',
      value: function _reject(reason) {
        var _this2 = this;

        this._rejectReason = reason;
        this.setRejected();

        if (this._rejectionCallback) {
          var result = void 0,
              error = void 0;

          try {
            result = this.settlePromise();
          } catch (err) {
            error = err;
          }

          if (isPromise(result)) {
            return result.then(function (value) {
              return _this2.nextPromise.resolve(value);
            });
          } else {
            if (error) {
              return this.nextPromise.reject(error);
            } else {
              return this.nextPromise.resolve(result);
            }
          }
        }
      }
    }, {
      key: 'settlePromise',
      value: function settlePromise() {
        if (this._state === Promise.PROMISE_STATE.RESOLVED) {
          return this._fullfillCallback && this._fullfillCallback(this._fullfilledValue);
        }

        if (this._state === Promise.PROMISE_STATE.REJECTED) {
          if (this._rejectionCallback) {
            return this._rejectionCallback(this._rejectReason);
          }
        }
      }
    }, {
      key: 'setResolved',
      value: function setResolved() {
        this._state = Promise.PROMISE_STATE.RESOLVED;
      }
    }, {
      key: 'setRejected',
      value: function setRejected() {
        this._state = Promise.PROMISE_STATE.REJECTED;
      }
    }, {
      key: 'isConcluded',
      value: function isConcluded() {
        return [Promise.PROMISE_STATE.RESOLVED, Promise.PROMISE_STATE.REJECTED].includes(this._state);
      }
    }], [{
      key: 'PROMISE_STATE',
      get: function get() {
        return PROMISE_STATE;
      }
    }]);

    return Promise;
  }();

  return Promise;
}();

exports.default = ArdiPromise;