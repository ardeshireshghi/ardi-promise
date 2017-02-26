'use strict';

const ArdiPromise = (() => {
  const PROMISE_STATE = {
    PENDING   : 'pending',
    RESOLVED  : 'resolved',
    REJECTED  : 'rejected'
  };

  class Promise {
    constructor(promiseResolver) {
      if (typeof promiseResolver !== 'function') {
        throw new Error(`Promise resolver ${promiseResolver} should be function`);
      }

      this._state = Promise.PROMISE_STATE.PENDING;
      this._fullfillCallbacks = [];
      this._rejectCallbacks = [];
      this._resolveFromResolver(promiseResolver);
    }

    static get PROMISE_STATE() {
      return PROMISE_STATE;
    }

    then(didFullfill, didReject) {
      if (typeof didFullfill !== 'function' && typeof didReject !== 'function') {
        throw new Error('then() only accepts functions');
      }

      return this._then(didFullfill, didReject);
    }

    _then(didFullfill, didReject) {
      if (didFullfill) {
        if (this._state === Promise.PROMISE_STATE.RESOLVED) {
          didFullfill(this._fullfilledValue);
        } else if (Promise.PROMISE_STATE.PENDING) {
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

    setCallbacks(fullfill, reject) {
      if (typeof fullfill === 'function') {
        if (!this._fullfillCallback0) {
          this._fullfillCallback0 = fullfill;
        }

        this._fullfillCallbacks.push(fullfill);
      }

      if (typeof reject === 'function') {
        if (!this._rejectionCallback0) {
          this._rejectionCallback0 = reject;
        }

        this._rejectCallbacks.push(reject);
      }
    }

    catch(fn) {
      return this.then(undefined, fn);
    }

    _resolveFromResolver(promiseResolver) {
      this._execute(promiseResolver, (value) => {
        this._resolveCallback(value);
      }, (reason) => {
        this._rejectCallback(reason);
      });
    }

    _resolveCallback(value) {
      this._fullfill(value);
    }

    _rejectCallback(reason) {
      this._reject(reason);
    }

    _fullfill(value) {
      this._fullfilledValue = value;
      this.setResolved();
      this.settlePromise();
    }

    _reject(reason) {
      this._rejectReason = reason;
      this.setRejected();
      this.settlePromise();
    }

    settlePromise() {
      if (this._state === Promise.PROMISE_STATE.RESOLVED) {
        if (this._fullfillCallback0) {
          let canBePromise = this._fullfillCallback0(this._fullfilledValue);
          if (this._fullfillCallbacks.length > 1) {
            this._settleCallbacks(canBePromise, 1);
          }
        }
      } else if (this._state === Promise.PROMISE_STATE.REJECTED) {
        if (this._rejectionCallback0) {
          this._rejectionCallback0(this._rejectReason);
        }
      }
    }

    _settleCallbacks(canBePromise, callbackIndex) {
      let callback = this._fullfillCallbacks[callbackIndex];

      let invoke = (value) => {
        let callbackResponse = callback(value);

        if (callbackIndex < this._fullfillCallbacks.length - 1) {
          this._settleCallbacks(callbackResponse, callbackIndex + 1);
        }
      };

      if (canBePromise instanceof Promise) {
          canBePromise.then(invoke);
      } else {
        invoke(canBePromise);
      }
    }

    setResolved() {
      this._state = Promise.PROMISE_STATE.RESOLVED;
    }

    setRejected() {
      this._state = Promise.PROMISE_STATE.REJECTED;
    }

    _execute(executer, fullfill, reject) {
      executer(fullfill, reject);
    }
  }

  return Promise;
})();

export default ArdiPromise;
