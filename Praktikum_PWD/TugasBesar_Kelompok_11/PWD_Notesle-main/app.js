const token = localStorage.getItem("notes_token");

if (!token) {
  location.href = "index.html";
}

let currentTab = "active";
let notes = [];
let gps = { lat: null, lng: null };
let autosaveTimer = null;

async function apiFetch(path, opts = {}) {
  opts.headers = opts.headers || {};
  if (token) opts.headers["Authorization"] = "Bearer " + token;

  if (opts.body && typeof opts.body === "object" && !(opts.body instanceof FormData)) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(opts.body);
  }

  const res = await fetch(path, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data;
  return data;
}

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

const grid = document.getElementById("notesGrid");
const composer = document.querySelector(".composer");

const titleEl = document.getElementById("noteTitle");
const bodyEl = document.getElementById("noteBody");
const addBtn = document.getElementById("addNoteBtn");
const searchInput = document.getElementById("searchInput");
const gpsBtn = document.getElementById("gpsBtn");
const gpsBadge = document.getElementById("gpsBadge");
const logoutBtn = document.getElementById("logoutBtn");

// modal edit
const editModal = document.getElementById("editModal");

// modal view
const viewModal = document.getElementById("viewModal");
const viewTitle = document.getElementById("viewNoteTitle");
const viewBody = document.getElementById("viewNoteBody");
const viewMeta = document.getElementById("viewNoteMeta");
const viewCloseBtns = document.querySelectorAll("[data-close-view]");

// modal profil
const profileBtn = document.getElementById("profileBtn");
const profileModal = document.getElementById("profileModal");
const profileCloseBtns = document.querySelectorAll("[data-close-profile]");
const DEFAULT_AVATAR = "assets/avatar.jpeg";
const profileAvatar = document.getElementById("profileAvatar");
const profileAvatarLarge = document.getElementById("profileAvatarLarge");
const profilePhotoInput = document.getElementById("profilePhotoInput");
const removePhotoBtn = document.getElementById("removePhotoBtn");
const profileForm = document.getElementById("profileForm");
const profileUsername = document.getElementById("profileUsername");
const profileEmail = document.getElementById("profileEmail");
const profilePassword = document.getElementById("profilePassword");
const profilePassword2 = document.getElementById("profilePassword2");
const profileFeedback = document.getElementById("profileFeedback");

function setAvatar(src) {
  const finalSrc = src || DEFAULT_AVATAR;
  if (profileAvatar) profileAvatar.src = finalSrc;
  if (profileAvatarLarge) profileAvatarLarge.src = finalSrc;

  profileAvatar?.addEventListener("error", () => (profileAvatar.src = DEFAULT_AVATAR), { once: true });
  profileAvatarLarge?.addEventListener("error", () => (profileAvatarLarge.src = DEFAULT_AVATAR), { once: true });
}

const colors = ["yellow", "green", "blue", "pink", "purple"];
const pickColor = () => colors[Math.floor(Math.random() * colors.length)];

function escapeHtml(s = "") {
  return s.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}

