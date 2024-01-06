/**
 * This is the mockup of the code that compiler.js should generates from `source.js`
 *
 * It will be further transformed and output into several packages based on topology.js configuration file
 *
 * All functions must be asyncronous end always await the result from other functions
 * This is done because we don't know where they will be executed and how long it will take
 */
import borderless from "./borderless.js";
import environment from "./environment.js";

const register = borderless.register(environment);

const grog = register("grog", async (a, b, c) => `GROG: ${a} / ${b} / ${c}`);

const blah = register(
  "blah",
  async (a) => (await grog(a, "foo", "bar")) + (await borg(a))
);

const borg = register("borg", async (x) => await smorg(x, 25));

const smorg = register("smorg", async (a, n) => `SMORG: ${a}: ${n * 20}`);

return blah(5);
