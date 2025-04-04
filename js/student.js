const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const registerButton = document.getElementById("register_button");

let selected_course;

searchButton.addEventListener("click", search);
registerButton.addEventListener("click", registerCourse);

function isWithinRange(start1, end1, start2, end2) {
  return start1 < end2 && start2 < end1;
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
  const courses = await fetchCourses();

  mainContent.innerHTML = "";

  courses
    .sort((a, b) => a.course_name.localeCompare(b.course_name))
    .forEach(course => {
      if (course.validated){
      mainContent.appendChild(createCourseCard(course))}
    });
}

async function search(e) {
  e.preventDefault();

  const query = searchInput.value.trim().toLowerCase();
  const mainContent = document.getElementById("coursescards");
  const courses = await fetchCourses();

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
  const courses = await fetchCourses();
  return courses.find(course => course.course_id === course_id);
}


async function registerCourse() {
  const userData = await getUserData();
  const userInfo = userData.info;
  const userPastCourses = userInfo.past_courses;

  if (!selected_course) {
    alert("No course was selected.");
    return;
  }

  if (userInfo.current_courses.includes(selected_course.course_id)) {
    console.log("This course is already being taken.");
    return;
  }

  if (selected_course.enrolled >= selected_course.capacity) {
    console.log("Course capacity is full. Please choose another one.");
    return;
  }

  const prerequisites = selected_course.prerequisites;

  if (prerequisites.length === 0) {
    console.log("No prerequisites required — course can be registered.");
    return;
  }

  const unclearedPrereqs = prerequisites.filter(prereq => {
    const match = userPastCourses.find(past =>
      past.course_name.trim().toLowerCase() === prereq.trim().toLowerCase()
    );
    return !(match && match.status.toLowerCase() === "passed");
  });

  if (unclearedPrereqs.length > 0) {
    console.log("Some prerequisites are not passed — registration blocked.");
    console.log("Uncleared prerequisites:", unclearedPrereqs);
    alert("You are missing the following prerequisite(s):\n- " + unclearedPrereqs.join("\n- "));
    return;
  }
let noconflict=true;
let takencourses=[]
  for (const courseID of userInfo.current_courses) {
    const course = await getCourseByID(courseID); 
  
    if (course !== undefined) {
           if(   isWithinRange(selected_course.time_start,selected_course.time_end,course.time_start,course.time_end)){
            selected_course.days.forEach(day=>{
              if(course.days.includes(day)){
                noconflict=false;
                console.log("conflict with",course,day);
                
                
              }
            })
           }
            
      
      
    } else {
      console.log("couldn't find course with ID:", courseID);
    }
  }
  if(noconflict){ 
    console.log("All checks passed — ready for registration.");

    

  }
  else{
    
  }
}

loadPage();
