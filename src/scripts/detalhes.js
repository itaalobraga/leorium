import {
  fetchAPI,
  formatCurrency,
  formatDate,
  showLoading,
  hideLoading,
  showAlert,
  showConfirm,
  getUserData,
} from "./utils.js";

let courseData = null;
let currentQuantity = 1;
let maxQuantity = 10;

const loadingElement = document.getElementById("loading");
const courseDetailsElement = document.getElementById("course-details");
const errorElement = document.getElementById("error-message");
const quantityInput = document.getElementById("quantity-input");
const decreaseBtn = document.getElementById("decrease-btn");
const increaseBtn = document.getElementById("increase-btn");
const totalValueElement = document.getElementById("total-value");
const enrollBtn = document.getElementById("enroll-btn");
const deleteBtn = document.getElementById("delete-btn");

document.addEventListener("DOMContentLoaded", function () {
  const courseId = getCourseIdFromURL();
  if (courseId) {
    loadCourseDetails(courseId);
  } else {
    showError();
  }

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

function getCourseIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get("id");
  return courseId && !isNaN(courseId) ? parseInt(courseId) : null;
}

async function loadCourseDetails(courseId) {
  try {
    showLoading(loadingElement);

    const data = await fetchAPI(`/courses/${courseId}`);
    courseData = data;
    displayCourseDetails();
    hideLoading(loadingElement);
  } catch (error) {
    if (error.message.includes("401")) {
      window.location.href = "/login";
      return;
    }
    console.error("Erro ao carregar detalhes do curso:", error);
    showError();
    hideLoading(loadingElement);
  }
}

function displayCourseDetails() {
  if (!courseData) return;

  document.getElementById("course-title").textContent = courseData.name;
  document.getElementById("course-description").textContent =
    courseData.description;
  document.getElementById("course-level").textContent = courseData.level;
  document.getElementById("course-start-date").textContent = formatDate(
    courseData.startDate || courseData.start_date
  );
  document.getElementById("course-duration").textContent =
    courseData.workload || courseData.duration + " horas";
  document.getElementById("course-instructor").textContent =
    courseData.instructor_name || "Instrutor";
  document.getElementById("course-spots").textContent = courseData.spots;
  document.getElementById("course-workload").textContent = courseData.workload;
  document.getElementById("course-instructor-full").textContent =
    courseData.instructor_name || "Instrutor";
  document.getElementById("course-level-full").textContent = courseData.level;
  document.getElementById("course-start-full").textContent = formatDate(
    courseData.startDate || courseData.start_date
  );
  document.getElementById("course-full-description").textContent =
    courseData.description;
  document.getElementById("course-price").textContent = formatCurrency(
    courseData.price
  )
    .replace("R$", "")
    .trim();

  if (courseData.skills && courseData.skills.length > 0) {
    const skillsContainer = document.getElementById("course-skills");
    if (skillsContainer) {
      skillsContainer.innerHTML = courseData.skills
        .map((skill) => `<span class="skill-tag">${skill}</span>`)
        .join("");
    }
  }

  maxQuantity = Math.min(courseData.spots, 10);
  quantityInput.max = maxQuantity;
  updateTotal();

  if (enrollBtn) {
    enrollBtn.innerHTML = '<i class="fas fa-ban"></i> Matrícula Indisponível';
    enrollBtn.style.background = "#9ca3af";
    enrollBtn.style.cursor = "not-allowed";
  }

  const currentUser = getUserData();
  const editBtn = document.getElementById("edit-btn");
  if (currentUser && currentUser.role === "admin") {
    if (deleteBtn) deleteBtn.style.display = "block";
    if (editBtn) {
      editBtn.style.display = "block";
      editBtn.onclick = function () {
        window.location.href = `/editar-curso.html?id=${courseData.id}`;
      };
    }
  }

  courseDetailsElement.style.display = "block";
}

function setupEventListeners() {
  quantityInput.addEventListener("input", handleQuantityChange);
  decreaseBtn.addEventListener("click", decreaseQuantity);
  increaseBtn.addEventListener("click", increaseQuantity);
  enrollBtn.addEventListener("click", processEnrollment);

  if (deleteBtn) {
    deleteBtn.addEventListener("click", handleDeleteCourse);
  }

  document.addEventListener("keydown", handleKeyboardShortcuts);
}

function updateTotal() {
  if (!courseData) return;

  const total = courseData.price * currentQuantity;
  totalValueElement.textContent = formatCurrency(total)
    .replace("R$", "")
    .trim();
}

function handleQuantityChange() {
  const value = parseInt(quantityInput.value);
  if (isNaN(value) || value < 1) {
    currentQuantity = 1;
    quantityInput.value = 1;
  } else if (value > maxQuantity) {
    currentQuantity = maxQuantity;
    quantityInput.value = maxQuantity;
  } else {
    currentQuantity = value;
  }
  updateTotal();
}

function decreaseQuantity() {
  if (currentQuantity > 1) {
    currentQuantity--;
    quantityInput.value = currentQuantity;
    updateTotal();
  }
}

function increaseQuantity() {
  if (currentQuantity < maxQuantity) {
    currentQuantity++;
    quantityInput.value = currentQuantity;
    updateTotal();
  }
}

function processEnrollment() {
  if (!courseData) return;

  const total = courseData.price * currentQuantity;
  const message = `
        Resumo da Matrícula:
        
        Curso: ${courseData.name}
        Quantidade de vagas: ${currentQuantity}
        Valor unitário: ${formatCurrency(courseData.price)}
        Valor total: ${formatCurrency(total)}
        
        Nota: A funcionalidade de matrícula está temporariamente desabilitada.
    `;

  showAlert(message, "info");
}

async function handleDeleteCourse() {
  if (!courseData) return;

  const currentUser = getUserData();
  if (!currentUser || currentUser.role !== "admin") {
    showAlert("Você não tem permissão para excluir cursos.", "error");
    return;
  }

  const confirmMessage = `Tem certeza que deseja excluir o curso "${courseData.name}"?\n\nEsta ação não pode ser desfeita.`;

  const confirmed = await showConfirm(confirmMessage);
  if (!confirmed) return;

  try {
    const deleteButton = document.getElementById("delete-btn");
    const originalText = deleteButton.innerHTML;

    deleteButton.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Excluindo...';
    deleteButton.disabled = true;

    await fetchAPI(`/courses/${courseData.id}`, {
      method: "DELETE",
      body: JSON.stringify({ userId: currentUser.id }),
    });

    showAlert("Curso excluído com sucesso!", "success");

    setTimeout(() => {
      window.location.href = "/";
    }, 2000);
  } catch (error) {
    console.error("Erro ao excluir curso:", error);
    showAlert("Erro ao excluir curso. Tente novamente.", "error");

    const deleteButton = document.getElementById("delete-btn");
    deleteButton.innerHTML = '<i class="fas fa-trash"></i> Excluir Curso';
    deleteButton.disabled = false;
  }
}

function handleKeyboardShortcuts(event) {
  if ((event.ctrlKey || event.metaKey) && event.key === "-") {
    event.preventDefault();
    decreaseQuantity();
  }

  if ((event.ctrlKey || event.metaKey) && event.key === "+") {
    event.preventDefault();
    increaseQuantity();
  }

  if (event.key === "Enter" && event.target !== enrollBtn) {
    event.preventDefault();
    processEnrollment();
  }

  if (event.key === "Escape") {
    window.history.back();
  }
}

function showError() {
  if (loadingElement) {
    loadingElement.style.display = "none";
  }

  if (courseDetailsElement) {
    courseDetailsElement.style.display = "none";
  }

  if (errorElement) {
    errorElement.style.display = "block";
  }
}

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("animate-in");
    }
  });
}, observerOptions);

document.addEventListener("DOMContentLoaded", () => {
  const elementsToAnimate = document.querySelectorAll(
    ".course-info, .enrollment-card"
  );
  elementsToAnimate.forEach((el) => observer.observe(el));
});
