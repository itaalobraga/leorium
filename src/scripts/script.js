import {
  fetchAPI,
  formatCurrency,
  formatDate,
  showLoading,
  hideLoading,
  showAlert,
  showConfirm,
} from "./utils.js";

let courses = [];
let originalCourses = [];
let isAuthenticated = false;

const coursesGrid = document.getElementById("courses-grid");
const loadingElement = document.getElementById("loading");
const filterButtons = document.querySelectorAll(".filter-btn");
const authSection = document.querySelector(".auth-section");

document.addEventListener("DOMContentLoaded", function () {
  checkAuthStatus();
  loadCourses();
  setupEventListeners();

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    import("./utils.js").then(({ logout }) => {
      logoutBtn.addEventListener("click", function (e) {
        e.preventDefault();
        logout();
      });
    });
  }
});

async function checkAuthStatus() {
  try {
    const data = await fetchAPI("/auth");
    isAuthenticated = data.authenticated;
    updateAuthUI();
  } catch (error) {
    console.error("Erro ao verificar autenticação:", error);
    isAuthenticated = false;
    updateAuthUI();
  }
}

function updateAuthUI() {
  const loggedIn = document.getElementById("logged-in");
  const loggedOut = document.getElementById("logged-out");

  if (isAuthenticated) {
    loggedIn.style.display = "flex";
    loggedOut.style.display = "none";
  } else {
    loggedIn.style.display = "none";
    loggedOut.style.display = "flex";
  }
}

async function loadCourses() {
  try {
    showLoading(loadingElement);

    const data = await fetchAPI("/courses");
    courses = data.results || data;
    originalCourses = [...courses];

    displayCourses(courses);
    hideLoading(loadingElement);
  } catch (error) {
    console.error("Erro ao carregar cursos:", error);
    showError("Erro ao carregar cursos. Tente novamente mais tarde.");
    hideLoading(loadingElement);
  }
}

function displayCourses(coursesToShow) {
  if (!coursesGrid) return;

  coursesGrid.innerHTML = "";

  if (coursesToShow.length === 0) {
    coursesGrid.innerHTML = `
            <div class="no-courses">
                <i class="fas fa-search"></i>
                <p>Nenhum curso encontrado com os filtros selecionados.</p>
            </div>
        `;
    return;
  }

  coursesToShow.forEach((course, index) => {
    const courseCard = createCourseCard(course);
    courseCard.style.animationDelay = `${index * 0.1}s`;
    coursesGrid.appendChild(courseCard);
  });

  setupDetailsButtonListeners();
}

function createCourseCard(course) {
  const card = document.createElement("div");
  card.className = "course-card";
  card.innerHTML = `
        <div class="course-header">
            <h3 class="course-name">${course.name}</h3>
            <div class="course-meta">
                <div class="meta-item">
                    <i class="fas fa-calendar-alt"></i>
                    <span>${formatDate(course.startDate || course.start_date)}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-clock"></i>
                    <span>${course.workload || course.duration + " horas"}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-signal"></i>
                    <span>${course.level}</span>
                </div>
            </div>
        </div>
        <div class="course-body">
            <p class="course-description">${course.description || ""}</p>
            <div class="course-skills">
                ${
                  course.skills && course.skills.length > 0
                    ? course.skills
                        .slice(0, 3)
                        .map((skill) => `<span class="skill-tag">${skill}</span>`)
                        .join("")
                    : ""
                }
            </div>
            <div class="course-footer">
                <div class="price-display">
                    <span class="price">${formatCurrency(course.price)}</span>
                </div>
                <button 
                    class="details-btn" 
                    data-course-id="${course.id}"
                    ${!isAuthenticated ? 'title="Faça login para ver os detalhes"' : ""}
                >
                    <i class="fas fa-eye"></i>
                    Ver Detalhes
                </button>
            </div>
        </div>
    `;

  return card;
}

function viewCourseDetails(courseId) {
  if (!isAuthenticated) {
    showLoginPrompt();
    return;
  }

  window.location.href = `/detalhes.html?id=${courseId}`;
}

function setupDetailsButtonListeners() {
  const detailsButtons = document.querySelectorAll(".details-btn");
  detailsButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const courseId = this.getAttribute("data-course-id");
      viewCourseDetails(courseId);
    });
  });
}

function showLoginPrompt() {
  showConfirm(
    "Você precisa fazer login para ver os detalhes dos cursos. Deseja ir para a página de login?",
    {
      title: "Login Necessário",
      type: "info",
      confirmText: "Ir para Login",
      cancelText: "Cancelar",
    }
  ).then((confirmed) => {
    if (confirmed) {
      window.location.href = "/login";
    }
  });
}

function setupEventListeners() {
  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const filter = this.dataset.filter;

      filterButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");

      filterCourses(filter);
    });
  });

  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", debounce(handleSearch, 300));
  }

  setupMobileMenu();
}

function filterCourses(filter) {
  let filteredCourses = [...originalCourses];

  if (filter !== "todos") {
    filteredCourses = originalCourses.filter((course) => {
      const level = inferLevel(course.name);
      return level.toLowerCase() === filter.toLowerCase();
    });
  }

  displayCourses(filteredCourses);
}

function inferLevel(courseName) {
  const name = courseName.toLowerCase();

  if (name.includes("fundamental") || name.includes("html") || name.includes("css")) {
    return "Iniciante";
  } else if (name.includes("avançado") || name.includes("react")) {
    return "Avançado";
  } else {
    return "Intermediário";
  }
}

function handleSearch(event) {
  const query = event.target.value.toLowerCase().trim();

  if (query === "") {
    displayCourses(originalCourses);
    return;
  }

  const filteredCourses = originalCourses.filter(
    (course) =>
      course.name.toLowerCase().includes(query) ||
      course.duration.toLowerCase().includes(query)
  );

  displayCourses(filteredCourses);
}

function setupMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", function () {
      mobileMenu.classList.toggle("active");
    });

    document.addEventListener("click", function (event) {
      if (!mobileMenuBtn.contains(event.target) && !mobileMenu.contains(event.target)) {
        mobileMenu.classList.remove("active");
      }
    });
  }
}

function formatDateWithOptions(dateString) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("pt-BR", options);
}

function showError(message) {
  showAlert(message, "error");

  if (coursesGrid) {
    coursesGrid.innerHTML = `
            <div class="error-message" style="
                grid-column: 1 / -1;
                text-align: center;
                padding: 2rem;
                background: #fed7d7;
                color: #c53030;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
            ">
                <i class="fas fa-exclamation-triangle"></i>
                ${message}
            </div>
        `;
  }
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

if ("IntersectionObserver" in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove("lazy");
        observer.unobserve(img);
      }
    });
  });

  document.querySelectorAll("img[data-src]").forEach((img) => {
    imageObserver.observe(img);
  });
}

document.addEventListener("click", function (event) {
  if (event.target.matches("button") || event.target.matches(".btn")) {
    const button = event.target;
    button.style.transform = "scale(0.95)";
    setTimeout(() => {
      button.style.transform = "";
    }, 150);
  }
});

let ticking = false;

function updateScrollIndicator() {
  const scrollTop = window.pageYOffset;
  const docHeight = document.body.offsetHeight - window.innerHeight;
  const scrollPercent = (scrollTop / docHeight) * 100;

  ticking = false;
}

window.addEventListener("scroll", function () {
  if (!ticking) {
    requestAnimationFrame(updateScrollIndicator);
    ticking = true;
  }
});

if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
}
