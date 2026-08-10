function updateTotal() {

  const element =
    document.getElementById("cart-total");

  if (!element) return;


  const subtotal =
    cart.reduce(
      function(sum, item) {
        return sum + (item.price * item.quantity);
      },
      0
    );


  let delivery = 0;

  if (subtotal > 0 && subtotal < 30) {
    delivery = 5;
  }


  const total =
    subtotal + delivery;


  element.textContent =
    formatPrice(total);
}
