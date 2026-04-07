import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

type ApiErrorBody = { error?: { message?: string } };

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function formatWhen(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function App() {
  const [todos, setTodos] = useState<Todo[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const trimmedTitle = title.trim();
  const canAdd = trimmedTitle.length > 0;

  const [loadingList, setLoadingList] = useState(true);
  const [pending, setPending] = useState<{
    add?: boolean;
    toggle?: Set<string>;
    delete?: Set<string>;
  }>({});

  const fetchTodos = useCallback(async () => {
    setLoadError(null);
    setLoadingList(true);
    try {
      const res = await fetch("/api/todos");
      const body = (await parseJson(res)) as { todos?: Todo[] } | null;
      if (!res.ok) {
        const msg =
          (body as ApiErrorBody)?.error?.message || "Couldn’t load your todos.";
        throw new Error(msg);
      }
      setTodos(body?.todos ?? []);
    } catch (e) {
      setTodos(null);
      setLoadError(e instanceof Error ? e.message : "Couldn’t load your todos.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    void fetchTodos();
  }, [fetchTodos]);

  const addTodo = useCallback(async () => {
    if (!canAdd) return;
    setActionError(null);
    setPending((p) => ({ ...p, add: true }));
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmedTitle }),
      });
      const body = (await parseJson(res)) as { todo?: Todo } | null;
      if (!res.ok) {
        const msg =
          (body as ApiErrorBody)?.error?.message || "Couldn’t save changes.";
        throw new Error(msg);
      }
      if (body?.todo) {
        setTodos((prev) => (prev ? [body.todo!, ...prev] : [body.todo!]));
      } else {
        await fetchTodos();
      }
      setTitle("");
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Couldn’t save changes.");
    } finally {
      setPending((p) => ({ ...p, add: false }));
    }
  }, [canAdd, trimmedTitle, fetchTodos]);

  const toggle = useCallback(
    async (id: string, completed: boolean) => {
      setActionError(null);
      setPending((p) => {
        const next = new Set(p.toggle ?? []);
        next.add(id);
        return { ...p, toggle: next };
      });
      const prevSnap = todos;
      setTodos((list) =>
        list
          ? list.map((t) =>
              t.id === id ? { ...t, completed, updatedAt: new Date().toISOString() } : t,
            )
          : list,
      );
      try {
        const res = await fetch(`/api/todos/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed }),
        });
        const body = (await parseJson(res)) as { todo?: Todo } | null;
        if (!res.ok) {
          const msg =
            (body as ApiErrorBody)?.error?.message || "Couldn’t save changes.";
          throw new Error(msg);
        }
        if (body?.todo) {
          setTodos((list) =>
            list ? list.map((t) => (t.id === id ? body.todo! : t)) : list,
          );
        }
      } catch (e) {
        setTodos(prevSnap);
        setActionError(e instanceof Error ? e.message : "Couldn’t save changes.");
      } finally {
        setPending((p) => {
          const next = new Set(p.toggle ?? []);
          next.delete(id);
          return { ...p, toggle: next };
        });
      }
    },
    [todos],
  );

  const remove = useCallback(
    async (id: string) => {
      setActionError(null);
      setPending((p) => {
        const next = new Set(p.delete ?? []);
        next.add(id);
        return { ...p, delete: next };
      });
      const prevSnap = todos;
      setTodos((list) => (list ? list.filter((t) => t.id !== id) : list));
      try {
        const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
        if (res.status === 404) {
          const body = (await parseJson(res)) as ApiErrorBody | null;
          throw new Error(body?.error?.message || "Todo not found.");
        }
        if (!res.ok) {
          const body = (await parseJson(res)) as ApiErrorBody | null;
          throw new Error(body?.error?.message || "Couldn’t save changes.");
        }
      } catch (e) {
        setTodos(prevSnap);
        setActionError(e instanceof Error ? e.message : "Couldn’t save changes.");
      } finally {
        setPending((p) => {
          const next = new Set(p.delete ?? []);
          next.delete(id);
          return { ...p, delete: next };
        });
      }
    },
    [todos],
  );

  const busyToggle = useCallback(
    (id: string) => pending.toggle?.has(id) ?? false,
    [pending.toggle],
  );
  const busyDelete = useCallback(
    (id: string) => pending.delete?.has(id) ?? false,
    [pending.delete],
  );

  const disableAdd =
    todos === null ||
    Boolean(loadError) ||
    loadingList ||
    Boolean(pending.add) ||
    !canAdd;

  const sections = useMemo(() => {
    if (!todos) return { active: [] as Todo[], done: [] as Todo[] };
    const active = todos.filter((t) => !t.completed);
    const done = todos.filter((t) => t.completed);
    return { active, done };
  }, [todos]);

  const initialBlocked = (loadingList && todos === null) || Boolean(loadError);

  return (
    <div className="app">
      <h1>Todos</h1>

      {loadError && (
        <div className="banner banner--error" role="alert">
          <div>
            <p>
              <strong>Couldn’t load your todos.</strong>
            </p>
            <p>{loadError}</p>
          </div>
          <button type="button" className="retry" onClick={() => void fetchTodos()}>
            Retry
          </button>
        </div>
      )}

      {actionError && !loadError && (
        <div className="banner banner--error" role="alert">
          <div>
            <p>
              <strong>Couldn’t save changes.</strong>
            </p>
            <p>{actionError}</p>
          </div>
          <button type="button" className="retry" onClick={() => setActionError(null)}>
            Dismiss
          </button>
        </div>
      )}

      <div className="add-form">
        <label htmlFor="todo-title" className="sr-only">
          New task
        </label>
        <input
          id="todo-title"
          name="title"
          placeholder="Add a task…"
          autoComplete="off"
          value={title}
          disabled={initialBlocked}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void addTodo();
          }}
        />
        <button type="button" disabled={disableAdd} onClick={() => void addTodo()}>
          {pending.add ? "Adding…" : "Add"}
        </button>
      </div>

      {loadingList && todos === null && !loadError && (
        <p className="loading">Loading todos…</p>
      )}

      {todos && todos.length === 0 && !loadError && (
        <div className="empty">
          <p>
            <strong>No todos yet.</strong>
          </p>
          <p>Add your first task above.</p>
        </div>
      )}

      {todos && todos.length > 0 && (
        <>
          {sections.active.length > 0 && (
            <ul className="list" aria-label="Active tasks">
              {sections.active.map((t) => (
                <li key={t.id} className={`row ${t.completed ? "done" : ""}`}>
                  <div className="row-check">
                    <input
                      type="checkbox"
                      checked={t.completed}
                      disabled={busyToggle(t.id)}
                      aria-label={`Mark complete: ${t.title}`}
                      onChange={(e) => void toggle(t.id, e.target.checked)}
                    />
                  </div>
                  <div className="row-text">
                    <p className="title">{t.title}</p>
                  </div>
                  <div className="row-meta">
                    <span className="meta">{formatWhen(t.createdAt)}</span>
                    <button
                      type="button"
                      className="delete"
                      disabled={busyDelete(t.id)}
                      aria-label={`Delete todo: ${t.title}`}
                      onClick={() => void remove(t.id)}
                    >
                      {busyDelete(t.id) ? "…" : "Delete"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {sections.done.length > 0 && (
            <ul className="list" aria-label="Completed tasks" style={{ marginTop: "1rem" }}>
              {sections.done.map((t) => (
                <li key={t.id} className={`row done`}>
                  <div className="row-check">
                    <input
                      type="checkbox"
                      checked={t.completed}
                      disabled={busyToggle(t.id)}
                      aria-label={`Mark not complete: ${t.title}`}
                      onChange={(e) => void toggle(t.id, e.target.checked)}
                    />
                  </div>
                  <div className="row-text">
                    <p className="title">{t.title}</p>
                  </div>
                  <div className="row-meta">
                    <span className="meta">{formatWhen(t.createdAt)}</span>
                    <button
                      type="button"
                      className="delete"
                      disabled={busyDelete(t.id)}
                      aria-label={`Delete todo: ${t.title}`}
                      onClick={() => void remove(t.id)}
                    >
                      {busyDelete(t.id) ? "…" : "Delete"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <style>{`
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      `}</style>
    </div>
  );
}
