// ======================================
// SHOPBASSIN MINI APP
// SCRIPT COMPLET
// ======================================


// ======================================
// TELEGRAM
// ======================================

const tg = window.Telegram?.WebApp;

if (tg) {
  try {
    tg.ready();
    tg.expand();
  } catch (error) {
    console.log("Telegram WebApp indisponible");
  }
}


// ======================================
// ÉCRAN DE CHARGEMENT
// ======================================

function removeLoader() {

  const loader = document.getElementById("loader");

  if (!loader) return;

  loader.style.opacity = "0";
  loader.style.pointerEvents = "none";

  setTimeout(function () {
    loader.style.display = "none";
  }, 750);
}


document.addEventListener("DOMContentLoaded", function () {

  setTimeout(removeLoader, 3000);

  loadCart();

  renderProducts();

  updateCartCount();

});


// Sécurité : le loader disparaît toujours
setTimeout(removeLoader, 5000);


// ======================================
// NAVIGATION
// ======================================

function showPage(pageId, clickedButton = null) {

  const pages = document.querySelectorAll(".page");

  pages.forEach(function (page) {
    page.classList.remove("active");
  });


  const selectedPage =
    document.getElementById(pageId);


  if (selectedPage) {
    selectedPage.classList.add("active");
  }


  // Navigation du bas
  const navButtons =
    document.querySelectorAll(".nav-button");


  navButtons.forEach(function (button) {
    button.classList.remove("active");
  });


  if (clickedButton) {

    clickedButton.classList.add("active");

  } else {

    const matchingButton =
      document.querySelector(
        '.nav-button[data-page="' +
        pageId +
        '"]'
      );


    if (matchingButton) {
      matchingButton.classList.add("active");
    }

  }


  // Actualiser panier
  if (pageId === "panier") {
    renderCart();
  }


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });


  // Petite vibration Telegram
  if (tg?.HapticFeedback) {

    try {
      tg.HapticFeedback.selectionChanged();
    } catch (error) {}

  }
}


// ======================================
// PRODUITS
// ======================================

// Tu pourras changer ici :
// nom, prix, image, etc.

const products = [

  {
    id: 1,
    name: "T-shirt Premium",
    price: 29.90,
    icon: "👕"
  },

  {
    id: 2,
    name: "Sweat ShopBassin",
    price: 49.90,
    icon: "🧥"
  },

  {
    id: 3,
    name: "T-shirt Oversize",
    price: 34.90,
    icon: "👕"
  },

  {
    id: 4,
    name: "Ensemble Premium",
    price: 69.90,
    icon: "✨"
  }

];


// ======================================
// AFFICHER LES PRODUITS
// ======================================

function renderProducts() {

  const container =
    document.getElementById("products-container");


  if (!container) return;


  container.innerHTML =
    products.map(function (product) {

      return `

        <div class="product-card">

          <div class="product-image">

            ${product.icon}

          </div>


          <div class="product-content">

            <h3>
              ${product.name}
            </h3>


            <div class="product-price">

              ${formatPrice(product.price)}

            </div>


            <button
              class="btn-primary full"
              onclick="addToCart(${product.id})"
            >
              Ajouter
            </button>

          </div>

        </div>

      `;

    }).join("");

}


// ======================================
// PANIER
// ======================================

let cart = [];


// ======================================
// CHARGER LE PANIER
// ======================================

function loadCart() {

  try {

    const saved =
      localStorage.getItem("shopbassin-cart");


    if (saved) {
      cart = JSON.parse(saved);
    }

  } catch (error) {

    cart = [];

  }


  updateCartCount();

}


// ======================================
// SAUVEGARDER PANIER
// ======================================

function saveCart() {

  try {

    localStorage.setItem(
      "shopbassin-cart",
      JSON.stringify(cart)
    );

  } catch (error) {}


  updateCartCount();

}


// ======================================
// AJOUTER AU PANIER
// ======================================

function addToCart(productId) {

  const product =
    products.find(function (item) {
      return item.id === productId;
    });


  if (!product) return;


  const existing =
    cart.find(function (item) {
      return item.id === productId;
    });


  if (existing) {

    existing.quantity += 1;

  } else {

    cart.push({

      id: product.id,

      name: product.name,

      price: product.price,

      icon: product.icon,

      quantity: 1

    });

  }


  saveCart();


  if (tg?.HapticFeedback) {

    try {
      tg.HapticFeedback.impactOccurred("light");
    } catch (error) {}

  }


  if (tg?.showAlert) {

    tg.showAlert(
      product.name +
      " ajouté au panier ✅"
    );

  }

}


