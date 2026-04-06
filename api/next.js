const { nextIndex, messageAt } = require("../lib/manifest.cjs");

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = (req, res) => {
  cors(res);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  const prev = req.query.prev != null ? req.query.prev : req.query.id;
  const ni = nextIndex(prev == null ? 0 : prev);

  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    nextIndex: ni,
    message: messageAt(ni)
  });
};
