// frontend/js/graph-viz.js
// SVG-based interactive graph visualizer for Musico

class GraphVisualizer {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options   = {
      nodeRadius:    32,
      width:         null,
      height:        500,
      genreColors:   {
        'Pop':        '#f72585',
        'Rock':       '#ef4444',
        'Hip-Hop':    '#fbbf24',
        'Electronic': '#06b6d4',
        'R&B':        '#a855f7',
        'Jazz':       '#10b981',
        'Classical':  '#a0a0c0',
      },
      ...options,
    };

    this.nodes    = [];
    this.edges    = [];
    this.songMap  = {};
    this.positions = {};
    this.isDragging = null;
    this.panOffset  = { x: 0, y: 0 };
    this.scale      = 1;

    this._initSVG();
  }

  _initSVG() {
    const w = this.options.width || this.container.clientWidth || 800;
    const h = this.options.height;

    this.container.innerHTML = '';
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width',   '100%');
    this.svg.setAttribute('height',  h);
    this.svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    this.svg.style.cursor = 'grab';

    this.width  = w;
    this.height = h;

    // Defs (gradients, filters)
    this.defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    this._addGlowFilter();
    this.svg.appendChild(this.defs);

    // Groups
    this.edgeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.edgeGroup.setAttribute('class', 'edges');
    this.nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.nodeGroup.setAttribute('class', 'nodes');

    this.svg.appendChild(this.edgeGroup);
    this.svg.appendChild(this.nodeGroup);
    this.container.appendChild(this.svg);
  }

  _addGlowFilter() {
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', 'glow');
    filter.setAttribute('x', '-50%'); filter.setAttribute('y', '-50%');
    filter.setAttribute('width', '200%'); filter.setAttribute('height', '200%');

    const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    blur.setAttribute('stdDeviation', '4');
    blur.setAttribute('result', 'coloredBlur');

    const merge   = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
    const mergeA  = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    mergeA.setAttribute('in', 'coloredBlur');
    const mergeB  = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    mergeB.setAttribute('in', 'SourceGraphic');

    merge.appendChild(mergeA);
    merge.appendChild(mergeB);
    filter.appendChild(blur);
    filter.appendChild(merge);
    this.defs.appendChild(filter);
  }

  /**
   * Load data and render the graph
   * @param {Array} nodes - [{id, title, artist, genre, cover_url}]
   * @param {Array} edges - [{source, target, weight}]
   * @param {number} centerId - The seed/center node ID
   */
  render(nodes, edges, centerId) {
    this.nodes    = nodes;
    this.edges    = edges;
    this.centerId = centerId;
    this.songMap  = Object.fromEntries(nodes.map(n => [n.id, n]));

    this._computeLayout(centerId);
    this._drawEdges();
    this._drawNodes(centerId);
  }

  /**
   * Radial layout — center node in middle, others around it
   */
  _computeLayout(centerId) {
    const cx = this.width  / 2;
    const cy = this.height / 2;

    this.positions[centerId] = { x: cx, y: cy };

    const others = this.nodes.filter(n => n.id !== centerId);
    const radius = Math.min(cx, cy) * 0.7;

    others.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / others.length - Math.PI / 2;
      this.positions[node.id] = {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      };
    });
  }

  _drawEdges() {
    this.edgeGroup.innerHTML = '';

    for (const edge of this.edges) {
      const from = this.positions[edge.source];
      const to   = this.positions[edge.target];
      if (!from || !to) continue;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', from.x);
      line.setAttribute('y1', from.y);
      line.setAttribute('x2', to.x);
      line.setAttribute('y2', to.y);
      line.setAttribute('stroke',           `rgba(255,255,255,${0.1 + edge.weight * 0.25})`);
      line.setAttribute('stroke-width',     Math.max(1, edge.weight * 4));
      line.setAttribute('stroke-linecap',   'round');
      line.dataset.source = edge.source;
      line.dataset.target = edge.target;
      line.dataset.weight = edge.weight;

      this.edgeGroup.appendChild(line);
    }
  }

  _drawNodes(centerId) {
    this.nodeGroup.innerHTML = '';

    for (const node of this.nodes) {
      const pos   = this.positions[node.id];
      if (!pos) continue;

      const color  = this.options.genreColors[node.genre] || '#7c3aed';
      const r      = node.id === centerId ? 44 : this.options.nodeRadius;
      const isCenter = node.id === centerId;

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', `graph-node${isCenter ? ' center-node' : ''}`);
      g.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);
      g.style.cursor = 'pointer';

      // Outer glow ring
      const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      ring.setAttribute('r',    r + 6);
      ring.setAttribute('fill', 'none');
      ring.setAttribute('stroke', color);
      ring.setAttribute('stroke-width', isCenter ? 2 : 1.5);
      ring.setAttribute('opacity', isCenter ? 0.5 : 0.25);
      if (isCenter) ring.setAttribute('filter', 'url(#glow)');

      // Main circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r',    r);
      circle.setAttribute('fill', isCenter ? color : `${color}33`);
      circle.setAttribute('stroke', color);
      circle.setAttribute('stroke-width', isCenter ? 3 : 1.5);
      if (isCenter) circle.setAttribute('filter', 'url(#glow)');

      // Clip image to circle
      const clipId = `clip-${node.id}`;
      const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
      clipPath.setAttribute('id', clipId);
      const clipCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      clipCircle.setAttribute('r', r - 2);
      clipPath.appendChild(clipCircle);
      this.defs.appendChild(clipPath);

      // Cover image
      if (node.cover_url) {
        const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        img.setAttribute('href',        node.cover_url);
        img.setAttribute('x',          -(r - 2));
        img.setAttribute('y',          -(r - 2));
        img.setAttribute('width',       (r - 2) * 2);
        img.setAttribute('height',      (r - 2) * 2);
        img.setAttribute('clip-path', `url(#${clipId})`);
        img.setAttribute('preserveAspectRatio', 'xMidYMid slice');
        g.appendChild(ring);
        g.appendChild(circle);
        g.appendChild(img);
      } else {
        // Emoji fallback
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'central');
        text.setAttribute('font-size', r * 0.7);
        text.textContent = '🎵';
        g.appendChild(ring);
        g.appendChild(circle);
        g.appendChild(text);
      }

      // Label
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('y',             r + 16);
      label.setAttribute('text-anchor',   'middle');
      label.setAttribute('font-size',     isCenter ? 13 : 11);
      label.setAttribute('font-weight',   isCenter ? '700' : '500');
      label.setAttribute('fill',          '#f0f0ff');
      label.setAttribute('font-family',   'Outfit, sans-serif');
      const labelText = node.title.length > 14 ? node.title.slice(0, 13) + '…' : node.title;
      label.textContent = labelText;
      g.appendChild(label);

      // Hover effect
      g.addEventListener('mouseenter', () => {
        circle.setAttribute('fill', color);
        circle.setAttribute('filter', 'url(#glow)');
        ring.setAttribute('opacity', '0.8');
        this._highlightEdges(node.id);
        this._showTooltip(node, pos);
      });

      g.addEventListener('mouseleave', () => {
        circle.setAttribute('fill', isCenter ? color : `${color}33`);
        if (!isCenter) circle.removeAttribute('filter');
        ring.setAttribute('opacity', isCenter ? '0.5' : '0.25');
        this._unhighlightEdges();
        this._hideTooltip();
      });

      g.addEventListener('click', () => {
        this.onNodeClick && this.onNodeClick(node);
      });

      this.nodeGroup.appendChild(g);
    }
  }

  _highlightEdges(nodeId) {
    const lines = this.edgeGroup.querySelectorAll('line');
    lines.forEach(line => {
      const isConnected = line.dataset.source == nodeId || line.dataset.target == nodeId;
      line.setAttribute('opacity', isConnected ? 1 : 0.15);
      if (isConnected) {
        line.setAttribute('stroke', 'rgba(124,58,237,0.9)');
        line.setAttribute('stroke-width', parseFloat(line.getAttribute('stroke-width')) + 1);
      }
    });
  }

  _unhighlightEdges() {
    const lines = this.edgeGroup.querySelectorAll('line');
    lines.forEach(line => {
      line.setAttribute('opacity', 1);
      const w = parseFloat(line.dataset.weight);
      line.setAttribute('stroke', `rgba(255,255,255,${0.1 + w * 0.25})`);
      line.setAttribute('stroke-width', Math.max(1, w * 4));
    });
  }

  _showTooltip(node, pos) {
    const existing = document.getElementById('graph-tooltip');
    if (existing) existing.remove();

    const tt = document.createElement('div');
    tt.id = 'graph-tooltip';
    tt.style.cssText = `
      position:absolute; background:rgba(15,15,30,0.95);
      border:1px solid rgba(124,58,237,0.5); border-radius:10px;
      padding:0.6rem 0.9rem; font-size:0.82rem; pointer-events:none;
      z-index:100; backdrop-filter:blur(20px); white-space:nowrap;
    `;
    tt.innerHTML = `
      <div style="font-weight:700;color:#f0f0ff">${node.title}</div>
      <div style="color:#a0a0c0">${node.artist}</div>
      <div style="color:#7c3aed;font-size:0.75rem;margin-top:0.2rem">${node.genre} · ${node.bpm} BPM</div>
    `;
    this.container.style.position = 'relative';
    this.container.appendChild(tt);

    const rect = this.svg.getBoundingClientRect();
    const svgRect = this.container.getBoundingClientRect();
    tt.style.left = (pos.x + 10) + 'px';
    tt.style.top  = (pos.y - 50) + 'px';
  }

  _hideTooltip() {
    const tt = document.getElementById('graph-tooltip');
    if (tt) tt.remove();
  }

  /**
   * Animate DFS traversal step-by-step
   * @param {Array} steps - DFS step objects from backend
   * @param {Function} onStep - callback(step, index)
   * @param {number} delay - ms between steps
   */
  animateDFS(steps, onStep, delay = 500) {
    this._clearDFSHighlights();
    let i = 0;

    const next = () => {
      if (i >= steps.length) return;
      const step = steps[i];
      this._applyDFSStep(step);
      onStep && onStep(step, i);
      i++;
      setTimeout(next, delay);
    };

    setTimeout(next, 400);
  }

  _clearDFSHighlights() {
    const circles = this.nodeGroup.querySelectorAll('circle');
    circles.forEach(c => {
      c.removeAttribute('data-dfs-state');
    });
  }

  _applyDFSStep(step) {
    const { action, nodeId } = step;
    const nodeEl = this.nodeGroup.querySelector(`[data-id="${nodeId}"]`);

    // Find node group by checking all groups
    const groups = this.nodeGroup.querySelectorAll('.graph-node');
    groups.forEach(g => {
      if (g.dataset.nodeId == nodeId) {
        const circle = g.querySelector('circle:nth-child(2)') || g.querySelector('circle');
        if (!circle) return;

        if (action === 'visit') {
          circle.setAttribute('fill', 'rgba(124,58,237,0.8)');
          circle.setAttribute('filter', 'url(#glow)');
        } else if (action === 'recommend') {
          circle.setAttribute('fill', 'rgba(6,182,212,0.8)');
          circle.setAttribute('filter', 'url(#glow)');
        } else if (action === 'push') {
          circle.setAttribute('stroke', '#fbbf24');
        }
      }
    });
  }
}
