/**
 * Environment generated based on /topology.js
 *
 * It is to be used the main thread on the browser
 * (e.g. sets a global "environment" constant to be used in the app code
 * and expects a global LOCAL constant to be provided by borderless.js)
 *
 * This environment terminates "blag" and "grog" calls locally
 * and forwards the rest of the calls to upstream
 */
const environment = {
  getExecutionModel: (name) => {
    if (name === "blah" || name === "grog") {
      return { type: LOCAL };
    }

    return {
      type: UPSTREAM,
      url: (name) => `/backend/${name}`,
    };
  },
};
