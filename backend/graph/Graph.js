// backend/graph/Graph.js
// Core Graph data structure using Adjacency List

class Graph {
  constructor() {
    // Map<songId: number, neighbors: Array<{id: number, weight: number}>>
    this.adjacencyList = new Map();
  }

  /**
   * Add a song node to the graph
   */
  addNode(songId) {
    if (!this.adjacencyList.has(songId)) {
      this.adjacencyList.set(songId, []);
    }
  }

  /**
   * Add a bidirectional weighted edge between two songs
   */
  addEdge(songId, relatedId, weight) {
    this.addNode(songId);
    this.addNode(relatedId);

    // Bidirectional — add both directions
    const neighborsA = this.adjacencyList.get(songId);
    if (!neighborsA.find(n => n.id === relatedId)) {
      neighborsA.push({ id: relatedId, weight });
    }

    const neighborsB = this.adjacencyList.get(relatedId);
    if (!neighborsB.find(n => n.id === songId)) {
      neighborsB.push({ id: songId, weight });
    }
  }

  /**
   * Get neighbors of a node, sorted by weight descending
   */
  getNeighbors(songId) {
    const neighbors = this.adjacencyList.get(songId) || [];
    return [...neighbors].sort((a, b) => b.weight - a.weight);
  }

  /**
   * Get all node IDs
   */
  getNodes() {
    return [...this.adjacencyList.keys()];
  }

  /**
   * Get all edges (deduplicated)
   */
  getEdges() {
    const edges = [];
    const seen = new Set();
    for (const [songId, neighbors] of this.adjacencyList) {
      for (const { id: relatedId, weight } of neighbors) {
        const key = [Math.min(songId, relatedId), Math.max(songId, relatedId)].join('-');
        if (!seen.has(key)) {
          seen.add(key);
          edges.push({ source: songId, target: relatedId, weight });
        }
      }
    }
    return edges;
  }

  /**
   * Build graph from raw DB edge rows
   * @param {Array<{song_id, related_id, weight}>} rows
   */
  buildFromDB(rows) {
    for (const row of rows) {
      this.addEdge(row.song_id, row.related_id, parseFloat(row.weight));
    }
  }

  /**
   * Extract a local subgraph around a node up to `depth` hops
   */
  subgraph(startId, depth = 2) {
    const visited = new Set();
    const queue = [{ id: startId, level: 0 }];
    const subNodes = new Set();
    const subEdges = [];

    while (queue.length) {
      const { id, level } = queue.shift();
      if (visited.has(id) || level > depth) continue;
      visited.add(id);
      subNodes.add(id);

      for (const neighbor of this.getNeighbors(id)) {
        const edgeKey = [Math.min(id, neighbor.id), Math.max(id, neighbor.id)].join('-');
        if (!subEdges.find(e => [Math.min(e.source,e.target), Math.max(e.source,e.target)].join('-') === edgeKey)) {
          subEdges.push({ source: id, target: neighbor.id, weight: neighbor.weight });
        }
        if (!visited.has(neighbor.id)) {
          queue.push({ id: neighbor.id, level: level + 1 });
        }
      }
    }

    return { nodes: [...subNodes], edges: subEdges };
  }

  get size() {
    return this.adjacencyList.size;
  }
}

module.exports = Graph;
