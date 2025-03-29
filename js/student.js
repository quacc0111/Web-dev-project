async function loadPage() {
  const mainContent = document.getElementById("coursescards");

  const recipecard = document.createElement("div");
  recipecard.classList.add("container");
  recipecard.innerHTML = `
      <div class="course-card">
        <div class="metadata">

            <div class="coursename">
                      <p>course name</p>

            </div>
            <div class="coursedr">
                      <p>instructors</p>
            </div>
            <div class="coursech">
            CH
            </div>
            <div class="coursetime">
            Time
            </div>
            <div class="courseother">
            ...
            </div>
        
        </div>
          
      </div>
    `;

  mainContent.appendChild(recipecard);
}
loadPage();
