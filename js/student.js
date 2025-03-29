async function loadPage() {
    const mainContent = document.getElementById("coursescards");
  
    const response = await fetch("/js/courses.json");
    const courses = await response.json();
  
    courses.forEach(course => {
      const card = document.createElement("div");
      card.classList.add("course-card");
  
      card.innerHTML = `
        <div class="course-metadata">
          <div class="course-name">${course.course_name}</div>
          <div class="course-instructor">${course.instructor}</div>
          <div class="course-time">${course.time}</div>
          <div class="course-other">${course.details}</div>
          <div class="course-prereq">${course.prerequisites.join(", ") || "None"}</div>
        </div>
      `;
  
      mainContent.appendChild(card);
    });
  }
  
  loadPage();
  