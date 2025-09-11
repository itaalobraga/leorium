import { showMessage, hideMessage, navigateWithToken } from "./utils.js";

const apiUrl = "http://localhost:3000/api";
let isEditing = false;
let userId = null;

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    window.location.href = "/src/pages/login.html";
    return;
  }

  // Parse URL params to check if we're editing
  const urlParams = new URLSearchParams(window.location.search);
  userId = urlParams.get("id");

  if (userId) {
    isEditing = true;
    document.getElementById("page-title").textContent = "Editar Usuário";
    document.getElementById("submit-btn").textContent = "Atualizar Usuário";
    document.getElementById("password-group").style.display = "none";
    loadUser(userId);
  }

  setupEventListeners();
});

function setupEventListeners() {
  // Form submission
  document.getElementById("user-form").addEventListener("submit", handleFormSubmit);

  // Role change to show/hide specialization field
  document.getElementById("role").addEventListener("change", handleRoleChange);

  // Logout button
  document.getElementById("logout-btn").addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("authToken");
    window.location.href = "/src/pages/login.html";
  });
}

function handleRoleChange(e) {
  const specializationGroup = document.getElementById("specialization-group");
  const specializationInput = document.getElementById("specialization");

  if (e.target.value === "instructor") {
    specializationGroup.style.display = "block";
    specializationInput.required = true;
  } else {
    specializationGroup.style.display = "none";
    specializationInput.required = false;
    specializationInput.value = "";
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const userData = {
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    bio: formData.get("bio") || null,
    avatar: formData.get("avatar") || null,
  };

  // Add password if creating new user
  if (!isEditing) {
    userData.password = formData.get("password");
  }

  // Add specialization if instructor
  if (userData.role === "instructor") {
    userData.specialization = formData.get("specialization");
  }

  try {
    const token = localStorage.getItem("authToken");
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `${apiUrl}/users/${userId}` : `${apiUrl}/users`;

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    const result = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        showMessage("Token expirado. Redirecionando para login...", "error");
        setTimeout(() => {
          localStorage.removeItem("authToken");
          window.location.href = "/src/pages/login.html";
        }, 1500);
        return;
      }
      throw new Error(result.error || "Erro ao processar solicitação");
    }

    const action = isEditing ? "atualizado" : "criado";
    showMessage(`Usuário ${action} com sucesso!`, "success");

    setTimeout(() => {
      window.location.href = "/src/pages/usuarios.html";
    }, 1500);
  } catch (error) {
    console.error("Erro:", error);
    showMessage(error.message || "Erro interno do servidor", "error");
  }
}

async function loadUser(id) {
  try {
    const token = localStorage.getItem("authToken");
    const response = await fetch(`${apiUrl}/users/${id}`, {
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
      throw new Error("Erro ao carregar usuário");
    }

    const user = await response.json();

    // Fill form with user data
    document.getElementById("name").value = user.name;
    document.getElementById("email").value = user.email;
    document.getElementById("role").value = user.role;
    document.getElementById("bio").value = user.bio || "";
    document.getElementById("avatar").value = user.avatar || "";

    // Handle specialization for instructors
    if (user.role === "instructor" && user.specialization) {
      document.getElementById("specialization-group").style.display = "block";
      document.getElementById("specialization").value = user.specialization;
      document.getElementById("specialization").required = true;
    }
  } catch (error) {
    console.error("Erro ao carregar usuário:", error);
    showMessage("Erro ao carregar dados do usuário", "error");
    setTimeout(() => {
      window.location.href = "/src/pages/usuarios.html";
    }, 2000);
  }
}
