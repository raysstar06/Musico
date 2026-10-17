// backend/routes/songs.js

const express    = require('express');
const router     = express.Router();
const SongModel  = require('../models/songModel');

// GET /api/songs — All songs with optional genre filter
router.get('/', async (req, res) => {
  try {
    const { limit, offset, genre } = req.query;
    const songs = await SongModel.getAll({ limit, offset, genre });
    const total = await SongModel.count();
    res.json({ songs, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/songs/genres — All distinct genres
router.get('/genres', async (req, res) => {
  try {
    const genres = await SongModel.getGenres();
    res.json({ genres });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/songs/search?q=query
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ songs: [] });
    const songs = await SongModel.search(q);
    res.json({ songs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/songs/:id — Single song
router.get('/:id', async (req, res) => {
  try {
    const song = await SongModel.getById(parseInt(req.params.id));
    if (!song) return res.status(404).json({ error: 'Song not found' });
    res.json({ song });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
