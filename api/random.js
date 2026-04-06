const { randomIndex, messageAt } = require("../lib/manifest.cjs");

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

  const current = req.query.current != null ? req.query.current : req.query.prev;
  const ri = randomIndex(current == null ? 0 : current);

  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    nextIndex: ri,
    message: messageAt(ri)
  });
};
