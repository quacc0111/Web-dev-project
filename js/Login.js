let LoginBTN = document.getElementById("LoginBTN");
let Usernamefield = document.getElementById("username-field");
let Passwordfield = document.getElementById("password-field");
let formsubmission = document.getElementById("form");

LoginBTN.addEventListener("click", checklogin);

async function checklogin(e) {
  e.preventDefault();

  const response = await fetch("/json/accounts.json");
  const accounts = await response.json();

  const username = Usernamefield.value;
  const password = Passwordfield.value;
  const ju = username;
  const jp = password;

  let role = "";
  if (username.startsWith("ad")) {
    role = "admin";
  } else if (username.startsWith("in")) {
    role = "instructor";
  } else if (username.startsWith("st")) {
    role = "student";
  }

  if (role === "") {
    alert("Username or password was incorrect");
    return;
  }

  const userList = accounts[role];
  const found = userList.find(
    (user) => user.username === username && user.password === password
  );

  const type_list = accounts[role];
  console.log(type_list);
  const jrole=role
  if (found) {
    const userData = {
      role: role,
      info: found
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
  
}
