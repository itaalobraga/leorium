export async function fetchAPI(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API fetch error:", error);
    throw error;
  }
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR");
}

export function showLoading(element) {
  if (element) {
    element.style.display = "block";
  }
}

export function hideLoading(element) {
  if (element) {
    element.style.display = "none";
  }
}

export function debounce(func, wait) {
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

export function createModal(options = {}) {
  const {
    title = "Atenção",
    message = "",
    type = "info",
    confirmText = "OK",
    cancelText = "Cancelar",
    showCancel = false,
    onConfirm = () => {},
    onCancel = () => {},
  } = options;

  const modalOverlay = document.createElement("div");
  modalOverlay.className = "modal-overlay";

  const iconClass = getIconClass(type);

  modalOverlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">
          <div class="modal-icon ${type}">
            <i class="${iconClass}"></i>
          </div>
          ${title}
        </h3>
        <button class="modal-close" type="button">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <p class="modal-message">${message}</p>
        <div class="modal-actions">
          ${
            showCancel
              ? `<button class="modal-btn modal-btn-secondary" data-action="cancel">${cancelText}</button>`
              : ""
          }
          <button class="modal-btn modal-btn-primary" data-action="confirm">${confirmText}</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modalOverlay);

  const closeModal = () => {
    modalOverlay.classList.remove("active");
    setTimeout(() => {
      document.body.removeChild(modalOverlay);
    }, 300);
  };

  modalOverlay.querySelector(".modal-close").addEventListener("click", () => {
    closeModal();
    onCancel();
  });

  modalOverlay.querySelector('[data-action="confirm"]').addEventListener("click", () => {
    closeModal();
    onConfirm();
  });

  if (showCancel) {
    modalOverlay.querySelector('[data-action="cancel"]').addEventListener("click", () => {
      closeModal();
      onCancel();
    });
  }

  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      closeModal();
      onCancel();
    }
  });

  document.addEventListener("keydown", function escapeHandler(e) {
    if (e.key === "Escape") {
      closeModal();
      onCancel();
      document.removeEventListener("keydown", escapeHandler);
    }
  });

  setTimeout(() => {
    modalOverlay.classList.add("active");
  }, 10);

  return {
    close: closeModal,
  };
}

function getIconClass(type) {
  switch (type) {
    case "success":
      return "fas fa-check";
    case "error":
      return "fas fa-times";
    case "warning":
      return "fas fa-exclamation-triangle";
    case "info":
      return "fas fa-info-circle";
    default:
      return "fas fa-info-circle";
  }
}

export function showAlert(message, type = "info") {
  return createModal({
    title: getAlertTitle(type),
    message,
    type,
    confirmText: "OK",
  });
}

export function showConfirm(message, options = {}) {
  return new Promise((resolve) => {
    createModal({
      title: options.title || "Confirmação",
      message,
      type: options.type || "warning",
      confirmText: options.confirmText || "Sim",
      cancelText: options.cancelText || "Não",
      showCancel: true,
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
}

function getAlertTitle(type) {
  switch (type) {
    case "success":
      return "Sucesso";
    case "error":
      return "Erro";
    case "warning":
      return "Atenção";
    case "info":
      return "Informação";
    default:
      return "Informação";
  }
}
