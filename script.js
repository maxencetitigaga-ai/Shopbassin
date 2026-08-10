const tg = window.Telegram?.WebApp;

if (tg) {
  try {
    tg.ready();
    tg.expand();
  } catch (error) {}
}


// ================================
// PRODUITS
// ================================
//
// POUR AJOUTER UN PRODUIT :
// copie un bloc et change les informations.
//
// POUR METTRE UNE PHOTO :
// ajoute l'image dans GitHub
// puis écris son nom dans "image".
//
// Exemple : "tshirt-noir.jpg"
//

const products = [

  {
    id: 1,
    name: "T-shirt ShopBassin",
    price: 25,
    image: ""
  },

  {
    id: 2,
    name: "Ensemble Premium",
    price: 39.90,
    image: ""
  },

  {
    id: 3,
    name: "T-shirt Oversize",
    price: 29.90,
    image: ""
  },

  {
    id: 4,
    name: "Nouveauté ShopBassin",
    price: 34.90,
    image: ""
  }

];


// ================================
// PANIER
// ================================

let cart = [];

try {

  const saved =
    localStorage.getItem("shopbassin-cart");

  if (saved) {
    cart = JSON.parse(saved);
  }

} catch (error) {
  cart = [];
}


// ================================
// NAVIGATION
// ================================

function showPage(pageId, button = null) {

  document
    .querySelectorAll(".page")
    .forEach(function(page) {

      page.classList.remove("active");

    });


  const page =
    document.getElementById(pageId);

  if (page) {
    page.classList.add("active");
  }


  document
    .querySelectorAll(".nav-button")
    .forEach(function(nav) {

      nav.classList.remove("active");

    });


  if (button) {

    button.classList.add("active");

  } else {

    const nav =
      document.querySelector(
        '[data-page="' + pageId + '"]'
      );

    if (nav) {
      nav.classList.add("active");
    }

  }


  if (pageId === "panier") {
    renderCart();
  }


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


// ================================
// CATALOGUE
// ================================

function renderProducts() {

  const container =
    document.getElementById(
      "products-container"
    );


  const count =
    document.getElementById(
      "product-count"
    );


  if (count) {
    count.textContent = products.length;
  }


  if (!container) return;


  container.innerHTML =
    products.map(function(product) {


      let imageHTML;


      if (product.image) {

        imageHTML =
          '<img src="./' +
          product.image +
          '" alt="' +
          product.name +
          '">';

      } else {

        imageHTML =
          '<div class="no-product-image">👕</div>';

      }


      return `

        <article class="product-card">

          <div class="product-image">

            ${imageHTML}

          </div>


          <div class="product-info">

            <h3>
              ${product.name}
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

    }).join("");

}


// ================================
// AJOUTER AU PANIER
// ================================

function addToCart(id) {

  const product =
    products.find(function(product) {

      return product.id === id;

    });


  if (!product) return;


  const existing =
    cart.find(function(item) {

      return item.id === id;

    });


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
        .impactOccurred("light");

    } catch (error) {}

  }

}


// ================================
// RETIRER DU PANIER
// ================================

function removeFromCart(id) {

  const item =
    cart.find(function(item) {

      return item.id === id;

    });


  if (!item) return;


  if (item.quantity > 1) {

    item.quantity--;

  } else {

    cart =
      cart.filter(function(item) {

        return item.id !== id;

      });

  }


  saveCart();

  renderCart();

}


// ================================
// SAUVEGARDE
// ================================

function saveCart() {

  localStorage.setItem(
    "shopbassin-cart",
    JSON.stringify(cart)
  );


  updateCartCount();

}


// ================================
// COMPTEUR
// ================================

function updateCartCount() {

  const counter =
    document.getElementById(
      "cart-count"
    );


  if (!counter) return;


  const total =
    cart.reduce(
      function(sum, item) {

        return sum + item.quantity;

      },
      0
    );


  counter.textContent = total;

}


// ================================
// PANIER
// ================================

function renderCart() {

  const container =
    document.getElementById(
      "cart-items"
    );


  if (!container) return;


  if (cart.length === 0) {

    container.innerHTML = `

      <div class="empty-cart">

        <span>🛒</span>

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
      cart.map(function(item) {


        let thumb;


        if (item.image) {

          thumb =
            '<img src="./' +
            item.image +
            '" alt="">';

        } else {

          thumb = "👕";

        }


        return `

          <div class="cart-item">

            <div class="cart-thumb">

              ${thumb}

            </div>


            <div class="cart-info">

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
              −
            </button>

          </div>

        `;

      }).join("");

  }


  updateTotals();

}


// ================================
// PRIX
// ================================

function getSubtotal() {

  return cart.reduce(
    function(total, item) {

      return (
        total +
        item.price * item.quantity
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
    delivery === 0 && subtotal > 0
      ? "GRATUITE"
      : formatPrice(delivery)
  );


  setText(
    "cart-total",
    formatPrice(total)
  );

}


function setText(id, text) {

  const element =
    document.getElementById(id);


  if (element) {
    element.textContent = text;
  }

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


// ================================
// COMMANDE
// ================================

function prepareOrder() {

  if (cart.length === 0) {

    alert(
      "Ton panier est vide."
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
    "🛍 COMMANDE SHOPBASSIN\n\n";


  cart.forEach(function(item) {

    message +=
      "• " +
      item.name +
      " — " +
      item.quantity +
      " × " +
      formatPrice(item.price) +
      "\n";

  });


  message +=
    "\nSous-total : " +
    formatPrice(subtotal);


  message +=
    "\nLivraison : " +
    (
      delivery === 0
        ? "GRATUITE"
        : formatPrice(delivery)
    );


  message +=
    "\nTOTAL : " +
    formatPrice(total);


  if (navigator.clipboard) {

    navigator.clipboard
      .writeText(message)
      .then(function() {

        alert(
          "Commande copiée ✅"
        );

      });

  } else {

    alert(message);

  }

}


// ================================
// DÉMARRAGE
// ================================

document.addEventListener(
  "DOMContentLoaded",
  function() {

    renderProducts();

    updateCartCount();

    renderCart();

  }
);
