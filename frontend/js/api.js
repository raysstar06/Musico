// frontend/js/api.js
// Centralized API client for Musico backend

const API_BASE = 'http://localhost:3001/api';

const api = {
  // ── Songs ──────────────────────────────────────
  async getSongs({ limit = 60, offset = 0, genre = '' } = {}) {
    const params = new URLSearchParams({ limit, offset });
    if (genre) params.set('genre', genre);
    const res = await fetch(`${API_BASE}/songs?${params}`);
    return res.json();
  },

  async getSong(id) {
    const res = await fetch(`${API_BASE}/songs/${id}`);
    return res.json();
  },

  async searchSongs(query) {
    const res = await fetch(`${API_BASE}/songs/search?q=${encodeURIComponent(query)}`);
    return res.json();
  },

  async getGenres() {
    const res = await fetch(`${API_BASE}/songs/genres`);
    return res.json();
  },

  // ── Recommendations ────────────────────────────
  async getRecommendations(songId, limit = 10) {
    const res = await fetch(`${API_BASE}/recommendations/${songId}?limit=${limit}`);
    return res.json();
  },

  async getSubgraph(songId, depth = 2) {
    const res = await fetch(`${API_BASE}/recommendations/graph/${songId}?depth=${depth}`);
    return res.json();
  },

  // ── Preferences ───────────────────────────────
  async likeSong(sessionId, songId) {
    const res = await fetch(`${API_BASE}/preferences`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ sessionId, songId }),
    });
    return res.json();
  },

  async getLikedSongs(sessionId) {
    const res = await fetch(`${API_BASE}/preferences/${sessionId}`);
    return res.json();
  },

  async unlikeSong(preferenceId) {
    const res = await fetch(`${API_BASE}/preferences/${preferenceId}`, { method: 'DELETE' });
    return res.json();
  },

  async isLiked(sessionId, songId) {
    const res = await fetch(`${API_BASE}/preferences/check/${sessionId}/${songId}`);
    return res.json();
  },
};

// ── Session ID ─────────────────────────────────
function getSessionId() {
  let id = sessionStorage.getItem('musico_session');
  if (!id) {
    id = 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('musico_session', id);
  }
  return id;
}

// ── Genre Badge CSS class ──────────────────────
function genreClass(genre) {
  const map = {
    'Pop':        'genre-pop',
    'Rock':       'genre-rock',
    'Hip-Hop':    'genre-hip-hop',
    'Electronic': 'genre-electronic',
    'R&B':        'genre-r-b',
    'Jazz':       'genre-jazz',
    'Classical':  'genre-classical',
  };
  return map[genre] || 'genre-pop';
}

// ── Format duration ───────────────────────────
function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ── Toast notification ────────────────────────
function showToast(message, type = 'info') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const container = document.getElementById('toast-container') || (() => {
    const c = document.createElement('div');
    c.id        = 'toast-container';
    c.className = 'toast-container';
    document.body.appendChild(c);
    return c;
  })();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toast-in 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ── Song card HTML builder ─────────────────────
function buildSongCard(song, sessionId, onClick) {
  const card      = document.createElement('div');
  card.className  = 'song-card';
  card.dataset.id = song.id;

  const cover = song.cover_url
    ? `<img src="${song.cover_url}" alt="${song.title}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">`
    : '';

  card.innerHTML = `
    <div class="song-card-cover">
      ${cover}
      <div class="song-card-cover-placeholder" ${song.cover_url ? 'style="display:none"' : ''}>🎵</div>
      <div class="song-card-play">
        <div class="play-btn-circle">▶</div>
      </div>
    </div>
    <div class="song-card-body">
      <div class="song-card-title">${song.title}</div>
      <div class="song-card-artist">${song.artist}</div>
      <div class="song-card-footer">
        <span class="genre-badge ${genreClass(song.genre)}">${song.genre}</span>
        <button class="like-btn" data-song-id="${song.id}" title="Like" aria-label="Like ${song.title}">♡</button>
      </div>
    </div>
  `;

  // Like button
  const likeBtn = card.querySelector('.like-btn');
  api.isLiked(sessionId, song.id).then(({ liked }) => {
    if (liked) { likeBtn.textContent = '♥'; likeBtn.classList.add('liked'); }
  }).catch(() => {});

  likeBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    const { liked } = await api.isLiked(sessionId, song.id);
    if (liked) {
      const { preferences } = await api.getLikedSongs(sessionId);
      const pref = preferences.find(p => p.song_id === song.id);
      if (pref) await api.unlikeSong(pref.id);
      likeBtn.textContent = '♡';
      likeBtn.classList.remove('liked');
      showToast('Removed from liked', 'info');
    } else {
      await api.likeSong(sessionId, song.id);
      likeBtn.textContent = '♥';
      likeBtn.classList.add('liked');
      showToast('Added to liked ♥', 'success');
    }
  });

  card.addEventListener('click', () => onClick && onClick(song));

  return card;
}
