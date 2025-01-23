document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("command-input");
  const output = document.getElementById("output");
  const terminalContent = document.querySelector(".terminal-content");
  const searchContainer = document.getElementById("search-container");
  const searchInput = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");

  const projects = {
    "php authentication": `
            <p><strong>PHP Authentication Projects</strong></p>
            <p><a href="https://github.com/ZinSoeTun/PHP-Authentication-Project" target="_blank">Github Link</a></p>
        `,
    "php simple router": `
        <p><strong>PHP Simple Router  Project</strong></p>
       <p><a href="https://github.com/ZinSoeTun/PHP-only-Router-Project" target="_blank">Github Link</a></p>
        <p>Watch the demo video below:</p>
        <p><a href="https://www.youtube.com/watch?v=oY0d5KEDgTY" target="_blank">Youtube Link</a></p>
    `,
    "laravel real estate": `
            <p><strong>Laravel Real Estate Project</strong></p>
           <p><a href="https://github.com/ZinSoeTun/laravel-real-estate-project" target="_blank">Github Link</a></p>
            <p>Watch the demo video below:</p>
             <p><a href="https://www.youtube.com/watch?v=2-pLKIr2gIs" target="_blank">Youtube Link</a></p>
        `,
    "laravel e-commerce laptop": `
            <p><strong>Laravel E-commerce Laptop Project</strong></p>
           <p><a href="https://github.com/ZinSoeTun/laravel-e-commerce-laptop-project" target="_blank">Github Link</a></p>
            <p>Watch the demo video below:</p>
            <p><a href="https://www.youtube.com/watch?v=FZc1mL-spiM" target="_blank">Youtube Link</a></p>
        `,
    "laravel chat": `
        <p><strong>Laravel Chat  Project</strong></p>
        <p><a href="https://github.com/ZinSoeTun/laravel-chat-app" target="_blank">Github Link</a></p>
        <p>Watch the demo video below:</p>
        <p><a href="https://www.youtube.com/watch?v=YqTdZu_xL5s" target="_blank">Youtube Link</a></p>
    `,
       "laravel Course Management": `
        <p><strong>Laravel Course Management  Project</strong></p>
        <p><a href="https://github.com/ZinSoeTun/master-mind-course-management" target="_blank">Github Link</a></p>
    `,
    "simple projects": `
    <h2 class="simple-title">These are simple and have only frondend...</h2>
 `,
    "js music player": `
    <a href="https://zinsoetun.github.io/JS-music-player-project/" target="_blank">
    <button class="responsive-button">JS Music Player Project</button>
    </a>
    `,
    "js quiz": `
    <a href="https://zinsoetun.github.io/JS-Quizz-Project/" target="_blank">
    <button class="responsive-button">JS Quizz Project</button>
    </a>
    `,
    "js stop watch": `
    <a href="https://zinsoetun.github.io/JS-Stop-Watch-Project/" target="_blank">
    <button class="responsive-button">JS Stop Watch Project</button>
    </a>
    `,
    "js rock paper scissors": `
    <a href="https://zinsoetun.github.io/JS-Rock-Paper-Scissor-Game-Project/" target="_blank">
    <button class="responsive-button">JS Rock Paper Scissors Project</button>
    </a>
    `,
    "js calculator": `
    <a href="https://zinsoetun.github.io/JS-calculation-project/" target="_blank">
    <button class="responsive-button">JS Calculator Project</button>
    </a>
    `,
    "bootstrap project": `
    <a href="https://zinsoetun.github.io/Bootstrap-programming-project/" target="_blank">
    <button class="responsive-button">Bootstrap Project</button>
    </a>
    `,
    "python projects": `
    <a href="https://github.com/ZinSoeTun?tab=repositories&q=&type=&language=python&sort=" target="_blank">
    <button class="responsive-button">Python Projects</button>
    </a>
    `,
    "java projects": `
    <a href="https://github.com/ZinSoeTun?tab=repositories&q=&type=&language=java&sort=" target="_blank">
    <button class="responsive-button">Java Projects</button>
    </a>
    `,
  };

  const commands = {
    help: "Available commands: about, skills, projects, contact, clear, thanks",
    about: `
      <p>I am a passionate Web Developer and Backend Developer with a strong foundation 
      in both frontend and backend technologies. With a keen eye for detail and a 
      commitment to delivering high-quality code,I strive to create seamless and 
      efficient web applications that solve real-world problems.
      I'm passionate about coding and learning new languages. I thrive in diverse
       environments and enjoy adapting to new challenges.
       Currently, I'm immersing myself in programming languages and enhancing my 
       communication skills in English and Korean.
       I'm eager to collaborate with like-minded individuals who bring diverse perspectives
        and a positive outlook to every project.
        I believe in working with dedication when it's time to focus, and valuing 
        rest and reflection during downtime.I'm always open to advice on managing
         pressure and eager to contribute to solving environmental issues.Whether as 
         a friend, mentor, or collaborator, I look forward to building meaningful 
         connections and working together towards shared goals.
         </p>
         <a href="https://github.com/ZinSoeTun" target="_blank">
      <img src="https://img.shields.io/badge/GitHub-%23121011.svg?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
        </a>

      `,
    skills: "Skills: PHP, Laravel, Python, Java,  React, Node, Express, Mongo, JavaScript, SQL, Mysql",
    projects: showProjectSearch,
    contact: `<p>Email: <a href='mailto:tunzinsoe786@gmail.com'>tunzinsoe786@gmail.com</a> | Phone: +95988911436"
      </p>
<table>
  <tr>
    <td align="center">
     <a href="https://www.facebook.com/profile.php?id=100082567453654&mibextid=ZbWKwL">
    <img src="https://img.shields.io/badge/Facebook-%231877F2.svg?style=for-the-badge&logo=facebook&logoColor=white" alt="Facebook" />
    </a>
    </td>
    <td align="center">
     <a href="https://www.instagram.com/zinsoetun123?igsh=MXJtcHE0MW5kbmU4dw==">
    <img src="https://img.shields.io/badge/Instagram-%23E4405F.svg?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram" />
</a>
    </td>
    <td align="center">
         <a href="https://x.com/tunzinsoe?s=09">
    <img src="https://img.shields.io/badge/X-%23000000.svg?style=for-the-badge&logo=x&logoColor=white" alt="Twitter" />
</a>
    </td>
  </tr>
  <tr>
    <td align="center">
     <a href="https://www.tiktok.com/@james.justin20?_t=8orPXc2PDAT&_r=1">
    <img src="https://img.shields.io/badge/TikTok-%23000000.svg?style=for-the-badge&logo=tiktok&logoColor=white" alt="TikTok" />
</a>
    </td>
    <td align="center">
    <a href="https://vb.me/letsChatOnViber">
    <img src="https://img.shields.io/badge/Viber-%238B4AEB.svg?style=for-the-badge&logo=viber&logoColor=white" alt="Viber" />
</a>
    </td>
    <td align="center">
      <a href="https://t.me/Fly02345">
        <img src="https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram" />
      </a>
    </td>
  </tr>
  <tr>
    <td align="center" colspan="3">
     <a href="https://www.youtube.com/@zinsoetun5485">
    <img src="https://img.shields.io/badge/YouTube-%23FF0000.svg?style=for-the-badge&logo=youtube&logoColor=white" alt="YouTube" />
</a>
    </td>
  </tr>
</table>
`,
  thanks: `<h1 class="simple-title">Thanks for visiting my porfolio ...<h1> 😊😊😊😊`,
  clear: clearScreen,
  };

  function executeCommand(command) {
    // Clear the output before showing the next command result
    output.innerHTML = "";

    if (commands[command]) {
      if (typeof commands[command] === "function") {
        commands[command](); // Executes functions like 'clear' or 'projects'
      } else {
        output.innerHTML = `<p class="command">${commands[command]}</p>`;
        searchContainer.style.display = "none"; // Hide search bar for other commands
      }
    } else {
      output.innerHTML = `<p class="command">bash: ${command}: command not found</p>`;
    }

    terminalContent.scrollTop = terminalContent.scrollHeight; // Scroll to the latest
    input.value = "";
  }

  // Show search input for projects
  function showProjectSearch() {
    output.innerHTML = `<p class="command">Here are some of my projects. Use the search bar to find specific projects.</p>`;
    searchContainer.style.display = "flex"; // Show the search bar
    terminalContent.scrollTop = terminalContent.scrollHeight;
  }

  // Handle project search
  function searchProjects(query) {
    output.innerHTML = ""; // Clear previous output

    if (query && projects[query]) {
      // Show the matched project
      output.innerHTML += `<p class="command">${projects[query]}</p>`;
    } else {
      // Show all projects if no match is found or query is empty
      output.innerHTML += `<p class="command">No specific match found. Showing all projects:</p>`;
      for (const project in projects) {
        output.innerHTML += `<p class="command">${projects[project]}</p>`;
      }
    }

    terminalContent.scrollTop = terminalContent.scrollHeight;
    searchInput.value = "";
  }

  // Clear the terminal screen
  function clearScreen() {
    output.innerHTML = "";
  }

  // Check if input exists and then attach event listener
  if (input) {
    input.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        executeCommand(input.value.trim().toLowerCase());
      }
    });
  }

  // Search button click handler
  searchBtn.addEventListener("click", function () {
    searchProjects(searchInput.value.trim().toLowerCase());
  });

    // Attach event listener for the Enter key in the search input field
    searchInput.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        searchProjects(searchInput.value.trim().toLowerCase());
      }
    });
});
