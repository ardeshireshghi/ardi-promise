'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ArdiPromise = function () {
  var PROMISE_STATE = {
    PENDING: 'pending',
    RESOLVED: 'resolved',
    REJECTED: 'rejected'
  };

  var Promise = function () {
    function Promise(promiseResolver) {
      _classCallCheck(this, Promise);

      if (typeof promiseResolver !== 'function') {
        throw new Error('Promise resolver ' + promiseResolver + ' should be function');
      }

      this._state = Promise.PROMISE_STATE.PENDING;
      this._resolveFromResolver(promiseResolver);
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
        if (didFullfill) {
          if (this._state === Promise.PROMISE_STATE.RESOLVED) {
            didFullfill(this._fullfilledValue);
          } else if (Promise.PROMISE_STATE.PENDING) {
            console.log('came here');
            this.setCallbacks(didFullfill, didReject);
          }
        } else if (didReject) {
          if (this._state === Promise.PROMISE_STATE.REJECTED) {
            didReject(this._rejectReason);
          } else {
            this.setCallbacks(didFullfill, didReject);
          }
        }

        return this;
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
      key: '_resolveFromResolver',
      value: function _resolveFromResolver(promiseResolver) {
        var _this = this;

        this._execute(promiseResolver, function (value) {
          _this._resolveCallback(value);
        }, function (reason) {
          _this._rejectCallback(reason);
        });
      }
    }, {
      key: '_resolveCallback',
      value: function _resolveCallback(value) {
        this._fullfill(value);
      }
    }, {
      key: '_rejectCallback',
      value: function _rejectCallback(reason) {
        this._reject(reason);
      }
    }, {
      key: '_fullfill',
      value: function _fullfill(value) {
        this._fullfilledValue = value;
        this.setResolved();
        this.settlePromise();
      }
    }, {
      key: '_reject',
      value: function _reject(reason) {
        this._rejectReason = reason;
        this.setRejected();
        this.settlePromise();
      }
    }, {
      key: 'settlePromise',
      value: function settlePromise() {
        if (this._state === Promise.PROMISE_STATE.RESOLVED) {
          if (this._fullfillCallback) {
            this._fullfillCallback(this._fullfilledValue);
          }
        } else if (this._state === Promise.PROMISE_STATE.REJECTED) {
          if (this._rejectionCallback) {
            this._rejectionCallback(this._rejectReason);
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
      key: '_execute',
      value: function _execute(executer, fullfill, reject) {
        executer(fullfill, reject);
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