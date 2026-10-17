# 🎵 Musico — Music Recommendation System Using Graphs

> A graph-based music recommendation system using the **Depth-First Search (DFS)** algorithm.
> Tech Stack: **JavaScript · Node.js · Express · MySQL · Vanilla HTML/CSS**

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MySQL 8.0+ running locally

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Edit `.env` with your MySQL credentials:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=musico_db
PORT=3001
```

### 3. Set up the database
Run the schema + seed data in MySQL:
```bash
mysql -u root -p < backend/db/schema.sql
```

### 4. Seed the graph edges
```bash
node backend/db/seedEdges.js
```

### 5. Start the server
```bash
npm run dev
```

Open **http://localhost:3001** 🎉

---

## 📁 Project Structure

```
Musico/
├── backend/
│   ├── db/
│   │   ├── connection.js     # MySQL connection pool
│   │   ├── schema.sql        # Tables + 50 seed songs
│   │   └── seedEdges.js      # Compute & insert graph edges
│   ├── graph/
│   │   ├── Graph.js          # Adjacency list graph data structure
│   │   └── dfs.js            # DFS recommendation algorithm
│   ├── models/
│   │   ├── songModel.js      # Song queries
│   │   └── preferenceModel.js# User likes queries
│   ├── routes/
│   │   ├── songs.js          # GET /api/songs
│   │   ├── recommendations.js# GET /api/recommendations/:id
│   │   └── preferences.js    # POST/GET/DELETE /api/preferences
│   └── server.js             # Express entry point
│
├── frontend/
│   ├── index.html            # Landing page
│   ├── explore.html          # Song browser
│   ├── recommendations.html  # DFS results + graph viz
│   ├── css/
│   │   └── style.css         # Complete design system
│   └── js/
│       ├── api.js            # API client + utilities
│       └── graph-viz.js      # SVG graph visualizer
│
├── .env                      # DB config
└── package.json
```

---

## 🔗 API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/songs` | All songs (paginated, filterable by genre) |
| GET | `/api/songs/:id` | Single song |
| GET | `/api/songs/search?q=` | Search songs |
| GET | `/api/songs/genres` | All genres |
| GET | `/api/recommendations/:songId` | DFS recommendations |
| GET | `/api/recommendations/graph/:songId` | Subgraph for visualization |
| POST | `/api/preferences` | Like a song |
| GET | `/api/preferences/:sessionId` | Get liked songs |

---

## 🧠 How the Algorithm Works

### Graph Structure
- **Nodes:** Each song is a node in an adjacency list (`Map<songId, [{id, weight}]>`)
- **Edges:** Two songs are connected if their **similarity score ≥ 0.40**
- **Edge Weight:** Computed from: genre match (0.40) + BPM (0.25) + energy (0.20) + valence (0.15)

### DFS Traversal
```
Stack: [seedSong]
While stack not empty and results < limit:
  current = stack.pop()
  if visited: skip
  mark visited
  for each neighbor (sorted by weight desc):
    if not visited: add to recommendations, push to stack
```

Neighbors are sorted by **similarity weight descending** — so the most similar songs are always explored first.
