// backend/db/seedEdges.js
// Computes and inserts song_edges based on similarity scores.
// Run once after inserting songs: node backend/db/seedEdges.js

require('dotenv').config();
const pool = require('./connection');
const { computeSimilarity } = require('../graph/dfs');

const EDGE_THRESHOLD = 0.40; // minimum similarity score to create an edge

async function seedEdges() {
  console.log('🔗  Computing song similarity edges...\n');

  const [songs] = await pool.query('SELECT * FROM songs');
  console.log(`   Found ${songs.length} songs`);

  const edges = [];

  for (let i = 0; i < songs.length; i++) {
    for (let j = i + 1; j < songs.length; j++) {
      const weight = computeSimilarity(songs[i], songs[j]);
      if (weight >= EDGE_THRESHOLD) {
        edges.push([songs[i].id, songs[j].id, weight]);
      }
    }
  }

  console.log(`   Computed ${edges.length} qualifying edges (threshold ≥ ${EDGE_THRESHOLD})\n`);

  if (edges.length === 0) {
    console.log('⚠️   No edges to insert. Check threshold or song attributes.');
    process.exit(0);
  }

  // Clear old edges
  await pool.query('DELETE FROM song_edges');

  // Bulk insert
  await pool.query(
    'INSERT INTO song_edges (song_id, related_id, weight) VALUES ?',
    [edges]
  );

  console.log(`✅  Inserted ${edges.length} edges into song_edges table.`);

  // Show sample edges
  const [sample] = await pool.query(`
    SELECT s1.title AS song, s2.title AS related, se.weight
    FROM song_edges se
    JOIN songs s1 ON s1.id = se.song_id
    JOIN songs s2 ON s2.id = se.related_id
    ORDER BY se.weight DESC
    LIMIT 10
  `);
  console.log('\n📊  Top 10 strongest connections:');
  sample.forEach(r => console.log(`   ${r.song} ↔ ${r.related}  [${r.weight}]`));

  await pool.end();
  process.exit(0);
}

seedEdges().catch(err => {
  console.error('❌  Seed edges failed:', err.message);
  process.exit(1);
});
