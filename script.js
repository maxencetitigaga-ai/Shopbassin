// ==========================================
// SHOPBASSIN — SCRIPT COMPLET
// ==========================================

const LOGO =
  "6561E272-B3F3-4F41-9D0F-8187CF4FC91E.png";


// ==========================================
// CODE ADMIN TEMPORAIRE
// ==========================================
//
// Change 2580 par le code que tu veux.
//
// ATTENTION :
// ceci protège seulement de manière simple.
// Pour une vraie sécurité, on utilisera Supabase.
//
const ADMIN_CODE = "2580";

let adminUnlocked = false;


// ==========================================
// TELEGRAM
// ==========================================

const tg = window.Telegram?.WebApp;

if (tg) {
  try {
    tg.ready();
    tg.expand();
  } catch (error) {
    console.log("Telegram WebApp indisponible");
  }
}


// ==========================================
// PRODUITS PAR DÉFAUT
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
    name: "Nouveauté ShopBassin",
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


// ==========================================
// CONTACTS PAR DÉFAUT
// ==========================================

const DEFAULT_CONTACTS = {
  snapchat: "ton_snapchat",
  instagram: "@toninstagram",
  telegram: "@shopbassinstore_bot"
};


// ==========================================
// VARIABLES
// ==========================================

let products = [];

let cart = [];

let contacts = {};

let shopOpen = true;


// ==========================================
// ÉCRAN DE CHARGEMENT
// ==========================================

window.addEventListener("load", function () {

  const loader =
    document.getElementById("loader");

  const app =
    document.getElementById("app");


  setTimeout(function () {

    if (loader) {
      loader.classList.add("hide");
    }

    if (app) {
      app.classList.remove("app-loading");
    }

  }, 2000);

});


// Sécurité : même si quelque chose bloque
setTimeout(function () {

  const loader =
    document.getElementById("loader");

  const app =
    document.getElementById("app");

  if (loader) {
    loader.classList.add("hide");
  }

  if (app) {
    app.classList.remove("app-loading");
  }

}, 4000);


// ==========================================
// DÉMARRAGE
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    loadProducts();

    loadCart();

    loadContacts();

    loadShopStatus();

    renderProducts();

    renderCart();

    renderAdminProducts();

    updateCartCount();

    updateContactsDisplay();

    updateShopStatusDisplay();

    fillAdminContacts();

  }
);


// ==========================================
// NAVIGATION
// ==========================================

function showPage(pageId, button = null) {

  // Protection simple de Gestion
  if (pageId === "gestion" && !adminUnlocked) {

    const enteredCode =
      prompt("Code administrateur ShopBassin :");

    if (enteredCode !== ADMIN_CODE) {

      alert("Code incorrect.");

      return;
    }

    adminUnlocked = true;
  }


  document
    .querySelectorAll(".page")
    .forEach(function (page) {

      page.classList.remove("active");

    });


  const selectedPage =
    document.getElementById(pageId);


  if (selectedPage) {
    selectedPage.classList.add("active");
  }


  document
    .querySelectorAll(".nav-button")
    .forEach(function (nav) {

      nav.classList.remove("active");

    });


  if (button) {

    button.classList.add("active");

  } else {

    const matchingButton =
      document.querySelector(
        '[data-page="' + pageId + '"]'
      );

    if (matchingButton) {
      matchingButton.classList.add("active");
    }

  }


  if (pageId === "panier") {

    renderCart();

  }


  if (pageId === "gestion") {

    renderAdminProducts();

    fillAdminContacts();

  }


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });


  if (tg?.HapticFeedback) {

    try {
      tg.HapticFeedback.selectionChanged();
    } catch (error) {}

  }

}


// ==========================================
// PRODUITS — CHARGER
// ==========================================

function loadProducts() {

  try {

    const saved =
      localStorage.getItem(
        "shopbassin-products"
      );


    if (saved) {

      products =
        JSON.parse(saved);

    } else {

      products =
        JSON.parse(
          JSON.stringify(
            DEFAULT_PRODUCTS
          )
        );

    }

  } catch (error) {

    products =
      JSON.parse(
        JSON.stringify(
          DEFAULT_PRODUCTS
        )
      );

  }

}


// ==========================================
// PRODUITS — SAUVEGARDER
// ==========================================

function saveProducts() {

  try {

    localStorage.setItem(
      "shopbassin-products",
      JSON.stringify(products)
    );

  } catch (error) {}


  renderProducts();

  renderAdminProducts();

}


