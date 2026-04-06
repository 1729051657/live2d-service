"use strict";

/**
 * 本地 Node 服务入口（Vercel 仍直接使用 api/*.js，不受影响）。
 */
const path = require("path");
const express = require("express");
const cors = require("cors");

const port = Number(process.env.PORT) || 3000;
const app = express();

app.disable("x-powered-by");
app.use(cors({ origin: "*" }));

function wrapAsync(handler) {
  return function asyncHandler(req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

const routes = [
  ["/api/model-list", require("./api/model-list.js")],
  ["/api/health", require("./api/health.js")],
  ["/api/next", require("./api/next.js")],
  ["/api/random", require("./api/random.js")],
  ["/api/hitokoto", wrapAsync(require("./api/hitokoto.js"))]
];

for (const [routePath, handler] of routes) {
  app.all(routePath, handler);
}

const LEGACY_EXAMPLE_MODEL = "/models/characters/example-model";
app.use((req, _res, next) => {
  if (req.path === LEGACY_EXAMPLE_MODEL || req.path.startsWith(`${LEGACY_EXAMPLE_MODEL}/`)) {
    req.url = req.url.replace(LEGACY_EXAMPLE_MODEL, "/models/uiharu");
  }
  next();
});

app.use(express.static(path.join(__dirname, "public")));

app.use((err, _req, res, _next) => {
  console.error(err);
  if (!res.headersSent) {
    res.status(500).json({ error: "internal_error" });
  }
});

app.listen(port, "0.0.0.0", () => {
  const base = `http://127.0.0.1:${port}`;
  console.log(`Live2D model service (local)\n  ${base}\n  ${base}/api/model-list\n  ${base}/models/…`);
});
