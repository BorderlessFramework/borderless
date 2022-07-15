/**
 * environment generated based on /topology.js
 *
 * It is to be used in the node process
 * (e.g. uses modules to import and export values
 *
 * This environment terminates all the calls locally
 * and does not have an upstream
 */
import { LOCAL } from "./borderless.js";

export default {
  getExecutionModel: () => {
    return { type: LOCAL };
  },
};