// ==========================================
// AFFICHER LE CATALOGUE
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


  if (counter) {
    counter.textContent =
      products.length;
  }


  if (!container) return;


  if (products.length === 0) {

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
          Les produits seront bientôt disponibles.
        </p>

      </div>

    `;

    return;
  }


  container.innerHTML =
    products
      .map(function (product) {

        let imageHTML;


        if (product.image) {

          imageHTML = `

            <img
              src="./${escapeHTML(product.image)}"
              alt="${escapeHTML(product.name)}"
              onerror="
                this.src='./${LOGO}';
                this.classList.add('product-placeholder');
              "
            >

          `;

        } else {

          imageHTML = `

            <img
              src="./${LOGO}"
              class="product-placeholder"
              alt="ShopBassin"
            >

          `;

        }


        return `

          <article class="product-card">

            <div class="product-image">

              ${imageHTML}

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

      })
      .join("");

}


// ==========================================
// ADMIN — LISTE DES PRODUITS
// ==========================================

function renderAdminProducts() {

  const container =
    document.getElementById(
      "admin-products"
    );


  if (!container) return;


  if (products.length === 0) {

    container.innerHTML =
      "<p>Aucun produit.</p>";

    return;
  }


  container.innerHTML =
    products.map(function (product) {

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
            id="product-name-${product.id}"
            type="text"
            value="${escapeAttribute(product.name)}"
          >


          <label>
            Prix
          </label>

          <input
            id="product-price-${product.id}"
            type="number"
            step="0.01"
            value="${product.price}"
          >


          <label>
            Photo
          </label>

          <input
            id="product-image-${product.id}"
            type="text"
            value="${escapeAttribute(product.image || "")}"
            placeholder="photo.jpg"
          >


          <button
            class="main-button"
            onclick="updateAdminProduct(${product.id})"
          >
            Enregistrer
          </button>

        </div>

      `;

    }).join("");

}


// ==========================================
// ADMIN — MODIFIER UN PRODUIT
// ==========================================

function updateAdminProduct(id) {

  const product =
    products.find(function (item) {

      return item.id === id;

    });


  if (!product) return;


  const nameInput =
    document.getElementById(
      "product-name-" + id
    );


  const priceInput =
    document.getElementById(
      "product-price-" + id
    );


  const imageInput =
    document.getElementById(
      "product-image-" + id
    );


  const name =
    nameInput
      ? nameInput.value.trim()
      : product.name;


  const price =
    priceInput
      ? Number(priceInput.value)
      : product.price;


  const image =
    imageInput
      ? imageInput.value.trim()
      : product.image;


  if (!name) {

    alert(
      "Entre un nom de produit."
    );

    return;
  }


  if (
    !Number.isFinite(price) ||
    price < 0
  ) {

    alert(
      "Entre un prix valide."
    );

    return;
  }


  product.name = name;

  product.price = price;

  product.image = image;


  saveProducts();


  alert(
    "Produit modifié ✅"
  );

}


// ==========================================
// ADMIN — AJOUTER UN PRODUIT
// ==========================================

function addAdminProduct() {

  const nameInput =
    document.getElementById(
      "new-product-name"
    );


  const priceInput =
    document.getElementById(
      "new-product-price"
    );


  const imageInput =
    document.getElementById(
      "new-product-image"
    );


  const name =
    nameInput
      ? nameInput.value.trim()
      : "";


  const price =
    priceInput
      ? Number(priceInput.value)
      : NaN;


  const image =
    imageInput
      ? imageInput.value.trim()
      : "";


  if (!name) {

    alert(
      "Entre le nom du produit."
    );

    return;
  }


  if (
    !Number.isFinite(price) ||
    price < 0
  ) {

    alert(
      "Entre un prix valide."
    );

    return;
  }


  const newProduct = {

    id:
      Date.now(),

    name:
      name,

    price:
      price,

    image:
      image

  };


  products.push(
    newProduct
  );


  saveProducts();


  if (nameInput) {
    nameInput.value = "";
  }

  if (priceInput) {
    priceInput.value = "";
  }

  if (imageInput) {
    imageInput.value = "";
  }


  alert(
    "Produit ajouté ✅"
  );

}


// ==========================================
// ADMIN — SUPPRIMER UN PRODUIT
// ==========================================

function deleteProduct(id) {

  const product =
    products.find(function (item) {

      return item.id === id;

    });


  if (!product) return;


  const confirmation =
    confirm(
      "Supprimer " +
      product.name +
      " ?"
    );


  if (!confirmation) return;


  products =
    products.filter(
      function (item) {

        return item.id !== id;

      }
    );


  cart =
    cart.filter(
      function (item) {

        return item.id !== id;

      }
    );


  saveProducts();

  saveCart();

  renderCart();

}


// ==========================================
// PANIER — CHARGER
// ==========================================

function loadCart() {

  try {

    const saved =
      localStorage.getItem(
        "shopbassin-cart"
      );


    if (saved) {

      cart =
        JSON.parse(saved);

    } else {

      cart = [];

    }

  } catch (error) {

    cart = [];

  }

}


// ==========================================
// PANIER — SAUVEGARDER
// ==========================================

function saveCart() {

  try {

    localStorage.setItem(
      "shopbassin-cart",
      JSON.stringify(cart)
    );

  } catch (error) {}


  updateCartCount();

}


// ==========================================
// AJOUTER AU PANIER
// ==========================================

function addToCart(id) {

  const product =
    products.find(function (item) {

      return item.id === id;

    });


  if (!product) return;


  const existing =
    cart.find(function (item) {

      return item.id === id;

    });


  if (existing) {

    existing.quantity++;

    existing.name =
      product.name;

    existing.price =
      product.price;

    existing.image =
      product.image;

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

      quantity:
        1

    });

  }


  saveCart();


  if (tg?.HapticFeedback) {

    try {

      tg.HapticFeedback
        .impactOccurred("light");

    } catch (error) {}

  }

}


// ==========================================
// RETIRER DU PANIER
// ==========================================

function removeFromCart(id) {

  const item =
    cart.find(function (item) {

      return item.id === id;

    });


  if (!item) return;


  if (item.quantity > 1) {

    item.quantity--;

  } else {

    cart =
      cart.filter(function (item) {

        return item.id !== id;

      });

  }


  saveCart();

  renderCart();

}


// ==========================================
// COMPTEUR DU PANIER
// ==========================================

function updateCartCount() {

  const counter =
    document.getElementById(
      "cart-count"
    );


  if (!counter) return;


  const total =
    cart.reduce(
      function (sum, item) {

        return (
          sum +
          item.quantity
        );

      },
      0
    );


  counter.textContent =
    total;

}


// ==========================================
// AFFICHER PANIER
// ==========================================

function renderCart() {

  const container =
    document.getElementById(
      "cart-items"
    );


  if (!container) return;


  if (cart.length === 0) {

    container.innerHTML = `

      <div class="empty-cart">

        <img
          src="./${LOGO}"
          alt="ShopBassin"
        >

        <h3>
          Ton panier est vide
        </h3>

        <p>
          Ajoute un produit depuis le catalogue.
        </p>

      </div>

    `;

  } else {

    container.innerHTML =
      cart.map(function (item) {

        const image =
          item.image
            ? item.image
            : LOGO;


        return `

          <div class="cart-item">

            <div class="cart-thumb">

              <img
                src="./${escapeHTML(image)}"
                alt="${escapeHTML(item.name)}"
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

      }).join("");

  }


  updateTotals();

}


