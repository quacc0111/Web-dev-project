const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
searchButton.addEventListener("click", search);

async function search(e) {
  e.preventDefault(); 
  const mainContent = document.getElementById("coursescards");
  const response = await fetch("/json/courses.json");
  const courses = await response.json();
  const query = searchInput.value.trim().toLowerCase();

  mainContent.innerHTML = "";
  let filteredCourses = courses.filter(course =>
    course.category.toLowerCase()===(query)
  );
  if (filteredCourses.length === 0)
    {
  filteredCourses = courses.filter(course =>
    course.course_name.toLowerCase().includes(query)
  );}
;

  if (filteredCourses.length > 0) {
    filteredCourses.sort((a, b) => a.course_name.localeCompare(b.course_name)).forEach(course => {
      const card = document.createElement("div");
      card.classList.add("course-card");
      card.innerHTML = `
        <div class="course-metadata">
          <div class="course-name">${course.course_name}</div>
          <div class="course-instructor">${course.instructor}</div>
          <div class="course-time">${course.time}</div>
          <div class="course-credit_hours">${course.credit_hours}CHS</div>
          <div class="course-other">${course.details}</div>
          <div class="course-prereq">${
            course.prerequisites.join(", ") || "None"
          }</div>
        </div>`;
      mainContent.appendChild(card);
    });
  } else if(query===""){
    loadPage();
  }
  else{
    mainContent.innerHTML = "<p>No courses found.</p>";
  }
}

async function loadPage() {
  const mainContent = document.getElementById("coursescards");

  const response = await fetch("/json/courses.json");
  const courses = await response.json();

  courses.sort((a, b) => a.course_name.localeCompare(b.course_name)).forEach(course => {
    const card = document.createElement("div");
    card.classList.add("course-card");
    card.innerHTML = `
      <div class="course-metadata">
        <div class="course-name">${course.course_name}</div>
        <div class="course-instructor">${course.instructor}</div>
        <div class="course-time">${course.time}</div>
        <div class="course-credit_hours">${course.credit_hours}CHS</div>
        <div class="course-other">${course.details}</div>
        <div class="course-prereq">${
          course.prerequisites.join(", ") || "None"
        }</div>
      </div>`;
    mainContent.appendChild(card);
  });
}

loadPage();
