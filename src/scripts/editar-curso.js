import { fetchAPI, getUserData, logout } from "./utils.js";

// Redireciona se não for admin
const user = getUserData();
if (!user || user.role !== "admin") {
  window.location.href = "/index.html";
}

const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get("id");
const form = document.getElementById("edit-course-form");
const messageDiv = document.getElementById("form-message");

async function fetchInstructors(query = "", page = 1) {
  const res = await fetchAPI(
    `/users?role=instructor&search=${encodeURIComponent(query)}&page=${page}`
  );
  return res.results || res;
}
async function fetchCategories(query = "", page = 1) {
  const res = await fetchAPI(
    `/categories?search=${encodeURIComponent(query)}&page=${page}`
  );
  return res.results || res;
}

function setupPaginatedSelect(selectId, fetchFn, placeholder, selectedValue) {
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
      const list = await fetchFn(search, page);
      if (reset) {
        select.innerHTML = `<option value="">${placeholder}</option>`;
      }
      list.forEach((item) => {
        if (!Array.from(select.options).some((opt) => opt.value == item.value)) {
          const opt = document.createElement("option");
          opt.value = item.value;
          opt.textContent = item.label;
          if (selectedValue && String(item.value) === String(selectedValue)) {
            opt.selected = true;
          }
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
    select.selectedIndex = 0;
  });
  // Carregar opções iniciais
  loadOptions({ reset: true });
}

async function loadCourseData() {
  if (!courseId) return;
  try {
    const data = await fetchAPI(`/courses/${courseId}`);
    // Preencher campos
    form.instructorId.value = data.instructor_id;
    form.categoryId.value = data.category_id;
    form.name.value = data.name;
    form.description.value = data.description;
    form.price.value = data.price;
    form.workload.value = data.workload;
    form.duration.value = data.duration;
    form.level.value = data.level;
    form.startDate.value = (data.startDate || data.start_date || "").slice(0, 10);
    form.spots.value = data.spots;
    form.skills.value = (data.skills || []).join(", ");
    // Setup selects com valor selecionado
    setupPaginatedSelect(
      "instructor",
      fetchInstructors,
      "Selecione um instrutor...",
      data.instructor_id
    );
    setupPaginatedSelect(
      "category",
      fetchCategories,
      "Selecione uma categoria...",
      data.category_id
    );
  } catch (error) {
    messageDiv.textContent = "Erro ao carregar dados do curso.";
    messageDiv.style.color = "red";
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  messageDiv.textContent = "";
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  data.instructor_id = Number(data.instructorId);
  data.category_id = Number(data.categoryId);
  data.price = parseFloat(data.price);
  data.spots = parseInt(data.spots);
  data.skills = data.skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  delete data.instructorId;
  delete data.categoryId;
  try {
    await fetchAPI(`/courses/${courseId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    messageDiv.textContent = "Curso atualizado com sucesso!";
    messageDiv.style.color = "green";
    setTimeout(() => {
      window.location.href = `/detalhes.html?id=${courseId}`;
    }, 1200);
  } catch (error) {
    messageDiv.textContent = "Erro ao atualizar curso. Verifique os dados.";
    messageDiv.style.color = "red";
  }
});

const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", function (e) {
    e.preventDefault();
    logout();
  });
}

loadCourseData();
