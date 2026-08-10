<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#050505" />
  <title>ShopBassin</title>

  <link rel="stylesheet" href="style.css" />
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
</head>

<body>

  <!-- ÉCRAN DE CHARGEMENT -->
  <div id="loader">
    <div class="loader-inner">
      <div class="logo-orbit">
        <img src="IMG_0438.png" alt="ShopBassin" class="loader-logo" />
      </div>

      <div class="loading-line">
        <div class="loading-progress"></div>
      </div>

      <p class="loader-tagline">
        PREMIUM • QUALITÉ • RAPIDITÉ
      </p>
    </div>
  </div>


  <!-- APPLICATION -->
  <div id="app" class="app">

    <!-- HEADER -->
    <header class="topbar">
      <div class="brand">
        <img src="IMG_0438.png" alt="ShopBassin" class="brand-logo" />

        <div>
          <p class="eyebrow">SHOPBASSIN</p>
          <h1>Bienvenue</h1>
        </div>
      </div>

      <button class="cart-button" onclick="showPage('panier')">
        <span>🛒</span>
        <span id="cart-count">0</span>
      </button>
    </header>


    <main>

      <!-- ACCUEIL -->
      <section id="accueil" class="page active">

        <div class="hero-card">
          <div class="hero-glow"></div>

          <div class="hero-content">

            <span class="premium-pill">
              COLLECTION PREMIUM
            </span>

            <h2>
              Le style,
              <span>autrement.</span>
            </h2>

            <p>
              Une sélection moderne pensée pour ceux qui aiment
              la qualité, le style et la simplicité.
            </p>

            <div class="hero-actions">
              <button class="btn-primary" onclick="showPage('habits')">
                Découvrir
              </button>

              <button class="btn-secondary" onclick="showPage('galo')">
                Voir Galo
              </button>
            </div>

          </div>
        </div>


        <!-- CATÉGORIES -->
        <div class="section-header">
          <div>
            <p class="eyebrow">SHOPBASSIN</p>
            <h3>Nos univers</h3>
          </div>
        </div>

        <div class="category-grid">

          <button class="category-card" onclick="showPage('habits')">
            <div class="category-top">
              <span class="category-icon">👕</span>
              <span class="arrow">↗</span>
            </div>

            <div>
              <h4>Habits</h4>
              <p>Découvre la collection</p>
            </div>
          </button>


          <button class="category-card" onclick="showPage('galo')">
            <div class="category-top">
              <span class="category-icon">✦</span>
              <span class="arrow">↗</span>
            </div>

            <div>
              <h4>Galo</h4>
              <p>Notre sélection spéciale</p>
            </div>
          </button>

        </div>


        <!-- AVANTAGES -->
        <div class="features">

          <div class="feature">
            <span>⚡</span>
            <div>
              <strong>Rapide</strong>
              <p>Commande simple</p>
            </div>
          </div>

          <div class="feature">
            <span>✓</span>
            <div>
              <strong>Qualité</strong>
              <p>Produits sélectionnés</p>
            </div>
          </div>

          <div class="feature">
            <span>💬</span>
            <div>
              <strong>Telegram</strong>
              <p>Contact direct</p>
            </div>
          </div>

        </div>

      </section>


      <!-- HABITS -->
      <section id="habits" class="page">

        <div class="page-title">
          <p class="eyebrow">COLLECTION</p>
          <h2>Habits</h2>
          <p>Découvre les articles disponibles.</p>
        </div>

        <div id="habits-products" class="product-grid"></div>

      </section>


      <!-- GALO -->
      <section id="galo" class="page">

        <div class="page-title">
          <p class="eyebrow">SHOPBASSIN</p>
          <h2>Galo</h2>
          <p>Une sélection spéciale ShopBassin.</p>
        </div>

        <div class="galo-card">

          <div class="galo-visual">
            <img src="IMG_0438.png" alt="Galo ShopBassin" />
          </div>

          <div class="galo-content">
            <span class="premium-pill">GALO</span>

            <h3>Une expérience différente.</h3>

            <p>
              Tes produits Galo apparaîtront ici avec leurs photos,
              descriptions et prix.
            </p>
          </div>

        </div>

      </section>


      <!-- PANIER -->
      <section id="panier" class="page">

        <div class="page-title">
          <p class="eyebrow">SHOPBASSIN</p>
          <h2>Ton panier</h2>
          <p>Retrouve ici tous tes articles.</p>
        </div>

        <div id="cart-items" class="cart-list"></div>

        <div class="checkout-card">

          <div class="checkout-line">
            <span>Total</span>
            <strong id="cart-total">0 €</strong>
          </div>

          <button class="btn-primary full" onclick="prepareOrder()">
            Commander sur Telegram
          </button>

        </div>

      </section>


      <!-- CONTACT -->
      <section id="contact" class="page">

        <div class="page-title">
          <p class="eyebrow">CONTACT</p>
          <h2>Besoin d'aide ?</h2>
          <p>Nous sommes disponibles directement sur Telegram.</p>
        </div>

        <div class="contact-card">

          <div class="contact-icon">💬</div>

          <h3>ShopBassin</h3>

          <p>
            Une question sur un produit ou une commande ?
            Contacte-nous directement.
          </p>

          <button class="btn-primary full" onclick="openTelegram()">
            Ouvrir Telegram
          </button>

        </div>

      </section>

    </main>


    <!-- NAVIGATION -->
    <nav class="bottom-nav">

      <button class="nav-item active"
        onclick="showPage('accueil', this)">
        <span>⌂</span>
        <small>Accueil</small>
      </button>

      <button class="nav-item"
        onclick="showPage('habits', this)">
        <span>👕</span>
        <small>Habits</small>
      </button>

      <button class="nav-item"
        onclick="showPage('galo', this)">
        <span>✦</span>
        <small>Galo</small>
      </button>

      <button class="nav-item"
        onclick="showPage('panier', this)">
        <span>🛒</span>
        <small>Panier</small>
      </button>

      <button class="nav-item"
        onclick="showPage('contact', this)">
        <span>●</span>
        <small>Contact</small>
      </button>

    </nav>

  </div>


  <script src="script.js"></script>

</body>
</html>
