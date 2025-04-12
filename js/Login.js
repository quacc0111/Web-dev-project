let LoginBTN = document.getElementById("LoginBTN");
let Usernamefield = document.getElementById("username-field");
let Passwordfield = document.getElementById("password-field");
let formsubmission = document.getElementById("form");

LoginBTN.addEventListener("click", checklogin);

async function seedStorage() {
  async function putIfAbsent(key, src) {
    if (localStorage.getItem(key)) return;
    const res = await fetch(src);
    if (!res.ok) throw new Error(`Could not load ${src}`);
    const data = await res.json();
    localStorage.setItem(key, JSON.stringify(data));
  }

  await putIfAbsent("coursesData", "/json/courses.json");
  await putIfAbsent("userAccounts", "/json/accounts.json");
  await putIfAbsent("defaultPathChart", "/json/learningPath.json");
}

async function checklogin(e) {
  e.preventDefault();

  let accounts = JSON.parse(localStorage.getItem("accounts"));
  if (!accounts) {
    const response = await fetch("/json/accounts.json");
    accounts = await response.json();
    localStorage.setItem("accounts", JSON.stringify(accounts));
  }

  const username = Usernamefield.value.trim();
  const password = Passwordfield.value.trim();

  let role = "";
  if (username.startsWith("ad")) role = "admin";
  else if (username.startsWith("in")) role = "instructor";
  else if (username.startsWith("st")) role = "student";

  if (role === "") {
    alert("Username or password was incorrect");
    return;
  }

  const userList = accounts[role];
  const index = userList.findIndex(
    (user) => user.username === username && user.password === password
  );
  const found = index !== -1 ? accounts[role][index] : null;

  if (!found) {
    alert("Incorrect username/password");
    return;
  }

  const userData = {
    role: role,
    info: JSON.parse(JSON.stringify(found))
  };
  localStorage.setItem("loggedUser", JSON.stringify(userData));

  if (role === "admin") {
    window.location.replace("/SPECIAL PAGES/Admin.html");
  } else if (role === "instructor") {
    window.location.replace("/SPECIAL PAGES/Instructor.html");
  } else {
    window.location.replace("/SPECIAL PAGES/STUDENT.html");
  }
}
