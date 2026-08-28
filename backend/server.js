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

// Trip details cache (in-memory, keyed by tripId, TTL 4 hours)
const tripCache = {};
const TRIP_CACHE_TTL = 4 * 60 * 60 * 1000;

app.get('/api/trip-details/:tripId', async (req, res) => {
  const { tripId } = req.params;
  const cached = tripCache[tripId];
  if (cached && Date.now() - cached.timestamp < TRIP_CACHE_TTL) {
    return res.json(cached.data);
  }
  const config = readJson(CONFIG_FILE, {});
  const apiKey = config.apiKey || 'TEST';
  try {
    const response = await fetch(
      `https://api.pugetsound.onebusaway.org/api/where/trip-details/${encodeURIComponent(tripId)}.json?key=${apiKey}&includeSchedule=true`
    );
    if (!response.ok) return res.status(response.status).json({ error: 'OBA error' });
    const data = await response.json();
    tripCache[tripId] = { data, timestamp: Date.now() };
    res.json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// Schedule cache (keyed by stopId+date, TTL until end of day)
const scheduleCache = {};

app.get('/api/schedule/:stopId', async (req, res) => {
  const { stopId } = req.params;
  const today = new Date().toISOString().slice(0, 10);
  const cacheKey = `${stopId}_${today}`;
  const cached = scheduleCache[cacheKey];
  if (cached) return res.json(cached);
  const config = readJson(CONFIG_FILE, {});
  const apiKey = config.apiKey || 'TEST';
  try {
    const response = await fetch(
      `https://api.pugetsound.onebusaway.org/api/where/schedule-for-stop/${encodeURIComponent(stopId)}.json?key=${apiKey}`
    );
    if (!response.ok) return res.status(response.status).json({ error: 'OBA error' });
    const data = await response.json();
    scheduleCache[cacheKey] = data;
    res.json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => console.log(`Bus tracker API running on port ${PORT}`));
