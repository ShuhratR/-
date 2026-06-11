const SITE_CONFIG = {
  whatsapp: "992007884423",
  deliveryPrice: 20,
  freeDeliveryFrom: 150,
};

const products = [
  [1,"Роллы","Филадельфия","Нежный ролл с лососем, сливочным сыром и свежим огурцом.","8 шт / 250 г",65,"Хит"],
  [2,"Роллы","Калифорния","Крабовый микс, огурец, икра масаго и сливочный сыр.","8 шт / 230 г",55,"Популярное"],
  [3,"Роллы","Запечённый ролл","Тёплый ролл под нежной сырной шапкой и фирменным соусом.","8 шт / 260 г",60,"Тёплое"],
  [4,"Пицца","Пицца Пепперони","Томатный соус, моцарелла и пикантная пепперони.","30 см / 650 г",65,"Хит"],
  [5,"Пицца","Пицца Маргарита","Моцарелла, томатный соус, помидоры и ароматный базилик.","30 см / 600 г",55,"Классика"],
  [6,"Пицца","Пицца с курицей","Сочная курица, сыр, фирменный соус и свежие овощи.","30 см / 680 г",65,"Сытно"],
  [7,"Бургеры","Чизбургер","Котлета, сыр, салат, овощи и соус в мягкой булочке.","1 шт / 280 г",45,"Быстро"],
  [8,"Фастфуд","Крылышки острые","Куриные крылышки в ярком остром соусе.","6 шт / 350 г",40,"Острое"],
  [9,"Фастфуд","Картофель фри","Золотистый и хрустящий картофель с солью.","150 г",25,"Добавка"],
  [10,"Салаты","Салат Цезарь","Курица, салат, сухарики, сыр и фирменный соус.","250 г",45,"Лёгкое"],
  [11,"Салаты","Салат с лососем","Свежий салат с лососем, овощами и мягкой заправкой.","250 г",55,"Премиум"],
  [12,"Супы","Куриный суп","Горячий домашний суп с курицей, овощами и зеленью.","350 мл",35,"Горячее"],
  [13,"Сеты","Сет Классик","Популярные роллы для компании из двух-трёх человек.","24 шт / 700 г",129,"Сет"],
  [14,"Сеты","Сет Премиум","Большой выбор роллов для семейного вечера или компании.","36 шт / 1050 г",199,"Большой сет"],
  [15,"Фастфуд","Наггетсы","Нежное куриное филе в хрустящей золотистой панировке.","8 шт / 220 г",30,"Детям"],
  [16,"Фастфуд","Сырные палочки","Горячая моцарелла в хрустящей панировке.","6 шт / 200 г",35,"Закуска"],
  [17,"Бургеры","Бургер двойной","Две сочные котлеты, сыр, овощи и насыщенный соус.","1 шт / 380 г",65,"Сытно"],
  [18,"Шаурма","Шаурма куриная","Сочная курица, свежие овощи и соус в тонком лаваше.","1 шт / 350 г",40,"Хит"],
  [19,"Роллы","Лосось ролл","Лосось, рис и нежная сливочная начинка.","8 шт / 240 г",70,"Премиум"],
  [20,"Роллы","Острый ролл","Пикантный ролл с ярким соусом для любителей острого.","8 шт / 240 г",60,"Острое"],
  [21,"Роллы","Темпура ролл","Хрустящий горячий ролл в темпуре с фирменным соусом.","8 шт / 260 г",60,"Горячее"],
  [22,"Напитки","Coca-Cola 0.5","Охлаждённый газированный напиток.","0.5 л",10,"Напиток"],
  [23,"Напитки","Fanta 0.5","Охлаждённый апельсиновый напиток.","0.5 л",10,"Напиток"],
  [24,"Напитки","Sprite 0.5","Освежающий лимонно-лаймовый напиток.","0.5 л",10,"Напиток"],
  [25,"Пицца","Пицца 4 сыра","Четыре вида сыра и насыщенный сливочный вкус.","30 см / 620 г",65,"Классика"],
  [26,"Пицца","Пицца BBQ","Курица, сыр, красный лук и дымный соус BBQ.","30 см / 700 г",65,"Мясное"],
  [27,"Десерты","Шоколадный торт","Насыщенный шоколадный десерт с нежным кремом.","1 порция / 150 г",30,"Десерт"],
  [28,"Десерты","Тирамису","Воздушный сливочный десерт с кофейной ноткой.","1 порция / 160 г",30,"Десерт"],
  [29,"Напитки","Мохито","Освежающий безалкогольный напиток с лаймом и мятой.","0.4 л",20,"Освежает"],
  [30,"Напитки","Апельсиновый сок","Холодный апельсиновый сок для детей и взрослых.","0.4 л",15,"Сок"],
].map(([id, category, name, description, size, price, tag]) => ({
  id, category, name, description, size, price, tag,
  image: `images/products/product-${String(id).padStart(2, "0")}.webp`,
}));

