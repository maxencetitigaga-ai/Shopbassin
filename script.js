* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --bg: #050505;
  --card: #111214;
  --card2: #18191c;
  --blue: #2997ff;
  --text: #ffffff;
  --muted: #8e8e93;
  --border: rgba(255,255,255,.08);
}

html {
  scroll-behavior: smooth;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display",
    "Segoe UI", sans-serif;
  min-height: 100vh;
}

button {
  font-family: inherit;
}

.app {
  min-height: 100vh;
  max-width: 600px;
  margin: auto;
  padding-bottom: 

// Écran de chargement ShopBassin
window.addEventListener("load", () => {
  const loader = document.getElementById("loader");

  setTimeout(() => {
    if (loader) {
      loader.classList.add("loader-hidden");
    }
  }, 3000);

  setTimeout(() => {
    if (loader) {
      loader.remove();
    }
  }, 4000);
});