function render(list) {
  if (!list.length) {
    grid.innerHTML = `<div class="small muted">${
      currentTab === "archived"
        ? "Belum ada catatan yang diarsipkan."
        : currentTab === "trashed"
        ? "Belum ada catatan di sampah."
        : "Belum ada catatan."
    }</div>`;
    return;
  }

  grid.innerHTML = list
    .map((n) => {
      const metaTrash = n.trashed_at ? `<span class="small muted">Hapus pada: ${n.trashed_at} (auto hilang 7 hari)</span>` : "";

      let actions = "";
      if (currentTab === "active") {
        actions = `
        <button class="secondary" data-action="edit" data-id="${n.id}">Edit</button>
        <button class="secondary" data-action="archive" data-id="${n.id}">Arsipkan</button>
        <button class="danger" data-action="delete" data-id="${n.id}">Hapus</button>
      `;
      } else if (currentTab === "archived") {
        actions = `
        <button class="secondary" data-action="unarchive" data-id="${n.id}">Kembalikan</button>
        <button class="danger" data-action="delete" data-id="${n.id}">Hapus</button>
      `;
      } else {
        actions = `
        <button class="secondary" data-action="restore" data-id="${n.id}">Restore</button>
        <button class="danger" data-action="purge" data-id="${n.id}">Hapus Permanen</button>
      `;
      }

      return `
      <article class="note ${n.color || ""}" data-id="${n.id}">
        <div class="note-title">${escapeHtml(n.title)}</div>
        <div class="note-body preview">${escapeHtml(n.body)}</div>

        <div class="note-meta">
          ${n.location_name ? `<span class="badge green">📍 ${escapeHtml(n.location_name)}</span>` : ""}
          <span class="small muted">${n.created_at || ""}</span>
          ${metaTrash}
        </div>


        <div class="note-actions">${actions}</div>
      </article>
    `;
    })
    .join("");
}

async function loadNotes() {
  notes = await apiFetch(`api/notes.php?status=${currentTab}`);
  render(notes);
  applyTabUI();
}
loadNotes();

function setActiveTab(btnId) {
  ["tabActive", "tabArchived", "tabTrash"].forEach((id) => {
    document.getElementById(id).classList.remove("active");
  });
  document.getElementById(btnId).classList.add("active");
}
function applyTabUI() {
  composer.style.display = currentTab === "active" ? "grid" : "none";
}
document.getElementById("tabActive").addEventListener("click", () => {
  currentTab = "active";
  setActiveTab("tabActive");
  loadNotes();
});
document.getElementById("tabArchived").addEventListener("click", () => {
  currentTab = "archived";
  setActiveTab("tabArchived");
  loadNotes();
});
document.getElementById("tabTrash").addEventListener("click", () => {
  currentTab = "trashed";
  setActiveTab("tabTrash");
  loadNotes();
});
setActiveTab("tabActive");

addBtn.addEventListener("click", async () => {
  const title = titleEl.value.trim();
  const body = bodyEl.value.trim();
  if (!title || !body) return alert("Judul & isi wajib diisi!");

  const fd = new FormData();
  fd.append("title", title);
  fd.append("body", body);
  fd.append("lat", gps.lat ?? "");
  fd.append("lng", gps.lng ?? "");
  fd.append("location_name", gps.location_name ?? "");
  fd.append("color", pickColor());

  const res = await fetch("api/notes.php", {
    method: "POST",
    headers: { Authorization: "Bearer " + token },
    body: fd,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) return alert(data.error || "Gagal simpan note");

  titleEl.value = "";
  bodyEl.value = "";
  localStorage.removeItem("draft_title");
  localStorage.removeItem("draft_body");
  gps = { lat: null, lng: null };
  gpsBadge.style.display = "none";

  currentTab = "active";
  setActiveTab("tabActive");
  loadNotes();
});

let autosaveEnabled = true;

const autosaveBadge = document.getElementById("autosaveBadge");

autosaveBadge.addEventListener("click", () => {
  autosaveEnabled = !autosaveEnabled;
  autosaveBadge.textContent = autosaveEnabled ? "Autosave aktif" : "Autosave mati";
  if (autosaveEnabled) {
    autosaveBadge.classList.remove("inactive");
  } else {
    autosaveBadge.classList.add("inactive");
  }
});

function autosaveDraft() {
  if (!autosaveEnabled) return;
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    localStorage.setItem("draft_title", titleEl.value);
    localStorage.setItem("draft_body", bodyEl.value);
  }, 250);
}

titleEl.addEventListener("input", autosaveDraft);
bodyEl.addEventListener("input", autosaveDraft);

titleEl.value = localStorage.getItem("draft_title") || "";
bodyEl.value = localStorage.getItem("draft_body") || "";

searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();
  render(notes.filter((n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)));
});