const state = {
  activeCategory: "Все",
  search: "",
  cart: loadCart(),
  viewMode: localStorage.getItem("sheikh-kebab-view") === "list" ? "list" : "grid",
};

const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
const formatPrice = value => `${value} сомони`;
const normalizeSearch = value => value.toLowerCase().replaceAll("ё", "е").trim();
let lastFocusedElement = null;
let activeProductId = null;

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("sheikh-kebab-cart"));
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
}

function saveCart() {
  localStorage.setItem("sheikh-kebab-cart", JSON.stringify(state.cart));
}

function getCartItems() {
  return Object.entries(state.cart)
    .map(([id, quantity]) => ({ product: products.find(item => item.id === Number(id)), quantity }))
    .filter(item => item.product && item.quantity > 0);
}

function cartSummary() {
  const items = getCartItems();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const fulfillment = $('input[name="fulfillment"]:checked')?.value || "delivery";
  const delivery = fulfillment === "delivery" && subtotal > 0 && subtotal < SITE_CONFIG.freeDeliveryFrom
    ? SITE_CONFIG.deliveryPrice
    : 0;
  return { items, count, subtotal, delivery, total: subtotal + delivery };
}

function renderCategories() {
  const categories = ["Все", ...new Set(products.map(item => item.category))];
  $("#categories").innerHTML = categories.map(category => `
    <button class="category-button ${category === state.activeCategory ? "active" : ""}" type="button" data-category="${category}">
      ${category}
    </button>
  `).join("");
  $("#selectedCategory").textContent = state.activeCategory;
  $("#categoryMenu").innerHTML = categories.map(category => `
    <button class="category-option ${category === state.activeCategory ? "active" : ""}" type="button"
      role="option" aria-selected="${category === state.activeCategory}" data-category-option="${category}">
      ${category}
    </button>
  `).join("");
}

function renderPopularProducts() {
  const popularIds = [18, 4, 13, 1, 7];
  const popular = popularIds.map(id => products.find(item => item.id === id)).filter(Boolean);
  $("#popularList").innerHTML = popular.map(item => `
    <article class="popular-card">
      <button type="button" data-view-product="${item.id}" aria-label="Открыть ${item.name}">
        <img src="${item.image}" alt="${item.name}" loading="lazy">
      </button>
      <div>
        <small>${item.category}</small>
        <strong>${item.name}</strong>
        <footer>
          <b>${formatPrice(item.price)}</b>
          <button class="add-button" type="button" data-add="${item.id}" aria-label="Добавить ${item.name}">+</button>
        </footer>
      </div>
    </article>
  `).join("");
}

function renderViewMode() {
  const listMode = state.viewMode === "list";
  $("#productGrid").classList.toggle("list-view", listMode);
  $("#viewToggle").setAttribute("aria-pressed", String(listMode));
  $("#viewToggle span").textContent = listMode ? "Сетка" : "Список";
  $("#viewToggle").setAttribute("aria-label", listMode ? "Показать блюда сеткой" : "Показать блюда списком");
}

function updateRestaurantStatus() {
  const parts = new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Asia/Dushanbe",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const hour = Number(parts.find(part => part.type === "hour")?.value || 0);
  const minute = Number(parts.find(part => part.type === "minute")?.value || 0);
  const now = hour * 60 + minute;
  const isOpen = now >= 11 * 60 && now < 23 * 60;
  const status = $("#restaurantStatus");
  status.classList.toggle("open", isOpen);
  status.classList.toggle("closed", !isOpen);
  $("span", status).textContent = isOpen
    ? "Сейчас открыто · принимаем заказы до 23:00"
    : "Сейчас закрыто · откроемся в 11:00";
}

function filteredProducts() {
  const query = normalizeSearch(state.search);
  return products.filter(item => {
    const categoryMatch = query || state.activeCategory === "Все" || item.category === state.activeCategory;
    const searchMatch = !query || normalizeSearch(`${item.name} ${item.category} ${item.description}`).includes(query);
    return categoryMatch && searchMatch;
  });
}

