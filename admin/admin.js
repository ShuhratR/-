const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

const authView = document.querySelector("#loginScreen");
const panelView = document.querySelector("#adminPanel");
const loginForm = document.querySelector("#loginForm");
const authMessage = document.querySelector("#authMessage");
const refreshButton = document.querySelector("#refreshButton");
const newCategoryButton = document.querySelector("#newCategoryButton");
const newProductButton = document.querySelector("#newProductButton");
const categoryList = document.querySelector("#categoryList");
const productList = document.querySelector("#productList");
const adminModal = document.querySelector("#adminModal");
const adminToast = document.querySelector("#adminToast");
const signOutButtons = $$(".sign-out");

const state = {
  session: null,
  user: null,
  categories: [],
  products: [],
  selectedItem: null,
  selectedImageFile: null,
  modalType: null,
};

const TEMP_ADMIN_ID = "ruzimatzodashuhrat@gmail.com";
const TEMP_ADMIN_PIN = "2";
const TEMP_ADMIN_SESSION_KEY = "tempAdminAuth";

function isTempAdminSession() {
  return sessionStorage.getItem(TEMP_ADMIN_SESSION_KEY) === "true";
}

function setTempAdminSession(enabled) {
  if (enabled) {
    sessionStorage.setItem(TEMP_ADMIN_SESSION_KEY, "true");
  } else {
    sessionStorage.removeItem(TEMP_ADMIN_SESSION_KEY);
  }
}

function showToast(message) {
  if (!adminToast) return;
  adminToast.textContent = message;
  adminToast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => adminToast.classList.remove("show"), 2200);
}

function updateVisibility(isAdmin) {
  if (authView) authView.hidden = isAdmin;
  if (panelView) panelView.hidden = !isAdmin;
  signOutButtons.forEach(button => button.hidden = !isAdmin);
}

async function initAdmin() {
  if (typeof supabaseClient === "undefined" || !supabaseClient) {
    showToast("Supabase не настроен. Проверьте supabase.config.js");
    return;
  }

  const { data: { session }, error } = await supabaseClient.auth.getSession();
  if (error) console.error(error);
  if (session?.user) {
    await verifyAdminSession(session);
  } else {
    state.user = { id: "public_admin" };
    updateVisibility(true);
    if (authMessage) authMessage.hidden = true;
    await loadAdminData();
  }

  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    if (event === "SIGNED_IN" && session?.user) {
      await verifyAdminSession(session);
    }
    if (event === "SIGNED_OUT") {
      updateVisibility(false);
      showToast("Выход выполнен");
    }
  });
}

async function verifyAdminSession(session) {
  state.session = session;
  state.user = session.user;
  const { data, error } = await supabaseClient.from("admin_users").select("user_id").eq("user_id", state.user.id).single();
  if (error || !data) {
    await signOut();
    updateVisibility(false);
    if (authMessage) {
      authMessage.hidden = false;
      authMessage.textContent = "Доступ администратора не подтверждён.";
    }
    return;
  }
  updateVisibility(true);
  if (authMessage) authMessage.hidden = true;
  await loadAdminData();
}

async function signOut() {
  if (!supabaseClient) return;
  await supabaseClient.auth.signOut();
  setTempAdminSession(false);
  state.session = null;
  state.user = null;
  state.categories = [];
  state.products = [];
  updateVisibility(false);
}

async function handleLogin(event) {
  event.preventDefault();
  if (authMessage) authMessage.hidden = true;

  const emailField = document.querySelector("#email");
  const passwordField = document.querySelector("#password");
  const email = emailField?.value.trim() || "";
  const password = passwordField?.value || "";

  if (!email || !password) {
    if (authMessage) {
      authMessage.hidden = false;
      authMessage.textContent = "ведите почту и пароль.";
    }
    return;
  }

  if (email === TEMP_ADMIN_ID && password === TEMP_ADMIN_PIN) {
    setTempAdminSession(true);
    state.user = { id: TEMP_ADMIN_ID };
    state.session = null;
    updateVisibility(true);
    if (authMessage) authMessage.hidden = true;
    await loadAdminData();
    return;
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    if (authMessage) {
      authMessage.hidden = false;
      authMessage.textContent = error.message || "Не удалось войти.";
    }
    return;
  }

  if (data?.session) {
    await verifyAdminSession(data.session);
  }
}