gpsBtn.addEventListener("click", () => {
  if (gps.lat && gps.lng) {
    gps = { lat: null, lng: null, location_name: null };
    gpsBadge.style.display = "none";
    gpsBtn.textContent = "Ambil Lokasi";
    return;
  }

  if (!navigator.geolocation) return alert("Browser tidak support GPS");

  gpsBtn.disabled = true;
  gpsBtn.textContent = "Mengambil lokasi...";

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      gps.lat = pos.coords.latitude;
      gps.lng = pos.coords.longitude;

      try {
        const r = await fetch(`api/reverse_geocode.php?lat=${gps.lat}&lon=${gps.lng}`);
        const d = await r.json();
        gps.location_name = d.display_name || "Lokasi tidak dikenal";
      } catch {
        gps.location_name = "Lokasi tidak dikenal";
      }

      gpsBadge.textContent = `📍 ${gps.location_name}`;
      gpsBadge.style.display = "inline-flex";

      gpsBtn.disabled = false;
      gpsBtn.textContent = "Batalkan Lokasi";
    },
    () => {
      alert("Gagal ambil lokasi");
      gpsBtn.disabled = false;
      gpsBtn.textContent = "Ambil Lokasi";
    }
  );
});

window.bukaModal = (id) => document.getElementById(id).classList.remove("hide");
window.tutupModal = (id) => document.getElementById(id).classList.add("hide");

window.openEdit = (id, title, body) => {
  document.getElementById("editNoteId").value = id;
  document.getElementById("editNoteTitle").value = title;
  document.getElementById("editNoteBody").value = body;
  bukaModal("editModal");
};

document.getElementById("editForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("editNoteId").value;
  const title = document.getElementById("editNoteTitle").value.trim();
  const body = document.getElementById("editNoteBody").value.trim();
  if (!title || !body) return alert("Judul & isi wajib diisi");

  const fd = new FormData();
  fd.append("title", title);
  fd.append("body", body);
  fd.append("_method", "PUT");

  const res = await fetch(`api/notes.php?id=${id}`, {
    method: "POST",
    headers: { Authorization: "Bearer " + token },
    body: fd,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) return alert(data.error || "Gagal update catatan");

  tutupModal("editModal");
  loadNotes();
});

function openView(id) {
  const n = notes.find((x) => String(x.id) === String(id));
  if (!n) return;

  viewTitle.textContent = n.title;
  viewBody.textContent = n.body;

  let meta = n.created_at ? `Dibuat: ${n.created_at}` : "";
  if (n.trashed_at) meta += ` • Dihapus: ${n.trashed_at}`;
  if (n.lat && n.lng) meta += ` • Lokasi: ${Number(n.lat).toFixed(3)}, ${Number(n.lng).toFixed(3)}`;
  viewMeta.textContent = meta;

  viewModal.classList.remove("hide");
}
function closeView() {
  viewModal.classList.add("hide");
}
viewCloseBtns.forEach((btn) => btn.addEventListener("click", closeView));
viewModal.addEventListener("click", (e) => {
  if (e.target === viewModal) closeView();
});

grid.addEventListener("click", (e) => {
  const actionBtn = e.target.closest("[data-action]");
  const noteEl = e.target.closest(".note");

  if (actionBtn) {
    const id = actionBtn.dataset.id;
    const action = actionBtn.dataset.action;
    const n = notes.find((x) => String(x.id) === String(id));
    if (!n) return;

    if (action === "edit") openEdit(n.id, n.title, n.body);
    if (action === "archive") archiveNote(n.id);
    if (action === "unarchive") unarchiveNote(n.id);
    if (action === "delete") deleteNote(n.id);
    if (action === "restore") restoreNote(n.id);
    if (action === "purge") purgeNote(n.id);
    return;
  }

  if (noteEl) openView(noteEl.dataset.id);
});

