// backend/models/preferenceModel.js
// MySQL query wrappers for user_preferences

const pool = require('../db/connection');

const PreferenceModel = {
  // Save a liked song for a session
  async add(sessionId, songId) {
    await pool.query(
      'INSERT IGNORE INTO user_preferences (session_id, song_id) VALUES (?, ?)',
      [sessionId, songId]
    );
  },

  // Get all liked songs for a session
  async getBySession(sessionId) {
    const [rows] = await pool.query(
      `SELECT up.id, up.song_id, up.liked_at,
              s.title, s.artist, s.genre, s.cover_url
       FROM user_preferences up
       JOIN songs s ON s.id = up.song_id
       WHERE up.session_id = ?
       ORDER BY up.liked_at DESC`,
      [sessionId]
    );
    return rows;
  },

  // Remove a preference by its ID
  async remove(id) {
    const [result] = await pool.query(
      'DELETE FROM user_preferences WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  },

  // Check if a song is liked
  async isLiked(sessionId, songId) {
    const [rows] = await pool.query(
      'SELECT id FROM user_preferences WHERE session_id = ? AND song_id = ?',
      [sessionId, songId]
    );
    return rows.length > 0;
  },
};

module.exports = PreferenceModel;