async function loadAdminData() {
  const [categoriesResponse, productsResponse] = await Promise.all([
    supabaseClient.from("categories").select("*").order("sort_order", { ascending: true }),
    supabaseClient.from("products").select("*").order("archived", { ascending: true }).order("sort_order", { ascending: true }),
  ]);

  if (categoriesResponse.error || productsResponse.error) {
    showToast("шибка загрузки данных админки.");
    console.error(categoriesResponse.error || productsResponse.error);
    return;
  }

  state.categories = categoriesResponse.data || [];
  state.products = productsResponse.data || [];
  renderDashboard();
  renderCategories();
  renderProducts();
}

function renderDashboard() {
  const totalProducts = state.products.length;
  const archivedProducts = state.products.filter(item => item.archived).length;
  const featuredProducts = state.products.filter(item => item.featured && !item.archived).length;

  const statProducts = document.querySelector("#statProducts strong");
  const statCategories = document.querySelector("#statCategories strong");
  const statArchived = document.querySelector("#statArchived strong");
  const statFeatured = document.querySelector("#statFeatured strong");

  if (statProducts) statProducts.textContent = String(totalProducts);
  if (statCategories) statCategories.textContent = String(state.categories.length);
  if (statArchived) statArchived.textContent = String(archivedProducts);
  if (statFeatured) statFeatured.textContent = String(featuredProducts);
}