// ==========================================
// PRIX
// ==========================================

function getSubtotal() {

  return cart.reduce(
    function (total, item) {

      return (
        total +
        item.price *
        item.quantity
      );

    },
    0
  );

}


function getDelivery(subtotal) {

  if (subtotal === 0) {
    return 0;
  }


  if (subtotal < 30) {
    return 5;
  }


  return 0;

}


function updateTotals() {

  const subtotal =
    getSubtotal();


  const delivery =
    getDelivery(subtotal);


  const total =
    subtotal + delivery;


  setText(
    "cart-subtotal",
    formatPrice(subtotal)
  );


  setText(
    "delivery-price",

    delivery === 0 &&
    subtotal > 0

      ? "GRATUITE"

      : formatPrice(delivery)
  );


  setText(
    "cart-total",
    formatPrice(total)
  );

}


function formatPrice(price) {

  return new Intl.NumberFormat(
    "fr-FR",
    {
      style: "currency",
      currency: "EUR"
    }
  ).format(price);

}


function setText(id, text) {

  const element =
    document.getElementById(id);


  if (element) {

    element.textContent =
      text;

  }

}


// ==========================================
// COMMANDE
// ==========================================

function prepareOrder() {

  if (cart.length === 0) {

    alert(
      "Ton panier est vide."
    );

    return;
  }


  if (!shopOpen) {

    alert(
      "ShopBassin est actuellement fermé."
    );

    return;
  }


  const subtotal =
    getSubtotal();


  const delivery =
    getDelivery(subtotal);


  const total =
    subtotal + delivery;


  let message =
`🛍 COMMANDE SHOPBASSIN

`;


  cart.forEach(function (item) {

    message +=
`• ${item.name}
  ${item.quantity} × ${formatPrice(item.price)}

`;

  });


  message +=
`Sous-total : ${formatPrice(subtotal)}
Livraison : ${
  delivery === 0
    ? "GRATUITE"
    : formatPrice(delivery)
}
TOTAL : ${formatPrice(total)}
`;


  if (navigator.clipboard) {

    navigator.clipboard
      .writeText(message)
      .then(function () {

        alert(
          "Bon de commande copié ✅"
        );

      })
      .catch(function () {

        alert(message);

      });

  } else {

    alert(message);

  }

}


