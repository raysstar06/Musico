// backend/graph/dfs.js
// DFS-based Music Recommendation Engine

const Graph = require('./Graph');

/**
 * Run Depth-First Search from a starting song and collect recommendations.
 *
 * @param {Graph}  graph       - The song graph
 * @param {number} startId     - ID of the seed song
 * @param {number} limit       - Max recommendations to return
 * @returns {{
 *   recommendations: number[],   // ordered song IDs
 *   traversalPath: number[],     // full DFS visit order (for animation)
 *   steps: Array<{              // step-by-step state snapshots for frontend
 *     action: 'push'|'visit'|'recommend',
 *     nodeId: number,
 *     stack: number[],
 *     visited: number[]
 *   }>
 * }}
 */
function dfsRecommend(graph, startId, limit = 10) {
  const visited       = new Set();
  const recommendations = [];
  const traversalPath = [];
  const steps         = [];

  // Stack starts with seed song
  const stack = [startId];

  steps.push({
    action:  'push',
    nodeId:  startId,
    stack:   [...stack],
    visited: [],
  });

  while (stack.length && recommendations.length < limit) {
    const current = stack.pop();

    if (visited.has(current)) continue;

    visited.add(current);
    traversalPath.push(current);

    steps.push({
      action:  'visit',
      nodeId:  current,
      stack:   [...stack],
      visited: [...visited],
    });

    // Get neighbors sorted by weight (highest similarity first)
    const neighbors = graph.getNeighbors(current);

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.id)) {
        // Collect as recommendation (skip seed song itself)
        if (neighbor.id !== startId && recommendations.length < limit) {
          if (!recommendations.includes(neighbor.id)) {
            recommendations.push(neighbor.id);

            steps.push({
              action:  'recommend',
              nodeId:  neighbor.id,
              stack:   [...stack],
              visited: [...visited],
            });
          }
        }
        stack.push(neighbor.id);

        steps.push({
          action:  'push',
          nodeId:  neighbor.id,
          stack:   [...stack],
          visited: [...visited],
        });
      }
    }
  }

  return { recommendations, traversalPath, steps };
}

/**
 * Compute a similarity weight between two songs based on audio features.
 * Used when building edges programmatically (seeding).
 *
 * Scoring:
 *  - Same genre:           +0.40
 *  - BPM within ±20:      +0.25
 *  - Energy within ±0.2:  +0.20
 *  - Valence within ±0.2: +0.15
 *
 * Minimum threshold to create an edge: weight >= 0.40
 */
function computeSimilarity(songA, songB) {
  let score = 0;

  if (songA.genre === songB.genre)                        score += 0.40;
  if (Math.abs(songA.bpm - songB.bpm) <= 20)             score += 0.25;
  if (Math.abs(songA.energy - songB.energy) <= 0.20)     score += 0.20;
  if (Math.abs(songA.valence - songB.valence) <= 0.20)   score += 0.15;

  return parseFloat(score.toFixed(2));
}

module.exports = { dfsRecommend, computeSimilarity };
