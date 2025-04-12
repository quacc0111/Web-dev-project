let LoginBTN       = document.getElementById("LoginBTN");
let Usernamefield  = document.getElementById("username-field");
let Passwordfield  = document.getElementById("password-field");

LoginBTN.addEventListener("click", checklogin);

/* ================== STORAGE SEEDING =================== */
async function seedStorage() {
  async function putIfAbsent(key, src) {
    if (localStorage.getItem(key)) return;          // already cached
    const res = await fetch(src);
    if (!res.ok) throw new Error(`Could not load ${src}`);
    localStorage.setItem(key, JSON.stringify(await res.json()));
  }

  await putIfAbsent("coursesData",      "/json/courses.json");
  await putIfAbsent("userAccounts",     "/json/accounts.json");
  await putIfAbsent("defaultPathChart", "/json/learningPath.json");
}
/* ====================================================== */

async function checklogin(e) {
  e.preventDefault();

  await seedStorage();

  const accounts = JSON.parse(localStorage.getItem("userAccounts"));

  const username = Usernamefield.value.trim();
  const password = Passwordfield.value.trim();

  let role = "";
  if      (username.startsWith("ad")) role = "admin";
  else if (username.startsWith("in")) role = "instructor";
  else if (username.startsWith("st")) role = "student";

  if (!role) {
    alert("Username or password was incorrect");
    return;
  }

  const userList = accounts[role];
  const found = userList.find(
    u => u.username === username && u.password === password
  );

  if (!found) {
    alert("Incorrect username/password");
    return;
  }

  /* 3️⃣  Cache the logged‑in user */
  localStorage.setItem(
    "loggedUser",
    JSON.stringify({ role, info: structuredClone(found) })
  );

  /* 4️⃣  Redirect */
  if (role === "admin")       window.location.replace("/SPECIAL PAGES/Admin.html");
  else if (role === "instructor") window.location.replace("/SPECIAL PAGES/Instructor.html");
  else                         window.location.replace("/SPECIAL PAGES/STUDENT.html");
}
