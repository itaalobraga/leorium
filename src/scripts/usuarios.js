import { showMessage, hideMessage, navigateWithToken } from "./utils.js";

const apiUrl = "http://localhost:3000/api";
let currentPage = 1;
let totalPages = 1;
let searchQuery = "";

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    window.location.href = "/src/pages/login.html";
    return;
  }

  setupEventListeners();
  loadUsers();
});

function setupEventListeners() {
  // Search input
  const searchInput = document.getElementById("search-input");
  let searchTimeout;

  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchQuery = e.target.value.trim();
      currentPage = 1;
      loadUsers();
    }, 500);
  });

  // Create user button
  document.getElementById("create-user-btn").addEventListener("click", () => {
    window.location.href = "/src/pages/usuario.html";
  });

  // Logout button
  document.getElementById("logout-btn").addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("authToken");
    window.location.href = "/src/pages/login.html";
  });
}

async function loadUsers() {
  const loadingState = document.getElementById("loading-state");
  const emptyState = document.getElementById("empty-state");
  const usersList = document.getElementById("users-list");
  const pagination = document.getElementById("pagination");

  // Show loading
  loadingState.style.display = "block";
  emptyState.style.display = "none";
  usersList.style.display = "none";
  pagination.style.display = "none";

  try {
    const token = localStorage.getItem("authToken");
    const params = new URLSearchParams({
      page: currentPage,
      limit: 10,
      ...(searchQuery && { search: searchQuery }),
    });

    const response = await fetch(`${apiUrl}/users?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        showMessage("Token expirado. Redirecionando para login...", "error");
        setTimeout(() => {
          localStorage.removeItem("authToken");
          window.location.href = "/src/pages/login.html";
        }, 1500);
        return;
      }
      throw new Error("Erro ao carregar usuários");
    }

    const result = await response.json();
    const { data: users, pagination: paginationData } = result;

    // Hide loading
    loadingState.style.display = "none";

    if (!users || users.length === 0) {
      emptyState.style.display = "block";
      return;
    }

    // Update pagination info
    totalPages = paginationData.lastPage;
    currentPage = paginationData.currentPage;

    // Render users
    renderUsers(users);
    renderPagination(paginationData);

    usersList.style.display = "block";
    pagination.style.display = "flex";
  } catch (error) {
    console.error("Erro ao carregar usuários:", error);
    loadingState.style.display = "none";
    showMessage("Erro ao carregar usuários", "error");
  }
}

function renderUsers(users) {
  const usersList = document.getElementById("users-list");

  usersList.innerHTML = users
    .map(
      (user) => `
    <div class="user-card">
      <div class="user-info">
        <div class="user-avatar">
          ${
            user.avatar
              ? `<img src="${user.avatar}" alt="${user.name}" />`
              : `<i class="fas fa-user"></i>`
          }
        </div>
        <div class="user-details">
          <h3 class="user-name">${user.name}</h3>
          <p class="user-email">${user.email}</p>
          <div class="user-meta">
            <span class="user-role role-${user.role}">${getRoleLabel(user.role)}</span>
            ${
              user.specialization
                ? `<span class="user-specialization">${user.specialization}</span>`
                : ""
            }
          </div>
          ${user.bio ? `<p class="user-bio">${user.bio}</p>` : ""}
        </div>
      </div>
      <div class="user-actions">
        <button onclick="editUser(${user.id})" class="btn btn-outline btn-sm">
          <i class="fas fa-edit"></i>
          Editar
        </button>
        <button onclick="confirmDeleteUser(${user.id}, '${
        user.name
      }')" class="btn btn-danger btn-sm">
          <i class="fas fa-trash"></i>
          Excluir
        </button>
      </div>
    </div>
  `
    )
    .join("");
}

function renderPagination(paginationData) {
  const pagination = document.getElementById("pagination");
  const { currentPage, lastPage, from, to, total } = paginationData;

  pagination.innerHTML = `
    <div class="pagination-info">
      Mostrando ${from}-${to} de ${total} usuários
    </div>
    <div class="pagination-controls">
      <button 
        onclick="changePage(${currentPage - 1})" 
        ${currentPage === 1 ? "disabled" : ""} 
        class="btn btn-outline btn-sm"
      >
        <i class="fas fa-chevron-left"></i>
        Anterior
      </button>
      <span class="pagination-current">
        Página ${currentPage} de ${lastPage}
      </span>
      <button 
        onclick="changePage(${currentPage + 1})" 
        ${currentPage === lastPage ? "disabled" : ""} 
        class="btn btn-outline btn-sm"
      >
        Próximo
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  `;
}

function getRoleLabel(role) {
  const roles = {
    student: "Estudante",
    instructor: "Instrutor",
    admin: "Administrador",
  };
  return roles[role] || role;
}

function changePage(page) {
  if (page >= 1 && page <= totalPages) {
    currentPage = page;
    loadUsers();
  }
}

function editUser(userId) {
  window.location.href = `/src/pages/usuario.html?id=${userId}`;
}

async function confirmDeleteUser(userId, userName) {
  if (!confirm(`Tem certeza que deseja excluir o usuário "${userName}"?`)) {
    return;
  }

  try {
    const token = localStorage.getItem("authToken");
    const response = await fetch(`${apiUrl}/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        showMessage("Token expirado. Redirecionando para login...", "error");
        setTimeout(() => {
          localStorage.removeItem("authToken");
          window.location.href = "/src/pages/login.html";
        }, 1500);
        return;
      }
      throw new Error("Erro ao excluir usuário");
    }

    showMessage("Usuário excluído com sucesso!", "success");
    loadUsers(); // Reload the list
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    showMessage(error.message || "Erro ao excluir usuário", "error");
  }
}

// Make functions globally available
window.changePage = changePage;
window.editUser = editUser;
window.confirmDeleteUser = confirmDeleteUser;
