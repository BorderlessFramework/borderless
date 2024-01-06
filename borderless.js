/**
 * Core version of borderless framework
 *
 * It will be transpiled to work in each individual environment
 */
export const LOCAL = "local";
export const UPSTREAM = "upstream";

function execOrUpstream(topology, name, code) {
  const whereToRun = topology.getExecutionModel(name);
  if (whereToRun && whereToRun.type === LOCAL) {
    return code;
  }

  if (whereToRun && whereToRun.type === UPSTREAM) {
    return async (...params) => {
      // call upstream for same results
      const response = await fetch(whereToRun.url(name), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow",
        body: JSON.stringify(params),
      });

      return response.json();
    };
  }

  console.error("Unknown execution model in provided topology");
}

function register(topology) {
  return (name, code) => execOrUpstream(topology, name, code);
}

export class BorderlessEnvironment {
  constructor(name, config, src, buildOutputFolder, boilerplate, buildCommand) {
    this.name = name;
    this.config = config;
    this.src = src;
    this.buildOutputFolder = buildOutputFolder;
    this.boilerplate = boilerplate;
    this.buildCommand = buildCommand;
  }
}

export class BorderlessTopology {
  constructor(environments, packages = []) {
    this.packages = packages.reduce((dictionary, pkg) => {
      dictionary[pkg.name] = pkg;

      return dictionary;
    }, {});

    this.environments = environments.reduce((dictionary, environment) => {
      dictionary[environment.name] = environment;

      if (environment.config.package) {
        // package in the environment definition can either be an ID
        // or direct reference to package object
        if (typeof environment.config.package === "string") {
          this.packages[environment.config.package].addEnvironment(environment);
        } else {
          environment.config.package.addEnvironment(environment);
        }
      } else {
        // add a package wrapper for single-environment deployments
        this.packages[environment.name] = new BorderlessPackage(
          environment.name,
          { deploy: environment.config.deploy },
          [environment]
        );
      }

      return dictionary;
    }, {});
  }
}

export class BorderlessPackage {
  constructor(name, config, environments = []) {
    this.name = name;
    this.config = config;
    this.environments = environments;
  }

  getDeployCommand(config) {
    if (this.config.buildCommand) {
      return this.config.buildCommand;
    } else {
      return this.environments[0].config.buildCommand;
    }
  }

  addEnvironment(environment) {
    this.environments.push(environment);
  }
}

export default register;
