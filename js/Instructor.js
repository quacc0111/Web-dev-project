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
function getCourses() {//** */
  const courses = JSON.parse(localStorage.getItem("coursesData") || "[]");
  const allStudents = getAccounts().student || []; // Fetch all students from userAccounts

  // Ensure every student in every course has a proper structure
  courses.forEach(course => {
    course.students = course.students.map(student => {
      if (typeof student === "string") {
        // If the student is a string (username), convert it to an object
        const studentDetails = allStudents.find(s => s.username === student) || {};
        return {
          username: student,
          grade: "", // Default grade
          name: studentDetails.name || "Unknown" // Add name if available
        };
      } else if (typeof student === "object" && student.username) {
        // If the student is already an object, ensure it has a grade field
        return {
          ...student,
          grade: student.grade || ""
        };
      } else {
        console.warn("Invalid student entry:", student);
        return null; // Filter out invalid entries
      }
    }).filter(Boolean); // Remove any null entries
  });

  return courses;
}
function saveCourses(updatedArray) {
  localStorage.setItem("coursesData", JSON.stringify(updatedArray));
}

/* ---------- ACCOUNTS / STUDENTS ---------- */
function getAccounts() {
  console.log("User account.....");
  console.log(JSON.parse(localStorage.getItem("userAccounts")));// Debugging: Check the accounts data
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
    <button class="view-grades-button" data-course-id="${course.course_id}">View Grades</button>
  `;

  card.addEventListener("click", () => {
    selected_course = course;
    handleCourseSelection(course);
  });

  const viewGradesButton = card.querySelector(".view-grades-button");
  viewGradesButton.addEventListener("click", (e) => {
    e.stopPropagation();
    openGradesModal(course);
  });

  return card;
}
//**** */
function openGradesModal(course) {
  console.log("Opening grades modal for course:", course);
  console.log("Course students:", course.students);

  const modal = document.getElementById("grades-modal");
  const modalCourseName = document.getElementById("modal-course-name");
  const studentsList = document.getElementById("students-list");

  modalCourseName.textContent = course.course_name;
  studentsList.innerHTML = "";

  // Fetch full student details
  const allStudents = getAccounts().student || [];
  const students = course.students.map(studentEntry => {
    const studentDetails = allStudents.find(student => student.username === studentEntry.username);
    return {
      ...studentDetails,
      grade: studentEntry.grade || ""
    };
  });

  // Populate the modal with student details
  students.forEach(student => {
    if (student) {
      const studentRow = document.createElement("div");
      studentRow.classList.add("student-row");

      studentRow.innerHTML = `
        <span>${student.name}</span>
        <input type="text" placeholder="Enter grade" data-student-id="${student.username}" value="${student.grade}" />
      `;

      studentsList.appendChild(studentRow);
    } else {
      console.warn(`Student not found in userAccounts.`);
    }
  });

  // Add Submit Grades button
  const submitButton = document.createElement("button");
  submitButton.textContent = "Submit Grades";
  submitButton.classList.add("submit-grades-button");
  submitButton.addEventListener("click", () => {
    submitGrades(course); // Call the submitGrades function when clicked
  });

  studentsList.appendChild(submitButton);

  const closeModalButton = document.getElementById("close-modal");
  closeModalButton.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  modal.classList.remove("hidden");
}
// ******************
function submitGrades(course) {
  const studentsList = document.getElementById("students-list");
  const inputs = studentsList.querySelectorAll("input");

  inputs.forEach(input => {
    const studentId = input.getAttribute("data-student-id");
    const grade = input.value.trim();

    // Validate the grade
    if (!grade) {
      alert(`Grade for student ${studentId} cannot be empty.`);
      return;
    }

    if (!isValidGrade(grade)) {
      alert(`Invalid grade entered for student ${studentId}. Please enter a valid grade (A, B, C, D, F).`);
      return;
    }

    // Update the grade for the student in the course object
    const studentEntry = course.students.find(s => s.username === studentId);
    if (studentEntry) {
      studentEntry.grade = grade; // Add or update the grade field
    } else {
      // If the student is not already in the course.students array, add them
      course.students.push({ username: studentId, grade });
    }
  });

  // Save the updated course data
  saveCourses(getCourses().map(c => (c.course_id === course.course_id ? course : c)));

  alert("Grades submitted successfully!");
  document.getElementById("grades-modal").classList.add("hidden");
}

// Helper function to validate grades
function isValidGrade(grade) {
  const validGrades = ["A", "B", "C", "D", "F"];
  return validGrades.includes(grade.toUpperCase());
}

// **************

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
