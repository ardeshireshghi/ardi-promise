const ArdiPromise = (() => {
  const PROMISE_STATE = {
    PENDING   : 'pending',
    RESOLVED  : 'resolved',
    REJECTED  : 'rejected'
  };

  const isPromise = value => typeof value === 'object' && (value instanceof Promise || 'then' in value);
  class Promise {
    constructor(promiseResolver = () => {}) {
      this._state = Promise.PROMISE_STATE.PENDING;
      this.promiseResolver = promiseResolver;

      this._invokeResolver();
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
      this.setCallbacks(didFullfill, didReject);
      this.nextPromise = new Promise();

      if (this.isConcluded()) {
        if (this._state === Promise.PROMISE_STATE.RESOLVED)  {
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

    setCallbacks(fullfill, reject) {
      if (typeof fullfill === 'function') {
        this._fullfillCallback = fullfill;
      }

      if (typeof reject === 'function') {
        this._rejectionCallback = reject;
      }
    }

    catch(fn) {
      return this.then(undefined, fn);
    }

    resolve(value) {
      return this._fullfill(value);
    }

    reject(reason) {
      return this._reject(reason);
    }

    _invokeResolver() {
      this.promiseResolver(this._fullfill.bind(this), this._reject.bind(this));
    }

    _fullfill(value) {
      this._fullfilledValue = value;

      this.setResolved();

      if (this._fullfillCallback) {
        const result = this.settlePromise();

        if (isPromise(result)) {
          return result.then((newValue) => {
            return this.nextPromise.resolve(newValue);
          });
        } else {
          return this.nextPromise.resolve(result);
        }
      }
    }

    _reject(reason) {
      this._rejectReason = reason;
      this.setRejected();

      if (this._rejectionCallback) {
        let result, error;

        try {
          result = this.settlePromise();
        } catch(err) {
          error = err;
        }

        if (isPromise(result)) {
          return result.then((value) => {
            return this.nextPromise.resolve(value);
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

    settlePromise() {
      if (this._state === Promise.PROMISE_STATE.RESOLVED) {
        return this._fullfillCallback && this._fullfillCallback(this._fullfilledValue);
      }

      if (this._state === Promise.PROMISE_STATE.REJECTED) {
        if (this._rejectionCallback) {
          return this._rejectionCallback(this._rejectReason);
        }
      }
    }

    setResolved() {
      this._state = Promise.PROMISE_STATE.RESOLVED;
    }

    setRejected() {
      this._state = Promise.PROMISE_STATE.REJECTED;
    }

    isConcluded() {
      return [
        Promise.PROMISE_STATE.RESOLVED,
        Promise.PROMISE_STATE.REJECTED
      ].includes(this._state);
    }
  }

  return Promise;
})();

export default ArdiPromise;
