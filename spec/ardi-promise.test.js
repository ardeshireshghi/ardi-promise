'use strict';

import {expect} from 'chai';
import {default as Promise} from '../src/ardi-promise';
import sinon from 'sinon';

describe('ardi-promise', () => {
  describe('#constructor', () => {
    let promise;

    before(() => {
      promise = new Promise(() => {});
    })

    it('should create a promise instance', () => {
      expect(promise).to.be.instanceOf(Promise);
    });
  });

  describe('#resolver', () => {
    let resolver, promise;

    before(() => {
      resolver = sinon.spy();
      promise = new Promise(resolver);
    });

    it('should call the resolver with resolve reject functions', () => {
      expect(resolver.calledOnce).to.be.true;
      expect(resolver.getCall(0).args.length).to.equal(2);
      expect(resolver.getCall(0).args[0]).to.be.a('function')
      expect(resolver.getCall(0).args[1]).to.be.a('function')
    });
  });

  describe('#then', () => {
    it('should call the "then" function with result when the promise is resolved', (done) => {
      let resolver, promise;
      let promiseResult = 'successful result';

      resolver = sinon.spy();
      promise = new Promise((resolve) => {
        resolve(promiseResult);
      }).then((result) => {
        expect(result).to.equal(promiseResult);
        done();
      })
    });

    it('should call the "then" function with result when the promise is resolved async', (done) => {
      let promiseResult = 'successful result';

      new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(promiseResult);
        }, 300);
      }).then((result) => {
        expect(result).to.equal(promiseResult);
        done();
      })
    });

    it('should call the non-chained "then" function with result when the promise is resolved', (done) => {
      let resolver, promise;
      let promiseResult = 'successful result';

      promise = new Promise((resolve, reject) => {
        resolve(promiseResult);
      });

      promise.then((result) => {
        expect(result).to.equal(promiseResult);
        done();
      })
    });

    it('should not invoke the non-chained "then" function with result when the promise is resolved', (done) => {
      let promise;
      let spy = sinon.spy();

      promise = new Promise((_, reject) => {
        reject(new Error('some error'));
      });

      promise
        .then(spy)
        .catch(() => {
          expect(spy.called).to.be.false;
          done();
        });
    });

    it('should throw error when none functions are passed', (done) => {
      let resolver, promise;
      let spy = sinon.spy();

      try {
        promise = new Promise((resolve, reject) => {
          resolve('success');
        })
        .then('notafunction');
      } catch(err) {
        expect(err).to.be.instanceOf(Error);
        done();
      }
    });
  });

   describe('#catch', () => {
    it('should call the "catch" function with error when the promise is rejected', (done) => {
      let resolver, promise;
      let promiseError = new Error('unsuccessful promise');

      promise = new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(promiseError);
        }, 300);
      }).catch((error) => {
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.equal('unsuccessful promise');
        done();
      })
    });

    it('should call the none chained "catch" function with error when the promise is rejected', (done) => {
      let resolver, promise;
      let promiseError = new Error('unsuccessful promise');

      promise = new Promise((resolve, reject) => {
        reject(promiseError);
      });

      promise.catch((error) => {
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.equal('unsuccessful promise');
        done();
      })
    });

    it('should not call "catch" function when the promise is resolved', (done) => {
      let resolver, promise;
      let promiseResult = 'successful result';
      let rejectSpy = sinon.spy();

      promise = new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(promiseResult);
        }, 300);
      })
      .then((result) => {
        expect(rejectSpy.called).to.be.false;
        done();
      })
      .catch(rejectSpy);
    });
  });

  describe('Multiple chained promises', () => {
    it('should go through the chain correcly', (done) => {
      const promise1 = () => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(10);
          }, 100);
        });
      };

      const promise2 = (number) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(number * 10);
          }, 100);
        });
      };

      const noPromise = (number) => {
        return number + 1;
      };

      const promise3 = (number) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(number * 10);
          }, 100);
        });
      };

      promise1()
        .then((res) => {
          expect(res).to.equal(10);
          return promise2(res).then((res) => {
            expect(res).to.equal(100);
            return res * 2;
          });
        })
        .then(noPromise)
        .then(promise3)
        .then((res) => {
          expect(res).to.equal(2010);
          done();
        });
    });

    describe('when error handler returns a value', () => {
      it('should result into a resolved promise', (done) => {
        new Promise((_, reject) => reject(new Error('haha')))
          .catch(() => {
            return 'nice';
          })
          .then(res => {
            return `${res} work`;
          })
          .then(finalResult => {
            expect(finalResult).to.equal('nice work');
            done();
          });
      });
    });

    describe('when error handler throws an error', () => {
      it('should result into a resolved promise', (done) => {
        new Promise((_, reject) => reject(new Error('haha')))
          .catch((err) => {
            throw new Error('More haha');
          })
          .then(res => {
            return `${res} work`;
          })
          .catch(err => {
            expect(err).to.be.instanceOf(Error);
            expect(err.message).to.equal('More haha');
            done();
          });
      });
    });
  });
});