// ==========================================
// CONTACTS
// ==========================================

function loadContacts() {

  try {

    const saved =
      localStorage.getItem(
        "shopbassin-contacts"
      );


    if (saved) {

      contacts =
        JSON.parse(saved);

    } else {

      contacts = {
        ...DEFAULT_CONTACTS
      };

    }

  } catch (error) {

    contacts = {
      ...DEFAULT_CONTACTS
    };

  }

}


function saveContacts() {

  const snapchatInput =
    document.getElementById(
      "admin-snapchat"
    );


  const instagramInput =
    document.getElementById(
      "admin-instagram"
    );


  const telegramInput =
    document.getElementById(
      "admin-telegram"
    );


  contacts = {

    snapchat:
      snapchatInput
        ? snapchatInput.value.trim()
        : contacts.snapchat,

    instagram:
      instagramInput
        ? instagramInput.value.trim()
        : contacts.instagram,

    telegram:
      telegramInput
        ? telegramInput.value.trim()
        : contacts.telegram

  };


  localStorage.setItem(
    "shopbassin-contacts",
    JSON.stringify(contacts)
  );


  updateContactsDisplay();


  alert(
    "Contacts enregistrés ✅"
  );

}


function fillAdminContacts() {

  const snapchat =
    document.getElementById(
      "admin-snapchat"
    );


  const instagram =
    document.getElementById(
      "admin-instagram"
    );


  const telegram =
    document.getElementById(
      "admin-telegram"
    );


  if (snapchat) {
    snapchat.value =
      contacts.snapchat || "";
  }


  if (instagram) {
    instagram.value =
      contacts.instagram || "";
  }


  if (telegram) {
    telegram.value =
      contacts.telegram || "";
  }

}


function updateContactsDisplay() {

  setText(
    "snapchat-contact",
    contacts.snapchat ||
    "Snapchat"
  );


  setText(
    "instagram-contact",
    contacts.instagram ||
    "Instagram"
  );


  setText(
    "telegram-contact",
    contacts.telegram ||
    "Telegram"
  );

}


// ==========================================
// OUVERT / FERMÉ
// ==========================================

function loadShopStatus() {

  const saved =
    localStorage.getItem(
      "shopbassin-open"
    );


  if (saved === null) {

    shopOpen = true;

  } else {

    shopOpen =
      saved === "true";

  }

}


function setShopStatus(open) {

  shopOpen = open;


  localStorage.setItem(
    "shopbassin-open",
    String(shopOpen)
  );


  updateShopStatusDisplay();


  alert(
    shopOpen
      ? "ShopBassin est maintenant OUVERT ✅"
      : "ShopBassin est maintenant FERMÉ 🔴"
  );

}


function updateShopStatusDisplay() {

  const status =
    document.getElementById(
      "shop-status"
    );


  const text =
    document.getElementById(
      "shop-status-text"
    );


  const description =
    document.getElementById(
      "shop-status-description"
    );


  if (!status) return;


  status.classList.remove(
    "open",
    "closed"
  );


  if (shopOpen) {

    status.classList.add(
      "open"
    );


    if (text) {
      text.textContent =
        "OUVERT";
    }


    if (description) {

      description.textContent =
        "Les commandes sont actuellement disponibles.";

    }

  } else {

    status.classList.add(
      "closed"
    );


    if (text) {
      text.textContent =
        "FERMÉ";
    }


    if (description) {

      description.textContent =
        "Les commandes sont actuellement fermées.";

    }

  }

}


// ==========================================
// SÉCURITÉ TEXTE
// ==========================================

function escapeHTML(value) {

  return String(value)

    .replaceAll("&", "&amp;")

    .replaceAll("<", "&lt;")

    .replaceAll(">", "&gt;")

    .replaceAll('"', "&quot;")

    .replaceAll("'", "&#039;");

}


function escapeAttribute(value) {

  return escapeHTML(
    value || ""
  );

}
