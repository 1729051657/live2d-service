"use strict";

const fs = require("fs");
const path = require("path");

const MODELS_ROOT = path.join(__dirname, "..", "public", "models");

let cache = { models: null, at: 0 };
const TTL_MS = 60 * 1000;

/**
 * 递归查找：若目录下存在 index.json，则视为一个模型根目录（不再向下扫子目录）。
 * 返回相对于 /models/ 的路径片段，使用正斜杠。
 */
function collectModels(absDir, relParts) {
  let stat;
  try {
    stat = fs.statSync(absDir);
  } catch {
    return [];
  }

  if (!stat.isDirectory()) {
    return [];
  }

  const indexPath = path.join(absDir, "index.json");
  if (fs.existsSync(indexPath)) {
    const rel = relParts.join("/");
    return [rel === "" ? "default" : rel];
  }

  const out = [];
  let entries;
  try {
    entries = fs.readdirSync(absDir, { withFileTypes: true });
  } catch {
    return [];
  }

  for (const ent of entries) {
    if (ent.name.startsWith(".")) {
      continue;
    }
    if (!ent.isDirectory()) {
      continue;
    }

    const sub = path.join(absDir, ent.name);
    const nextParts = relParts.length ? [...relParts, ent.name] : [ent.name];
    out.push(...collectModels(sub, nextParts));
  }

  return out;
}

function scanModelsSync() {
  if (!fs.existsSync(MODELS_ROOT)) {
    return [];
  }

  const raw = collectModels(MODELS_ROOT, []);
  raw.sort((a, b) => a.localeCompare(b, "en"));
  return raw;
}

function scanModelsCached() {
  const now = Date.now();
  if (cache.models && now - cache.at < TTL_MS) {
    return cache.models;
  }

  const models = scanModelsSync();
  cache = { models, at: now };
  return models;
}

function invalidateScanCache() {
  cache = { models: null, at: 0 };
}

module.exports = {
  MODELS_ROOT,
  scanModelsSync,
  scanModelsCached,
  invalidateScanCache
};
