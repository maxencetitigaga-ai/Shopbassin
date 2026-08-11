// ==========================================
// SHOPBASSIN — SCRIPT COMPLET
// ==========================================

const LOGO =
  "6561E272-B3F3-4F41-9D0F-8187CF4FC91E.png";


// ==========================================
// CODE ADMIN
// ==========================================
//
// CHANGE TON CODE À 6 CHIFFRES ICI
//
const ADMIN_CODE = "483726";


// Temps nécessaire pour ouvrir l'admin
// 1500 = 1,5 seconde
const ADMIN_LONG_PRESS_TIME = 1500;


const tg =
  window.Telegram?.WebApp;


// ==========================================
// TELEGRAM
// ==========================================

if (tg) {

  try {

    tg.ready();
    tg.expand();

  } catch (error) {}

}


// ==========================================
// DONNÉES PAR DÉFAUT
// ==========================================

const DEFAULT_PRODUCTS = [

  {
    id: 1,
    name: "Produit ShopBassin",
    price: 25,
    image: ""
  },

  {
    id: 2,
    name: "Produit Premium",
    price: 29.90,
    image: ""
  },

  {
    id: 3,
    name: "Nouveauté",
    price: 34.90,
    image: ""
  },

  {
    id: 4,
    name: "Sélection ShopBassin",
    price: 39.90,
    image: ""
  }

];


const DEFAULT_CONTACTS = {

  snapchat:
    "ton_snapchat",

  instagram:
    "@toninstagram",

  telegram:
    "@shopbassinstore_bot"

};


// ==========================================
// VARIABLES
// ==========================================

let products = [];

let cart = [];

let contacts = {};

let shopOpen = true;

let pickupAvailable = true;

let deliveryAvailable = true;

let orderMode = "pickup";

let adminUnlocked = false;

let adminPressTimer = null;

let adminLongPressTriggered = false;


// ==========================================
// ÉCRAN DE CHARGEMENT
// ==========================================

window.addEventListener(
  "load",
  function () {

    const loader =
      document.getElementById(
        "loader"
      );

    const app =
      document.getElementById(
        "app"
      );


    setTimeout(
      function () {

        if (loader) {
          loader.classList.add(
            "hide"
          );
        }


        if (app) {
          app.classList.remove(
            "app-loading"
          );
        }

      },
      2200
    );

  }
);


// Sécurité : le loader disparaît
// même en cas de petit bug

setTimeout(
  function () {

    const loader =
      document.getElementById(
        "loader"
      );

    const app =
      document.getElementById(
        "app"
      );


    if (loader) {
      loader.classList.add(
        "hide"
      );
    }


    if (app) {
      app.classList.remove(
        "app-loading"
      );
    }

  },
  4500
);


// ==========================================
// DÉMARRAGE
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    loadProducts();

    loadCart();

    loadContacts();

    loadAvailability();

    renderProducts();

    renderCart();

    updateContacts();

    updateAvailabilityUI();

    updateCartCount();

    updateOrderMode();

    setupSecretAdmin();

  }
);


// ==========================================
// ADMIN SECRET
// APPUI LONG SUR LE LOGO
// ==========================================

function setupSecretAdmin() {

  const logo =
    document.getElementById(
      "admin-secret-trigger"
    );


  if (!logo) return;


  // Empêche le menu iPhone
  // d'apparaître lors d'un appui long
  logo.style.webkitTouchCallout =
    "none";

  logo.style.userSelect =
    "none";

  logo.style.webkitUserSelect =
    "none";


  logo.addEventListener(
    "contextmenu",
    function (event) {

      event.preventDefault();

    }
  );


  // ============================
  // IPHONE / TACTILE
  // ============================

  logo.addEventListener(
    "touchstart",
    function (event) {

      adminLongPressTriggered =
        false;


      clearTimeout(
        adminPressTimer
      );


      adminPressTimer =
        setTimeout(
          function () {

            adminLongPressTriggered =
              true;

            openAdmin();

          },
          ADMIN_LONG_PRESS_TIME
        );

    },
    {
      passive: true
    }
  );


  logo.addEventListener(
    "touchend",
    cancelAdminPress
  );


  logo.addEventListener(
    "touchcancel",
    cancelAdminPress
  );


  logo.addEventListener(
    "touchmove",
    cancelAdminPress
  );


  // ============================
  // SOURIS / ORDINATEUR
  // ============================

  logo.addEventListener(
    "mousedown",
    function () {

      adminLongPressTriggered =
        false;


      clearTimeout(
        adminPressTimer
      );


      adminPressTimer =
        setTimeout(
          function () {

            adminLongPressTriggered =
              true;

            openAdmin();

          },
          ADMIN_LONG_PRESS_TIME
        );

    }
  );


  logo.addEventListener(
    "mouseup",
    cancelAdminPress
  );


  logo.addEventListener(
    "mouseleave",
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


    if (
      code !== ADMIN_CODE
    ) {

      alert(
        "Code incorrect."
      );

      return;

    }


    adminUnlocked =
      true;

  }


  fillAdminContacts();

  renderAdminProducts();

  showPage(
    "gestion"
  );

}


