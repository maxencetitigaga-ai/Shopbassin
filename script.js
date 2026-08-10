document.addEventListener("DOMContentLoaded", function () {
  const loader = document.getElementById("loader");

  if (!loader) return;

  setTimeout(function () {
    loader.style.transition = "opacity 0.7s ease";
    loader.style.opacity = "0";

    setTimeout(function () {
      loader.remove();
    }, 700);

  }, 3000);
});
