/**
 * This is code compiled from /source.js using "node" module
 * for execution inside the node server
 */

import borderless from "./borderless.js";
import environment from "./environment.js";

const register = borderless(environment);

const grog = register("grog", async (a, b, c) => `GROG: ${a} / ${b} / ${c}`);

const blah = register(
  "blah",
  async (a) => (await grog(a, "foo", "bar")) + " eats " + (await borg(a))
);

const borg = register("borg", async (x) => await smorg(x, 25));

const smorg = register("smorg", async (a, n) => `SMORG: ${a}: ${n * 20}`);

export default async (name, params) => {
  const funcs = {
    grog,
    blah,
    borg,
    smorg,
  };

  return funcs[name](params);
};
