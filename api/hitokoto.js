function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = async (req, res) => {
  cors(res);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  try {
    const response = await fetch("https://v1.hitokoto.cn/");
    if (!response.ok) {
      throw new Error(String(response.status));
    }

    const payload = await response.json();
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json(payload);
  } catch {
    res.status(502).json({ error: "hitokoto_proxy_failed" });
  }
};
