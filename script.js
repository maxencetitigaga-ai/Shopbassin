const LOGO =
  "6561E272-B3F3-4F41-9D0F-8187CF4FC91E.png";

const ADMIN_CODE = "483726";
const ADMIN_LONG_PRESS_TIME = 1500;

const tg = window.Telegram?.WebApp;

if (tg) {
  try {
    tg.ready();
    tg.expand();
  } catch {}
}


const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "Produit ShopBassin",
    price: 25,
    description:
      "Ajoute ici la description de ton produit depuis la partie Gestion.",
    image: ""
  },

  {
    id: 2,
    name: "Produit Premium",
    price: 29.90,
    description:
      "Produit sélectionné par ShopBassin. Modifie cette description dans Gestion.",
    image: ""
  }
];


let products = [];
let cart = [];
let shopOpen = true;
let pickupAvailable = true;
let deliveryAvailable = true;
let orderMode = "pickup";
let adminUnlocked = false;
let adminPressTimer = null;


// LOADER

window.addEventListener("load", function () {

  setTimeout(function () {

    document
      .getElementById("loader")
      ?.classList.add("hide");

    document
      .getElementById("app")
      ?.classList.remove("app-loading");

  }, 2200);

});


document.addEventListener(
  "DOMContentLoaded",
  function () {

    loadProducts();
    loadCart();

    renderProducts();
    renderCart();

    updateCartCount();
    updateOrderMode();

    setupSecretAdmin();

  }
);


// ADMIN APPUI LONG

function setupSecretAdmin() {

  const logo =
    document.getElementById(
      "admin-secret-trigger"
    );

  if (!logo) return;


  logo.addEventListener(
    "touchstart",
    function () {

      clearTimeout(adminPressTimer);

      adminPressTimer =
        setTimeout(
          openAdmin,
          ADMIN_LONG_PRESS_TIME
        );

    }
  );


  logo.addEventListener(
    "touchend",
    cancelAdminPress
  );


  logo.addEventListener(
    "touchmove",
    cancelAdminPress
  );


  logo.addEventListener(
    "mousedown",
    function () {

      clearTimeout(adminPressTimer);

      adminPressTimer =
        setTimeout(
          openAdmin,
          ADMIN_LONG_PRESS_TIME
        );

    }
  );


  logo.addEventListener(
    "mouseup",
    cancelAdminPress
  );

}


function cancelAdminPress() {

  clearTimeout(
    adminPressTimer
  );

}


function openAdmin() {

  if (!adminUnlocked) {

    const code =
      prompt(
        "Code administrateur ShopBassin"
      );

    if (code !== ADMIN_CODE) {

      alert(
        "Code incorrect."
      );

      return;
    }

    adminUnlocked = true;

  }


  renderAdminProducts();

  showPage("gestion");

}


// NAVIGATION

