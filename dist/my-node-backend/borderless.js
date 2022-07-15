/**
 * Node version of borderless framework
 *
 * (@TODO compile this from main framework)
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

export default register;
