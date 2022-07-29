#!/usr/bin/env node

import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

import path from "path";
import fse from "fs-extra";
import glob from "glob";

import babel from "@babel/core";

const DEFAULT_SRC = "src/";
const DEFAULT_PATTERN = "**/*.js";
const DEFAULT_INST = "inst/";

const DEFAULT_TOPOLOGY = "topology.js";
const DEFAULT_DIST = "dist/";

yargs(hideBin(process.argv))
  .command(
    "instrument",
    "instrument the source code",
    (yargs) => {
      return yargs
        .option("src", {
          describe: "folder to read source code from",
          default: DEFAULT_SRC,
        })
        .option("pattern", {
          describe: "pattern that defines which files to include",
          default: DEFAULT_PATTERN,
        })
        .option("inst", {
          describe: "name for the instrumented output folder",
          default: DEFAULT_INST,
        });
    },
    async (argv) => {
      if (argv.verbose) {
        console.info(
          `instrument the code in ${argv.src}/${argv.pattern} and output it into ${argv.inst}.\n`
        );
      }
      await instrument(argv.src, argv.pattern, argv.inst);
    }
  )
  .command(
    "pack",
    "create packages for each environment listed in topology file",
    (yargs) => {
      return yargs
        .option("topology", {
          describe: "topology file name",
          default: DEFAULT_TOPOLOGY,
        })
        .option("inst", {
          describe: "name for the instrumented output folder",
          default: DEFAULT_INST,
        })
        .option("dist", {
          describe: "name for the output folder",
          default: DEFAULT_DIST,
        });
    },
    async (argv) => {
      if (argv.verbose) {
        console.info(
          `package the code in ${argv.inst} for each environment listed in topology file and output it into ${argv.dist}\n`
        );
      }

      await pack(argv.topology, argv.inst, argv.dist);
    }
  )
  .command(
    "version",
    "Logs version of the CLI and borderless package",
    (yargs) => {
      return yargs;
    },
    async (argv) => {
      const rawdata = fse.readFileSync(
        new URL("package.json", import.meta.url),
        "utf-8"
      );
      const package_json = JSON.parse(rawdata);
      console.info(
        `@borderlessjs/borderless package and cli version: ${package_json.version}`
      );
    }
  )
  .command(
    "$0",
    "borderless cli is used to compile an instrumented version of the source code and pack it for environments listed in topology file in your project",
    (yargs) => {
      return yargs;
    },
    async (argv) => {
      if (argv.verbose) {
        console.info(`Instrument and pack with default folders/files\n`);
      }

      await instrument(DEFAULT_SRC, DEFAULT_PATTERN, DEFAULT_INST);
      await pack(DEFAULT_TOPOLOGY, DEFAULT_INST, DEFAULT_DIST);
    }
  )
  .option("verbose", {
    alias: "v",
    type: "boolean",
    description: "Run with verbose logging\n",
  })
  .strict()
  .help().argv;

async function instrument(source, pattern, inst) {
  console.log(`Removing ${inst} if it exists.`);
  fse.removeSync(inst);

  console.log(`Running instrumentation ${source} -> ${inst}`);

  const files = glob.sync(pattern, {
    cwd: source,
  });

  let promises = files.map(
    (file) =>
      new Promise((resolve, reject) => {
        const input_filename = path.resolve(source, file);
        const output_filename = path.resolve(inst, file);

        // parse the code -> ast
        babel
          .transformFileAsync(input_filename, {
            plugins: ["@borderlessjs/babel-plugin"],
          })
          .then((result) => {
            console.log(`${input_filename} -> ${output_filename}`);
            fse.outputFileSync(output_filename, result.code, "utf8");

            resolve();
          })
          .catch(reject);
      })
  );

  return Promise.all(promises);
}

async function pack(topology, inst, dist) {
  console.log(`Removing ${dist} if it exists.`);
  fse.removeSync(dist);

  console.log(`Packing environments ${inst} -> ${dist} using ${topology}\n`);
  fse.copySync(inst, dist);
}
