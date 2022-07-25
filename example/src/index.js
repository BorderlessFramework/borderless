/**
 * This is the source code that one would write
 *
 * Run `npm run compile` to generate `output.js` file to see how it will be wrapped into registration calls and forced to be asyncronous
 *
 * It will also be further transformed and output into several packages based on topology.js configuration file
 */
const grog = (a, b, c) => `GROG: ${a} / ${b} / ${c}`;

const blah = (a) => grog(a, "foo", "bar") + borg(a);

const borg = (x) => smorg(x, 25);

const smorg = (a, n) => `SMORG: ${a}: ${n * 20}`;

blah(5);