function renderProducts() {
  const visible = filteredProducts();
  $("#resultCount").textContent = `${visible.length} ${visible.length === 1 ? "позиция" : "позиций"}`;
  $("#emptyState").hidden = visible.length > 0;
  $("#productGrid").innerHTML = visible.map(item => {
    const quantity = state.cart[item.id] || 0;
    return `
      <article class="product-card">
        <button class="product-image product-view-trigger" type="button" data-view-product="${item.id}" aria-label="Открыть ${item.name}">
          <img src="${item.image}" alt="${item.name}" loading="lazy">
          <span class="product-tag">${item.tag}</span>
        </button>
        <div class="product-body" data-view-product="${item.id}">
          <span class="product-category">${item.category}</span>
          <h3>${item.name}</h3>
          <p class="product-desc">${item.description}</p>
          <span class="product-size">${item.size}</span>
          <div class="product-footer">
            <span class="product-price">${item.price} <small>сомони</small></span>
            ${quantity ? `
              <div class="card-quantity">
                <button type="button" data-change="${item.id}" data-delta="-1">−</button>
                <span>${quantity}</span>
                <button type="button" data-change="${item.id}" data-delta="1">+</button>
              </div>
            ` : `<button class="add-button" type="button" data-add="${item.id}" aria-label="Добавить ${item.name}">+</button>`}
          </div>
        </div>
      </article>
    `;
  }).join("");
  renderViewMode();
  observeProductCards();
}

function scrollToCatalogStart() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const headerHeight = $(".site-header")?.offsetHeight || 0;
      const toolsHeight = $("#menuTools")?.offsetHeight || 0;
      const gridTop = $("#productGrid").getBoundingClientRect().top + window.scrollY;
      const targetTop = Math.max(0, gridTop - headerHeight - toolsHeight - 18);
      window.scrollTo({ top: targetTop, behavior: "auto" });
    });
  });
}

let revealObserver;
function observeProductCards() {
  revealObserver?.disconnect();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    $$(".product-card").forEach(card => card.classList.add("reveal-visible"));
    return;
  }
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const card = entry.target;
      const index = [...card.parentElement.children].indexOf(card);
      card.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
      card.classList.add("reveal-visible");
      revealObserver.unobserve(card);
    });
  }, { threshold: .08, rootMargin: "0px 0px 80px" });
  $$(".product-card").forEach(card => revealObserver.observe(card));
}

function renderProductViewAction(id) {
  const quantity = state.cart[id] || 0;
  $("#productViewAction").innerHTML = quantity ? `
    <div class="card-quantity">
      <button type="button" data-change="${id}" data-delta="-1">−</button>
      <span>${quantity} в корзине</span>
      <button type="button" data-change="${id}" data-delta="1">+</button>
    </div>
  ` : `<button class="primary-button" type="button" data-add="${id}">Добавить в корзину</button>`;
}

function openProductView(id) {
  const product = products.find(item => item.id === Number(id));
  if (!product) return;
  activeProductId = product.id;
  $("#productViewImage").src = product.image;
  $("#productViewImage").alt = product.name;
  $("#productViewTag").textContent = product.tag;
  $("#productViewCategory").textContent = product.category;
  $("#productViewName").textContent = product.name;
  $("#productViewDescription").textContent = product.description;
  $("#productViewSize").textContent = product.size;
  $("#productViewPrice").textContent = formatPrice(product.price);
  $("#productView").dataset.productId = product.id;
  renderProductViewAction(product.id);
  lastFocusedElement = document.activeElement;
  $("#productView").removeAttribute("inert");
  $("#productView").classList.add("open");
  $("#productView").setAttribute("aria-hidden", "false");
  document.body.classList.add("locked");
  requestAnimationFrame(() => $(".product-back", $("#productView")).focus());
}

function closeProductView() {
  $("#productView").classList.remove("open");
  $("#productView").setAttribute("aria-hidden", "true");
  $("#productView").setAttribute("inert", "");
  document.body.classList.remove("locked");
  activeProductId = null;
  lastFocusedElement?.focus?.();
}

function changeQuantity(id, delta) {
  const next = (state.cart[id] || 0) + delta;
  if (next <= 0) delete state.cart[id];
  else state.cart[id] = next;
  saveCart();
  renderProducts();
  renderCart();
  if ($("#productView").classList.contains("open")) renderProductViewAction(id);
  if (delta > 0) showToast("Добавлено в корзину");
}

