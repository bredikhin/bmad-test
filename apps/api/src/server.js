import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

import cors from "cors";
import express from "express";
import helmet from "helmet";
import Database from "better-sqlite3";

import { migrate } from "./migrate.js";
import { createTodoRepo } from "./repo.js";
import { validateTitle } from "./domain.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.PORT || 3001);
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";

const dbPath =
  process.env.DATABASE_PATH || path.join(__dirname, "..", "data", "app.db");
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
migrate(db);
const repo = createTodoRepo(db);

const app = express();
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: "64kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/todos", (_req, res) => {
  try {
    res.json({ todos: repo.list() });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: { code: "INTERNAL", message: "Could not load todos" },
    });
  }
});

app.post("/api/todos", (req, res) => {
  const v = validateTitle(req.body?.title);
  if (!v.ok) {
    return res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: v.error },
    });
  }
  try {
    const todo = repo.create(v.title);
    res.status(201).json({ todo });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: { code: "INTERNAL", message: "Could not create todo" },
    });
  }
});

app.patch("/api/todos/:id", (req, res) => {
  const { completed } = req.body ?? {};
  if (typeof completed !== "boolean") {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Body must include boolean completed",
      },
    });
  }
  try {
    const todo = repo.setCompleted(req.params.id, completed);
    if (!todo) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Todo not found" },
      });
    }
    res.json({ todo });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: { code: "INTERNAL", message: "Could not update todo" },
    });
  }
});

app.delete("/api/todos/:id", (req, res) => {
  try {
    const ok = repo.delete(req.params.id);
    if (!ok) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Todo not found" },
      });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: { code: "INTERNAL", message: "Could not delete todo" },
    });
  }
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
  console.log(`DB path: ${dbPath}`);
});