// ==========================================
// NAVIGATION
// ==========================================

function showPage(
  pageId,
  button = null
) {

  // La gestion reste protégée
  if (
    pageId === "gestion" &&
    !adminUnlocked
  ) {

    return;

  }


  document
    .querySelectorAll(".page")
    .forEach(
      function (page) {

        page.classList.remove(
          "active"
        );

      }
    );


  const page =
    document.getElementById(
      pageId
    );


  if (page) {

    page.classList.add(
      "active"
    );

  }


  document
    .querySelectorAll(
      ".nav-button"
    )
    .forEach(
      function (nav) {

        nav.classList.remove(
          "active"
        );

      }
    );


  if (button) {

    button.classList.add(
      "active"
    );

  } else {

    const nav =
      document.querySelector(
        '[data-page="' +
        pageId +
        '"]'
      );


    if (nav) {

      nav.classList.add(
        "active"
      );

    }

  }


  if (
    pageId === "panier"
  ) {

    renderCart();

  }


  if (
    pageId === "gestion"
  ) {

    fillAdminContacts();

    renderAdminProducts();

  }


  window.scrollTo({

    top: 0,

    behavior: "smooth"

  });

}


// ==========================================
// PRODUITS
// ==========================================

function loadProducts() {

  try {

    const saved =
      localStorage.getItem(
        "sb-products"
      );


    products =
      saved
        ? JSON.parse(saved)
        : JSON.parse(
            JSON.stringify(
              DEFAULT_PRODUCTS
            )
          );

  } catch (error) {

    products =
      JSON.parse(
        JSON.stringify(
          DEFAULT_PRODUCTS
        )
      );

  }

}


function saveProducts() {

  try {

    localStorage.setItem(
      "sb-products",
      JSON.stringify(
        products
      )
    );

  } catch (error) {

    alert(
      "Impossible d'enregistrer. La photo est peut-être trop lourde."
    );

  }


  renderProducts();

  renderAdminProducts();

}


// ==========================================
// CATALOGUE
// ==========================================

function renderProducts() {

  const container =
    document.getElementById(
      "products-container"
    );


  const counter =
    document.getElementById(
      "product-count"
    );


  if (!container) return;


  const search =
    (
      document
        .getElementById(
          "product-search"
        )
        ?.value || ""
    )
      .toLowerCase()
      .trim();


  const filtered =
    products.filter(
      function (product) {

        return product.name
          .toLowerCase()
          .includes(search);

      }
    );


  if (counter) {

    counter.textContent =
      products.length;

  }


  if (
    filtered.length === 0
  ) {

    container.innerHTML = `

      <div class="empty-cart">

        <img
          src="./${LOGO}"
          alt="ShopBassin"
        >

        <h3>
          Aucun produit
        </h3>

        <p>
          Aucun résultat trouvé.
        </p>

      </div>

    `;

    return;

  }


  container.innerHTML =
    filtered
      .map(
        function (product) {

          const image =
            product.image
              ? product.image
              : LOGO;


          const placeholderClass =
            product.image
              ? ""
              : "product-placeholder";


          return `

            <article class="product-card">

              <div class="product-image">

                <img
                  src="${image}"
                  class="${placeholderClass}"
                  alt="${escapeHTML(product.name)}"
                  onerror="
                    this.src='./${LOGO}';
                    this.classList.add('product-placeholder');
                  "
                >

              </div>


              <div class="product-info">

                <h3>
                  ${escapeHTML(product.name)}
                </h3>


                <div class="product-price">

                  ${formatPrice(product.price)}

                </div>


                <button
                  class="add-button"
                  onclick="addToCart(${product.id})"
                >

                  Ajouter au panier

                </button>

              </div>

            </article>

          `;

        }
      )
      .join("");

}


// ==========================================
// PANIER
// ==========================================

