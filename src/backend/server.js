// backend/server.js
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("database.db");

// -------------------
// Tabellen erstellen
// -------------------
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS netzplaene (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS aktivitaeten (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      netzplan_id INTEGER,
      ref_number INTEGER NOT NULL,
      name TEXT NOT NULL,
      dauer REAL NOT NULL,
      FOREIGN KEY (netzplan_id) REFERENCES netzplaene(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS vorgaenger_mappings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      aktivitaet_id INTEGER NOT NULL,
      vorgaenger_id INTEGER NOT NULL,
      FOREIGN KEY (aktivitaet_id) REFERENCES aktivitaeten(id),
      FOREIGN KEY (vorgaenger_id) REFERENCES aktivitaeten(id)
    )
  `);
});

// -------------------
// Netzplan-Endpunkte
// -------------------
app.get("/netzplaene", (_req, res) => {
  db.all("SELECT * FROM netzplaene", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get("/netzplaene/:id", (req, res) => {
  const netzplanId = parseInt(req.params.id);
  db.get("SELECT * FROM netzplaene WHERE id = ?", [netzplanId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Netzplan not found" });
    res.json(row);
  });
});

app.post("/netzplaene", (req, res) => {
  const { name, description } = req.body;
  db.run(
    "INSERT INTO netzplaene (name, description) VALUES (?, ?)",
    [name, description],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, description });
    }
  );
});

// ❌ Netzplan löschen inkl. Aktivitäten + Vorgänger
app.delete("/netzplaene/:id", (req, res) => {
  const netzplanId = parseInt(req.params.id);

  db.all("SELECT id FROM aktivitaeten WHERE netzplan_id = ?", [netzplanId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const aktivitaetIds = rows.map(r => r.id);
    if (aktivitaetIds.length > 0) {
      const placeholders = aktivitaetIds.map(() => "?").join(",");

      // Vorgänger-Mappings löschen (als Aktivität ODER als Vorgänger)
      db.run(
        `DELETE FROM vorgaenger_mappings 
         WHERE aktivitaet_id IN (${placeholders}) 
         OR vorgaenger_id IN (${placeholders})`,
        [...aktivitaetIds, ...aktivitaetIds],
        (err2) => {
          if (err2) return res.status(500).json({ error: err2.message });

          // Aktivitäten löschen
          db.run(
            `DELETE FROM aktivitaeten WHERE id IN (${placeholders})`,
            aktivitaetIds,
            (err3) => {
              if (err3) return res.status(500).json({ error: err3.message });

              // Netzplan löschen
              db.run("DELETE FROM netzplaene WHERE id = ?", [netzplanId], function (err4) {
                if (err4) return res.status(500).json({ error: err4.message });
                res.json({ deleted: this.changes });
              });
            }
          );
        }
      );
    } else {
      db.run("DELETE FROM netzplaene WHERE id = ?", [netzplanId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
      });
    }
  });
});

// -------------------
// Aktivitäten-Endpunkte
// -------------------
app.get("/netzplaene/:id/aktivitaeten", (req, res) => {
  const netzplanId = parseInt(req.params.id);
  db.all(
    "SELECT * FROM aktivitaeten WHERE netzplan_id = ? ORDER BY ref_number ASC",
    [netzplanId],
    async (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      const promises = rows.map(
        row =>
          new Promise(resolve => {
            db.all(
              "SELECT vorgaenger_id FROM vorgaenger_mappings WHERE aktivitaet_id = ?",
              [row.id],
              (err2, vorgaengerRows) => {
                if (err2) return resolve(row);
                row.vorgaenger = vorgaengerRows.map(v => v.vorgaenger_id);
                resolve(row);
              }
            );
          })
      );

      const withVorgaenger = await Promise.all(promises);
      res.json(withVorgaenger);
    }
  );
});

app.post("/aktivitaeten", (req, res) => {
  const { netzplan_id, ref_number, name, dauer, vorgaenger = [] } = req.body;

  db.run(
    "INSERT INTO aktivitaeten (netzplan_id, ref_number, name, dauer) VALUES (?, ?, ?, ?)",
    [netzplan_id, ref_number, name, dauer],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      const aktivitaetId = this.lastID;

      const stmt = db.prepare(
        "INSERT INTO vorgaenger_mappings (aktivitaet_id, vorgaenger_id) VALUES (?, ?)"
      );
      vorgaenger.forEach(vId => stmt.run(aktivitaetId, vId));
      stmt.finalize();

      res.json({
        id: aktivitaetId,
        netzplan_id,
        ref_number,
        name,
        dauer,
        vorgaenger,
      });
    }
  );
});

app.put("/aktivitaeten/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { ref_number, name, dauer, vorgaenger = [] } = req.body;

  db.run(
    "UPDATE aktivitaeten SET ref_number = ?, name = ?, dauer = ? WHERE id = ?",
    [ref_number, name, dauer, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      db.run("DELETE FROM vorgaenger_mappings WHERE aktivitaet_id = ?", [id], err2 => {
        if (err2) return res.status(500).json({ error: err2.message });

        const stmt = db.prepare(
          "INSERT INTO vorgaenger_mappings (aktivitaet_id, vorgaenger_id) VALUES (?, ?)"
        );
        vorgaenger.forEach(vId => stmt.run(id, vId));
        stmt.finalize();

        res.json({ id, ref_number, name, dauer, vorgaenger });
      });
    }
  );
});

app.delete("/aktivitaeten/:id", (req, res) => {
  const id = parseInt(req.params.id);

  db.run(
    "DELETE FROM vorgaenger_mappings WHERE aktivitaet_id = ? OR vorgaenger_id = ?",
    [id, id],
    (err1) => {
      if (err1) return res.status(500).json({ error: err1.message });

      db.run("DELETE FROM aktivitaeten WHERE id = ?", [id], function (err2) {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ deleted: this.changes });
      });
    }
  );
});

// -------------------
// Server starten
// -------------------
const PORT = 4000;
const HOST = '0.0.0.0'; // Listen on all network interfaces

app.listen(PORT, HOST, () => {
  console.log(`✅ Backend läuft auf http://localhost:${PORT}`);
  console.log(`🌐 Auch erreichbar über Netzwerk auf http://<YOUR_IP>:${PORT}`);
  console.log(`💡 Um deine IP zu finden: "ipconfig" (Windows) oder "ip a" (Mac/Linux)`);
});
