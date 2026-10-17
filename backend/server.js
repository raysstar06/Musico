// backend/server.js
// Express entry point for Musico API

require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const path     = require('path');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// ── API Routes ────────────────────────────────────────────
app.use('/api/songs',           require('./routes/songs'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/preferences',     require('./routes/preferences'));

// ── Health check ──────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status:  'ok',
    service: 'Musico API',
    version: '1.0.0',
    time:    new Date().toISOString(),
  });
});

// ── Catch-all: serve frontend ─────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ── Start server ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🎵  Musico API running at http://localhost:${PORT}`);
  console.log(`📡  Health:           http://localhost:${PORT}/api/health`);
  console.log(`🎸  Songs API:        http://localhost:${PORT}/api/songs`);
  console.log(`🔍  Recommendations:  http://localhost:${PORT}/api/recommendations/:id\n`);
});

module.exports = app;