function renderCart() {
  const { items, count, subtotal, delivery, total } = cartSummary();
  $("#headerCartCount").textContent = count;
  $("#floatingCartCount").textContent = count;
  $("#floatingCartTotal").textContent = formatPrice(total);
  $(".floating-cart").hidden = count === 0;
  $("#subtotal").textContent = formatPrice(subtotal);
  $("#deliveryCost").textContent = delivery === 0 && subtotal >= SITE_CONFIG.freeDeliveryFrom ? "Бесплатно" : formatPrice(delivery);
  $("#grandTotal").textContent = formatPrice(total);
  $("#modalTotal").textContent = formatPrice(total);
  $("#goCheckout").disabled = count === 0;

  const percentage = Math.min(100, Math.round(subtotal / SITE_CONFIG.freeDeliveryFrom * 100));
  $("#progressBar").style.width = `${percentage}%`;
  $("#deliveryPercent").textContent = `${percentage}%`;
  $("#deliveryMessage").textContent = subtotal >= SITE_CONFIG.freeDeliveryFrom
    ? "Доставка будет бесплатной"
    : `До бесплатной доставки ${SITE_CONFIG.freeDeliveryFrom - subtotal} сомони`;

  $("#cartContent").innerHTML = items.length ? items.map(({ product, quantity }) => `
    <div class="cart-item">
      <img src="${product.image}" alt="${product.name}">
      <div>
        <h4>${product.name}</h4>
        <span class="cart-item-price">${formatPrice(product.price * quantity)}</span>
        <div class="quantity-control">
          <button type="button" data-change="${product.id}" data-delta="-1">−</button>
          <span>${quantity}</span>
          <button type="button" data-change="${product.id}" data-delta="1">+</button>
        </div>
      </div>
      <button class="remove-item" type="button" data-remove="${product.id}" aria-label="Удалить">×</button>
    </div>
  `).join("") : `
    <div class="cart-empty">
      <b>Корзина пуста</b>
      <p>Добавьте блюда из меню, и они появятся здесь.</p>
    </div>
  `;
}

function openCart() {
  lastFocusedElement = document.activeElement;
  $("#cartDrawer").removeAttribute("inert");
  $("#cartDrawer").classList.add("open");
  $("#drawerOverlay").classList.add("open");
  $("#cartDrawer").setAttribute("aria-hidden", "false");
  document.body.classList.add("locked");
  requestAnimationFrame(() => $("[data-close-cart]", $("#cartDrawer")).focus());
}

function closeCart() {
  $("#cartDrawer").classList.remove("open");
  $("#drawerOverlay").classList.remove("open");
  $("#cartDrawer").setAttribute("aria-hidden", "true");
  $("#cartDrawer").setAttribute("inert", "");
  if (!$("#checkoutModal").classList.contains("open")) document.body.classList.remove("locked");
  lastFocusedElement?.focus?.();
}

function openCheckout() {
  if (!cartSummary().count) return;
  closeCart();
  lastFocusedElement = document.activeElement;
  $("#checkoutModal").removeAttribute("inert");
  $("#checkoutModal").classList.add("open");
  $("#checkoutModal").setAttribute("aria-hidden", "false");
  document.body.classList.add("locked");
  requestAnimationFrame(() => $("[data-close-checkout]", $("#checkoutModal")).focus());
}

function closeCheckout() {
  $("#checkoutModal").classList.remove("open");
  $("#checkoutModal").setAttribute("aria-hidden", "true");
  $("#checkoutModal").setAttribute("inert", "");
  document.body.classList.remove("locked");
  lastFocusedElement?.focus?.();
}

function updateFulfillment() {
  const delivery = $('input[name="fulfillment"]:checked').value === "delivery";
  $("#addressField").hidden = !delivery;
  $("#addressField input").required = delivery;
  renderCart();
}

function saveCheckoutForm() {
  const form = $("#checkoutForm");
  const values = Object.fromEntries(new FormData(form).entries());
  localStorage.setItem("sheikh-kebab-checkout", JSON.stringify(values));
}

