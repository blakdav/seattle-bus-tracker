const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_DIR = '/data';
const STOPS_FILE = path.join(DATA_DIR, 'stops.json');
const GROUPS_FILE = path.join(DATA_DIR, 'groups.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

app.use(express.json());

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return fallback; }
}

function writeJson(file, data) {
  ensureDataDir();
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Stops
app.get('/api/stops', (req, res) => res.json(readJson(STOPS_FILE, [])));
app.post('/api/stops', (req, res) => {
  if (!Array.isArray(req.body)) return res.status(400).json({ error: 'Expected array' });
  writeJson(STOPS_FILE, req.body);
  res.json({ ok: true });
});

// Groups
app.get('/api/groups', (req, res) => res.json(readJson(GROUPS_FILE, [])));
app.post('/api/groups', (req, res) => {
  if (!Array.isArray(req.body)) return res.status(400).json({ error: 'Expected array' });
  writeJson(GROUPS_FILE, req.body);
  res.json({ ok: true });
});

// Config
app.get('/api/config', (req, res) => res.json(readJson(CONFIG_FILE, {})));
app.post('/api/config', (req, res) => {
  const updated = { ...readJson(CONFIG_FILE, {}), ...req.body };
  writeJson(CONFIG_FILE, updated);
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`Bus tracker API running on port ${PORT}`));
