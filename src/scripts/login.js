import { fetchAPI, setToken, setUserData } from "./utils.js";

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("login-form");

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  checkIfAlreadyLoggedIn();
});

async function handleLogin(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const credentials = {
    email: formData.get("username"),
    password: formData.get("password"),
  };

  try {
    const loadingBtn = document.querySelector(".btn-primary");
    const originalText = loadingBtn.textContent;
    loadingBtn.textContent = "Entrando...";
    loadingBtn.disabled = true;

    const response = await fetchAPI("/auth", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (response.token) {
      setToken(response.token);
      setUserData(response.user);
      window.location.href = "/";
    } else {
      showError("Credenciais inválidas");
    }
  } catch (error) {
    showError("Erro ao fazer login. Verifique suas credenciais.");
    console.error("Login error:", error);
  } finally {
    const loadingBtn = document.querySelector(".btn-primary");
    loadingBtn.textContent = "Entrar";
    loadingBtn.disabled = false;
  }
}

function checkIfAlreadyLoggedIn() {
  const token = localStorage.getItem("jwt_token");
  if (token) {
    window.location.href = "/";
  }
}

function showError(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "alert alert-error";
  errorDiv.textContent = message;

  const form = document.getElementById("login-form");
  form.insertBefore(errorDiv, form.firstChild);

  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}
