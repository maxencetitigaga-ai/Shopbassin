// ======================================================
// SHOPBASSIN + SUPABASE
// ======================================================

const LOGO =
  "6561E272-B3F3-4F41-9D0F-8187CF4FC91E.png";


// ======================================================
// SUPABASE
// ======================================================

const SUPABASE_URL =
  "https://szfzibyixkiewkosjbro.supabase.co";


// COLLE TA PUBLISHABLE KEY ENTRE LES GUILLEMETS
const SUPABASE_KEY =
  "sb_publishable_URF7d3K0eXTiCActPBMGTw_f5k7bvzB";


const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


// ======================================================
// TELEGRAM
// ======================================================

const tg =
  window.Telegram?.WebApp;


if (tg) {

  try {

    tg.ready();
    tg.expand();

  } catch (error) {}

}


// ======================================================
// VARIABLES
// ======================================================

let products = [];

let cart = [];

let contacts = {
  snap: "",
  insta: "",
  telegram: ""
};


let shopOpen = true;

let pickupAvailable = true;

let deliveryAvailable = true;


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


// ======================================================
// LOADER
// ======================================================

window.addEventListener(
  "load",
  function () {

    setTimeout(
      function () {

        document
          .getElementById("loader")
          ?.classList.add("hide");


        document
          .getElementById("app")
          ?.classList.remove("app-hidden");

      },
      1800
    );

  }
);


// sécurité anti-loader bloqué

setTimeout(
  function () {

    document
      .getElementById("loader")
      ?.classList.add("hide");


    document
      .getElementById("app")
      ?.classList.remove("app-hidden");

  },
  4500
);


// ======================================================
// DÉMARRAGE
// ======================================================

