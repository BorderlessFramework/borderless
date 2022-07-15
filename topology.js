/**
 * This is the configuration file that defines the topology
 *
 * Build tooling will be using this to compile source.js into
 * multiple environments saving them into dist folder.
 *
 * Each type of the environment will use it's own version of the code
 *
 * It will also be deployed differently based on each environment's 'deploy'
 * configuration or combined as packages and deployed based on package config
 * (currently all 3 are "deployed" together to a server.js node server)
 */
module.exports = {
  packages: {
    name: "main-site",
    deploy: {
      type: "node",
      host: "www.mysite.com",
    },
  },
  environments: [
    {
      name: "static-html-page",
      type: "html",
      package: "main-site",
    },
    {
      name: "my-app-in-browser",
      type: "main_thread",
      local: ["blah", "glog"],
      upstream: "my-node-backend",
    },
    {
      name: "my-node-backend",
      type: "node",
      input: {
        url: (name) => `/backend/${name}`,
        serialization: "json",
        method: "post",
      },
      package: "main-site",
    },
  ],
};
