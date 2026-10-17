// backend/routes/preferences.js

const express         = require('express');
const router          = express.Router();
const PreferenceModel = require('../models/preferenceModel');

// POST /api/preferences — Like a song
router.post('/', async (req, res) => {
  try {
    const { sessionId, songId } = req.body;
    if (!sessionId || !songId) {
      return res.status(400).json({ error: 'sessionId and songId required' });
    }
    await PreferenceModel.add(sessionId, parseInt(songId));
    res.json({ success: true, message: 'Song liked' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/preferences/:sessionId — Get all liked songs for a session
router.get('/:sessionId', async (req, res) => {
  try {
    const prefs = await PreferenceModel.getBySession(req.params.sessionId);
    res.json({ preferences: prefs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/preferences/:id — Remove a preference
router.delete('/:id', async (req, res) => {
  try {
    const removed = await PreferenceModel.remove(parseInt(req.params.id));
    if (!removed) return res.status(404).json({ error: 'Preference not found' });
    res.json({ success: true, message: 'Preference removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/preferences/check/:sessionId/:songId
router.get('/check/:sessionId/:songId', async (req, res) => {
  try {
    const liked = await PreferenceModel.isLiked(req.params.sessionId, parseInt(req.params.songId));
    res.json({ liked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