document.addEventListener(
  "DOMContentLoaded",
  async function () {

    loadCart();

    await loadProducts();

    await loadShopSettings();


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


// ======================================================
// NAVIGATION
// ======================================================

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
    .querySelectorAll(".page")
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
    .querySelectorAll(".nav-item")
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


// ======================================================
// ADMIN — APPUI LONG SUR LE LOGO
// ======================================================

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

  logo.style.webkitUserSelect =
    "none";


  logo.addEventListener(
    "contextmenu",
    function (event) {

      event.preventDefault();

    }
  );


  const start =
    function () {

      clearTimeout(
        adminTimer
      );


      adminTimer =
        setTimeout(
          openAdminLogin,
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


// ======================================================
// CONNEXION ADMIN SUPABASE
// ======================================================

async function openAdminLogin() {

  // vérifie d'abord si une session existe déjà

  const {
    data: sessionData
  } =
    await supabaseClient
      .auth
      .getSession();


  if (
    sessionData?.session
  ) {

    adminUnlocked =
      true;


    fillAdminContacts();

    renderAdminProducts();

    showPage(
      "gestion"
    );

    return;

  }


  const email =
    prompt(
      "Email administrateur ShopBassin"
    );


  if (!email) {

    return;

  }


  const password =
    prompt(
      "Mot de passe administrateur"
    );


  if (!password) {

    return;

  }


  const {
    data,
    error
  } =
    await supabaseClient
      .auth
      .signInWithPassword({
        email:
          email.trim(),

        password:
          password
      });


  if (error) {

    console.error(
      error
    );


    alert(
      "Connexion refusée. Vérifie ton email et ton mot de passe."
    );

    return;

  }


  if (
    !data?.user
  ) {

    alert(
      "Connexion impossible."
    );

    return;

  }


  adminUnlocked =
    true;


  fillAdminContacts();

  renderAdminProducts();

  showPage(
    "gestion"
  );

}


// ======================================================
// DÉCONNEXION ADMIN
// ======================================================

async function logoutAdmin() {

  await supabaseClient
    .auth
    .signOut();


  adminUnlocked =
    false;


  showPage(
    "catalogue"
  );


  alert(
    "Déconnecté de la gestion."
  );

}


// ======================================================
// CHARGER PRODUITS DEPUIS SUPABASE
// ======================================================

async function loadProducts() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("products")
      .select("*")
      .eq("active", true)
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(
      "Erreur produits :",
      error
    );


    alert(
      "Impossible de charger les produits."
    );

    products = [];

    return;

  }


  products =
    (data || [])
      .map(
        function (product) {

          return normalizeProduct(
            product
          );

        }
      );

}


// ======================================================
// NORMALISATION PRODUIT
// ======================================================

function normalizeProduct(
  product
) {

  return {

    id:
      Number(
        product.id
      ),

    name:
      product.name ||
      "",

    price:
      Number(
        product.price ||
        0
      ),

    description:
      product.description ||
      "",

    images:
      Array.isArray(
        product.images
      )
        ? product.images
        : [],

    sizes: {

      S:
        Boolean(
          product.size_s
        ),

      M:
        Boolean(
          product.size_m
        ),

      L:
        Boolean(
          product.size_l
        ),

      UNIQUE:
        Boolean(
          product.size_unique
        )

    },

    active:
      product.active !== false

  };

}


// ======================================================
// CATALOGUE
// ======================================================

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
      .trim()
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


  if (
    filtered.length === 0
  ) {

    container.innerHTML = `

      <div class="empty-cart">

        <img
          src="${LOGO}"
          alt="ShopBassin"
        >

        <h3>
          Aucun produit
        </h3>

        <p>
          Les produits seront bientôt disponibles.
        </p>

      </div>

    `;

    return;

  }


  container.innerHTML =
    filtered
      .map(
        function (product) {

          const images =
            getProductImages(
              product
            );


          const image =
            images[0];


          const placeholder =
            product.images.length
              ? ""
              : "placeholder";


          const badge =
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
                  src="${escapeAttribute(image)}"
                  class="${placeholder}"
                  alt="${escapeAttribute(product.name)}"
                  loading="lazy"
                  onerror="this.src='${LOGO}'"
                >

                ${badge}

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


// ======================================================
// FICHE PRODUIT
// ======================================================

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


  if (button) {

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

  }


  showPage(
    "produit"
  );

}


// ======================================================
// IMAGES PRODUIT
// ======================================================

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


// ======================================================
// GALERIE
// ======================================================

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
  ) {

    return;

  }


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
                src="${escapeAttribute(image)}"
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
    currentGalleryIndex < 0
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


  const visible =
    images.length > 1
      ? "grid"
      : "none";


  if (prev) {
    prev.style.display =
      visible;
  }


  if (next) {
    next.style.display =
      visible;
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


// ======================================================
// SWIPE PHOTOS
// ======================================================

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

      const end =
        event.changedTouches[0]
          .clientX;


      const difference =
        end -
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


// ======================================================
// TAILLES
// ======================================================

function renderProductSizes(
  product
) {

  const container =
    document.getElementById(
      "detail-sizes"
    );


  if (!container) return;


  const sizes =
    product.sizes;


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


  const options =
    [
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


// ======================================================
// PANIER LOCAL
// ======================================================

function loadCart() {

  try {

    cart =
      JSON.parse(
        localStorage.getItem(
          "shopbassin-cart"
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
    "shopbassin-cart",

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
              item.images?.[0] ||
              LOGO;


            const encodedSize =
              encodeURIComponent(
                item.size
              );


            return `

              <div class="cart-item">

                <div class="cart-thumb">

                  <img
                    src="${escapeAttribute(image)}"
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


// ======================================================
// MODE LIVRAISON
// ======================================================

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


// ======================================================
// PRIX
// ======================================================

function getSubtotal() {

  return cart.reduce(
    function (
      total,
      item
    ) {

      return (
        total +
        Number(item.price) *
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


// ======================================================
// COMMANDE
// ======================================================

async function prepareOrder() {

  if (
    !shopOpen
  ) {

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


    const cities = {

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
      cities[city] ||
      city;


    address =
      valueOf(
        "delivery-address"
      );


    const extra =
      valueOf(
        "delivery-extra"
      );


    if (!address) {

      alert(
        "Entre ton adresse."
      );

      return;

    }


    if (extra) {

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

👤 Client : ${name}
📞 Téléphone : ${phone}

`;


  if (
    orderMode === "pickup"
  ) {

    message +=

`🏠 RETRAIT SUR PLACE
📍 Arcachon

`;

  } else {

    message +=

`🚚 LIVRAISON
📍 Ville : ${cityName}
🏡 Adresse : ${address}

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


// ======================================================
// TELEGRAM
// ======================================================

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


// ======================================================
// CHARGER RÉGLAGES SUPABASE
// ======================================================

async function loadShopSettings() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from(
        "shop_settings"
      )
      .select("*")
      .eq(
        "id",
        1
      )
      .single();


  if (error) {

    console.error(
      "Erreur réglages :",
      error
    );

    return;

  }


  shopOpen =
    Boolean(
      data.shop_open
    );


  pickupAvailable =
    Boolean(
      data.pickup_available
    );


  deliveryAvailable =
    Boolean(
      data.delivery_available
    );


  contacts = {

    snap:
      data.snapchat ||
      "",

    insta:
      data.instagram ||
      "",

    telegram:
      data.telegram ||
      ""

  };

}


// ======================================================
// MODIFIER RÉGLAGES ADMIN
// ======================================================

async function updateShopSettings(
  changes,
  successMessage
) {

  if (!adminUnlocked) {

    alert(
      "Connexion administrateur nécessaire."
    );

    return;

  }


  const {
    error
  } =
    await supabaseClient
      .from(
        "shop_settings"
      )
      .update({
        ...changes,
        updated_at:
          new Date()
            .toISOString()
      })
      .eq(
        "id",
        1
      );


  if (error) {

    console.error(
      error
    );


    alert(
      "Modification refusée."
    );

    return;

  }


  await loadShopSettings();

  updateAvailability();

  updateContacts();


  if (successMessage) {

    alert(
      successMessage
    );

  }

}


async function setShopOpen(
  value
) {

  await updateShopSettings(
    {
      shop_open:
        value
    },

    value
      ? "Boutique ouverte ✅"
      : "Boutique fermée."
  );

}


async function setPickupAvailable(
  value
) {

  await updateShopSettings(
    {
      pickup_available:
        value
    },

    value
      ? "Retrait disponible ✅"
      : "Retrait indisponible."
  );

}


async function setDeliveryAvailable(
  value
) {

  await updateShopSettings(
    {
      delivery_available:
        value
    },

    value
      ? "Livraison disponible ✅"
      : "Livraison indisponible."
  );

}


// ======================================================
// AFFICHAGE DISPONIBILITÉS
// ======================================================

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


// ======================================================
// CONTACTS
// ======================================================

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


async function saveContacts() {

  await updateShopSettings(
    {

      snapchat:
        valueOf(
          "admin-snap"
        ),

      instagram:
        valueOf(
          "admin-insta"
        ),

      telegram:
        valueOf(
          "admin-telegram"
        )

    },

    "Contacts enregistrés ✅"
  );

}


// ======================================================
// ADMIN — PRODUITS
// ======================================================

function renderAdminProducts() {

  const container =
    document.getElementById(
      "admin-products"
    );


  if (!container) return;


  if (
    products.length === 0
  ) {

    container.innerHTML =
      "<p>Aucun produit.</p>";

    return;

  }


  container.innerHTML =
    products
      .map(
        function (product) {

          const previews =
            product.images
              .map(
                function (image) {

                  return `

                    <img
                      src="${escapeAttribute(image)}"
                      alt=""
                    >

                  `;

                }
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
                Remplacer toutes les photos
              </label>

              <input
                id="photos-${product.id}"
                type="file"
                accept="image/*"
                multiple
              >


              <p class="admin-help">
                Laisse vide pour conserver les photos actuelles.
              </p>


              <div class="admin-size-box">

                <h4>
                  Tailles disponibles
                </h4>


                <div class="admin-size-grid">


                  ${adminSizeCheckbox(
                    product.id,
                    "s",
                    "S",
                    product.sizes.S
                  )}


                  ${adminSizeCheckbox(
                    product.id,
                    "m",
                    "M",
                    product.sizes.M
                  )}


                  ${adminSizeCheckbox(
                    product.id,
                    "l",
                    "L",
                    product.sizes.L
                  )}


                  ${adminSizeCheckbox(
                    product.id,
                    "u",
                    "Unique",
                    product.sizes.UNIQUE
                  )}


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


function adminSizeCheckbox(
  id,
  key,
  label,
  checkedState
) {

  return `

    <label class="admin-size-option">

      <span>
        ${label}
      </span>

      <input
        id="size-${key}-${id}"
        type="checkbox"
        ${checkedState ? "checked" : ""}
      >

    </label>

  `;

}


// ======================================================
// UPLOAD PHOTOS SUPABASE
// ======================================================

async function uploadProductImages(
  files
) {

  const urls =
    [];


  for (
    const file
    of Array.from(files)
  ) {

    // taille max choisie : 8 Mo
    if (
      file.size >
      8 * 1024 * 1024
    ) {

      throw new Error(
        `La photo ${file.name} dépasse 8 Mo.`
      );

    }


    const extension =
      (
        file.name
          .split(".")
          .pop() ||
        "jpg"
      )
        .toLowerCase();


    const safeExtension =
      extension.replace(
        /[^a-z0-9]/g,
        ""
      ) ||
      "jpg";


    const filePath =
      `products/${Date.now()}-${crypto.randomUUID()}.${safeExtension}`;


    const {
      error
    } =
      await supabaseClient
        .storage
        .from(
          "product-images"
        )
        .upload(
          filePath,
          file,
          {
            cacheControl:
              "3600",

            upsert:
              false,

            contentType:
              file.type ||
              undefined
          }
        );


    if (error) {

      console.error(
        "Upload :",
        error
      );


      throw error;

    }


    const {
      data
    } =
      supabaseClient
        .storage
        .from(
          "product-images"
        )
        .getPublicUrl(
          filePath
        );


    urls.push(
      data.publicUrl
    );

  }


  return urls;

}


// ======================================================
// AJOUTER PRODUIT
// ======================================================

async function addProduct() {

  if (!adminUnlocked) {

    alert(
      "Connexion administrateur nécessaire."
    );

    return;

  }


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
    !Number.isFinite(price) ||
    price < 0
  ) {

    alert(
      "Entre un nom et un prix valide."
    );

    return;

  }


  const sizes =
    readNewProductSizes();


  if (
    !hasAnySize(
      sizes
    )
  ) {

    alert(
      "Choisis au moins une taille."
    );

    return;

  }


  const photoInput =
    document.getElementById(
      "new-photos"
    );


  let imageUrls =
    [];


  try {

    if (
      photoInput?.files?.length
    ) {

      imageUrls =
        await uploadProductImages(
          photoInput.files
        );

    }

  } catch (error) {

    console.error(
      error
    );


    alert(
      "Erreur pendant l'envoi des photos : " +
      (
        error.message ||
        "upload impossible"
      )
    );

    return;

  }


  const {
    error
  } =
    await supabaseClient
      .from(
        "products"
      )
      .insert({

        name:
          name,

        price:
          price,

        description:
          description,

        images:
          imageUrls,

        size_s:
          sizes.S,

        size_m:
          sizes.M,

        size_l:
          sizes.L,

        size_unique:
          sizes.UNIQUE,

        active:
          true

      });


  if (error) {

    console.error(
      error
    );


    alert(
      "Impossible d'ajouter le produit."
    );

    return;

  }


  clearNewProductForm();


  await loadProducts();


  renderProducts();

  renderAdminProducts();


  alert(
    "Produit ajouté ✅"
  );

}


// ======================================================
// TAILLES NOUVEAU PRODUIT
// ======================================================

function readNewProductSizes() {

  const unique =
    checked(
      "new-size-unique"
    );


  return {

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

}


function hasAnySize(
  sizes
) {

  return Boolean(
    sizes.S ||
    sizes.M ||
    sizes.L ||
    sizes.UNIQUE
  );

}


// ======================================================
// MODIFIER PRODUIT
// ======================================================

async function saveProduct(
  id
) {

  if (!adminUnlocked) {

    return;

  }


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
    !Number.isFinite(price) ||
    price < 0
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
    !hasAnySize(
      sizes
    )
  ) {

    alert(
      "Choisis au moins une taille."
    );

    return;

  }


  let images =
    product.images;


  const photoInput =
    document.getElementById(
      `photos-${id}`
    );


  try {

    if (
      photoInput?.files?.length
    ) {

      images =
        await uploadProductImages(
          photoInput.files
        );

    }

  } catch (error) {

    alert(
      "Erreur photo : " +
      (
        error.message ||
        "upload impossible"
      )
    );

    return;

  }


  const {
    error
  } =
    await supabaseClient
      .from(
        "products"
      )
      .update({

        name:
          name,

        price:
          price,

        description:
          description,

        images:
          images,

        size_s:
          sizes.S,

        size_m:
          sizes.M,

        size_l:
          sizes.L,

        size_unique:
          sizes.UNIQUE,

        updated_at:
          new Date()
            .toISOString()

      })
      .eq(
        "id",
        id
      );


  if (error) {

    console.error(
      error
    );


    alert(
      "Impossible d'enregistrer le produit."
    );

    return;

  }


  await loadProducts();


  renderProducts();

  renderAdminProducts();


  alert(
    "Produit enregistré ✅"
  );

}


// ======================================================
// SUPPRIMER PRODUIT
// ======================================================

async function deleteProduct(
  id
) {

  if (
    !confirm(
      "Supprimer ce produit ?"
    )
  ) {

    return;

  }


  const {
    error
  } =
    await supabaseClient
      .from(
        "products"
      )
      .delete()
      .eq(
        "id",
        id
      );


  if (error) {

    console.error(
      error
    );


    alert(
      "Suppression impossible."
    );

    return;

  }


  cart =
    cart.filter(
      function (item) {

        return (
          item.id !== id
        );

      }
    );


  saveCart();


  await loadProducts();


  renderProducts();

  renderAdminProducts();

  renderCart();


  alert(
    "Produit supprimé."
  );

}


// ======================================================
// CLEAR FORM
// ======================================================

function clearNewProductForm() {

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


  const photos =
    document.getElementById(
      "new-photos"
    );


  if (photos) {

    photos.value =
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


  const unique =
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


  if (unique) {
    unique.checked =
      false;
  }

}


// ======================================================
// OUTILS
// ======================================================

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
      Number(price) ||
      0
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
