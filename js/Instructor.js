const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");

let selected_course;



searchButton.addEventListener("click", search);

function isWithinRange(start1, end1, start2, end2) {
  return start1 < end2 && start2 < end1;
}

/* =================================================================
   PERSISTENCE HELPERS  (Instructor page)
   -----------------------------------------------------------------
   • All pages should use the SAME keys that seedStorage() created:
       – "coursesData"      (array)
       – "userAccounts"     (object with admin / instructor / student)
   • These helpers hide JSON.parse / stringify and guarantee that
     the data exists (because the login page already seeded it).
   ================================================================= */

/* ---------- COURSES ---------- */
function getCourses() {
  return JSON.parse(localStorage.getItem("coursesData") || "[]");
}
function saveCourses(updatedArray) {
  localStorage.setItem("coursesData", JSON.stringify(updatedArray));
}

/* ---------- ACCOUNTS / STUDENTS ---------- */
function getAccounts() {
  return JSON.parse(localStorage.getItem("userAccounts") || "{}");
}
function saveAccounts(updatedObj) {
  localStorage.setItem("userAccounts", JSON.stringify(updatedObj));
}

/* Convenience: grab a single student object by username */
function getStudent(username) {
  const accounts = getAccounts();
  return (accounts.student || []).find(s => s.username === username);
}

async function fetchCourses() {
  const response = await fetch("/json/courses.json");
  return response.json();
}

function createCourseCard(course) {
  const card = document.createElement("div");
  card.classList.add("course-card");

  card.innerHTML = `
    <div class="course-metadata">
      <div class="course-name">${course.course_name}</div>
      <div class="course-instructor">${course.instructor}</div>
      <div class="course-time">${course.time_display}</div>
      <div class="course-credit_hours">${course.credit_hours} CHS</div>
      <div class="course-other">${course.details}</div>
      <div class="course-prereq">${course.prerequisites.join(", ") || "None"}</div>
    </div>
  `;

  card.addEventListener("click", () => {
    selected_course = course;
    handleCourseSelection(course);
  });

  return card;
}

async function loadPage() {

  const mainContent = document.getElementById("coursescards");
  const courses = await getCourses();
  const userData = await getUserData();
  const instructorid = userData.info.username;
console.log(instructorid);

  mainContent.innerHTML = "";

  courses
    .sort((a, b) => a.course_name.localeCompare(b.course_name))
    .forEach(course => {
      if (course.instructor_id===instructorid){
      mainContent.appendChild(createCourseCard(course))}
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
    filteredCourses
      .sort((a, b) => a.course_name.localeCompare(b.course_name))
      .forEach(course => {
        if (course.validated) {
          mainContent.appendChild(createCourseCard(course));
        }
      });
  }
   else if (query === "") {
    loadPage();
  } else {
    mainContent.innerHTML = "<p>No courses found.</p>";
  }
}

function handleCourseSelection(course) {
  console.log("Selected course:", course);
}

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



console.log(getCourses());

loadPage();
