// backend/models/songModel.js
// MySQL query wrappers for songs and edges

const pool = require('../db/connection');

const SongModel = {
  // Get all songs (with optional pagination)
  async getAll({ limit = 60, offset = 0, genre = null } = {}) {
    let sql    = 'SELECT * FROM songs';
    const params = [];
    if (genre) {
      sql += ' WHERE genre = ?';
      params.push(genre);
    }
    sql += ' ORDER BY title LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    const [rows] = await pool.query(sql, params);
    return rows;
  },

  // Get a single song by ID
  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM songs WHERE id = ?', [id]);
    return rows[0] || null;
  },

  // Search songs by title or artist
  async search(query) {
    const like = `%${query}%`;
    const [rows] = await pool.query(
      'SELECT * FROM songs WHERE title LIKE ? OR artist LIKE ? ORDER BY title LIMIT 20',
      [like, like]
    );
    return rows;
  },

  // Get all edges
  async getAllEdges() {
    const [rows] = await pool.query('SELECT song_id, related_id, weight FROM song_edges');
    return rows;
  },

  // Get edges for a specific song
  async getEdgesForSong(songId) {
    const [rows] = await pool.query(
      'SELECT song_id, related_id, weight FROM song_edges WHERE song_id = ? OR related_id = ?',
      [songId, songId]
    );
    return rows;
  },

  // Get songs by IDs (for recommendations result)
  async getByIds(ids) {
    if (!ids || ids.length === 0) return [];
    const placeholders = ids.map(() => '?').join(',');
    const [rows] = await pool.query(
      `SELECT * FROM songs WHERE id IN (${placeholders})`,
      ids
    );
    // Preserve DFS order
    const map = new Map(rows.map(r => [r.id, r]));
    return ids.map(id => map.get(id)).filter(Boolean);
  },

  // Get all distinct genres
  async getGenres() {
    const [rows] = await pool.query('SELECT DISTINCT genre FROM songs ORDER BY genre');
    return rows.map(r => r.genre);
  },

  // Count total songs
  async count() {
    const [rows] = await pool.query('SELECT COUNT(*) as total FROM songs');
    return rows[0].total;
  },
};

module.exports = SongModel;
