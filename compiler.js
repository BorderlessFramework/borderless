import fs from "fs";

import babel from "@babel/core";

if (process.argv.length < 3) {
  throw "Usage: node compiler.js <source> <compiled>";
}

const source = process.argv[2];
const compiled = process.argv[3];

const code = fs.readFileSync(source, { encoding: "utf8" });

// parse the code -> ast
var result = babel.transform(
  code,
  {
    plugins: ["./borderless_babel_plugin"],
  },
  function (err, result) {
    console.log(result.code);
    fs.writeFileSync(compiled, result.code, "utf8");
  }
);
