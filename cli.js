#!/usr/bin/env node

import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

import path from "path";
import fse from "fs-extra";
import glob from "glob";
import { fileURLToPath } from "node:url";

import { spawnSync } from "child_process";

import babel from "@babel/core";
import { exit } from "process";

const DEFAULT_SRC_FOLDER = "src/";
const DEFAULT_PATTERN = "**/*.js";
const DEFAULT_INST_FOLDER = "inst/";
const DEFAULT_TOPOLOGY = "topology.js";

const DEFAULT_BUILD_FOLDER = "build/";

const DEFAULT_DIST_FOLDER = "dist/";

yargs(hideBin(process.argv))
  .command(
    "instrument",
    "instrument the source code",
    (yargs) => {
      return yargs
        .option("src", {
          describe: "folder to read source code from",
          default: DEFAULT_SRC_FOLDER,
        })
        .option("pattern", {
          describe: "pattern that defines which files to include",
          default: DEFAULT_PATTERN,
        })
        .option("inst", {
          describe: "name for the instrumented output folder",
          default: DEFAULT_INST_FOLDER,
        });
    },
    async (argv) => {
      if (argv.verbose) {
        console.info(
          `Instrumenting the code in ${argv.src}/${argv.pattern} and outputting it into ${argv.inst}.\n`
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
          default: DEFAULT_INST_FOLDER,
        })
        .option("build", {
          describe: "name for the build folder",
          default: DEFAULT_BUILD_FOLDER,
        });
    },
    async (argv) => {
      if (argv.verbose) {
        console.log(
          `Generating environments ${argv.inst} -> ${argv.build} using ${argv.topology} topology file\n`
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
          default: DEFAULT_BUILD_FOLDER,
        });
    },
    async (argv) => {
      if (argv.verbose) {
        console.log(
          `Building code in all environments within ${argv.build} using ${argv.topology} topology file\n`
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
          default: DEFAULT_BUILD_FOLDER,
        })
        .option("dist", {
          describe: "name for the output folder",
          default: DEFAULT_DIST_FOLDER,
        });
    },
    async (argv) => {
      if (argv.verbose) {
        console.log(
          `Packing environments ${argv.build} -> ${argv.dist} using ${argv.topology}\n`
        );
      }

      await pack(argv.topology, argv.build, argv.dist);
    }
  )
  .command(
    "deploy",
    "deploys all the packages to their destinations",
    (yargs) => {
      return yargs
        .option("topology", {
          describe: "topology file name",
          default: DEFAULT_TOPOLOGY,
        })
        .option("dist", {
          describe: "name for the output folder",
          default: DEFAULT_DIST_FOLDER,
        });
    },
    async (argv) => {
      if (argv.verbose) {
        console.info(
          `deploys all the packages from ${argv.dist} folder to their destinations using ${argv.topology}\n`
        );
      }

      await deploy(argv.topology, argv.dist);
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

      await instrument(
        DEFAULT_SRC_FOLDER,
        DEFAULT_PATTERN,
        DEFAULT_INST_FOLDER
      );
      await generate(
        DEFAULT_TOPOLOGY,
        DEFAULT_INST_FOLDER,
        DEFAULT_BUILD_FOLDER
      );
      await build(DEFAULT_TOPOLOGY, DEFAULT_BUILD_FOLDER);
      await pack(DEFAULT_TOPOLOGY, DEFAULT_BUILD_FOLDER, DEFAULT_DIST_FOLDER);
      await deploy(DEFAULT_DIST_FOLDER);
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

  const topology = await getTopology(topologyFilename);

  Object.values(topology.environments).forEach(async (env) => {
    let destinationPaths = [buildFolder, env.name];

    // folder where to keep all output for this environment
    let buildRoot = path.resolve(...destinationPaths);

    if (env.boilerplate) {
      fse.copySync(env.boilerplate, buildRoot);
    }

    // relative path where to copy instrumented code into
    let buildSrc = path.resolve(buildRoot, env.src);

    fse.copySync(instFolder, buildSrc);
  });
}

async function build(topologyFilename, buildFolder) {
  const topology = await getTopology(topologyFilename);

  Object.values(topology.environments).forEach(async (env) => {
    let destinationPaths = [buildFolder, env.name];

    // folder where to run the build command
    let buildRoot = path.resolve(...destinationPaths);

    if (env.buildCommand) {
      console.info(
        `${env.name}: Executing '${env.buildCommand}' in ${buildRoot}`
      );

      const child = spawnSync(env.buildCommand, {
        stdio: "inherit",
        shell: true,
        cwd: buildRoot,
      });
    } else {
      console.info(`${env.name}: No build command. Skipping...`);
    }
  });
}

async function pack(topologyFilename, buildFolder, distFolder) {
  console.log(`Removing ${distFolder} if it exists.`);
  fse.removeSync(distFolder);

  const topology = await getTopology(topologyFilename);

  Object.values(topology.packages).forEach((pkg) => {
    const distRoot = [distFolder, pkg.name];
    console.info(`${pkg.name} (${path.resolve(...distRoot)}: -`);

    Object.values(pkg.environments).forEach((env) => {
      const buildPaths = [buildFolder, env.name];
      const distPaths = [distFolder, pkg.name];

      // if environment defined a path, add it
      if (env.config.path) {
        distPaths.push(env.config.path);
      }

      if (env.buildOutputFolder) {
        buildPaths.push(env.buildOutputFolder);
      }

      // folder with output of the module build
      let buildOutputRoot = path.resolve(...buildPaths);

      // folder where to keep all output for this environment
      let packRoot = path.resolve(...distPaths);

      fse.copySync(buildOutputRoot, packRoot);

      console.info(`  ${packRoot} -> ${env.name}`);
    });
  });
}

async function deploy(topologyFilename, distFolder) {
  const topology = await getTopology(topologyFilename);

  const deployments = [];

  topology.environments.forEach(async (env) => {
    let depPaths = [distFolder];
    let depModuleType;
    let depName;
    let depConfig;

    // if environment outputs into a packlage,
    // use it instead of the environment
    if (env.package) {
      const targetPackage = topology.packages.find(
        (pkg) => pkg.name === env.package
      );

      depPaths.push(targetPackage.name);
      depModuleType = targetPackage.type;
      depName = targetPackage.name;
      depConfig = targetPackage.deploy;
    } else {
      depPaths.push(env.name);
      depModuleType = env.type;
      depName = env.name;
      depConfig = env.deploy;
    }

    deployments[depName] = {
      name: depName,
      root: path.resolve(...depPaths),
      type: depModuleType,
      config: depConfig,
    };
  });

  Object.values(deployments).forEach(async (dep) => {
    const depModule = (await import(dep.type)).default(dep);

    // deploy command to use
    let command = depModule.getDeployCommand(dep.config);

    if (command) {
      console.info(`${dep.name}: Executing '${command}' in ${dep.root}`);

      const child = spawnSync(command, {
        stdio: "inherit",
        shell: true,
        cwd: dep.root,
      });
    } else {
      console.error(`${dep.name}: No deploy command. Skipping...`);
    }
  });
}

// helper function for loading topologies
async function getTopology(topologyFilename) {
  const resolvedTopologyFilename = path.resolve(topologyFilename);
  const imports = await import(resolvedTopologyFilename);
  const topology = imports.default;
  return topology;
}
