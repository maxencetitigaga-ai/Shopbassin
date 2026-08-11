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
// DONNÉES PAR DÉFAUT
// ==========================================

const DEFAULT_PRODUCTS = [

  {
    id: 1,

    name:
      "Produit ShopBassin",

    price:
      25,

    description:
      "Description du produit. Modifie-la dans Gestion.",

    images:
      [],

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

    images:
      [],

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


let currentGalleryIndex =
  0;

let galleryTouchStartX =
  0;


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

    updateAvailability();

    updateCartCount();

    updateOrderMode();


    setupAdmin();

    setupGallerySwipe();

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
    .getElementById(
      id
    )
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

    top: 0,

    behavior: "smooth"

  });

}


// ==========================================
// ADMIN APPUI LONG LOGO
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
      passive: true
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
        "shopbassin-products-gallery"
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


  // Compatibilité avec tes anciens produits

  products =
    products.map(
      function (product) {

        let images =
          Array.isArray(
            product.images
          )
            ? product.images
            : [];


        if (
          images.length === 0 &&
          product.image
        ) {

          images = [
            product.image
          ];

        }


        return {

          ...product,

          description:
            product.description ||
            "Aucune description.",

          images:
            images,

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

      S: true,

      M: true,

      L: true,

      UNIQUE: false

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
      "shopbassin-products-gallery",

      JSON.stringify(
        products
      )
    );

  } catch {

    alert(
      "Impossible d'enregistrer. Les photos sont peut-être trop lourdes."
    );

    return;

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

          const images =
            getProductImages(
              product
            );


          const firstImage =
            images[0];


          const placeholder =
            product.images &&
            product.images.length
              ? ""
              : "placeholder";


          const photoBadge =
            images.length > 1
              ? `

                <div class="multi-photo-badge">
                  📷 ${images.length}
                </div>

              `
              : "";


          return `

            <article
              class="product-card"
              onclick="openProduct(${product.id})"
            >

              <div class="product-image">

                <img
                  src="${firstImage}"
                  class="${placeholder}"
                  alt=""
                  onerror="this.src='${LOGO}'"
                >

                ${photoBadge}

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
// OUVRIR PRODUIT
// ==========================================

function openProduct(
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


  if (!product) return;


  currentProductId =
    id;


  selectedSize =
    null;


  currentGalleryIndex =
    0;


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


  renderGallery(
    product
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
// GALERIE
// ==========================================

function getProductImages(
  product
) {

  if (
    Array.isArray(
      product.images
    ) &&
    product.images.length
  ) {

    return product.images;

  }


  return [
    LOGO
  ];

}


function renderGallery(
  product
) {

  const images =
    getProductImages(
      product
    );


  const slides =
    document.getElementById(
      "detail-slides"
    );


  const dots =
    document.getElementById(
      "gallery-dots"
    );


  if (
    !slides ||
    !dots
  ) return;


  slides.innerHTML =
    images
      .map(
        function (
          image,
          index
        ) {

          const placeholder =
            image === LOGO
              ? "gallery-placeholder"
              : "";


          return `

            <div class="detail-slide">

              <img
                src="${image}"
                class="${placeholder}"
                alt="Photo ${index + 1}"
                onerror="this.src='${LOGO}'"
              >

            </div>

          `;

        }
      )
      .join("");


  dots.innerHTML =
    images
      .map(
        function (
          image,
          index
        ) {

          return `

            <button
              class="gallery-dot ${index === 0 ? "active" : ""}"
              onclick="goToProductImage(${index})"
            ></button>

          `;

        }
      )
      .join("");


  updateGallery();

}


function updateGallery() {

  const product =
    products.find(
      function (product) {

        return (
          product.id ===
          currentProductId
        );

      }
    );


  if (!product) return;


  const images =
    getProductImages(
      product
    );


  if (
    currentGalleryIndex <
    0
  ) {

    currentGalleryIndex =
      images.length - 1;

  }


  if (
    currentGalleryIndex >=
    images.length
  ) {

    currentGalleryIndex =
      0;

  }


  const slides =
    document.getElementById(
      "detail-slides"
    );


  if (slides) {

    slides.style.transform =
      `translateX(-${currentGalleryIndex * 100}%)`;

  }


  document
    .querySelectorAll(
      ".gallery-dot"
    )
    .forEach(
      function (
        dot,
        index
      ) {

        dot.classList.toggle(
          "active",
          index ===
          currentGalleryIndex
        );

      }
    );


  setText(
    "gallery-counter",
    `${currentGalleryIndex + 1} / ${images.length}`
  );


  const prev =
    document.getElementById(
      "gallery-prev"
    );


  const next =
    document.getElementById(
      "gallery-next"
    );


  if (
    images.length <= 1
  ) {

    if (prev) {
      prev.style.display =
        "none";
    }


    if (next) {
      next.style.display =
        "none";
    }

  } else {

    if (prev) {
      prev.style.display =
        "grid";
    }


    if (next) {
      next.style.display =
        "grid";
    }

  }

}


function previousProductImage() {

  currentGalleryIndex--;

  updateGallery();

}


function nextProductImage() {

  currentGalleryIndex++;

  updateGallery();

}


function goToProductImage(
  index
) {

  currentGalleryIndex =
    index;

  updateGallery();

}


// ==========================================
// SWIPE GALERIE
// ==========================================

function setupGallerySwipe() {

  const gallery =
    document.getElementById(
      "detail-gallery"
    );


  if (!gallery) return;


  gallery.addEventListener(
    "touchstart",
    function (event) {

      galleryTouchStartX =
        event.touches[0]
          .clientX;

    },
    {
      passive: true
    }
  );


  gallery.addEventListener(
    "touchend",
    function (event) {

      const endX =
        event.changedTouches[0]
          .clientX;


      const difference =
        endX -
        galleryTouchStartX;


      if (
        Math.abs(
          difference
        ) < 45
      ) {

        return;

      }


      if (
        difference < 0
      ) {

        nextProductImage();

      } else {

        previousProductImage();

      }

    },
    {
      passive: true
    }
  );

}


// ==========================================
// TAILLES
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
    "S",
    "M",
    "L"
  ];


  container.innerHTML =
    options
      .map(
        function (size) {

          if (
            sizes[size]
          ) {

            return `

              <button
                class="size-button available"
                onclick="selectSize('${size}', this)"
              >
                ${size}
              </button>

            `;

          }


          return `

            <button
              class="size-button unavailable"
              disabled
            >
              ${size}
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
          "shopbassin-cart-gallery"
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
    "shopbassin-cart-gallery",

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

      images:
        product.images,

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

            const image =
              item.images &&
              item.images.length
                ? item.images[0]
                : LOGO;


            const encodedSize =
              encodeURIComponent(
                item.size
              );


            return `

              <div class="cart-item">

                <div class="cart-thumb">

                  <img
                    src="${image}"
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


  if (!element) return;


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


  if (!container) return;


  container.innerHTML =
    products
      .map(
        function (product) {

          const sizes =
            normalizeSizes(
              product.sizes
            );


          const images =
            getProductImages(
              product
            );


          const previews =
            images
              .filter(
                image =>
                  image !== LOGO
              )
              .map(
                image => `

                  <img
                    src="${image}"
                    alt=""
                  >

                `
              )
              .join("");


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


              ${
                previews
                  ? `

                    <div class="admin-gallery-preview">
                      ${previews}
                    </div>

                  `
                  : ""
              }


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


              <label>
                Remplacer les photos
              </label>

              <input
                id="photos-${product.id}"
                type="file"
                accept="image/*"
                multiple
              >


              <p class="admin-help">
                Laisse vide si tu veux garder les photos actuelles.
              </p>


              <div class="admin-size-box">

                <h4>
                  Tailles disponibles
                </h4>


                <div class="admin-size-grid">


                  <label class="admin-size-option">

                    <span>S</span>

                    <input
                      id="size-s-${product.id}"
                      type="checkbox"
                      ${sizes.S ? "checked" : ""}
                    >

                  </label>


                  <label class="admin-size-option">

                    <span>M</span>

                    <input
                      id="size-m-${product.id}"
                      type="checkbox"
                      ${sizes.M ? "checked" : ""}
                    >

                  </label>


                  <label class="admin-size-option">

                    <span>L</span>

                    <input
                      id="size-l-${product.id}"
                      type="checkbox"
                      ${sizes.L ? "checked" : ""}
                    >

                  </label>


                  <label class="admin-size-option">

                    <span>Unique</span>

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

async function saveProduct(
  id
) {

  const product =
    products.find(
      product =>
        product.id === id
    );


  if (!product) return;


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


  const fileInput =
    document.getElementById(
      `photos-${id}`
    );


  const files =
    fileInput?.files;


  if (
    files &&
    files.length
  ) {

    product.images =
      await filesToDataURLs(
        files
      );

  }


  saveProducts();


  alert(
    "Produit enregistré ✅"
  );

}


// ==========================================
// AJOUTER PRODUIT
// ==========================================

async function addProduct() {

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


  const photoInput =
    document.getElementById(
      "new-photos"
    );


  let images =
    [];


  if (
    photoInput?.files?.length
  ) {

    images =
      await filesToDataURLs(
        photoInput.files
      );

  }


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

    images:
      images,

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


  alert(
    "Produit ajouté ✅"
  );

}


// ==========================================
// LIRE PLUSIEURS PHOTOS
// ==========================================

function filesToDataURLs(
  files
) {

  return Promise.all(

    Array
      .from(files)
      .map(
        function (file) {

          return new Promise(
            function (
              resolve,
              reject
            ) {

              const reader =
                new FileReader();


              reader.onload =
                function () {

                  resolve(
                    reader.result
                  );

                };


              reader.onerror =
                reject;


              reader.readAsDataURL(
                file
              );

            }
          );

        }
      )

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
      product =>
        product.id !== id
    );


  cart =
    cart.filter(
      item =>
        item.id !== id
    );


  saveProducts();

  saveCart();

  renderCart();

}


// ==========================================
// OUTILS
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
  ).trim();

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


  if (element) {

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


  if (element) {

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
