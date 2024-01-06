/**
 * This is code compiled from /source.js using "main_thread" module
 * for execution on the main thread of the browser
 */

const register = borderless.register(environment);

const grog = register("grog", async (a, b, c) => `GROG: ${a} / ${b} / ${c}`);

const blah = register(
  "blah",
  async (a) => (await grog(a, "foo", "bar")) + " eats " + (await borg(a))
);

const borg = register("borg", async (x) => await smorg(x, 25));

const smorg = register("smorg", async (a, n) => `SMORG: ${a}: ${n * 20}`);

blah(5).then((res) => {
  const el = document.getElementById("output");
  el.innerHTML = res;
});
