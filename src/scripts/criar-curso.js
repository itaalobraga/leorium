// --- Select com busca paginada para instrutor e categoria ---
function setupPaginatedSelect(selectId, fetchFn, placeholder) {
  const select = document.getElementById(selectId);
  let page = 1;
  let query = "";
  let hasMore = true;
  let loading = false;

  async function loadOptions({ reset = false, search = "" } = {}) {
    if (loading || (!hasMore && !reset)) return;
    loading = true;
    if (reset) {
      page = 1;
      hasMore = true;
      select.innerHTML = `<option value="">${placeholder}</option>`;
    }
    try {
      const res = await fetchFn(search, page);
      const list = res.results || res;
      if (reset) {
        select.innerHTML = `<option value="">${placeholder}</option>`;
      }
      list.forEach((item) => {
        if (!Array.from(select.options).some((opt) => opt.value == item.value)) {
          const opt = document.createElement("option");
          opt.value = item.value;
          opt.textContent = item.label;
          select.appendChild(opt);
        }
      });
      hasMore = list.length > 0;
      if (hasMore) page++;
    } catch {
      if (reset) select.innerHTML = `<option value="">Erro ao carregar opções</option>`;
    }
    loading = false;
  }

  select.addEventListener("focus", () => {
    if (select.options.length <= 1) loadOptions({ reset: true });
  });

  select.addEventListener("scroll", function () {
    if (this.scrollTop + this.clientHeight >= this.scrollHeight - 5) {
      loadOptions({ search: query });
    }
  });

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = `Buscar...`;
  searchInput.className = "form-control";
  select.parentNode.insertBefore(searchInput, select);
  searchInput.addEventListener("input", function () {
    query = this.value;
    page = 1;
    hasMore = true;
    loadOptions({ reset: true, search: query });
    // Limpa seleção ao buscar
    select.selectedIndex = 0;
  });
}

async function fetchInstructors(query, page = 1) {
  const res = await fetchAPI(
    `/users?role=instructor&search=${encodeURIComponent(query)}&page=${page}`
  );
  return res.results || res;
}

async function fetchCategories(query, page = 1) {
  const res = await fetchAPI(
    `/categories?search=${encodeURIComponent(query)}&page=${page}`
  );
  return res.results || res;
}

setupPaginatedSelect("instructor", fetchInstructors, "Selecione um instrutor...");
setupPaginatedSelect("category", fetchCategories, "Selecione uma categoria...");
import { fetchAPI, getUserData, logout } from "./utils.js";

const user = getUserData();
if (!user || user.role !== "admin") {
  window.location.href = "/index.html";
}

const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", function (e) {
    e.preventDefault();
    logout();
  });
}

const form = document.getElementById("create-course-form");
const messageDiv = document.getElementById("form-message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  messageDiv.textContent = "";

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  data.skills = data.skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  data.price = parseFloat(data.price);
  data.spots = parseInt(data.spots);

  // Pega o id do instrutor e categoria selecionados
  data.instructor_id = Number(document.getElementById("instructor").value);
  data.category_id = Number(document.getElementById("category").value);
  data.duration = document.getElementById("duration")?.value || "";

  if (!data.instructorId || !data.categoryId) {
    messageDiv.textContent = "Selecione um instrutor e uma categoria válidos.";
    messageDiv.style.color = "red";
    return;
  }

  try {
    const response = await fetchAPI("/courses", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (response && response.id) {
      window.location.href = `/detalhes.html?id=${response.id}`;
    } else {
      messageDiv.textContent = "Curso criado, mas não foi possível redirecionar.";
      messageDiv.style.color = "orange";
      form.reset();
    }
  } catch (error) {
    messageDiv.textContent = "Erro ao criar curso. Verifique os dados.";
    messageDiv.style.color = "red";
  }
});