function renderCategories() {
  if (!categoryList) return;
  if (!state.categories.length) {
    categoryList.innerHTML = `<div class="admin-alert">Нет категорий. Создайте первую категорию.</div>`;
    return;
  }

  categoryList.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Название</th>
          <th>Порядок</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        ${state.categories.map(category => `
          <tr data-category-id="${category.id}">
            <td>${escapeHtml(category.name)}</td>
            <td>${category.sort_order ?? 0}</td>
            <td>
              <button class="text-button" data-action="edit" data-id="${category.id}">Изменить</button>
              <button class="text-button" data-action="move-up" data-id="${category.id}">↑</button>
              <button class="text-button" data-action="move-down" data-id="${category.id}">↓</button>
              <button class="text-button" data-action="delete" data-id="${category.id}">Удалить</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function renderProducts() {
  if (!productList) return;
  if (!state.products.length) {
    productList.innerHTML = `<div class="admin-alert">Нет товаров. Добавьте первый продукт.</div>`;
    return;
  }

  productList.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Название</th>
          <th>Категория</th>
          <th>Цена</th>
          <th>В наличии</th>
          <th>Хит</th>
          <th>Архив</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        ${state.products.map(product => `
          <tr data-product-id="${product.id}">
            <td>${escapeHtml(product.name)}</td>
            <td>${escapeHtml(product.category_name || product.category || "—")}</td>
            <td>${product.price}${product.old_price && product.old_price > product.price ? ` / <span class="product-old-price">${product.old_price}</span>` : ""}</td>
            <td>${product.available ? "Да" : "Нет"}</td>
            <td>${product.featured ? "Да" : "Нет"}</td>
            <td>${product.archived ? "Да" : "Нет"}</td>
            <td>
              <button class="text-button" data-action="edit" data-id="${product.id}">Изменить</button>
              <button class="text-button" data-action="archive" data-id="${product.id}">${product.archived ? "Восстановить" : "Архив"}</button>
              <button class="text-button" data-action="delete" data-id="${product.id}">Удалить</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function openModal(type, item = null) {
  state.modalType = type;
  state.selectedItem = item;
  state.selectedImageFile = null;
  if (!adminModal) return;

  const pasteValue = value => value == null ? "" : escapeHtml(String(value));
  const categoryOptions = state.categories.map(category => `
    <option value="${escapeHtml(category.name)}" ${item && category.name === (item.category_name || item.category) ? "selected" : ""}>${escapeHtml(category.name)}</option>
  `).join("");

  if (type === "category") {
    adminModal.querySelector(".admin-modal-card").innerHTML = `
      <button class="close-button modal-close" type="button" id="adminClose" aria-label="закрыть">×</button>
      <p class="eyebrow dark"><span></span> Управление</p>
      <h2>${item ? "Изменить категорию" : "Новая категория"}</h2>
      <form id="adminForm" class="admin-form-grid">
        <div class="admin-alert" id="modalMessage" hidden></div>
        <label class="full-width">
          Название категории
          <input id="categoryName" class="admin-input" value="${pasteValue(item?.name)}" required>
        </label>
        <label class="full-width">
          Порядок сортировки
          <input id="categorySortOrder" type="number" class="admin-input" min="0" value="${pasteValue(item?.sort_order || 0)}" required>
        </label>
        <div class="admin-form-footer full-width">
          <button class="text-button" type="button" id="cancelModal">Отмена</button>
          <button class="primary-button" type="submit">Сохранить</button>
        </div>
      </form>
    `;
  } else {
    adminModal.querySelector(".admin-modal-card").innerHTML = `
      <button class="close-button modal-close" type="button" id="adminClose" aria-label="закрыть">×</button>
      <p class="eyebrow dark"><span></span> Управление</p>
      <h2>${item ? "Изменить товар" : "Новый товар"}</h2>
      <form id="adminForm" class="admin-form-grid">
        <div class="admin-alert" id="modalMessage" hidden></div>
        <label class="full-width">
          Название товара
          <input id="productName" class="admin-input" value="${pasteValue(item?.name)}" required>
        </label>
        <label class="full-width">
          Краткое описание
          <textarea id="productDescription" class="admin-input" rows="3" required>${pasteValue(item?.description)}</textarea>
        </label>
        <label>
          Категория
          <select id="productCategory" class="admin-input" required>${categoryOptions}</select>
        </label>
        <label>
          Размер / порция
          <input id="productSize" class="admin-input" value="${pasteValue(item?.size)}">
        </label>
        <label>
          Цена, сомони
          <input id="productPrice" type="number" class="admin-input" min="0" step="1" value="${pasteValue(item?.price)}" required>
        </label>
        <label>
          Старая цена, сомони
          <input id="productOldPrice" type="number" class="admin-input" min="0" step="1" value="${pasteValue(item?.old_price)}">
        </label>
        <label>
          Скидка %
          <input id="productDiscount" type="number" class="admin-input" min="0" max="99" step="1" value="${pasteValue(item?.discount_percentage)}">
        </label>
        <label class="admin-checkbox">
          <input id="productAvailable" type="checkbox" ${item ? (item.available ? "checked" : "") : "checked"}>
          В наличии
        </label>
        <label class="admin-checkbox">
          <input id="productFeatured" type="checkbox" ${item && item.featured ? "checked" : ""}>
          Хит / рекомендованный
        </label>
        <label>
          Порядок сортировки
          <input id="productSortOrder" type="number" class="admin-input" min="0" step="1" value="${pasteValue(item?.sort_order || 0)}">
        </label>
        <label class="full-width">
          Тег на карточке
          <input id="productTag" class="admin-input" value="${pasteValue(item?.tag)}" placeholder="апример: Хит, опулярное">
        </label>
        <label class="full-width">
          зображение
          <input id="imageInput" type="file" accept="image/*" class="admin-input">
        </label>
        <div class="full-width">
          <div id="imagePreview" class="admin-image-preview">${item?.image_url ? `<img src="${escapeHtml(item.image_url)}" alt="ревью изображения">` : "ыберите файл для загрузки"}</div>
        </div>
        <input id="productId" type="hidden" value="${pasteValue(item?.id)}">
        <div class="admin-form-footer full-width">
          <button class="text-button" type="button" id="cancelModal">тмена</button>
          <button class="primary-button" type="submit">Сохранить</button>
        </div>
      </form>
    `;
  }

  attachModalEvents();
  adminModal.classList.add("open");
}

function attachModalEvents() {
  if (!adminModal) return;
  const cancelButton = adminModal.querySelector("#cancelModal");
  const closeButton = adminModal.querySelector("#adminClose");
  const imageInputElem = adminModal.querySelector("#imageInput");
  const form = adminModal.querySelector("#adminForm");

  if (cancelButton) cancelButton.addEventListener("click", closeModal);
  if (closeButton) closeButton.addEventListener("click", closeModal);
  if (imageInputElem) imageInputElem.addEventListener("change", handleImageChange);
  if (form) form.addEventListener("submit", handleModalSubmit);
}

function detachModalEvents() {
  if (!adminModal) return;
  const cancelButton = adminModal.querySelector("#cancelModal");
  const closeButton = adminModal.querySelector("#adminClose");
  const imageInputElem = adminModal.querySelector("#imageInput");
  const form = adminModal.querySelector("#adminForm");

  if (cancelButton) cancelButton.removeEventListener("click", closeModal);
  if (closeButton) closeButton.removeEventListener("click", closeModal);
  if (imageInputElem) imageInputElem.removeEventListener("change", handleImageChange);
  if (form) form.removeEventListener("submit", handleModalSubmit);
}

function closeModal() {
  if (!adminModal) return;
  adminModal.classList.remove("open");
  const message = adminModal.querySelector("#modalMessage");
  if (message) message.hidden = true;
  detachModalEvents();
}

function handleImageChange(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  state.selectedImageFile = file;
  const preview = adminModal.querySelector("#imagePreview");
  if (!preview) return;
  const reader = new FileReader();
  reader.onload = () => {
    preview.innerHTML = `<img src="${reader.result}" alt="ревью изображения">`;
  };
  reader.readAsDataURL(file);
}

async function handleModalSubmit(event) {
  event.preventDefault();
  const form = event.target;
  if (!form) return;

  if (state.modalType === "category") {
    const name = form.querySelector("#categoryName").value.trim();
    const sortOrder = Number(form.querySelector("#categorySortOrder").value) || 0;
    if (!name) return showModalError("Введите название категории.");
    await saveCategory({ id: state.selectedItem?.id, name, sort_order: sortOrder });
    return;
  }

  const payload = {
    id: state.selectedItem?.id,
    name: form.querySelector("#productName").value.trim(),
    description: form.querySelector("#productDescription").value.trim(),
    category_name: form.querySelector("#productCategory").value,
    size: form.querySelector("#productSize").value.trim(),
    price: Number(form.querySelector("#productPrice").value) || 0,
    old_price: form.querySelector("#productOldPrice").value ? Number(form.querySelector("#productOldPrice").value) : null,
    discount_percentage: Number(form.querySelector("#productDiscount").value) || 0,
    available: form.querySelector("#productAvailable").checked,
    featured: form.querySelector("#productFeatured").checked,
    sort_order: Number(form.querySelector("#productSortOrder").value) || 0,
    tag: form.querySelector("#productTag").value.trim(),
  };

  if (!payload.name) return showModalError("Введите название товара.");
  if (!payload.description) return showModalError("Введите описание товара.");
  if (!payload.category_name) return showModalError("Выберите категорию.");
  if (!payload.price || payload.price <= 0) return showModalError("Введите корректную цену.");

  if (!payload.discount_percentage && payload.old_price && payload.old_price > payload.price) {
    payload.discount_percentage = Math.round(((payload.old_price - payload.price) / payload.old_price) * 100);
  }

  await saveProduct(payload);
}

function showModalError(message) {
  const messageBox = adminModal.querySelector("#modalMessage");
  if (!messageBox) return;
  messageBox.hidden = false;
  messageBox.textContent = message;
}

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function saveCategory(category) {
  try {
    if (category.id) {
      await supabaseClient.from("categories").update({ name: category.name, sort_order: category.sort_order }).eq("id", category.id);
      await supabaseClient.from("products").update({ category_name: category.name }).eq("category_id", category.id);
      showToast("Категория обновлена.");
    } else {
      await supabaseClient.from("categories").insert({ name: category.name, sort_order: category.sort_order });
      showToast("Категория добавлена.");
    }
    await loadAdminData();
    closeModal();
  } catch (error) {
    showModalError(error.message || "шибка при сохранении категории.");
  }
}

async function saveProduct(payload) {
  try {
    const categoryId = findCategoryId(payload.category_name);
    let image_path = state.selectedItem?.image_path || null;
    let image_url = state.selectedItem?.image_url || state.selectedItem?.image || null;

    if (state.selectedImageFile) {
      const uploadResult = await uploadImage(state.selectedImageFile);
      image_path = uploadResult.image_path;
      image_url = uploadResult.image_url;
    }

    const record = {
      name: payload.name,
      description: payload.description,
      category_id: categoryId,
      category_name: payload.category_name,
      size: payload.size,
      price: payload.price,
      old_price: payload.old_price,
      discount_percentage: payload.discount_percentage,
      available: payload.available,
      featured: payload.featured,
      sort_order: payload.sort_order,
      tag: payload.tag,
      image_path,
      image_url,
      archived: state.selectedItem?.archived ?? false,
    };

    if (payload.id) {
      await supabaseClient.from("products").update(record).eq("id", payload.id);
      showToast("Товар сохранён.");
    } else {
      await supabaseClient.from("products").insert(record);
      showToast("Товар создан.");
    }

    await loadAdminData();
    closeModal();
  } catch (error) {
    showModalError(error.message || "шибка при сохранении товара.");
    console.error(error);
  }
}

function findCategoryId(name) {
  const category = state.categories.find(item => item.name === name);
  return category?.id || null;
}

async function uploadImage(file) {
  const compressed = await compressImage(file);
  const path = `products/${crypto.randomUUID()}.webp`;
  const { error } = await supabaseClient.storage.from(STORAGE_BUCKET).upload(path, compressed, { upsert: true });
  if (error) throw error;
  const { data } = supabaseClient.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return { image_path: path, image_url: data.publicUrl };
}

async function compressImage(file) {
  const bitmap = await createImageBitmap(file);
  const maxWidth = 1200;
  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.drawImage(bitmap, 0, 0, width, height);
  return await new Promise(resolve => canvas.toBlob(resolve, "image/webp", 0.8));
}

async function handleCategoryAction(action, id) {
  const category = state.categories.find(item => item.id === id);
  if (!category) return;

  if (action === "edit") {
    openModal("category", category);
    return;
  }

  if (action === "delete") {
    const linkedProducts = state.products.filter(item => item.category_id === id);
    if (linkedProducts.length) {
      showToast("Удалите или переместите товары из категории перед удалением.");
      return;
    }
    await supabaseClient.from("categories").delete().eq("id", id);
    showToast("Категория удалена.");
    await loadAdminData();
    return;
  }

  const currentIndex = state.categories.findIndex(item => item.id === id);
  const swapIndex = action === "move-up" ? currentIndex - 1 : currentIndex + 1;
  if (swapIndex < 0 || swapIndex >= state.categories.length) return;
  const current = state.categories[currentIndex];
  const neighbor = state.categories[swapIndex];
  await supabaseClient.from("categories").update({ sort_order: neighbor.sort_order || 0 }).eq("id", current.id);
  await supabaseClient.from("categories").update({ sort_order: current.sort_order || 0 }).eq("id", neighbor.id);
  await loadAdminData();
}

async function handleProductAction(action, id) {
  const product = state.products.find(item => item.id === id);
  if (!product) return;

  if (action === "edit") {
    openModal("product", product);
    return;
  }

  if (action === "archive") {
    await supabaseClient.from("products").update({ archived: !product.archived }).eq("id", id);
    showToast(product.archived ? "Товар восстановлен." : "Товар отправлен в архив.");
    await loadAdminData();
    return;
  }

  if (action === "delete") {
    await supabaseClient.from("products").delete().eq("id", id);
    showToast("Товар удалён.");
    await loadAdminData();
    return;
  }
}

categoryList?.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const action = button.dataset.action;
  const id = Number(button.dataset.id);
  handleCategoryAction(action, id);
});

productList?.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const action = button.dataset.action;
  const id = Number(button.dataset.id);
  handleProductAction(action, id);
});

loginForm?.addEventListener("submit", handleLogin);
refreshButton?.addEventListener("click", loadAdminData);
newCategoryButton?.addEventListener("click", () => openModal("category"));
newProductButton?.addEventListener("click", () => openModal("product"));
signOutButtons.forEach(button => button.addEventListener("click", signOut));

initAdmin();
