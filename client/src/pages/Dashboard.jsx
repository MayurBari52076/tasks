import { useEffect, useState, useContext } from "react";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
  const { token, logout, user } = useContext(AuthContext);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [myTasks, setMyTasks] = useState([]);
  const [collabTasks, setCollabTasks] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [subtaskInputs, setSubtaskInputs] = useState({});

  const [inviteTaskId, setInviteTaskId] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");

  const [theme, setTheme] = useState("dark");

  const [dragIndex, setDragIndex] = useState(null);

  // ---------------- THEME ----------------

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  // ---------------- FETCH TASKS ----------------

  const fetchTasks = async () => {
    const res = await api.get("/tasks", {
      headers: { Authorization: `Bearer ${token}` }
    });

    setMyTasks(res.data.myTasks);
    setCollabTasks(res.data.collaborativeTasks);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // ---------------- CREATE / UPDATE ----------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      await api.put(
        `/tasks/${editingId}`,
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingId(null);
    } else {
      await api.post(
        "/tasks",
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    setTitle("");
    setDescription("");
    fetchTasks();
  };

  // ---------------- DELETE ----------------

  const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchTasks();
  };

  // ---------------- SUBTASK ----------------

  const addSubtask = async (taskId) => {
    if (!subtaskInputs[taskId]) return;

    await api.post(
      `/tasks/${taskId}/subtasks`,
      { title: subtaskInputs[taskId] },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setSubtaskInputs({ ...subtaskInputs, [taskId]: "" });
    fetchTasks();
  };

  const toggleSubtask = async (taskId, subId) => {
    await api.put(
      `/tasks/${taskId}/subtasks/${subId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchTasks();
  };

  // ---------------- INVITE ----------------

  const sendInvite = async () => {
    const res = await api.post(
      `/invites/${inviteTaskId}`,
      { email: inviteEmail },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setInviteLink(res.data.link);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    alert("Invite link copied!");
  };

  // ---------------- SEARCH + FILTER + SORT ----------------

  const applyLogic = (tasks) => {
    let filtered = tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description.toLowerCase().includes(search.toLowerCase())
    );

    if (filter === "completed") {
      filtered = filtered.filter(
        (t) => t.subtasks.length && t.subtasks.every(s => s.completed)
      );
    }

    if (filter === "pending") {
      filtered = filtered.filter(
        (t) => t.subtasks.some(s => !s.completed)
      );
    }

    filtered.sort((a, b) =>
      sort === "newest"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );

    return filtered;
  };

  // ---------------- DRAG & DROP ----------------

  const handleDragStart = (index) => {
    setDragIndex(index);
  };

  const handleDrop = (index) => {
    const updated = [...myTasks];
    const draggedItem = updated.splice(dragIndex, 1)[0];
    updated.splice(index, 0, draggedItem);
    setMyTasks(updated);
  };

  // ------------------------------------------------------

  return (
    <div className="dashboard">

      {/* HEADER */}
      <div className="header">

        <div>
          <h2>{user?.name}</h2>
          <small>{user?.email}</small>
        </div>

        <div className="btn-row">

          <button onClick={() =>
            setTheme(theme === "dark" ? "light" : "dark")
          }>
            {theme === "dark" ? "☀ Light" : "🌙 Dark"}
          </button>

          <button className="danger-btn" onClick={logout}>
            🚪 Logout
          </button>

        </div>

      </div>

      {/* FILTER BAR */}
      <div className="filter-bar">

        <input
          placeholder="🔍 Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>

      </div>

      {/* CREATE */}
      <div className="create-box">

        <form onSubmit={handleSubmit} className="form">

          <input
            placeholder="📝 Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            placeholder="📄 Task description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button>
            {editingId ? "Update Task" : "Create Task"}
          </button>

        </form>

      </div>

      {/* ---------------- MY TASKS ---------------- */}

      <h2 className="section-title">My Tasks (Drag to reorder)</h2>

      {applyLogic(myTasks).map((task, index) => (
        <div
          key={task._id}
          className="task-card"
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(index)}
        >

          <h3>{task.title}</h3>
          <p>{task.description}</p>

          <div className="btn-row">

            <button onClick={() => {
              setEditingId(task._id);
              setTitle(task.title);
              setDescription(task.description);
            }}>
              ✏ Edit
            </button>

            <button className="danger-btn"
              onClick={() => deleteTask(task._id)}>
              🗑 Delete
            </button>

            <button onClick={() => {
              setInviteTaskId(task._id);
              setInviteEmail("");
              setInviteLink("");
            }}>
              👥 Invite
            </button>

          </div>

          {task.subtasks.map((sub) => (
            <div key={sub._id} className="subtask">
              <input
                type="checkbox"
                checked={sub.completed}
                onChange={() => toggleSubtask(task._id, sub._id)}
              />
              <span>{sub.title}</span>
            </div>
          ))}

          <div className="btn-row">
            <input
              placeholder="New subtask"
              value={subtaskInputs[task._id] || ""}
              onChange={(e) =>
                setSubtaskInputs({
                  ...subtaskInputs,
                  [task._id]: e.target.value
                })
              }
            />
            <button onClick={() => addSubtask(task._id)}>Add</button>
          </div>

        </div>
      ))}

      {/* ---------------- COLLAB TASKS ---------------- */}

      <h2 className="section-title">Collaborative Tasks</h2>

      {applyLogic(collabTasks).map((task) => (
        <div key={task._id} className="task-card collab-card">

          <h3>{task.title}</h3>
          <p>{task.description}</p>

          {task.subtasks.map((sub) => (
            <div key={sub._id} className="subtask">
              <input
                type="checkbox"
                checked={sub.completed}
                onChange={() => toggleSubtask(task._id, sub._id)}
              />
              <span>{sub.title}</span>
            </div>
          ))}

        </div>
      ))}

      {/* ---------------- INVITE ---------------- */}

      {inviteTaskId && (
        <div className="invite-box">

          <h3>Invite User</h3>

          <input
            placeholder="Email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />

          <button onClick={sendInvite}>
            Generate Invite Link
          </button>

          {inviteLink && (
            <>
              <p>{inviteLink}</p>
              <button onClick={copyLink}>📋 Copy</button>
            </>
          )}

        </div>
      )}

    </div>
  );
}