// ======================================
// COMPTEUR PANIER
// ======================================

function updateCartCount() {

  const counter =
    document.getElementById("cart-count");


  if (!counter) return;


  const count =
    cart.reduce(
      function (total, item) {

        return total + item.quantity;

      },
      0
    );


  counter.textContent = count;

}


// ======================================
// AFFICHER LE PANIER
// ======================================

function renderCart() {

  const container =
    document.getElementById("cart-items");


  if (!container) return;


  if (cart.length === 0) {

    container.innerHTML = `

      <div class="empty-cart">

        <span>
          🛒
        </span>

        <h3>
          Ton panier est vide
        </h3>

        <p>
          Ajoute des articles
          depuis Habits.
        </p>

      </div>

    `;

  } else {

    container.innerHTML =
      cart.map(function (item) {

        return `

          <div class="cart-item">

            <div class="cart-item-image">

              ${item.icon}

            </div>


            <div>

              <strong>
                ${item.name}
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
              ×
            </button>

          </div>

        `;

      }).join("");

  }


  updateTotal();

}


// ======================================
// RETIRER DU PANIER
// ======================================

function removeFromCart(productId) {

  const item =
    cart.find(function (product) {

      return product.id === productId;

    });


  if (!item) return;


  if (item.quantity > 1) {

    item.quantity -= 1;

  } else {

    cart =
      cart.filter(function (product) {

        return product.id !== productId;

      });

  }


  saveCart();

  renderCart();

}


// ======================================
// CALCUL SOUS-TOTAL
// ======================================

function getSubtotal() {

  return cart.reduce(
    function (sum, item) {

      return (
        sum +
        item.price * item.quantity
      );

    },
    0
  );

}


// ======================================
// FRAIS DE LIVRAISON
// ======================================

// 30 € ou plus = livraison gratuite
// Moins de 30 € = +5 €
// Panier vide = 0 €

function getDeliveryPrice(subtotal) {

  if (subtotal === 0) {
    return 0;
  }


  if (subtotal < 30) {
    return 5;
  }


  return 0;

}


// ======================================
// TOTAL
// ======================================

function updateTotal() {

  const element =
    document.getElementById("cart-total");


  if (!element) return;


  const subtotal =
    getSubtotal();


  const delivery =
    getDeliveryPrice(subtotal);


  const total =
    subtotal + delivery;


  element.textContent =
    formatPrice(total);

}


// ======================================
// FORMAT PRIX
// ======================================

function formatPrice(price) {

  return new Intl.NumberFormat(
    "fr-FR",
    {
      style: "currency",
      currency: "EUR"
    }
  ).format(price);

}


// ======================================
// PRÉPARER LA COMMANDE
// ======================================

function prepareOrder() {

  if (cart.length === 0) {

    if (tg?.showAlert) {

      tg.showAlert(
        "Ton panier est vide."
      );

    } else {

      alert(
        "Ton panier est vide."
      );

    }


    return;
  }


  const subtotal =
    getSubtotal();


  const delivery =
    getDeliveryPrice(subtotal);


  const total =
    subtotal + delivery;


  let message =

`🛍 COMMANDE SHOPBASSIN

Articles :
`;


  cart.forEach(function (item) {

    message +=

`
• ${item.name}
  ${item.quantity} × ${formatPrice(item.price)}
`;

  });


  message +=
`
Sous-total : ${formatPrice(subtotal)}
`;


  if (delivery === 0) {

    message +=
`Livraison : GRATUITE ✅
`;

  } else {

    message +=
`Livraison : ${formatPrice(delivery)}
`;

  }


  message +=

`
TOTAL : ${formatPrice(total)}

Merci de confirmer ma commande.`;



  // Copier le bon de commande

  if (navigator.clipboard) {

    navigator.clipboard
      .writeText(message)
      .then(function () {

        if (tg?.showAlert) {

          tg.showAlert(
            "Bon de commande copié ✅"
          );

        } else {

          alert(
            "Bon de commande copié ✅"
          );

        }

      });

  } else {

    alert(message);

  }

}


// ======================================
// TELEGRAM
// ======================================

function openTelegram() {

  const url =
    "https://t.me/shopbassinstore_bot";


  if (
    tg &&
    typeof tg.openTelegramLink ===
    "function"
  ) {

    tg.openTelegramLink(url);

  } else {

    window.location.href = url;

  }

}
