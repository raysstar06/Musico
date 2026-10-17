-- ============================================================
-- MUSICO DATABASE SCHEMA
-- Music Recommendation System Using Graphs (DFS)
-- ============================================================

CREATE DATABASE IF NOT EXISTS musico_db;
USE musico_db;

-- --------------------------------------------------------
-- Table: songs
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS songs (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(255)  NOT NULL,
  artist      VARCHAR(255)  NOT NULL,
  album       VARCHAR(255)  DEFAULT '',
  genre       VARCHAR(100)  NOT NULL,
  bpm         INT           DEFAULT 120,
  energy      FLOAT         DEFAULT 0.5 COMMENT '0.0 to 1.0',
  valence     FLOAT         DEFAULT 0.5 COMMENT '0.0 (sad) to 1.0 (happy)',
  duration    INT           DEFAULT 210  COMMENT 'seconds',
  cover_url   VARCHAR(500)  DEFAULT '',
  preview_url VARCHAR(500)  DEFAULT '',
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table: song_edges (Graph Adjacency)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS song_edges (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  song_id     INT   NOT NULL,
  related_id  INT   NOT NULL,
  weight      FLOAT NOT NULL COMMENT 'Similarity score 0.0 to 1.0',
  FOREIGN KEY (song_id)    REFERENCES songs(id) ON DELETE CASCADE,
  FOREIGN KEY (related_id) REFERENCES songs(id) ON DELETE CASCADE,
  UNIQUE KEY unique_edge (song_id, related_id)
);

-- --------------------------------------------------------
-- Table: user_preferences (Session-based likes)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_preferences (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(64)  NOT NULL,
  song_id    INT          NOT NULL,
  liked_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
  UNIQUE KEY unique_pref (session_id, song_id)
);

-- ============================================================
-- SEED DATA — 50 Songs across 7 genres
-- ============================================================
INSERT INTO songs (title, artist, album, genre, bpm, energy, valence, duration, cover_url) VALUES

-- POP
('Blinding Lights',       'The Weeknd',      'After Hours',              'Pop',        171, 0.73, 0.33, 200, 'https://i.scdn.co/image/ab67616d0000b273ef017e899c0547766997d874'),
('As It Was',             'Harry Styles',    "Harry's House",            'Pop',        174, 0.73, 0.59, 167, 'https://i.scdn.co/image/ab67616d0000b2732e8ed79e177ff6011076f5f0'),
('Anti-Hero',             'Taylor Swift',    'Midnights',                'Pop',        97,  0.64, 0.56, 200, 'https://i.scdn.co/image/ab67616d0000b273bb54dde68cd23e2a268ae0f5'),
('Flowers',               'Miley Cyrus',     'Endless Summer Vacation',  'Pop',        118, 0.65, 0.83, 200, 'https://i.scdn.co/image/ab67616d0000b273e85259a1cae29a8d91f2093d'),
('Levitating',            'Dua Lipa',        'Future Nostalgia',         'Pop',        103, 0.83, 0.92, 203, 'https://i.scdn.co/image/ab67616d0000b273bd26ede1ae69327010d49946'),
('Watermelon Sugar',      'Harry Styles',    'Fine Line',                'Pop',        95,  0.82, 0.94, 174, 'https://i.scdn.co/image/ab67616d0000b2732e8ed79e177ff6011076f5f0'),
('Cruel Summer',          'Taylor Swift',    'Lover',                    'Pop',        170, 0.70, 0.64, 178, 'https://i.scdn.co/image/ab67616d0000b273e787cffec20aa2a396a61647'),

-- ROCK
('Mr. Brightside',        'The Killers',     'Hot Fuss',                 'Rock',       148, 0.92, 0.29, 222, 'https://i.scdn.co/image/ab67616d0000b2730d9c3d7a0a77acae73ebc5ef'),
('Smells Like Teen Spirit','Nirvana',        'Nevermind',                'Rock',       117, 0.91, 0.31, 301, 'https://i.scdn.co/image/ab67616d0000b273e175a19e530c898d167d39bf'),
('Bohemian Rhapsody',     'Queen',           'A Night at the Opera',     'Rock',       146, 0.40, 0.22, 354, 'https://i.scdn.co/image/ab67616d0000b2730d9c3d7a0a77acae73ebc5ef'),
('Under the Bridge',      'Red Hot Chili Peppers','Blood Sugar Sex Magik','Rock',      82,  0.43, 0.39, 264, 'https://i.scdn.co/image/ab67616d0000b2730d9c3d7a0a77acae73ebc5ef'),
('Yellow',                'Coldplay',        'Parachutes',               'Rock',       174, 0.41, 0.30, 268, 'https://i.scdn.co/image/ab67616d0000b273de09e02aa7febf30b7c02d82'),
('Radioactive',           'Imagine Dragons', 'Night Visions',            'Rock',       136, 0.67, 0.21, 187, 'https://i.scdn.co/image/ab67616d0000b27378a89a26be4df4f4b62d7acf'),
('Paradise',              'Coldplay',        'Mylo Xyloto',              'Rock',       140, 0.70, 0.56, 279, 'https://i.scdn.co/image/ab67616d0000b273de09e02aa7febf30b7c02d82'),

-- HIP-HOP
('God\'s Plan',           'Drake',           'Scorpion',                 'Hip-Hop',    77,  0.45, 0.25, 198, 'https://i.scdn.co/image/ab67616d0000b2731f4e956e4ae85f9f2e35455d'),
('HUMBLE.',               'Kendrick Lamar',  'DAMN.',                    'Hip-Hop',    150, 0.54, 0.38, 177, 'https://i.scdn.co/image/ab67616d0000b27388a3f52b838d1534a3d68fe3'),
('Rockstar',              'Post Malone',     'Beerbongs & Bentleys',     'Hip-Hop',    160, 0.53, 0.19, 218, 'https://i.scdn.co/image/ab67616d0000b2739478c87599550dd73bfa7e02'),
('Sicko Mode',            'Travis Scott',    'Astroworld',               'Hip-Hop',    155, 0.73, 0.23, 312, 'https://i.scdn.co/image/ab67616d0000b273072e9faef2ef7b6db63834a3'),
('DNA.',                  'Kendrick Lamar',  'DAMN.',                    'Hip-Hop',    165, 0.77, 0.45, 185, 'https://i.scdn.co/image/ab67616d0000b27388a3f52b838d1534a3d68fe3'),
('Lose Yourself',         'Eminem',          '8 Mile Soundtrack',        'Hip-Hop',    171, 0.63, 0.38, 326, 'https://i.scdn.co/image/ab67616d0000b273ced8a0aef1bf5873a6b85f9b'),
('Industry Baby',         'Lil Nas X',       'MONTERO',                  'Hip-Hop',    150, 0.70, 0.64, 212, 'https://i.scdn.co/image/ab67616d0000b273e3a05af3d6e5f5d07efb4bde'),

-- ELECTRONIC / EDM
('Titanium',              'David Guetta',    'Nothing but the Beat',     'Electronic', 126, 0.82, 0.30, 245, 'https://i.scdn.co/image/ab67616d0000b2736f7c8de7a8c32e88d7f52a15'),
('Animals',               'Martin Garrix',   'Gold Skies EP',            'Electronic', 128, 0.92, 0.46, 240, 'https://i.scdn.co/image/ab67616d0000b273e3a05af3d6e5f5d07efb4bde'),
('Don\'t You Worry Child','Swedish House Mafia','Until Now',             'Electronic', 128, 0.86, 0.70, 228, 'https://i.scdn.co/image/ab67616d0000b273a4873e07e6a69a87bd0dba97'),
('Wake Me Up',            'Avicii',          'True',                     'Electronic', 124, 0.64, 0.65, 247, 'https://i.scdn.co/image/ab67616d0000b2734c79d5ec52a6d0302f3add25'),
('Levels',                'Avicii',          'Levels',                   'Electronic', 126, 0.90, 0.81, 197, 'https://i.scdn.co/image/ab67616d0000b2734c79d5ec52a6d0302f3add25'),
('Closer',                'The Chainsmokers','Collage EP',               'Electronic', 95,  0.54, 0.41, 244, 'https://i.scdn.co/image/ab67616d0000b273bcd20ef4a56e3a6a81e0551c'),
('One More Time',         'Daft Punk',       'Discovery',                'Electronic', 123, 0.85, 0.96, 321, 'https://i.scdn.co/image/ab67616d0000b273b33d46dfa2f330fc9s2349ac'),

-- R&B / SOUL
('Redbone',               'Childish Gambino','Awaken, My Love!',         'R&B',        88,  0.42, 0.72, 327, 'https://i.scdn.co/image/ab67616d0000b273d3d4c0f146c10f88a66b0f0c'),
('Stay With Me',          'Sam Smith',       'In the Lonely Hour',       'R&B',        83,  0.39, 0.28, 172, 'https://i.scdn.co/image/ab67616d0000b2731f4e956e4ae85f9f2e35455d'),
('No One',                'Alicia Keys',     'As I Am',                  'R&B',        80,  0.49, 0.56, 228, 'https://i.scdn.co/image/ab67616d0000b273e8cc20e00ef7a3f756e07e5d'),
('Thinking Out Loud',     'Ed Sheeran',      'x',                        'R&B',        79,  0.48, 0.65, 281, 'https://i.scdn.co/image/ab67616d0000b273e96f372eef441e8f3dad3f69'),
('Good Days',             'SZA',             'Good Days',                'R&B',        93,  0.42, 0.36, 394, 'https://i.scdn.co/image/ab67616d0000b273825765048af56f9e28d90d44'),
('Peaches',               'Justin Bieber',   'Justice',                  'R&B',        90,  0.52, 0.75, 198, 'https://i.scdn.co/image/ab67616d0000b273e6f407c7f3a0ec98845e4431'),
('All of Me',             'John Legend',     'Love in the Future',       'R&B',        63,  0.38, 0.52, 269, 'https://i.scdn.co/image/ab67616d0000b273d3d4c0f146c10f88a66b0f0c'),

-- JAZZ
('Take Five',             'Dave Brubeck',    'Time Out',                 'Jazz',       174, 0.28, 0.58, 324, 'https://i.scdn.co/image/ab67616d0000b273d5f35c7a592c1c3f1b07c9cc'),
('So What',               'Miles Davis',     'Kind of Blue',             'Jazz',       136, 0.22, 0.42, 562, 'https://i.scdn.co/image/ab67616d0000b273d74b2836e1a8f2a56975c4b4'),
('Autumn Leaves',         'Bill Evans',      'Portrait in Jazz',         'Jazz',       108, 0.19, 0.39, 326, 'https://i.scdn.co/image/ab67616d0000b273d74b2836e1a8f2a56975c4b4'),
('Fly Me to the Moon',    'Frank Sinatra',   'It Might as Well Be Swing','Jazz',       140, 0.41, 0.82, 147, 'https://i.scdn.co/image/ab67616d0000b2739a16bbc40d3b40fcff9af28d'),
('What a Wonderful World','Louis Armstrong', 'What a Wonderful World',   'Jazz',       72,  0.18, 0.84, 139, 'https://i.scdn.co/image/ab67616d0000b2739a16bbc40d3b40fcff9af28d'),
('Blue in Green',         'Miles Davis',     'Kind of Blue',             'Jazz',       47,  0.14, 0.27, 337, 'https://i.scdn.co/image/ab67616d0000b273d74b2836e1a8f2a56975c4b4'),

-- CLASSICAL
('Moonlight Sonata',      'Beethoven',       'Piano Sonata No. 14',      'Classical',  54,  0.10, 0.11, 900, 'https://i.scdn.co/image/ab67616d0000b273d6d5e71ab56e5d4f1e5e6a9a'),
('Clair de Lune',         'Debussy',         'Suite Bergamasque',        'Classical',  60,  0.08, 0.36, 318, 'https://i.scdn.co/image/ab67616d0000b273d6d5e71ab56e5d4f1e5e6a9a'),
('Canon in D',            'Pachelbel',       'Baroque Favorites',        'Classical',  100, 0.16, 0.68, 420, 'https://i.scdn.co/image/ab67616d0000b2734be2c1d5e4a19d90785dd2e8'),
('Symphony No. 5',        'Beethoven',       'Symphony No. 5',           'Classical',  108, 0.50, 0.15, 2100,'https://i.scdn.co/image/ab67616d0000b2734be2c1d5e4a19d90785dd2e8'),
('Für Elise',             'Beethoven',       'Piano Works',              'Classical',  70,  0.13, 0.44, 177, 'https://i.scdn.co/image/ab67616d0000b273d6d5e71ab56e5d4f1e5e6a9a'),
('The Four Seasons',      'Vivaldi',         'The Four Seasons',         'Classical',  140, 0.62, 0.55, 660, 'https://i.scdn.co/image/ab67616d0000b2734be2c1d5e4a19d90785dd2e8'),
('Gymnopédie No. 1',      'Erik Satie',      'Gymnopédies',              'Classical',  60,  0.07, 0.42, 195, 'https://i.scdn.co/image/ab67616d0000b273d6d5e71ab56e5d4f1e5e6a9a');
