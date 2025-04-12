const loginBtn      = document.getElementById("LoginBTN");
const usernameField = document.getElementById("username-field");
const passwordField = document.getElementById("password-field");

loginBtn.addEventListener("click", handleLogin);

async function seedStorage() {
  async function put(key, url) {
    if (localStorage.getItem(key)) return;
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    localStorage.setItem(key, JSON.stringify(await res.json()));
  }
  await put("coursesData", "/json/courses.json");
  await put("userAccounts", "/json/accounts.json");
  await put("defaultPathChart", "/json/learningPath.json");
}

function getAccounts() {
  return JSON.parse(localStorage.getItem("userAccounts") || "{}");
}

async function handleLogin(e) {
  e.preventDefault();
  try { await seedStorage(); } catch { alert("Data init failed"); return; }

  const accounts = getAccounts();
  const u = usernameField.value.trim();
  const p = passwordField.value.trim();
  const role = u.startsWith("ad") ? "admin" : u.startsWith("in") ? "instructor" : u.startsWith("st") ? "student" : "";

  if (!role) { alert("Username or password was incorrect"); return; }

  const match = (accounts[role] || []).find(a => a.username === u && a.password === p);
  if (!match) { alert("Incorrect username/password"); return; }

  localStorage.setItem("loggedUser", JSON.stringify({ role, info: { ...match } }));

  window.location.replace(
    role === "admin" ? "/SPECIAL PAGES/Admin.html" :
    role === "instructor" ? "/SPECIAL PAGES/Instructor.html" :
    "/SPECIAL PAGES/STUDENT.html"
  );
}