function restoreCheckoutForm() {
  try {
    const values = JSON.parse(localStorage.getItem("sheikh-kebab-checkout") || "{}");
    Object.entries(values).forEach(([name, value]) => {
      const field = $(`[name="${name}"]`, $("#checkoutForm"));
      if (!field) return;
      if (field.type === "radio") {
        const radio = $(`[name="${name}"][value="${CSS.escape(value)}"]`, $("#checkoutForm"));
        if (radio) radio.checked = true;
      } else {
        field.value = value;
      }
    });
  } catch {
    localStorage.removeItem("sheikh-kebab-checkout");
  }
}

function validateCheckout(form) {
  const phone = form.elements.phone;
  const address = form.elements.address;
  const digits = phone.value.replace(/\D/g, "");
  phone.setCustomValidity(digits.length >= 9 ? "" : "Введите полный номер телефона");
  const delivery = form.elements.fulfillment.value === "delivery";
  address.setCustomValidity(!delivery || address.value.trim().length >= 5 ? "" : "Укажите полный адрес доставки");
  return form.reportValidity();
}

function buildOrderMessage(form) {
  const data = new FormData(form);
  const { items, subtotal, delivery, total } = cartSummary();
  const isDelivery = data.get("fulfillment") === "delivery";
  const lines = [
    "Здравствуйте! Хочу оформить заказ в «Шейх Кебаб»:",
    "",
    ...items.map(({ product, quantity }) => `• ${product.name} — ${quantity} × ${product.price} с. = ${product.price * quantity} с.`),
    "",
    `Сумма блюд: ${subtotal} сомони`,
    `Доставка: ${isDelivery ? (delivery ? `${delivery} сомони` : "бесплатно") : "самовывоз"}`,
    `Итого: ${total} сомони`,
    "",
    `Имя: ${data.get("name")}`,
    `Телефон: ${data.get("phone")}`,
    `Получение: ${isDelivery ? "доставка" : "самовывоз"}`,
    ...(isDelivery ? [`Адрес: ${data.get("address")}`] : []),
    `Время: ${data.get("orderTime")}`,
    `Оплата: ${data.get("payment")}`,
    `Комментарий: ${data.get("comment") || "нет"}`,
  ];
  return lines.join("\n");
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1700);
}

$("#categories").addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  state.activeCategory = button.dataset.category;
  state.search = "";
  $("#searchInput").value = "";
  renderCategories();
  renderProducts();
  scrollToCatalogStart();
});

$("#searchInput").addEventListener("input", event => {
  state.search = event.target.value;
  if (state.search.trim() && state.activeCategory !== "Все") {
    state.activeCategory = "Все";
    renderCategories();
  }
  renderProducts();
});

$("#categoryToggle").addEventListener("click", () => {
  const picker = $("#categoryPicker");
  const open = picker.classList.toggle("open");
  $("#categoryToggle").setAttribute("aria-expanded", String(open));
});

$("#categoryMenu").addEventListener("click", event => {
  const option = event.target.closest("[data-category-option]");
  if (!option) return;
  state.activeCategory = option.dataset.categoryOption;
  state.search = "";
  $("#searchInput").value = "";
  $("#categoryPicker").classList.remove("open");
  $("#categoryToggle").setAttribute("aria-expanded", "false");
  renderCategories();
  renderProducts();
  scrollToCatalogStart();
});

document.addEventListener("click", event => {
  if (!event.target.closest("#categoryPicker")) {
    $("#categoryPicker").classList.remove("open");
    $("#categoryToggle").setAttribute("aria-expanded", "false");
  }
});

$("#clearFilters").addEventListener("click", () => {
  state.activeCategory = "Все";
  state.search = "";
  $("#searchInput").value = "";
  renderCategories();
  renderProducts();
  scrollToCatalogStart();
});

$("#viewToggle").addEventListener("click", () => {
  state.viewMode = state.viewMode === "grid" ? "list" : "grid";
  localStorage.setItem("sheikh-kebab-view", state.viewMode);
  renderViewMode();
});

$$("[data-popular-scroll]").forEach(button => button.addEventListener("click", () => {
  $("#popularList").scrollBy({
    left: Number(button.dataset.popularScroll) * Math.min(620, window.innerWidth * .65),
    behavior: "smooth",
  });
}));

document.addEventListener("click", event => {
  const add = event.target.closest("[data-add]");
  const change = event.target.closest("[data-change]");
  const remove = event.target.closest("[data-remove]");
  const view = event.target.closest("[data-view-product]");
  if (add) changeQuantity(Number(add.dataset.add), 1);
  if (change) changeQuantity(Number(change.dataset.change), Number(change.dataset.delta));
  if (remove) {
    delete state.cart[Number(remove.dataset.remove)];
    saveCart();
    renderProducts();
    renderCart();
  }
  if (view && !add && !change && !remove) openProductView(Number(view.dataset.viewProduct));
});

