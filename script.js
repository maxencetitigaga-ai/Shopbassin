const LOGO =
  "6561E272-B3F3-4F41-9D0F-8187CF4FC91E.png";

const ADMIN_CODE =
  "483726";

const tg =
  window.Telegram?.WebApp;


if (tg) {

  try {

    tg.ready();
    tg.expand();

  } catch {}

}


// ==========================================
// PRODUITS PAR DÉFAUT
// ==========================================

const DEFAULT_PRODUCTS = [

  {
    id: 1,

    name:
      "Produit ShopBassin",

    price:
      25,

    description:
      "Description du produit. Tu peux la modifier dans Gestion.",

    image:
      "",

    sizes: {
      S: true,
      M: true,
      L: true,
      UNIQUE: false
    }
  },


  {
    id: 2,

    name:
      "Produit Premium",

    price:
      29.90,

    description:
      "Ajoute ici toutes les informations importantes du produit.",

    image:
      "",

    sizes: {
      S: false,
      M: false,
      L: false,
      UNIQUE: true
    }
  }

];


const DEFAULT_CONTACTS = {

  snap:
    "ton_snap",

  insta:
    "@instagram",

  telegram:
    "@shopbassinstore_bot"

};


// ==========================================
// VARIABLES
// ==========================================

let products = [];

let cart = [];

let contacts = {};


let shopOpen =
  true;

let pickupAvailable =
  true;

let deliveryAvailable =
  true;


let orderMode =
  "pickup";


let adminUnlocked =
  false;

let adminTimer =
  null;


let currentProductId =
  null;

let selectedSize =
  null;


// ==========================================
// LOADER
// ==========================================

window.addEventListener(
  "load",
  function () {

    setTimeout(
      function () {

        document
          .getElementById(
            "loader"
          )
          ?.classList.add(
            "hide"
          );


        document
          .getElementById(
            "app"
          )
          ?.classList.remove(
            "app-hidden"
          );

      },
      2200
    );

  }
);


// ==========================================
// START
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

    updateAvailability();

    updateCartCount();

    updateOrderMode();


    setupAdmin();

  }
);


// ==========================================
// NAVIGATION
// ==========================================

function showPage(
  id,
  button = null
) {

  if (
    id === "gestion" &&
    !adminUnlocked
  ) {
    return;
  }


  document
    .querySelectorAll(
      ".page"
    )
    .forEach(
      function (page) {

        page.classList.remove(
          "active"
        );

      }
    );


  document
    .getElementById(id)
    ?.classList.add(
      "active"
    );


  document
    .querySelectorAll(
      ".nav-item"
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

  }


  if (
    id === "panier"
  ) {

    renderCart();

  }


  if (
    id === "gestion"
  ) {

    fillAdminContacts();

    renderAdminProducts();

  }


  window.scrollTo({

    top:
      0,

    behavior:
      "smooth"

  });

}


// ==========================================
// ADMIN APPUI LONG
// ==========================================

function setupAdmin() {

  const logo =
    document.getElementById(
      "admin-trigger"
    );


  if (!logo) return;


  logo.style.webkitTouchCallout =
    "none";

  logo.style.userSelect =
    "none";


  const start =
    function () {

      clearTimeout(
        adminTimer
      );


      adminTimer =
        setTimeout(
          openAdmin,
          1500
        );

    };


  const stop =
    function () {

      clearTimeout(
        adminTimer
      );

    };


  logo.addEventListener(
    "touchstart",
    start,
    {
      passive:
        true
    }
  );


  logo.addEventListener(
    "touchend",
    stop
  );


  logo.addEventListener(
    "touchmove",
    stop
  );


  logo.addEventListener(
    "touchcancel",
    stop
  );


  logo.addEventListener(
    "mousedown",
    start
  );


  logo.addEventListener(
    "mouseup",
    stop
  );


  logo.addEventListener(
    "mouseleave",
    stop
  );

}


