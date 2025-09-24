// backend/server.js
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// SQLite DB öffnen (Datei wird automatisch angelegt)
const db = new sqlite3.Database("database.db");

// Tabellen erstellen, falls sie nicht existieren
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS netzplaene (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS aktivitaeten (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      netzplan_id INTEGER,
      name TEXT NOT NULL,
      dauer INTEGER,
      vorgaenger TEXT,
      FOREIGN KEY (netzplan_id) REFERENCES netzplaene(id)
    )
  `);
});

// -------------------
// Netzplan-Endpunkte
// -------------------

// Alle Netzpläne abrufen
app.get("/netzplaene", (_req, res) => {
  db.all("SELECT * FROM netzplaene", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Neuen Netzplan erstellen
app.post("/netzplaene", (req, res) => {
  const { name } = req.body;
  db.run(
    "INSERT INTO netzplaene (name) VALUES (?)",
    [name],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name });
    }
  );
});

// -------------------
// Aktivitäten-Endpunkte
// -------------------

// Aktivitäten eines Netzplans abrufen
app.get("/netzplaene/:id/aktivitaeten", (req, res) => {
  const netzplanId = parseInt(req.params.id);
  db.all(
    "SELECT * FROM aktivitaeten WHERE netzplan_id = ?",
    [netzplanId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Neue Aktivität erstellen
app.post("/aktivitaeten", (req, res) => {
  const { netzplan_id, name, dauer, vorgaenger } = req.body;
  db.run(
    "INSERT INTO aktivitaeten (netzplan_id, name, dauer, vorgaenger) VALUES (?, ?, ?, ?)",
    [netzplan_id, name, dauer, vorgaenger],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        id: this.lastID,
        netzplan_id,
        name,
        dauer,
        vorgaenger,
      });
    }
  );
});

// -------------------
// Server starten
// -------------------
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Backend läuft auf http://localhost:${PORT}`);
});
