const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'consensus.db');

// Ensure data dir exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

// Init SQLite
const db = new Database(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS chats (
    id TEXT PRIMARY KEY,
    title TEXT,
    messages TEXT NOT NULL DEFAULT '[]',
    created INTEGER,
    updated INTEGER
  );
  CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// ── Health ────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ ok: true, storage: 'sqlite', version: '1.0.0' }));

// ── Chats ─────────────────────────────────────────────
app.get('/api/history', (_, res) => {
  const rows = db.prepare('SELECT * FROM chats ORDER BY updated DESC').all();
  res.json(rows.map(r => ({ ...r, messages: JSON.parse(r.messages) })));
});

app.post('/api/history', (req, res) => {
  const { id, title, messages } = req.body;
  if (!id) return res.status(400).json({ error: 'id required' });
  const now = Date.now();
  db.prepare(`
    INSERT INTO chats (id, title, messages, created, updated)
    VALUES (@id, @title, @messages, @created, @updated)
    ON CONFLICT(id) DO UPDATE SET title=@title, messages=@messages, updated=@updated
  `).run({ id, title: title || '', messages: JSON.stringify(messages || []), created: now, updated: now });
  res.json({ ok: true });
});

app.delete('/api/history/:id', (req, res) => {
  db.prepare('DELETE FROM chats WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

app.delete('/api/history', (_, res) => {
  db.prepare('DELETE FROM chats').run();
  res.json({ ok: true });
});

// ── Config ────────────────────────────────────────────
app.get('/api/config', (_, res) => {
  const row = db.prepare('SELECT value FROM config WHERE key = ?').get('main');
  res.json(row ? JSON.parse(row.value) : null);
});

app.post('/api/config', (req, res) => {
  db.prepare(`
    INSERT INTO config (key, value) VALUES ('main', ?)
    ON CONFLICT(key) DO UPDATE SET value=excluded.value
  `).run(JSON.stringify(req.body));
  res.json({ ok: true });
});

// ── Stats ─────────────────────────────────────────────
app.get('/api/stats', (_, res) => {
  const chatCount = db.prepare('SELECT COUNT(*) as n FROM chats').get().n;
  const dbSize = fs.existsSync(DB_PATH) ? fs.statSync(DB_PATH).size : 0;
  res.json({ chatCount, dbSize, dbPath: DB_PATH });
});

// ── Fallback to index.html ────────────────────────────
app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(PORT, () => {
  console.log(`✅ Consensus running at http://localhost:${PORT}`);
  console.log(`📦 SQLite database: ${DB_PATH}`);
});