function openAdmin() {

  if (
    !adminUnlocked
  ) {

    const code =
      prompt(
        "Code administrateur"
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


  showPage(
    "gestion"
  );

}


// ==========================================
// PRODUITS
// ==========================================

function loadProducts() {

  try {

    const saved =
      localStorage.getItem(
        "shopbassin-products-sizes"
      );


    products =
      saved
        ? JSON.parse(
            saved
          )
        : JSON.parse(
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


  products =
    products.map(
      function (product) {

        return {

          ...product,

          description:
            product.description ||
            "Aucune description.",


          sizes:
            normalizeSizes(
              product.sizes
            )

        };

      }
    );

}


function normalizeSizes(
  sizes
) {

  if (!sizes) {

    return {

      S:
        true,

      M:
        true,

      L:
        true,

      UNIQUE:
        false

    };

  }


  return {

    S:
      Boolean(
        sizes.S
      ),

    M:
      Boolean(
        sizes.M
      ),

    L:
      Boolean(
        sizes.L
      ),

    UNIQUE:
      Boolean(
        sizes.UNIQUE ||
        sizes.unique
      )

  };

}


function saveProducts() {

  try {

    localStorage.setItem(
      "shopbassin-products-sizes",

      JSON.stringify(
        products
      )
    );

  } catch {

    alert(
      "Impossible d'enregistrer. Essaie avec une photo moins lourde."
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
      "products"
    );


  if (!container) return;


  const search =
    (
      document
        .getElementById(
          "search-input"
        )
        ?.value ||
      ""
    )
      .toLowerCase();


  const filtered =
    products.filter(
      function (product) {

        return product.name
          .toLowerCase()
          .includes(
            search
          );

      }
    );


  setText(
    "product-count",
    products.length
  );


  container.innerHTML =
    filtered
      .map(
        function (product) {

          const image =
            product.image ||
            LOGO;


          const placeholder =
            product.image
              ? ""
              : "placeholder";


          return `

            <article
              class="product-card"
              onclick="openProduct(${product.id})"
            >

              <div class="product-image">

                <img
                  src="${image}"
                  class="${placeholder}"
                  alt=""
                  onerror="this.src='${LOGO}'"
                >

              </div>


              <div class="product-body">

                <h3>
                  ${escapeHTML(product.name)}
                </h3>


                <strong>
                  ${formatPrice(product.price)}
                </strong>

              </div>

            </article>

          `;

        }
      )
      .join("");

}


// ==========================================
// FICHE PRODUIT
// ==========================================

function openProduct(id) {

  const product =
    products.find(
      function (product) {

        return (
          product.id === id
        );

      }
    );


  if (!product) return;


  currentProductId =
    id;


  selectedSize =
    null;


  const image =
    product.image ||
    LOGO;


  document
    .getElementById(
      "detail-image"
    )
    .src =
      image;


  setText(
    "detail-name",
    product.name
  );


  setText(
    "detail-price",
    formatPrice(
      product.price
    )
  );


  setText(
    "detail-description",
    product.description
  );


  setText(
    "selected-size-label",
    "Choisis une taille"
  );


  renderProductSizes(
    product
  );


  const button =
    document.getElementById(
      "detail-add"
    );


  button.onclick =
    function () {

      if (
        !selectedSize
      ) {

        alert(
          "Choisis une taille avant d'ajouter le produit."
        );

        return;
      }


      addToCart(
        product.id,
        selectedSize
      );


      alert(
        "Ajouté au panier ✅"
      );

    };


  showPage(
    "produit"
  );

}


// ==========================================
// AFFICHAGE TAILLES
// ==========================================

function renderProductSizes(
  product
) {

  const container =
    document.getElementById(
      "detail-sizes"
    );


  if (!container) return;


  const sizes =
    normalizeSizes(
      product.sizes
    );


  if (
    sizes.UNIQUE
  ) {

    container.innerHTML = `

      <button
        class="size-button unique available"
        onclick="selectSize('Taille unique', this)"
      >
        Taille unique
      </button>

    `;


    return;

  }


  const options = [

    {
      key:
        "S",

      label:
        "S"
    },

    {
      key:
        "M",

      label:
        "M"
    },

    {
      key:
        "L",

      label:
        "L"
    }

  ];


  container.innerHTML =
    options
      .map(
        function (item) {

          const available =
            sizes[
              item.key
            ];


          if (
            available
          ) {

            return `

              <button
                class="size-button available"
                onclick="selectSize('${item.label}', this)"
              >
                ${item.label}
              </button>

            `;

          }


          return `

            <button
              class="size-button unavailable"
              disabled
            >
              ${item.label}
            </button>

          `;

        }
      )
      .join("");

}


function selectSize(
  size,
  button
) {

  selectedSize =
    size;


  document
    .querySelectorAll(
      ".size-button"
    )
    .forEach(
      function (element) {

        element.classList.remove(
          "selected"
        );

      }
    );


  button.classList.add(
    "selected"
  );


  setText(
    "selected-size-label",
    size
  );

}


// ==========================================
// PANIER
// ==========================================

function loadCart() {

  try {

    cart =
      JSON.parse(
        localStorage.getItem(
          "shopbassin-cart-sizes"
        )
      ) ||
      [];

  } catch {

    cart =
      [];

  }

}


function saveCart() {

  localStorage.setItem(
    "shopbassin-cart-sizes",

    JSON.stringify(
      cart
    )
  );


  updateCartCount();

}


function addToCart(
  id,
  size
) {

  const product =
    products.find(
      function (product) {

        return (
          product.id === id
        );

      }
    );


  if (!product) return;


  const existing =
    cart.find(
      function (item) {

        return (

          item.id === id &&

          item.size === size

        );

      }
    );


  if (existing) {

    existing.quantity++;

  } else {

    cart.push({

      id:
        product.id,

      name:
        product.name,

      price:
        product.price,

      image:
        product.image,

      size:
        size,

      quantity:
        1

    });

  }


  saveCart();

}


function removeFromCart(
  id,
  sizeEncoded
) {

  const size =
    decodeURIComponent(
      sizeEncoded
    );


  const item =
    cart.find(
      function (item) {

        return (

          item.id === id &&

          item.size === size

        );

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

          return !(
            item.id === id &&
            item.size === size
          );

        }
      );

  }


  saveCart();

  renderCart();

}


function updateCartCount() {

  const count =
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


  setText(
    "cart-count",
    count
  );

}


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
          src="${LOGO}"
          alt=""
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

            const encodedSize =
              encodeURIComponent(
                item.size
              );


            return `

              <div class="cart-item">

                <div class="cart-thumb">

                  <img
                    src="${item.image || LOGO}"
                    alt=""
                    onerror="this.src='${LOGO}'"
                  >

                </div>


                <div class="cart-product">

                  <strong>
                    ${escapeHTML(item.name)}
                  </strong>


                  <p class="cart-size">

                    Taille :
                    ${escapeHTML(item.size)}

                  </p>


                  <p>

                    ${item.quantity}
                    ×
                    ${formatPrice(item.price)}

                  </p>

                </div>


                <button
                  class="remove"
                  onclick="removeFromCart(${item.id}, '${encodedSize}')"
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
// MODE COMMANDE
// ==========================================

function setOrderMode(
  mode
) {

  orderMode =
    mode;


  updateOrderMode();

  updateTotals();

}


function updateOrderMode() {

  const pickup =
    document.getElementById(
      "pickup-mode"
    );


  const delivery =
    document.getElementById(
      "delivery-mode"
    );


  const fields =
    document.getElementById(
      "delivery-fields"
    );


  pickup
    ?.classList.remove(
      "active"
    );


  delivery
    ?.classList.remove(
      "active"
    );


  if (
    orderMode === "pickup"
  ) {

    pickup
      ?.classList.add(
        "active"
      );


    if (fields) {

      fields.style.display =
        "none";

    }

  } else {

    delivery
      ?.classList.add(
        "active"
      );


    if (fields) {

      fields.style.display =
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
    "subtotal",
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
    "total",
    formatPrice(
      total
    )
  );

}


// ==========================================
// COMMANDE
// ==========================================

async function prepareOrder() {

  if (
    !shopOpen
  ) {

    alert(
      "ShopBassin est fermé."
    );

    return;

  }


  if (
    !cart.length
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
      "Le retrait sur place est indisponible."
    );

    return;

  }


  if (
    orderMode === "delivery" &&
    !deliveryAvailable
  ) {

    alert(
      "La livraison est indisponible."
    );

    return;

  }


  const name =
    valueOf(
      "customer-name"
    );


  const phone =
    valueOf(
      "customer-phone"
    );


  if (
    !name ||
    !phone
  ) {

    alert(
      "Entre ton nom et ton téléphone."
    );

    return;

  }


  let cityName =
    "";

  let address =
    "";


  if (
    orderMode === "delivery"
  ) {

    const city =
      document
        .getElementById(
          "delivery-city"
        )
        ?.value;


    const cityNames = {

      arcachon:
        "Arcachon",

      lateste:
        "La Teste-de-Buch",

      gujan:
        "Gujan-Mestras",

      outside:
        "Plus loin"

    };


    cityName =
      cityNames[
        city
      ] ||
      city;


    address =
      valueOf(
        "delivery-address"
      );


    const extra =
      valueOf(
        "delivery-extra"
      );


    if (
      !address
    ) {

      alert(
        "Entre ton adresse."
      );

      return;

    }


    if (
      extra
    ) {

      address +=
        " — " +
        extra;

    }

  }


  const subtotal =
    getSubtotal();


  const delivery =
    getDeliveryPrice();


  const total =
    subtotal +
    delivery;


  let message =

`🛍 COMMANDE SHOPBASSIN

👤 ${name}
📞 ${phone}

`;


  if (
    orderMode === "pickup"
  ) {

    message +=

`🏠 SUR PLACE À ARCACHON

`;

  } else {

    message +=

`🚚 LIVRAISON
📍 ${cityName}
🏡 ${address}

`;

  }


  message +=

`🛒 PRODUITS

`;


  cart.forEach(
    function (item) {

      message +=

`• ${item.name}
  Taille : ${item.size}
  ${item.quantity} × ${formatPrice(item.price)}

`;

    }
  );


  message +=

`Sous-total : ${formatPrice(subtotal)}
Livraison : ${formatPrice(delivery)}
TOTAL : ${formatPrice(total)}`;


  try {

    await navigator
      .clipboard
      .writeText(
        message
      );


    alert(
      "Commande copiée ✅ Telegram va s'ouvrir."
    );


    openTelegram();

  } catch {

    alert(
      message
    );

  }

}


// ==========================================
// TELEGRAM
// ==========================================

function openTelegram() {

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
    getBool(
      "sb-open",
      true
    );


  pickupAvailable =
    getBool(
      "sb-pickup",
      true
    );


  deliveryAvailable =
    getBool(
      "sb-delivery",
      true
    );

}


function getBool(
  key,
  defaultValue
) {

  const value =
    localStorage.getItem(
      key
    );


  return (
    value === null
      ? defaultValue
      : value === "true"
  );

}


function setShopOpen(
  value
) {

  shopOpen =
    value;


  localStorage.setItem(
    "sb-open",
    value
  );


  updateAvailability();

}


function setPickupAvailable(
  value
) {

  pickupAvailable =
    value;


  localStorage.setItem(
    "sb-pickup",
    value
  );


  updateAvailability();

}


function setDeliveryAvailable(
  value
) {

  deliveryAvailable =
    value;


  localStorage.setItem(
    "sb-delivery",
    value
  );


  updateAvailability();

}


function updateAvailability() {

  updateBadge(
    "shop-status",
    shopOpen,
    "OUVERT",
    "FERMÉ"
  );


  updateBadge(
    "pickup-status",
    pickupAvailable,
    "DISPONIBLE",
    "INDISPONIBLE"
  );


  updateBadge(
    "delivery-status",
    deliveryAvailable,
    "DISPONIBLE",
    "INDISPONIBLE"
  );


  const header =
    document.getElementById(
      "header-status"
    );


  if (
    header
  ) {

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


function updateBadge(
  id,
  state,
  yes,
  no
) {

  const element =
    document.getElementById(
      id
    );


  if (
    !element
  ) return;


  element.textContent =
    state
      ? yes
      : no;


  element.classList.toggle(
    "available",
    state
  );


  element.classList.toggle(
    "unavailable",
    !state
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

  } catch {

    contacts =
      {
        ...DEFAULT_CONTACTS
      };

  }

}


function updateContacts() {

  setText(
    "contact-snap",
    contacts.snap
  );


  setText(
    "contact-insta",
    contacts.insta
  );


  setText(
    "contact-telegram",
    contacts.telegram
  );

}


function fillAdminContacts() {

  setValue(
    "admin-snap",
    contacts.snap
  );


  setValue(
    "admin-insta",
    contacts.insta
  );


  setValue(
    "admin-telegram",
    contacts.telegram
  );

}


function saveContacts() {

  contacts = {

    snap:
      valueOf(
        "admin-snap"
      ),

    insta:
      valueOf(
        "admin-insta"
      ),

    telegram:
      valueOf(
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


  if (
    !container
  ) return;


  container.innerHTML =
    products
      .map(
        function (product) {

          const sizes =
            normalizeSizes(
              product.sizes
            );


          return `

            <div class="admin-product">

              <div class="admin-product-header">

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
                id="name-${product.id}"
                value="${escapeAttribute(product.name)}"
              >


              <label>
                Prix
              </label>

              <input
                id="price-${product.id}"
                type="number"
                step="0.01"
                value="${product.price}"
              >


              <label>
                Description
              </label>

              <textarea
                id="description-${product.id}"
                rows="4"
              >${escapeHTML(product.description)}</textarea>


              <div class="admin-size-box">

                <h4>
                  Tailles disponibles
                </h4>


                <div class="admin-size-grid">


                  <label class="admin-size-option">

                    <span>
                      S
                    </span>

                    <input
                      id="size-s-${product.id}"
                      type="checkbox"
                      ${sizes.S ? "checked" : ""}
                    >

                  </label>


                  <label class="admin-size-option">

                    <span>
                      M
                    </span>

                    <input
                      id="size-m-${product.id}"
                      type="checkbox"
                      ${sizes.M ? "checked" : ""}
                    >

                  </label>


                  <label class="admin-size-option">

                    <span>
                      L
                    </span>

                    <input
                      id="size-l-${product.id}"
                      type="checkbox"
                      ${sizes.L ? "checked" : ""}
                    >

                  </label>


                  <label class="admin-size-option">

                    <span>
                      Unique
                    </span>

                    <input
                      id="size-u-${product.id}"
                      type="checkbox"
                      ${sizes.UNIQUE ? "checked" : ""}
                    >

                  </label>


                </div>

              </div>


              <button
                class="primary"
                onclick="saveProduct(${product.id})"
              >
                Enregistrer
              </button>

            </div>

          `;

        }
      )
      .join("");

}


// ==========================================
// ENREGISTRER PRODUIT
// ==========================================

function saveProduct(
  id
) {

  const product =
    products.find(
      function (product) {

        return (
          product.id === id
        );

      }
    );


  if (
    !product
  ) return;


  const name =
    valueOf(
      `name-${id}`
    );


  const price =
    Number(
      valueOf(
        `price-${id}`
      )
    );


  const description =
    valueOf(
      `description-${id}`
    );


  if (
    !name ||
    !Number.isFinite(
      price
    )
  ) {

    alert(
      "Nom ou prix incorrect."
    );

    return;

  }


  const unique =
    checked(
      `size-u-${id}`
    );


  const sizes = {

    S:
      unique
        ? false
        : checked(
            `size-s-${id}`
          ),

    M:
      unique
        ? false
        : checked(
            `size-m-${id}`
          ),

    L:
      unique
        ? false
        : checked(
            `size-l-${id}`
          ),

    UNIQUE:
      unique

  };


  if (
    !sizes.S &&
    !sizes.M &&
    !sizes.L &&
    !sizes.UNIQUE
  ) {

    alert(
      "Choisis au moins une taille disponible."
    );

    return;

  }


  product.name =
    name;


  product.price =
    price;


  product.description =
    description ||
    "Aucune description.";


  product.sizes =
    sizes;


  saveProducts();


  alert(
    "Produit enregistré ✅"
  );

}


// ==========================================
// AJOUTER PRODUIT
// ==========================================

function addProduct() {

  const name =
    valueOf(
      "new-name"
    );


  const price =
    Number(
      valueOf(
        "new-price"
      )
    );


  const description =
    valueOf(
      "new-description"
    );


  const photoInput =
    document.getElementById(
      "new-photo"
    );


  if (
    !name ||
    !Number.isFinite(
      price
    )
  ) {

    alert(
      "Entre un nom et un prix."
    );

    return;

  }


  const unique =
    checked(
      "new-size-unique"
    );


  const sizes = {

    S:
      unique
        ? false
        : checked(
            "new-size-s"
          ),

    M:
      unique
        ? false
        : checked(
            "new-size-m"
          ),

    L:
      unique
        ? false
        : checked(
            "new-size-l"
          ),

    UNIQUE:
      unique

  };


  if (
    !sizes.S &&
    !sizes.M &&
    !sizes.L &&
    !sizes.UNIQUE
  ) {

    alert(
      "Choisis au moins une taille disponible."
    );

    return;

  }


  const finish =
    function (
      image
    ) {

      products.push({

        id:
          Date.now(),

        name:
          name,

        price:
          price,

        description:
          description ||
          "Aucune description.",

        image:
          image ||
          "",

        sizes:
          sizes

      });


      saveProducts();


      setValue(
        "new-name",
        ""
      );


      setValue(
        "new-price",
        ""
      );


      setValue(
        "new-description",
        ""
      );


      if (
        photoInput
      ) {

        photoInput.value =
          "";

      }


      const s =
        document.getElementById(
          "new-size-s"
        );

      const m =
        document.getElementById(
          "new-size-m"
        );

      const l =
        document.getElementById(
          "new-size-l"
        );

      const u =
        document.getElementById(
          "new-size-unique"
        );


      if (s) {
        s.checked =
          true;
      }


      if (m) {
        m.checked =
          true;
      }


      if (l) {
        l.checked =
          true;
      }


      if (u) {
        u.checked =
          false;
      }


      alert(
        "Produit ajouté ✅"
      );

    };


  const file =
    photoInput
      ?.files
      ?.[0];


  if (
    !file
  ) {

    finish(
      ""
    );

    return;

  }


  const reader =
    new FileReader();


  reader.onload =
    function () {

      finish(
        reader.result
      );

    };


  reader.readAsDataURL(
    file
  );

}


// ==========================================
// SUPPRIMER PRODUIT
// ==========================================

function deleteProduct(
  id
) {

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
// HELPERS
// ==========================================

function formatPrice(
  price
) {

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
    .format(
      price
    );

}


function valueOf(
  id
) {

  return (
    document
      .getElementById(
        id
      )
      ?.value ||
    ""
  )
    .trim();

}


function checked(
  id
) {

  return Boolean(
    document
      .getElementById(
        id
      )
      ?.checked
  );

}


function setValue(
  id,
  value
) {

  const element =
    document.getElementById(
      id
    );


  if (
    element
  ) {

    element.value =
      value ||
      "";

  }

}


function setText(
  id,
  value
) {

  const element =
    document.getElementById(
      id
    );


  if (
    element
  ) {

    element.textContent =
      value ??
      "";

  }

}


function escapeHTML(
  value
) {

  return String(
    value ||
    ""
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


function escapeAttribute(
  value
) {

  return escapeHTML(
    value
  );

}