document.addEventListener("pointermove", event => {
  const card = event.target.closest(".product-card");
  if (!card || event.pointerType === "touch") return;
  const rect = card.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - .5;
  const y = (event.clientY - rect.top) / rect.height - .5;
  card.style.setProperty("--tilt-x", `${-y * 7}deg`);
  card.style.setProperty("--tilt-y", `${x * 9}deg`);
  card.style.setProperty("--image-x", `${-x * 5}px`);
  card.style.setProperty("--image-y", `${-y * 5}px`);
  card.classList.add("is-tilting");
});

document.addEventListener("pointerout", event => {
  const card = event.target.closest(".product-card");
  if (!card || card.contains(event.relatedTarget)) return;
  card.style.removeProperty("--tilt-x");
  card.style.removeProperty("--tilt-y");
  card.style.removeProperty("--image-x");
  card.style.removeProperty("--image-y");
  card.classList.remove("is-tilting");
});

let previousScrollY = window.scrollY;
let scrollAnimationFrame = 0;
window.addEventListener("scroll", () => {
  if (scrollAnimationFrame || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  scrollAnimationFrame = requestAnimationFrame(() => {
    const direction = window.scrollY > previousScrollY ? -4 : 4;
    previousScrollY = window.scrollY;
    $$(".product-card").forEach(card => {
      const rect = card.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) card.style.setProperty("--scroll-y", `${direction}px`);
    });
    clearTimeout(window.scrollLookTimer);
    window.scrollLookTimer = setTimeout(() => {
      $$(".product-card").forEach(card => card.style.setProperty("--scroll-y", "0px"));
    }, 120);
    scrollAnimationFrame = 0;
  });
}, { passive: true });

$$("[data-open-cart]").forEach(button => button.addEventListener("click", openCart));
$$("[data-close-cart]").forEach(button => button.addEventListener("click", closeCart));
$$("[data-close-checkout]").forEach(button => button.addEventListener("click", closeCheckout));
$$("[data-close-product]").forEach(button => button.addEventListener("click", closeProductView));
$("#drawerOverlay").addEventListener("click", closeCart);
$("#goCheckout").addEventListener("click", openCheckout);
$$('input[name="fulfillment"]').forEach(input => input.addEventListener("change", updateFulfillment));
$("#checkoutForm").addEventListener("input", saveCheckoutForm);
$("#checkoutForm").addEventListener("change", saveCheckoutForm);

$("#shareProduct").addEventListener("click", async () => {
  const product = products.find(item => item.id === activeProductId);
  if (!product) return;
  const url = `${window.location.origin}${window.location.pathname}`;
  const shareData = { title: product.name, text: `${product.name} — ${formatPrice(product.price)}`, url };
  try {
    if (navigator.share) await navigator.share(shareData);
    else {
      await navigator.clipboard.writeText(url.toString());
      showToast("Ссылка на блюдо скопирована");
    }
  } catch (error) {
    if (error.name !== "AbortError") showToast("Не удалось поделиться ссылкой");
  }
});

$("#checkoutModal").addEventListener("click", event => {
  if (event.target === $("#checkoutModal")) closeCheckout();
});

$("#checkoutForm").addEventListener("submit", event => {
  event.preventDefault();
  if (!validateCheckout(event.currentTarget)) return;
  saveCheckoutForm();
  const message = buildOrderMessage(event.currentTarget);
  const url = `https://wa.me/${SITE_CONFIG.whatsapp}?text=${encodeURIComponent(message)}`;
  const opened = window.open(url, "_blank", "noopener");
  showToast(opened ? "Заказ подготовлен в WhatsApp" : "Разрешите открытие WhatsApp в браузере");
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    if ($("#checkoutModal").classList.contains("open")) closeCheckout();
    else if ($("#productView").classList.contains("open")) closeProductView();
    else if ($("#cartDrawer").classList.contains("open")) closeCart();
  }
});

restoreCheckoutForm();
renderCategories();
renderPopularProducts();
renderProducts();
renderCart();
updateFulfillment();
updateRestaurantStatus();
setInterval(updateRestaurantStatus, 60000);
