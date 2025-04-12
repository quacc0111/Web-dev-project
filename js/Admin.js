const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const registerButton = document.getElementById("register_button");
const validatationbtn = document.getElementById("validbtn");
const addbtn = document.getElementById("addcourse");
addbtn.addEventListener("click", loadaddpage);

async function loadaddpage() {
  document.getElementById("catagories").style.display = "none";
  document.getElementById("addcourse").style.display = "none";

  const main = document.getElementById("coursescards");
  main.innerHTML = "";

  const instructorOpts = await (getaccounts().instructor || [])
    .map(i => `<option value="${i.username}">${i.name} (${i.username})</option>`)
    .join("");

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayChecks = days.map(d =>
    `<label><input type="checkbox" name="days" value="${d}"> ${d}</label>`
  ).join(" ");

  main.innerHTML = `
    <form id="courseForm" class="add‑course‑form">
      <h2>Add a New Course</h2>

      <label>Course ID <input required name="course_id"></label>
      <label>Course Name <input required name="course_name"></label>
      <label>Category <input required name="category"></label>
      <label>Prerequisites (comma‑separated)
             <input name="prerequisites"></label>

      <label>Instructor 
        <select required name="instructor_id">${instructorOpts}</select>
      </label>

      <label>Credit Hours <input type="number" min="1" required name="credit_hours"></label>
      <label>Capacity <input type="number" min="1" required name="capacity"></label>

      <label>Details <textarea required name="details"></textarea></label>

      <label>Time Display <input required name="time_display" placeholder="e.g. 1:00 PM ‑ 2:30 PM"></label>
      <label>Time Start <input type="number" required name="time_start" placeholder="e.g. 1300"></label>
      <label>Time End   <input type="number" required name="time_end"   placeholder="e.g. 1430"></label>

      <fieldset><legend>Days</legend>${dayChecks}</fieldset>

      <div class="form‑buttons">
        <button type="submit">Save</button>
        <button type="button" id="backBtn">Back</button>
      </div>
    </form>
  `;

  document.getElementById("backBtn").onclick = () => {
    document.getElementById("catagories").style.display = "";
    document.getElementById("addcourse").style.display = "";
    loadPage();
  };

  document.getElementById("courseForm").onsubmit = handleAddSubmit;
}

function handleAddSubmit(ev) {
  ev.preventDefault();
  const f = ev.target;

  const newCourse = {
    course_id: f.course_id.value.trim(),
    course_name: f.course_name.value.trim(),
    category: f.category.value.trim(),
    prerequisites: f.prerequisites.value.split(",").map(s => s.trim()).filter(Boolean),
    instructor_id: f.instructor_id.value,
    instructor: (getaccounts().instructor || []).find(i => i.username === f.instructor_id.value).name,
    credit_hours: +f.credit_hours.value,
    capacity: +f.capacity.value,
    validated: false,
    status: "closed",
    students: [],
    enrolled: 0,
    details: f.details.value.trim(),
    time_display: f.time_display.value.trim(),
    time_start: +f.time_start.value,
    time_end: +f.time_end.value,
    days: Array.from(f.querySelectorAll("input[name=days]:checked")).map(cb => cb.value)
  };

  const courses = getCourses();
  if (courses.some(c => c.course_id === newCourse.course_id)) {
    alert("Course ID already exists."); return;
  }
  if (newCourse.days.length === 0) {
    alert("Select at least one day."); return;
  }

  courses.push(newCourse);
  saveCourses(courses);
  localStorage.setItem("courses", JSON.stringify(courses));

  alert("✅ Course added!");
  document.getElementById("backBtn").click();
}

function getCourses() {
  return JSON.parse(localStorage.getItem("coursesData") || "[]");
}

function saveCourses(updatedArray) {
  localStorage.setItem("coursesData", JSON.stringify(updatedArray));
}

function getaccounts() {
  const accounts = JSON.parse(localStorage.getItem("accounts"));
  return accounts;
}

function saveaccounts(updatedaccounts) {
  localStorage.setItem("accounts", JSON.stringify(updatedaccounts));
}

let selected_course;

searchButton.addEventListener("click", search);

function isWithinRange(start1, end1, start2, end2) {
  return start1 < end2 && start2 < end1;
}

function createCourseCard(course) {
  const card = document.createElement("div");
  card.classList.add("course-card");

  card.innerHTML = `
    <div class="course-metadata">
      <div class="course-ID">${course.course_id}</div>
      <div class="course-instructor">${course.instructor}</div>
      <div class="course-time">${course.time_display}</div>
      <div class="course-time">
      <button class="course-validation" data-course-id="${course.course_id}">
        ${course.validated ? " Validated" : "unvalid"}
      </button></div>
      <div class="course-status">${course.status}</div>
      <div class="course-prereq">
        ${course.prerequisites.join(", ") || "None"}
      </div>
    </div>
  `;

  card.addEventListener("click", () => {
    selected_course = course;
    handleCourseSelection(course);
  });

  const validateBtn = card.querySelector(".course-validation");
  validateBtn.addEventListener("click", (ev) => {
    toggleValidation(course, validateBtn);
  });

  return card;
}

function toggleValidation(course, btn) {
  const courses = getCourses();
  const idx = courses.findIndex(c => c.course_id === course.course_id);

  courses[idx].validated = !courses[idx].validated;
  courses[idx].status = courses[idx].validated ? "active" : "closed";

  saveCourses(courses);
  localStorage.setItem("courses", JSON.stringify(courses));

  loadPage();
}

async function loadPage() {
  const mainContent = document.getElementById("coursescards");
  const courses = await getCourses();

  mainContent.innerHTML = "";

  courses.sort((a, b) => a.course_name.localeCompare(b.course_name)).forEach(course => {
    mainContent.appendChild(createCourseCard(course));
  });
}

async function search(e) {
  e.preventDefault();

  const query = searchInput.value.trim().toLowerCase();
  const mainContent = document.getElementById("coursescards");
  const courses = await getCourses();

  mainContent.innerHTML = "";

  let filteredCourses = courses.filter(course =>
    course.category.toLowerCase() === query
  );

  if (filteredCourses.length === 0) {
    filteredCourses = courses.filter(course =>
      course.course_name.toLowerCase().includes(query)
    );
  }

  if (filteredCourses.length > 0) {
    filteredCourses.sort((a, b) => a.course_name.localeCompare(b.course_name)).forEach(course => {
      if (course.validated) {
        mainContent.appendChild(createCourseCard(course));
      }
    });
  } else if (query === "") {
    loadPage();
  } else {
    mainContent.innerHTML = "<p>No courses found.</p>";
  }
}

function handleCourseSelection(course) {}

async function getUserData() {
  const storedData = localStorage.getItem("loggedUser");

  if (!storedData) {
    window.location.href = "/SPECIAL PAGES/login.html";
  }

  return JSON.parse(storedData);
}

async function getCourseByID(course_id) {
  const courses = await getCourses();
  return courses.find(course => course.course_id === course_id);
}

window.addEventListener("load", async () => {
  const courses = await getCourses();
});
loadPage();
