~/*
  Miscellaneous utilities
*/function() {
'use strict';

const util = Object.freeze({
  /**
   * Promise-calls a function with the specified arguments.
   */
  promiseCall(f, ...args) {
    return Promise.resolve().then(f.bind(null, args));
  },

  /**
   * A throttling decorator that will make the first call immediately, and make
   * final call within the next interval when that interval has elapsed.
   * Calls in between will be dropped (and their result promises rejected).
   */
  throttled(interval, f) {
    console.assert(typeof f === 'function');
    console.assert(typeof interval === 'number');

    let nextPotentialCallTimeoutId = null;
    let nextCall = null;

    function executeCall(...args) {
      // Prepare to execute next potential call.
      nextPotentialCallTimeoutId = setTimeout(() => {
        nextPotentialCallTimeoutId = null;

        if (nextCall !== null) {
          const call = nextCall;
          nextCall = null;
          call.resolve(executeCall(call.args));
        }
      }, interval);

      // Then execute this one.
      return util.promiseCall(f, ...args);
    }

    return (...args) => new Promise(resolve => {
      if (nextPotentialCallTimeoutId === null) {
        // Not throttled -- execute immediately.
        resolve(executeCall(...args));
      } else {
        // Throttled.
        if (nextCall !== null) {
          // Cancel latest potential next call, if it exists.
          nextCall.resolve(Promise.reject(new Error('call throttled')));
        }
        // Then set the new potential next call.
        nextCall = {
          resolve: resolve,
          args: args
        };
      }
    });
  }
});

window.util = util;

}();
