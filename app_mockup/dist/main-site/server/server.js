/**
 * This is a temporary server to test html, main_thread and node environments
 *
 * - HTML/main_thread server serves static files to the client
 *   and forwards the rest of the requests to the "node" backend
 * - node server deserializes the payload, executes the function requested
 *   and sends serialized result back
 *
 * In the future, each module will have it's own server and deployment process
 */
import express from "express";

import handler from "./app.js";

const app = express();
const port = 3000;

app.use(express.static("pub/"));

app.use(express.json());

app.post("/backend/:name", async (req, res) => {
  const func = req.params.name;
  const params = req.body;

  const result = await handler(func, params);

  res.json(result);
});

app.listen(port, () => {
  console.log(`Borderless server on port ${port}`);
  console.log(`http://localhost:${port}/`);
});
