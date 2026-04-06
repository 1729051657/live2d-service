"use strict";

const manifest = require("../config/model-list.json");

function normalizeIndex(value, fallback = 0) {
  const n = parseInt(String(value), 10);
  return Number.isFinite(n) ? n : fallback;
}

function modelCount() {
  return Array.isArray(manifest.models) ? manifest.models.length : 0;
}

function nextIndex(prev) {
  const c = modelCount();
  if (c === 0) {
    return 0;
  }

  const p = normalizeIndex(prev, 0);
  const bounded = ((p % c) + c) % c;
  return (bounded + 1) % c;
}

function randomIndex(current) {
  const c = modelCount();
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
  if (!manifest.messages || manifest.messages[i] == null) {
    return "";
  }

  return manifest.messages[i];
}

module.exports = {
  manifest,
  nextIndex,
  randomIndex,
  messageAt,
  modelCount
};
