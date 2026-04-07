import { v4 as uuidv4 } from "uuid";

function nowIso() {
  return new Date().toISOString();
}

function mapRow(row) {
  return {
    id: row.id,
    title: row.title,
    completed: Boolean(row.completed),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function sortTodos(rows) {
  const todos = rows.map(mapRow);
  return todos.sort((a, b) => {
    if (a.completed !== b.completed) {
      return Number(a.completed) - Number(b.completed);
    }
    if (!a.completed) {
      return a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0;
    }
    return a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : 0;
  });
}

export function createTodoRepo(db) {
  const listStmt = db.prepare(
    `SELECT id, title, completed, created_at, updated_at FROM todos`,
  );

  return {
    list() {
      return sortTodos(listStmt.all());
    },

    create(title) {
      const id = uuidv4();
      const ts = nowIso();
      const stmt = db.prepare(
        `INSERT INTO todos (id, title, completed, created_at, updated_at)
         VALUES (@id, @title, 0, @ts, @ts)`,
      );
      stmt.run({ id, title, ts });
      return mapRow(db.prepare(`SELECT * FROM todos WHERE id = ?`).get(id));
    },

    setCompleted(id, completed) {
      const ts = nowIso();
      const row = db
        .prepare(
          `UPDATE todos SET completed = @completed, updated_at = @ts WHERE id = @id`,
        )
        .run({ id, completed: completed ? 1 : 0, ts });
      if (row.changes === 0) return null;
      return mapRow(db.prepare(`SELECT * FROM todos WHERE id = ?`).get(id));
    },

    delete(id) {
      const row = db.prepare(`DELETE FROM todos WHERE id = ?`).run(id);
      return row.changes > 0;
    },
  };
}