function loadCart() {

  try {

    cart =
      JSON.parse(
        localStorage.getItem(
          "sb-cart"
        )
      ) || [];

  } catch (error) {

    cart = [];

  }

}


function saveCart() {

  localStorage.setItem(
    "sb-cart",
    JSON.stringify(
      cart
    )
  );


  updateCartCount();

}


function addToCart(id) {

  const product =
    products.find(
      function (product) {

        return product.id === id;

      }
    );


  if (!product) return;


  const existing =
    cart.find(
      function (item) {

        return item.id === id;

      }
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


  if (tg?.HapticFeedback) {

    try {

      tg.HapticFeedback
        .impactOccurred(
          "light"
        );

    } catch (error) {}

  }

}


function removeFromCart(id) {

  const item =
    cart.find(
      function (item) {

        return item.id === id;

      }
    );


  if (!item) return;


  if (
    item.quantity > 1
  ) {

    item.quantity--;

  } else {

    cart =
      cart.filter(
        function (item) {

          return item.id !== id;

        }
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
      function (
        total,
        item
      ) {

        return (
          total +
          item.quantity
        );

      },
      0
    );

}


// ==========================================
// AFFICHAGE PANIER
// ==========================================

function renderCart() {

  const container =
    document.getElementById(
      "cart-items"
    );


  if (!container) return;


  if (
    cart.length === 0
  ) {

    container.innerHTML = `

      <div class="empty-cart">

        <img
          src="./${LOGO}"
          alt="ShopBassin"
        >

        <h3>
          Panier vide
        </h3>

        <p>
          Ajoute un produit depuis le catalogue.
        </p>

      </div>

    `;

  } else {

    container.innerHTML =
      cart
        .map(
          function (item) {

            const image =
              item.image ||
              LOGO;


            return `

              <div class="cart-item">

                <div class="cart-thumb">

                  <img
                    src="${image}"
                    alt=""
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

            `;

          }
        )
        .join("");

  }


  updateTotals();

}


// ==========================================
// MODE LIVRAISON / SUR PLACE
// ==========================================

function setOrderMode(
  mode
) {

  orderMode = mode;

  updateOrderMode();

  updateTotals();

}


function updateOrderMode() {

  const pickupButton =
    document.getElementById(
      "pickup-choice"
    );


  const deliveryButton =
    document.getElementById(
      "delivery-choice"
    );


  const deliveryFields =
    document.getElementById(
      "delivery-fields"
    );


  pickupButton
    ?.classList.remove(
      "active"
    );


  deliveryButton
    ?.classList.remove(
      "active"
    );


  if (
    orderMode === "pickup"
  ) {

    pickupButton
      ?.classList.add(
        "active"
      );


    if (deliveryFields) {

      deliveryFields.style.display =
        "none";

    }

  } else {

    deliveryButton
      ?.classList.add(
        "active"
      );


    if (deliveryFields) {

      deliveryFields.style.display =
        "block";

    }

  }

}


// ==========================================
// PRIX
// ==========================================

function getSubtotal() {

  return cart.reduce(
    function (
      total,
      item
    ) {

      return (
        total +
        item.price *
        item.quantity
      );

    },
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


  if (
    city === "outside"
  ) {

    return 10;

  }


  return 5;

}


function updateTotals() {

  const subtotal =
    getSubtotal();


  const delivery =
    cart.length
      ? getDeliveryPrice()
      : 0;


  const total =
    subtotal +
    delivery;


  setText(
    "cart-subtotal",
    formatPrice(
      subtotal
    )
  );


  setText(
    "delivery-price",
    formatPrice(
      delivery
    )
  );


  setText(
    "cart-total",
    formatPrice(
      total
    )
  );

}


// ==========================================
// COMMANDE
// ==========================================

async function prepareOrder() {

  if (!shopOpen) {

    alert(
      "ShopBassin est actuellement fermé."
    );

    return;

  }


  if (
    cart.length === 0
  ) {

    alert(
      "Ton panier est vide."
    );

    return;

  }


  if (
    orderMode === "pickup" &&
    !pickupAvailable
  ) {

    alert(
      "Le retrait sur place est actuellement indisponible."
    );

    return;

  }


  if (
    orderMode === "delivery" &&
    !deliveryAvailable
  ) {

    alert(
      "La livraison est actuellement indisponible."
    );

    return;

  }


  const name =
    document
      .getElementById(
        "customer-name"
      )
      ?.value
      .trim();


  const phone =
    document
      .getElementById(
        "customer-phone"
      )
      ?.value
      .trim();


  if (
    !name ||
    !phone
  ) {

    alert(
      "Entre ton nom et ton numéro de téléphone."
    );

    return;

  }


  let address = "";

  let cityLabel =
    "Arcachon";


  if (
    orderMode === "delivery"
  ) {

    const addressInput =
      document
        .getElementById(
          "delivery-address"
        )
        ?.value
        .trim();


    const extra =
      document
        .getElementById(
          "delivery-extra"
        )
        ?.value
        .trim();


    if (!addressInput) {

      alert(
        "Entre ton adresse de livraison."
      );

      return;

    }


    const city =
      document
        .getElementById(
          "delivery-city"
        )
        ?.value;


    const cities = {

      arcachon:
        "Arcachon",

      "la-teste":
        "La Teste-de-Buch",

      gujan:
        "Gujan-Mestras",

      outside:
        "Plus loin sur le Bassin"

    };


    cityLabel =
      cities[city] ||
      city;


    address =
      addressInput;


    if (extra) {

      address +=
        " — " +
        extra;

    }

  }


  const subtotal =
    getSubtotal();


  const deliveryFee =
    getDeliveryPrice();


  const total =
    subtotal +
    deliveryFee;


  let message =

`🛍 COMMANDE SHOPBASSIN

👤 Client : ${name}
📞 Téléphone : ${phone}

`;


  if (
    orderMode === "pickup"
  ) {

    message +=

`🏠 Récupération :
Sur place à Arcachon

`;

  } else {

    message +=

`🚚 Livraison

📍 Ville : ${cityLabel}
🏡 Adresse : ${address}

`;

  }


  message +=
`🛒 Articles :

`;


  cart.forEach(
    function (item) {

      message +=
`• ${item.name}
  ${item.quantity} × ${formatPrice(item.price)}

`;

    }
  );


  message +=
`Sous-total : ${formatPrice(subtotal)}
Livraison : ${formatPrice(deliveryFee)}
TOTAL : ${formatPrice(total)}

Merci de confirmer ma commande.`;


  try {

    await navigator
      .clipboard
      .writeText(
        message
      );


    alert(
      "Commande prête ✅"
    );


    openOrderTelegram();

  } catch (error) {

    alert(message);

  }

}


// ==========================================
// OUVRIR TELEGRAM
// ==========================================

function openOrderTelegram() {

  let username =
    contacts.telegram ||
    "@shopbassinstore_bot";


  username =
    username.replace(
      "@",
      ""
    );


  const url =
    "https://t.me/" +
    username;


  if (
    tg &&
    typeof tg.openTelegramLink ===
    "function"
  ) {

    tg.openTelegramLink(
      url
    );

  } else {

    window.location.href =
      url;

  }

}


// ==========================================
// DISPONIBILITÉS
// ==========================================

function loadAvailability() {

  shopOpen =
    readBoolean(
      "sb-shop-open",
      true
    );


  pickupAvailable =
    readBoolean(
      "sb-pickup",
      true
    );


  deliveryAvailable =
    readBoolean(
      "sb-delivery",
      true
    );

}


function readBoolean(
  key,
  fallback
) {

  const value =
    localStorage.getItem(
      key
    );


  if (
    value === null
  ) {

    return fallback;

  }


  return (
    value === "true"
  );

}


function setShopOpen(value) {

  shopOpen =
    value;


  localStorage.setItem(
    "sb-shop-open",
    String(value)
  );


  updateAvailabilityUI();

}


function setPickupAvailable(value) {

  pickupAvailable =
    value;


  localStorage.setItem(
    "sb-pickup",
    String(value)
  );


  updateAvailabilityUI();

}


function setDeliveryAvailable(value) {

  deliveryAvailable =
    value;


  localStorage.setItem(
    "sb-delivery",
    String(value)
  );


  updateAvailabilityUI();

}


function updateAvailabilityUI() {

  setAvailability(
    "shop-status",
    shopOpen,
    "OUVERT",
    "FERMÉ"
  );


  setAvailability(
    "pickup-status",
    pickupAvailable,
    "DISPONIBLE",
    "INDISPONIBLE"
  );


  setAvailability(
    "delivery-status",
    deliveryAvailable,
    "DISPONIBLE",
    "INDISPONIBLE"
  );


  const header =
    document.getElementById(
      "header-status"
    );


  if (header) {

    header.textContent =
      shopOpen
        ? "OUVERT"
        : "FERMÉ";


    header.classList.toggle(
      "open",
      shopOpen
    );


    header.classList.toggle(
      "closed",
      !shopOpen
    );

  }

}


function setAvailability(
  id,
  value,
  yes,
  no
) {

  const element =
    document.getElementById(
      id
    );


  if (!element) return;


  element.textContent =
    value
      ? yes
      : no;


  element.classList.toggle(
    "available",
    value
  );


  element.classList.toggle(
    "unavailable",
    !value
  );

}


// ==========================================
// CONTACTS
// ==========================================

function loadContacts() {

  try {

    contacts =
      JSON.parse(
        localStorage.getItem(
          "sb-contacts"
        )
      ) ||
      {
        ...DEFAULT_CONTACTS
      };

  } catch (error) {

    contacts =
      {
        ...DEFAULT_CONTACTS
      };

  }

}


function updateContacts() {

  setText(
    "snapchat-contact",
    contacts.snapchat
  );


  setText(
    "instagram-contact",
    contacts.instagram
  );


  setText(
    "telegram-contact",
    contacts.telegram
  );

}


function fillAdminContacts() {

  setInput(
    "admin-snapchat",
    contacts.snapchat
  );


  setInput(
    "admin-instagram",
    contacts.instagram
  );


  setInput(
    "admin-telegram",
    contacts.telegram
  );

}


function saveContacts() {

  contacts = {

    snapchat:
      getInput(
        "admin-snapchat"
      ),

    instagram:
      getInput(
        "admin-instagram"
      ),

    telegram:
      getInput(
        "admin-telegram"
      )

  };


  localStorage.setItem(
    "sb-contacts",
    JSON.stringify(
      contacts
    )
  );


  updateContacts();


  alert(
    "Contacts enregistrés ✅"
  );

}


// ==========================================
// ADMIN PRODUITS
// ==========================================

function renderAdminProducts() {

  const container =
    document.getElementById(
      "admin-products"
    );


  if (!container) return;


  container.innerHTML =
    products
      .map(
        function (product) {

          return `

            <div class="admin-product">

              <div class="admin-product-head">

                <strong>
                  ${escapeHTML(product.name)}
                </strong>


                <button
                  class="admin-delete"
                  onclick="deleteProduct(${product.id})"
                >
                  ×
                </button>

              </div>


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


              <button
                class="primary-button"
                onclick="saveAdminProduct(${product.id})"
              >
                Enregistrer
              </button>

            </div>

          `;

        }
      )
      .join("");

}


function saveAdminProduct(id) {

  const product =
    products.find(
      function (product) {

        return (
          product.id === id
        );

      }
    );


  if (!product) return;


  const name =
    getInput(
      "admin-name-" +
      id
    );


  const price =
    Number(
      getInput(
        "admin-price-" +
        id
      )
    );


  if (
    !name ||
    !Number.isFinite(price)
  ) {

    alert(
      "Nom ou prix incorrect."
    );

    return;

  }


  product.name =
    name;


  product.price =
    price;


  saveProducts();


  alert(
    "Produit modifié ✅"
  );

}


// ==========================================
// AJOUT PRODUIT + PHOTO
// ==========================================

function addAdminProduct() {

  const name =
    getInput(
      "new-product-name"
    );


  const price =
    Number(
      getInput(
        "new-product-price"
      )
    );


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

        id:
          Date.now(),

        name:
          name,

        price:
          price,

        image:
          image || ""

      });


      saveProducts();


      setInput(
        "new-product-name",
        ""
      );


      setInput(
        "new-product-price",
        ""
      );


      if (photoInput) {

        photoInput.value =
          "";

      }


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
      function (product) {

        return (
          product.id !== id
        );

      }
    );


  cart =
    cart.filter(
      function (item) {

        return (
          item.id !== id
        );

      }
    );


  saveProducts();

  saveCart();

  renderCart();

}


// ==========================================
// OUTILS
// ==========================================

function formatPrice(price) {

  return new Intl
    .NumberFormat(
      "fr-FR",
      {

        style:
          "currency",

        currency:
          "EUR"

      }
    )
    .format(price);

}


function setText(
  id,
  value
) {

  const element =
    document.getElementById(
      id
    );


  if (element) {

    element.textContent =
      value || "";

  }

}


function setInput(
  id,
  value
) {

  const element =
    document.getElementById(
      id
    );


  if (element) {

    element.value =
      value || "";

  }

}


function getInput(id) {

  return (
    document
      .getElementById(
        id
      )
      ?.value || ""
  ).trim();

}


function escapeHTML(value) {

  return String(
    value || ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}


function escapeAttribute(value) {

  return escapeHTML(
    value
  );

}
