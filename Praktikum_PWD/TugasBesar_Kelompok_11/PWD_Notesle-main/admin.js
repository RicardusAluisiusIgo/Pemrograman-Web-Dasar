const token = localStorage.getItem('notes_token');
if (!token) location.href = 'index.html';

const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("theme") || "dark";

document.documentElement.setAttribute("data-theme", savedTheme);
if (themeToggle) themeToggle.textContent = savedTheme === "dark" ? "🌙" : "☀️";

themeToggle?.addEventListener("click", () => {
  const cur = document.documentElement.getAttribute("data-theme");
  const next = cur === "dark" ? "light" : "dark";
  
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  
  themeToggle.textContent = next === "dark" ? "🌙" : "☀️";
});

async function apiFetch(path, opts = {}) {
  opts.headers = opts.headers || {};
  opts.headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(path, opts);
  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    alert("Sesi habis. Silakan login ulang.");
    localStorage.removeItem('notes_token');
    location.href = 'index.html';
    return null;
  }
  if (res.status === 403) {
    alert("⛔ AKSES DITOLAK: Anda bukan Admin!");
    location.href = 'app.html';
    return null;
  }
  if (!res.ok) throw data;
  return data;
}

async function loadDashboard() {
  try {
    const data = await apiFetch('api/admin.php');
    if (!data) return;

    document.getElementById('countUsers').textContent = data.count_users ?? 0;
    document.getElementById('countNotes').textContent = data.count_notes ?? 0;

    document.getElementById('usersTable').innerHTML = (data.users || []).map(u => `
      <tr>
        <td>
          <div style="font-weight:bold">${u.username}</div>
          <div class="small muted">${u.role === 'admin' ? '🛡️ Admin' : 'User'}</div>
        </td>
        <td>${u.email}</td>
        <td>${u.notes_count}</td>
        <td style="text-align: right;">
           ${u.role !== 'admin' ? 
             `<button class="danger small-btn" onclick="deleteUser(${u.id}, '${u.username}')">Hapus</button>` 
             : '<span class="small muted">Protected</span>'}
        </td>
      </tr>
    `).join('') || `<tr><td colspan="4" class="small">Tidak ada user.</td></tr>`;

    document.getElementById('notesTable').innerHTML = (data.latest_notes || []).map(n => `
      <tr>
        <td>${n.username}</td>
        <td>${n.title}</td>
        <td class="small muted">${n.created_at}</td>
        <td style="text-align: right;">
          <button class="danger small-btn" onclick="deleteNote(${n.id})">Hapus</button>
        </td>
      </tr>
    `).join('') || `<tr><td colspan="4" class="small">Tidak ada catatan.</td></tr>`;

  } catch (err) {
    console.error(err);
  }
}

window.deleteUser = async (id, name) => {
  if(!confirm(`⚠️ Hapus user "${name}"?\nSemua catatan milik user ini juga akan dihapus permanen.`)) return;
  
  try {
    await apiFetch(`api/admin.php?action=delete_user&id=${id}`, { method: 'POST' });
    loadDashboard();
  } catch (err) {
    alert(err.error || "Gagal hapus user");
  }
};

window.deleteNote = async (id) => {
  if(!confirm("Hapus catatan ini? Tindakan tidak bisa dibatalkan.")) return;

  try {
    await apiFetch(`api/admin.php?action=delete_note&id=${id}`, { method: 'POST' });
    loadDashboard();
  } catch (err) {
    alert(err.error || "Gagal hapus note");
  }
};

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('notes_token');
  location.href = 'index.html';
});

loadDashboard();