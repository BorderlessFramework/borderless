#!/usr/bin/env node

import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

import path from "path";
import fse from "fs-extra";
import glob from "glob";
import { fileURLToPath } from "node:url";

import { spawnSync } from "child_process";

import babel from "@babel/core";

const DEFAULT_SRC = "src/";
const DEFAULT_PATTERN = "**/*.js";
const DEFAULT_INST = "inst/";
const DEFAULT_TOPOLOGY = "topology.js";

const DEFAULT_BUILD = "build/";

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
    "generate",
    "create packages for each environment listed in topology file",
    (yargs) => {
      return yargs
        .option("topology", {
          describe: "topology file name",
          default: DEFAULT_TOPOLOGY,
        })
        .option("inst", {
          describe: "name for the instrumented folder",
          default: DEFAULT_INST,
        })
        .option("build", {
          describe: "name for the build folder",
          default: DEFAULT_BUILD,
        });
    },
    async (argv) => {
      if (argv.verbose) {
        console.info(
          `generate build directories with code from ${argv.inst} for each environment listed in topology file and output them into ${argv.build}\n`
        );
      }

      await generate(argv.topology, argv.inst, argv.build);
    }
  )
  .command(
    "build",
    "executes build scripts for each of the environment listed in topology file",
    (yargs) => {
      return yargs
        .option("topology", {
          describe: "topology file name",
          default: DEFAULT_TOPOLOGY,
        })
        .option("build", {
          describe: "name for the build folder",
          default: DEFAULT_BUILD,
        });
    },
    async (argv) => {
      if (argv.verbose) {
        console.info(
          `build the code for each generated environment in ${argv.build} listed in ${argv.topology} topology file\n`
        );
      }

      await build(argv.topology, argv.build);
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
        .option("build", {
          describe: "name for the build folder",
          default: DEFAULT_BUILD,
        })
        .option("dist", {
          describe: "name for the output folder",
          default: DEFAULT_DIST,
        });
    },
    async (argv) => {
      if (argv.verbose) {
        console.info(
          `package the code for each environment in ${argv.build} listed in ${argv.topology} topology file and output it into ${argv.dist}\n`
        );
      }

      await pack(argv.topology, argv.build, argv.dist);
    }
  )
  .command(
    "version",
    "Logs version of the CLI and borderless package",
    (yargs) => {
      return yargs;
    },
    async (argv) => {
      const rawPackageJSON = fse.readFileSync(
        fileURLToPath(new URL("package.json", import.meta.url)),
        "utf-8"
      );
      const packageJSON = JSON.parse(rawPackageJSON);
      console.info(
        `@borderlessjs/borderless package and cli version: ${packageJSON.version}`
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
      await generate(DEFAULT_TOPOLOGY, DEFAULT_INST, DEFAULT_BUILD);
      await build(DEFAULT_TOPOLOGY, DEFAULT_BUILD);
      await pack(DEFAULT_TOPOLOGY, DEFAULT_BUILD, DEFAULT_DIST);
    }
  )
  .option("verbose", {
    alias: "v",
    type: "boolean",
    description: "Run with verbose logging\n",
  })
  .strict()
  .help().argv;

async function instrument(source, pattern, instFolder) {
  console.log(`Removing ${instFolder} if it exists.`);
  fse.removeSync(instFolder);

  console.log(`Running instrumentation ${source} -> ${instFolder}`);

  const files = glob.sync(pattern, {
    cwd: source,
  });

  let promises = files.map(
    (file) =>
      new Promise((resolve, reject) => {
        const input_filename = path.resolve(source, file);
        const output_filename = path.resolve(instFolder, file);

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

async function generate(topologyFilename, instFolder, buildFolder) {
  console.log(`Removing ${buildFolder} if it exists.`);
  fse.removeSync(buildFolder);

  console.log(
    `Generating environments ${instFolder} -> ${buildFolder} using ${topologyFilename} topology file\n`
  );

  const topology = await getTopology(topologyFilename);

  topology.environments.forEach(async (env) => {
    let destinationPaths = [buildFolder, env.name];

    const borderlessModule = (await import(env.type)).default(env);

    // folder with  boilerplate code for the module
    let boilerplate = borderlessModule.boilerplate;

    // folder where to keep all output for this environment
    let buildRoot = path.resolve(...destinationPaths);

    if (boilerplate) {
      fse.copySync(boilerplate, buildRoot);
    }

    // relative path where to copy instrumented code into
    let buildSrc = path.resolve(buildRoot, borderlessModule.src);

    fse.copySync(instFolder, buildSrc);
  });
}

async function build(topologyFilename, buildFolder) {
  console.log(
    `Building code in all environments within ${buildFolder} using ${topologyFilename} topology file\n`
  );

  const topology = await getTopology(topologyFilename);

  topology.environments.forEach(async (env) => {
    let destinationPaths = [buildFolder, env.name];

    const borderlessModule = (await import(env.type)).default(env);

    // build command to use
    let buildCommand = borderlessModule.buildCommand;

    // folder where to run the build command
    let buildRoot = path.resolve(...destinationPaths);

    if (buildCommand) {
      console.info(`${env.name}: Executing '${buildCommand}' in ${buildRoot}`);

      const child = spawnSync(buildCommand, {
        stdio: "inherit",
        shell: true,
        cwd: buildRoot,
      });
    } else {
      console.info(`${env.name}: No build command. Skipping...`);
    }
  });
}

async function pack(topologyFilename, buildFolder, dist) {
  console.log(`Removing ${dist} if it exists.`);
  fse.removeSync(dist);

  console.log(
    `Packing environments ${buildFolder} -> ${dist} using ${topologyFilename}\n`
  );

  const topology = await getTopology(topologyFilename);

  topology.environments.forEach(async (env) => {
    let buildPaths = [buildFolder, env.name];
    let distPaths = [dist];

    // if environment outputs into a packlage use it
    // instead of environment name
    if (env.package) {
      const targetPackage = topology.packages.find(
        (pkg) => pkg.name === env.package
      );

      distPaths.push(targetPackage.name);
    } else {
      distPaths.push(env.name);
    }

    // if environment defined a path, add it
    if (env.path) {
      distPaths.push(env.path);
    }

    const borderlessModule = (await import(env.type)).default(env);

    if (borderlessModule.buildOutputFolder) {
      buildPaths.push(borderlessModule.buildOutputFolder);
    }

    // folder with output of the module build
    let buildOutputFolder = path.resolve(...buildPaths);

    // folder where to keep all output for this environment
    let packRoot = path.resolve(...distPaths);

    fse.copySync(buildOutputFolder, packRoot);

    console.info(`${env.name}: Output in ${packRoot}`);
  });
}

async function getTopology(topologyFilename) {
  const resolvedTopologyFilename = path.resolve(topologyFilename);
  const imports = await import(resolvedTopologyFilename);
  const topology = imports.default;
  return topology;
}