function showPage(pageId, button = null) {

  if (
    pageId === "gestion" &&
    !adminUnlocked
  ) {
    return;
  }


  document
    .querySelectorAll(".page")
    .forEach(
      page =>
        page.classList.remove("active")
    );


  document
    .getElementById(pageId)
    ?.classList.add("active");


  document
    .querySelectorAll(".nav-button")
    .forEach(
      nav =>
        nav.classList.remove("active")
    );


  if (button) {
    button.classList.add("active");
  }


  if (pageId === "panier") {
    renderCart();
  }


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


// PRODUITS

function loadProducts() {

  try {

    products =
      JSON.parse(
        localStorage.getItem(
          "sb-products-v2"
        )
      ) ||
      JSON.parse(
        JSON.stringify(
          DEFAULT_PRODUCTS
        )
      );

  } catch {

    products =
      JSON.parse(
        JSON.stringify(
          DEFAULT_PRODUCTS
        )
      );

  }


  // ajoute description aux anciens produits
  products =
    products.map(
      product => ({
        ...product,
        description:
          product.description ||
          "Aucune description pour le moment."
      })
    );

}


function saveProducts() {

  localStorage.setItem(
    "sb-products-v2",
    JSON.stringify(products)
  );

  renderProducts();
  renderAdminProducts();

}


function renderProducts() {

  const container =
    document.getElementById(
      "products-container"
    );

  if (!container) return;


  const search =
    (
      document
        .getElementById("product-search")
        ?.value || ""
    )
      .toLowerCase()
      .trim();


  const filtered =
    products.filter(
      product =>
        product.name
          .toLowerCase()
          .includes(search)
    );


  const counter =
    document.getElementById(
      "product-count"
    );

  if (counter) {
    counter.textContent =
      products.length;
  }


  container.innerHTML =
    filtered.map(
      product => {

        const image =
          product.image ||
          `./${LOGO}`;


        const placeholder =
          product.image
            ? ""
            : "product-placeholder";


        return `

          <article
            class="product-card"
            onclick="openProduct(${product.id})"
          >

            <div class="product-image">

              <img
                src="${image}"
                class="${placeholder}"
                alt="${escapeHTML(product.name)}"
                onerror="this.src='./${LOGO}'"
              >

            </div>


            <div class="product-info">

              <h3>
                ${escapeHTML(product.name)}
              </h3>

              <div class="product-price">

                ${formatPrice(product.price)}

              </div>

            </div>

          </article>

        `;

      }
    ).join("");

}


// OUVRIR FICHE PRODUIT

function openProduct(id) {

  const product =
    products.find(
      product =>
        product.id === id
    );


  if (!product) return;


  const image =
    product.image ||
    `./${LOGO}`;


  document
    .getElementById(
      "detail-product-image"
    )
    .src = image;


  setText(
    "detail-product-name",
    product.name
  );


  setText(
    "detail-product-price",
    formatPrice(product.price)
  );


  setText(
    "detail-product-description",
    product.description
  );


  const button =
    document.getElementById(
      "detail-add-button"
    );


  button.onclick =
    function () {

      addToCart(
        product.id
      );

      alert(
        "Produit ajouté au panier ✅"
      );

    };


  showPage("produit");

}


// PANIER

function loadCart() {

  try {

    cart =
      JSON.parse(
        localStorage.getItem(
          "sb-cart"
        )
      ) || [];

  } catch {

    cart = [];

  }

}


function saveCart() {

  localStorage.setItem(
    "sb-cart",
    JSON.stringify(cart)
  );

  updateCartCount();

}


function addToCart(id) {

  const product =
    products.find(
      product =>
        product.id === id
    );

  if (!product) return;


  const existing =
    cart.find(
      item =>
        item.id === id
    );


  if (existing) {
    existing.quantity++;
  } else {

    cart.push({
      ...product,
      quantity: 1
    });

  }


  saveCart();

}


function removeFromCart(id) {

  const item =
    cart.find(
      item =>
        item.id === id
    );

  if (!item) return;


  if (item.quantity > 1) {
    item.quantity--;
  } else {

    cart =
      cart.filter(
        item =>
          item.id !== id
      );

  }


  saveCart();
  renderCart();

}


function updateCartCount() {

  const counter =
    document.getElementById(
      "cart-count"
    );

  if (!counter) return;


  counter.textContent =
    cart.reduce(
      (total, item) =>
        total +
        item.quantity,
      0
    );

}


function renderCart() {

  const container =
    document.getElementById(
      "cart-items"
    );

  if (!container) return;


  if (!cart.length) {

    container.innerHTML = `

      <div class="empty-cart">

        <img
          src="./${LOGO}"
          alt=""
        >

        <h3>
          Panier vide
        </h3>

      </div>

    `;

  } else {

    container.innerHTML =
      cart.map(
        item => `

          <div class="cart-item">

            <div class="cart-thumb">

              <img
                src="${item.image || `./${LOGO}`}"
                onerror="this.src='./${LOGO}'"
              >

            </div>

            <div class="cart-info">

              <strong>
                ${escapeHTML(item.name)}
              </strong>

              <p>
                ${item.quantity}
                ×
                ${formatPrice(item.price)}
              </p>

            </div>

            <button
              class="remove-button"
              onclick="removeFromCart(${item.id})"
            >
              −
            </button>

          </div>

        `
      ).join("");

  }


  updateTotals();

}


// MODE COMMANDE

function setOrderMode(mode) {

  orderMode = mode;

  updateOrderMode();

  updateTotals();

}


function updateOrderMode() {

  const pickup =
    document.getElementById(
      "pickup-choice"
    );

  const delivery =
    document.getElementById(
      "delivery-choice"
    );

  const fields =
    document.getElementById(
      "delivery-fields"
    );


  pickup?.classList.remove("active");
  delivery?.classList.remove("active");


  if (orderMode === "pickup") {

    pickup?.classList.add("active");

    if (fields) {
      fields.style.display =
        "none";
    }

  } else {

    delivery?.classList.add("active");

    if (fields) {
      fields.style.display =
        "block";
    }

  }

}


function getSubtotal() {

  return cart.reduce(
    (total, item) =>
      total +
      item.price *
      item.quantity,
    0
  );

}


function getDeliveryPrice() {

  if (
    orderMode === "pickup"
  ) {
    return 0;
  }


  const city =
    document
      .getElementById(
        "delivery-city"
      )
      ?.value;


  return city === "outside"
    ? 10
    : 5;

}


function updateTotals() {

  const subtotal =
    getSubtotal();

  const delivery =
    cart.length
      ? getDeliveryPrice()
      : 0;

  const total =
    subtotal + delivery;


  setText(
    "cart-subtotal",
    formatPrice(subtotal)
  );

  setText(
    "delivery-price",
    formatPrice(delivery)
  );

  setText(
    "cart-total",
    formatPrice(total)
  );

}


// ADMIN PRODUITS

function renderAdminProducts() {

  const container =
    document.getElementById(
      "admin-products"
    );

  if (!container) return;


  container.innerHTML =
    products.map(
      product => `

        <div class="admin-product">

          <label>
            Nom
          </label>

          <input
            id="admin-name-${product.id}"
            value="${escapeAttribute(product.name)}"
          >


          <label>
            Prix
          </label>

          <input
            id="admin-price-${product.id}"
            type="number"
            step="0.01"
            value="${product.price}"
          >


          <label>
            Description
          </label>

          <textarea
            id="admin-description-${product.id}"
            class="admin-textarea"
          >${escapeHTML(product.description)}</textarea>


          <button
            class="primary-button"
            onclick="saveAdminProduct(${product.id})"
          >
            Enregistrer
          </button>


          <button
            class="remove-button"
            onclick="deleteProduct(${product.id})"
          >
            ×
          </button>

        </div>

      `
    ).join("");

}


function saveAdminProduct(id) {

  const product =
    products.find(
      product =>
        product.id === id
    );

  if (!product) return;


  product.name =
    document
      .getElementById(
        `admin-name-${id}`
      )
      ?.value
      .trim();


  product.price =
    Number(
      document
        .getElementById(
          `admin-price-${id}`
        )
        ?.value
    );


  product.description =
    document
      .getElementById(
        `admin-description-${id}`
      )
      ?.value
      .trim();


  saveProducts();

  alert(
    "Produit modifié ✅"
  );

}


// AJOUT PRODUIT

function addAdminProduct() {

  const name =
    document
      .getElementById(
        "new-product-name"
      )
      ?.value
      .trim();


  const price =
    Number(
      document
        .getElementById(
          "new-product-price"
        )
        ?.value
    );


  const description =
    document
      .getElementById(
        "new-product-description"
      )
      ?.value
      .trim();


  const photoInput =
    document.getElementById(
      "new-product-photo"
    );


  if (
    !name ||
    !Number.isFinite(price)
  ) {

    alert(
      "Entre un nom et un prix."
    );

    return;

  }


  const createProduct =
    function (image) {

      products.push({

        id: Date.now(),

        name,

        price,

        description:
          description ||
          "Aucune description.",

        image:
          image || ""

      });


      saveProducts();

      alert(
        "Produit ajouté ✅"
      );

    };


  const file =
    photoInput
      ?.files?.[0];


  if (!file) {

    createProduct("");

    return;

  }


  const reader =
    new FileReader();


  reader.onload =
    function () {

      createProduct(
        reader.result
      );

    };


  reader.readAsDataURL(
    file
  );

}


function deleteProduct(id) {

  if (
    !confirm(
      "Supprimer ce produit ?"
    )
  ) {
    return;
  }


  products =
    products.filter(
      product =>
        product.id !== id
    );


  saveProducts();

}


// COMMANDES / HELPERS

function prepareOrder() {
  alert(
    "Le système de commande reste identique à ta version actuelle."
  );
}


function formatPrice(price) {

  return new Intl
    .NumberFormat(
      "fr-FR",
      {
        style: "currency",
        currency: "EUR"
      }
    )
    .format(price);

}


function setText(id, value) {

  const element =
    document.getElementById(id);

  if (element) {
    element.textContent =
      value || "";
  }

}


function escapeHTML(value) {

  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


function escapeAttribute(value) {

  return escapeHTML(value);

}
