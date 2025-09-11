const apiUrl = "http://localhost:3030/api";
let isEditing = false;
let userId = null;

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("jwt_token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  userId = urlParams.get("id");

  if (userId) {
    isEditing = true;
    document.getElementById("page-title").textContent = "Editar Usuário";
    document.getElementById("submit-btn").textContent = "Atualizar Usuário";

    const passwordGroup = document.getElementById("password-group");
    const passwordInput = document.getElementById("password");
    if (passwordGroup) passwordGroup.style.display = "none";
    if (passwordInput) passwordInput.required = false;

    loadUser(userId);
  }

  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById("user-form").addEventListener("submit", handleFormSubmit);

  document.getElementById("role").addEventListener("change", handleRoleChange);

  document.getElementById("logout-btn").addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("jwt_token");
    window.location.href = "login.html";
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

  if (!isEditing) {
    userData.password = formData.get("password");
  }

  if (userData.role === "instructor") {
    userData.specialization = formData.get("specialization");
  }

  try {
    const token = localStorage.getItem("jwt_token");
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
        setTimeout(() => {
          localStorage.removeItem("jwt_token");
          window.location.href = "login.html";
        }, 1500);
        return;
      }
      throw new Error(result.error || "Erro ao processar solicitação");
    }

    const action = isEditing ? "atualizado" : "criado";

    setTimeout(() => {
      window.location.href = "usuarios.html";
    }, 1500);
  } catch (error) {
    console.error("Erro:", error);
  }
}

async function loadUser(id) {
  try {
    const token = localStorage.getItem("jwt_token");
    const response = await fetch(`${apiUrl}/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("jwt_token");
        window.location.href = "login.html";
        return;
      }
      throw new Error("Erro ao carregar usuário");
    }

    const user = await response.json();

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const roleSelect = document.getElementById("role");
    const bioInput = document.getElementById("bio");
    const avatarInput = document.getElementById("avatar");

    if (nameInput) nameInput.value = user.name || "";
    if (emailInput) emailInput.value = user.email || "";
    if (roleSelect) roleSelect.value = user.role || "";
    if (bioInput) bioInput.value = user.bio || "";
    if (avatarInput) avatarInput.value = user.avatar || "";

    if (user.role === "instructor" && user.specialization) {
      const specializationGroup = document.getElementById("specialization-group");
      const specializationInput = document.getElementById("specialization");

      if (specializationGroup) specializationGroup.style.display = "block";
      if (specializationInput) {
        specializationInput.value = user.specialization;
        specializationInput.required = true;
      }
    }
  } catch (error) {
    console.error("Erro ao carregar usuário:", error);
    setTimeout(() => {
      window.location.href = "usuarios.html";
    }, 2000);
  }
}
