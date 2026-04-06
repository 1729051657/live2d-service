"use strict";

const fs = require("fs");
const path = require("path");
const { scanModelsCached } = require("./scanModels.cjs");

const CONFIG_PATH = path.join(__dirname, "..", "config", "model-list.json");

function loadConfigOptional() {
  try {
    const txt = fs.readFileSync(CONFIG_PATH, "utf8");
    return JSON.parse(txt);
  } catch {
    return {};
  }
}

function buildManifest() {
  const models = scanModelsCached();
  const cfg = loadConfigOptional();
  const serviceName = typeof cfg.serviceName === "string" ? cfg.serviceName : "Live2D Model Service";

  let messages = cfg.messages;
  if (!Array.isArray(messages)) {
    messages = [];
  }

  messages = messages.slice(0, models.length);
  while (messages.length < models.length) {
    messages.push("");
  }

  return {
    serviceName,
    models,
    messages
  };
}

function normalizeIndex(value, fallback = 0) {
  const n = parseInt(String(value), 10);
  return Number.isFinite(n) ? n : fallback;
}

function getManifest() {
  return buildManifest();
}

function modelCount() {
  return getManifest().models.length;
}

function nextIndex(prev) {
  const manifest = getManifest();
  const c = manifest.models.length;
  if (c === 0) {
    return 0;
  }

  const p = normalizeIndex(prev, 0);
  const bounded = ((p % c) + c) % c;
  return (bounded + 1) % c;
}

function randomIndex(current) {
  const manifest = getManifest();
  const c = manifest.models.length;
  if (c <= 1) {
    return 0;
  }

  const cur = normalizeIndex(current, 0);
  const bounded = ((cur % c) + c) % c;
  let idx = bounded;
  let guard = 0;

  do {
    idx = Math.floor(Math.random() * c);
    guard += 1;
  } while (idx === bounded && guard < 64);

  return idx;
}

function messageAt(i) {
  const manifest = getManifest();
  if (!manifest.messages || manifest.messages[i] == null) {
    return "";
  }

  return manifest.messages[i];
}

module.exports = {
  getManifest,
  buildManifest,
  nextIndex,
  randomIndex,
  messageAt,
  modelCount
};
