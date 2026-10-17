// backend/routes/recommendations.js

const express   = require('express');
const router    = express.Router();
const Graph     = require('../graph/Graph');
const { dfsRecommend } = require('../graph/dfs');
const SongModel = require('../models/songModel');

// Helper: get direct edge weight between two nodes
function getSimilarityScore(graph, fromId, toId) {
  const neighbors = graph.getNeighbors(fromId);
  const match = neighbors.find(n => n.id === toId);
  return match ? Math.round(match.weight * 100) : 0;
}

/**
 * GET /api/recommendations/graph/:songId?depth=2
 * ⚠️  MUST be declared BEFORE /:songId — otherwise Express treats "graph" as the songId param
 * Returns a subgraph around a song for visualization
 */
router.get('/graph/:songId', async (req, res) => {
  try {
    const songId = parseInt(req.params.songId);
    const depth  = parseInt(req.query.depth || '2');

    const edges = await SongModel.getAllEdges();
    const graph = new Graph();
    graph.buildFromDB(edges);

    const subgraph = graph.subgraph(songId, depth);

    // Fetch metadata for all nodes
    const songs   = await SongModel.getByIds(subgraph.nodes);
    const songMap = new Map(songs.map(s => [s.id, s]));

    res.json({
      nodes: subgraph.nodes.map(id => ({ id, ...songMap.get(id) })),
      edges: subgraph.edges,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/recommendations/:songId?limit=10
 *
 * 1. Load all edges from DB
 * 2. Build in-memory graph
 * 3. Run DFS from :songId
 * 4. Fetch full metadata for recommended IDs
 * 5. Return recommendations + DFS steps for animation
 */
router.get('/:songId', async (req, res) => {
  try {
    const songId = parseInt(req.params.songId);
    const limit  = parseInt(req.query.limit || '10');

    // Validate seed song exists
    const seedSong = await SongModel.getById(songId);
    if (!seedSong) return res.status(404).json({ error: 'Song not found' });

    // Build graph from all edges
    const edges = await SongModel.getAllEdges();
    if (edges.length === 0) {
      return res.status(503).json({ error: 'Graph not initialized. Run seedEdges.js first.' });
    }

    const graph = new Graph();
    graph.buildFromDB(edges);

    // Run DFS
    const { recommendations, traversalPath, steps } = dfsRecommend(graph, songId, limit);

    // Fetch full song data for results (in DFS order)
    const recommendedSongs = await SongModel.getByIds(recommendations);

    // Compute similarity scores for display
    const results = recommendedSongs.map((song, index) => ({
      ...song,
      rank:            index + 1,
      similarityScore: getSimilarityScore(graph, songId, song.id),
    }));

    res.json({
      seedSong,
      recommendations: results,
      meta: {
        graphSize:      graph.size,
        totalEdges:     edges.length,
        traversalSteps: steps.length,
        traversalPath,
        steps,
      },
    });
  } catch (err) {
    console.error('Recommendation error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
