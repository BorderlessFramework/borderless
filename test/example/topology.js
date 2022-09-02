import HTMLEnvironment from "@borderlessjs/env-html";
import MainThreadEnvironment from "@borderlessjs/env-main-thread";
import NodeEnvironment from "@borderlessjs/env-node";

const MY_NODE_BACKEND_ID = "my-node-backend";
const MY_MAIN_THREAD_ID = "my-app-in-browser";

export default {
  packages: [
    {
      name: "main-site",
      type: "@borderlessjs/env-node",
      deploy: {
        host: "www.mysite.com",
        provider: "gcloud",
      },
    },
  ],
  environments: [
    new HTMLEnvironment("static-html-page", {
      package: "main-site",
      upstream: MY_MAIN_THREAD_ID,
      path: "pub/",
    }),
    new MainThreadEnvironment(MY_MAIN_THREAD_ID, {
      local: ["blah", "glog"],
      upstream: MY_NODE_BACKEND_ID,
      package: "main-site",
      path: "pub/js/",
    }),
    new NodeEnvironment(MY_NODE_BACKEND_ID, {
      input: {
        url: (name) => `/backend/${name}`,
        serialization: "json",
        method: "post",
      },
      package: "main-site",
      path: "server/",
    }),
    new NodeEnvironment("another-node-backend", {
      input: {
        url: (name) => `/another/${name}`,
        serialization: "json",
        method: "post",
      },
      deploy: {
        host: "another.mysite.com",
        provider: "aws",
      },
    }),
  ],
};
