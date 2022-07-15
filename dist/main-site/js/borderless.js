/**
 * Main thread version of borderless framework
 *
 * (@TODO compile this from main framework)
 */
const LOCAL = "local";
const UPSTREAM = "upstream";

const borderless = {
  execOrUpstream: (topology, name, code) => {
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
  },

  register: (topology) => {
    return (name, code) => borderless.execOrUpstream(topology, name, code);
  },
};
