import { createModal, showConfirm, showLoading, hideLoading } from "./utils.js";

const apiUrl = "http://localhost:3030/api";
let currentPage = 1;
let totalPages = 1;
let searchQuery = "";

function translateRole(role) {
  const translations = {
    admin: "Administrador",
    instructor: "Instrutor",
    student: "Estudante",
  };
  return translations[role] || role;
}

function createRoleBadge(role) {
  const roleConfig = {
    admin: {
      label: "Administrador",
      color: "#dc2626",
      bgColor: "#fef2f2",
      borderColor: "#fecaca",
    },
    instructor: {
      label: "Instrutor",
      color: "#059669",
      bgColor: "#f0fdf4",
      borderColor: "#bbf7d0",
    },
    student: {
      label: "Estudante",
      color: "#2563eb",
      bgColor: "#eff6ff",
      borderColor: "#bfdbfe",
    },
  };

  const config = roleConfig[role] || {
    label: role,
    color: "#6b7280",
    bgColor: "#f9fafb",
    borderColor: "#e5e7eb",
  };

  return `
    <span style="
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
      color: ${config.color};
      background-color: ${config.bgColor};
      border: 1px solid ${config.borderColor};
    ">
      ${config.label}
    </span>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("jwt_token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  setupEventListeners();
  loadUsers();
});

function setupEventListeners() {
  const searchInput = document.getElementById("search-input");

  let searchTimeout;

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        searchQuery = e.target.value.trim();
        currentPage = 1;
        loadUsers();
      }, 500);
    });
  }

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("user_data");
      window.location.href = "login.html";
    });
  }

  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        loadUsers();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        loadUsers();
      }
    });
  }
}

async function loadUsers() {
  try {
    const token = localStorage.getItem("jwt_token");

    const queryParams = new URLSearchParams({
      page: currentPage,
      limit: 10,
    });

    if (searchQuery) {
      queryParams.append("search", searchQuery);
    }

    const response = await fetch(`${apiUrl}/users?${queryParams}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const result = await response.json();

      const users = result.data || [];
      const pagination = result.pagination || {};
      totalPages = pagination.totalPages || 1;

      displayUsers(users);
      updatePagination();
    } else {
      if (response.status === 401) {
        localStorage.removeItem("jwt_token");
        window.location.href = "login.html";
        return;
      }
      createModal({
        title: "Erro",
        message: "Erro ao carregar usuários",
        type: "error",
        confirmText: "OK",
      });
    }
  } catch (error) {
    createModal({
      title: "Erro de Conexão",
      message: "Erro de conexão ao carregar usuários",
      type: "error",
      confirmText: "OK",
    });
  }
}

function displayUsers(users) {
  const tableBody = document.getElementById("users-table-body");

  const usersList = document.getElementById("users-list");

  if (!tableBody && !usersList) {
    return;
  }

  const container = usersList || tableBody;
  container.innerHTML = "";

  if (users.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        Nenhum usuário encontrado
      </div>
    `;
    return;
  }

  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";

  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <th style="padding: 1rem; text-align: left;">ID</th>
      <th style="padding: 1rem; text-align: left;">Nome</th>
      <th style="padding: 1rem; text-align: left;">Email</th>
      <th style="padding: 1rem; text-align: left;">Função</th>
      <th style="padding: 1rem; text-align: left;">Ações</th>
    </tr>
  `;

  const tbody = document.createElement("tbody");

  users.forEach((user) => {
    const row = document.createElement("tr");
    row.style.borderBottom = "1px solid #f3f4f6";
    row.innerHTML = `
      <td style="padding: 1rem;">${user.id}</td>
      <td style="padding: 1rem;">${user.name}</td>
      <td style="padding: 1rem;">${user.email}</td>
      <td style="padding: 1rem;">
        ${createRoleBadge(user.role)}
      </td>
      <td style="padding: 1rem;">
        <button onclick="editUser(${
          user.id
        })" class="btn btn-edit" style="margin-right: 0.5rem;">Editar</button>
        <button onclick="deleteUser(${user.id})" class="btn btn-delete">Excluir</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  table.appendChild(thead);
  table.appendChild(tbody);
  container.appendChild(table);
}

function updatePagination() {
  const pageInfo = document.getElementById("page-info");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");

  if (pageInfo) {
    pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
  }

  if (prevBtn) {
    prevBtn.disabled = currentPage === 1;
  }

  if (nextBtn) {
    nextBtn.disabled = currentPage === totalPages;
  }
}

window.editUser = function (userId) {
  try {
    if (!userId) {
      console.error("ID do usuário não fornecido");
      return;
    }

    const editUrl = `http://localhost:3030/usuario.html?id=${userId}`;

    window.location.href = editUrl;
  } catch (error) {
    console.error("Erro ao editar usuário:", error);
  }
};

window.deleteUser = async function (userId) {
  const confirmed = await showConfirm("Tem certeza que deseja excluir este usuário?", {
    title: "Confirmar Exclusão",
    type: "warning",
    confirmText: "Excluir",
    cancelText: "Cancelar",
  });

  if (!confirmed) {
    return;
  }

  try {
    const token = localStorage.getItem("jwt_token");

    const response = await fetch(`${apiUrl}/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      createModal({
        title: "Sucesso",
        message: "Usuário excluído com sucesso!",
        type: "success",
        confirmText: "OK",
        onConfirm: () => loadUsers(),
      });
    } else {
      const data = await response.json();

      createModal({
        title: "Erro",
        message: data.error || "Erro ao excluir usuário",
        type: "error",
        confirmText: "OK",
      });
    }
  } catch (error) {
    createModal({
      title: "Erro de Conexão",
      message: "Erro de conexão ao excluir usuário",
      type: "error",
      confirmText: "OK",
    });
  }
};