async function deleteNote(id) {
  if (!confirm("Hapus catatan ini?")) return;
  const fd = new FormData();
  fd.append("_method", "DELETE");

  const res = await fetch(`api/notes.php?id=${id}`, {
    method: "POST",
    headers: { Authorization: "Bearer " + token },
    body: fd,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return alert(data.error || "Gagal hapus catatan");
  loadNotes();
}
async function archiveNote(id) {
  await apiFetch(`api/notes.php?id=${id}&action=archive`, { method: "PATCH" });
  loadNotes();
}
async function unarchiveNote(id) {
  await apiFetch(`api/notes.php?id=${id}&action=unarchive`, { method: "PATCH" });
  loadNotes();
}
async function restoreNote(id) {
  await apiFetch(`api/notes.php?id=${id}&action=restore`, { method: "PATCH" });
  loadNotes();
}
async function purgeNote(id) {
  if (!confirm("Hapus permanen? Catatan tidak bisa kembali.")) return;
  await apiFetch(`api/notes.php?id=${id}&action=purge`, { method: "PATCH" });
  loadNotes();
}

profileBtn.addEventListener("click", async () => {
  await loadProfile();             
  profilePassword.value = "";     
  profilePassword2.value = "";     
  profilePhotoInput.value = "";    
  profileModal.classList.remove("hide");
});
profileCloseBtns.forEach((btn) => btn.addEventListener("click", () => profileModal.classList.add("hide")));
profileModal.addEventListener("click", (e) => {
  if (e.target === profileModal) profileModal.classList.add("hide");
});

profilePhotoInput.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  setAvatar(url);
});

function normalizeAvatarUrl(url) {
  if (!url) return DEFAULT_AVATAR;
  if (url.startsWith("http") || url.startsWith("/")) return url;

  return url.startsWith("uploads/") ? "../" + url : url;
}

async function loadProfile() {
  try {
    const p = await apiFetch("api/profile.php");
    profileUsername.value = p.username || "";
    profileEmail.value = p.email || "";

    const avatar = normalizeAvatarUrl(p.avatar_url);
    console.log("Avatar final:", avatar || DEFAULT_AVATAR);
    setAvatar(avatar || DEFAULT_AVATAR);
  } catch (e) {
    setAvatar(DEFAULT_AVATAR);
    console.warn("Profile belum tersedia / token invalid.");
  }
}

profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  profileFeedback.classList.add("hide");

  if (profilePassword.value && profilePassword.value !== profilePassword2.value) {
    profileFeedback.textContent = "Password tidak sama!";
    profileFeedback.className = "feedback error";
    profileFeedback.classList.remove("hide");
    return;
  }

  try {
    const fd = new FormData();
    fd.append("username", profileUsername.value.trim());
    fd.append("email", profileEmail.value.trim());
    if (profilePassword.value.trim()) fd.append("password", profilePassword.value.trim());

    const file = profilePhotoInput.files?.[0];
    if (file) fd.append("avatar", file);

    const res = await fetch("api/profile.php", {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
      body: fd,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw data;

    profileFeedback.textContent = "Profil berhasil diperbarui ✅";
    profileFeedback.className = "feedback success";
    profileFeedback.classList.remove("hide");

    const avatar = normalizeAvatarUrl(data.avatar_url);
    setAvatar(avatar);
  } catch (err) {
    profileFeedback.textContent = err.error || "Gagal update profil.";
    profileFeedback.className = "feedback error";
    profileFeedback.classList.remove("hide");
  }
});

removePhotoBtn.addEventListener("click", async () => {
  if (!confirm("Hapus foto profil?")) return;

  try {
    const res = await fetch("api/profile.php?action=remove_photo", {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw data;

    setAvatar(DEFAULT_AVATAR);
    profilePhotoInput.value = "";

    profileFeedback.textContent = "Foto profil dihapus ✅";
    profileFeedback.className = "feedback success";
    profileFeedback.classList.remove("hide");
  } catch (err) {
    profileFeedback.textContent = err.error || "Gagal hapus foto profil.";
    profileFeedback.className = "feedback error";
    profileFeedback.classList.remove("hide");
  }
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("notes_token");
  location.href = "index.html";
});
