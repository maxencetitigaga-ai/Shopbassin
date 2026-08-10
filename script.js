// =====================================
// SHOPBASSIN MINI APP
// =====================================


// TELEGRAM
const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}


// =====================================
// CHARGEMENT
// =====================================

function closeLoader() {

  const loader = document.getElementById("loader");

  if (!loader) {
    return;
  }

  loader.style.opacity = "0";
  loader.style.pointerEvents = "none";

  setTimeout(function () {

    if (loader) {
      loader.style.display = "none";
    }

  }, 700);
}


// Dès que la page est prête
document.addEventListener(
  "DOMContentLoaded",
  function () {

    setTimeout(
      closeLoader,
      3000
    );

  }
);


// SÉCURITÉ : même si quelque chose bloque,
// le loader disparaît quand même.
setTimeout(
  closeLoader,
  4500
);


// =====================================
// NAVIGATION
// =====================================

function showPage(pageId, clickedButton) {

  const pages =
    document.querySelectorAll(".page");


  pages.forEach(function (page) {

    page.classList.remove("active");

  });


  const selectedPage =
    document.getElementById(pageId);


  if (selectedPage) {

    selectedPage.classList.add("active");

  }


  // MENU DU BAS

  const navButtons =
    document.querySelectorAll(
      ".bottom-nav button"
    );


  navButtons.forEach(function (button) {

    button.classList.remove("active");

  });


  // Si le bouton vient du menu
  if (clickedButton) {

    clickedButton.classList.add("active");

  }

  // Si on vient d'un bouton ailleurs
  else {

    const matchingButton =
      document.querySelector(
        '.bottom-nav button[data-page="' +
        pageId +
        '"]'
      );


    if (matchingButton) {

      matchingButton.classList.add(
        "active"
      );

    }

  }


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });


  // Vibration légère dans Telegram
  if (
    tg &&
    tg.HapticFeedback
  ) {

    try {

      tg.HapticFeedback
        .selectionChanged();

    } catch (error) {

      console.log(
        "Haptic indisponible"
      );

    }

  }

}


// =====================================
// CONTACT TELEGRAM
// =====================================

function openTelegram() {

  const telegramUrl =
    "https://t.me/shopbassinstore_bot";


  if (
    tg &&
    typeof tg.openTelegramLink ===
    "function"
  ) {

    tg.openTelegramLink(
      telegramUrl
    );

    return;
  }


  window.location.href =
    telegramUrl;
}


// =====================================
// COMPTEUR PANIER
// =====================================

function updateCartCount(number) {

  const counter =
    document.getElementById(
      "cart-count"
    );


  if (counter) {

    counter.textContent =
      number || 0;

  }

}


// DÉMARRAGE
updateCartCount(0);
