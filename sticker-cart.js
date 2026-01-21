const CART_KEY = "f1_cart_v1";
const stickerName = "FENDI1 Sticker Pack #1 (Shiny Finish)";
const packSelect = document.querySelector("#quantity");
const stickerPrice = document.querySelector("#price-display");
const selectedOption = packSelect.options[packSelect.selectedIndex];

document.addEventListener("DOMContentLoaded", () => {
    const burger = document.getElementById("burger");
    const nav = document.getElementById("nav");

    burger.addEventListener("click", () => {
        nav.classList.toggle("show");
    });
});

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
        console.error("Fehler beim Laden des Carts:", e);
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const count = getCart().reduce((sum, p) => sum + p.qty, 0);
    const cartCountEl = document.getElementById("cart-count");
    if (cartCountEl) cartCountEl.textContent = count > 99 ? "99+" : count;
}

// Fügt Produkt zum Cart hinzu
function addToCart(product) {
    const cart = getCart();
    const idx = cart.findIndex(p => p.sku === product.sku && p.option === product.option);
    if (idx > -1) {
        cart[idx].qty += product.qty;
    } else {
        cart.push(product);
    }
    saveCart(cart);
}

// Initialisierung
document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();

    const addBtn = document.querySelector(".add-to-cart-btn");
    const packSelect = document.getElementById("quantity");

    if (addBtn && packSelect) {
        addBtn.addEventListener("click", () => {
            const selectedOption = packSelect.options[packSelect.selectedIndex];
            const qty = 1;
            const price = parseFloat(selectedOption.dataset.price);

            const product = {
                sku: addBtn.dataset.sku,
                name: addBtn.dataset.name,
                price: price,
                option: selectedOption.text,
                qty: qty,
                img: document.querySelector(".product-image img")?.src || ""
            };

            addToCart(product);

            // Button Feedback
            addBtn.textContent = "✔ added succesfully!";
            setTimeout(() => (addBtn.textContent = "Add to cart"), 1200);
        });
    }

    // PayPal Button
    const paypalContainer = document.getElementById("paypal-button-container");
    if (paypalContainer && packSelect) {
        paypal.Buttons({
            onClick: function(data, actions) {
                const checkbox = document.getElementById('acceptTerms');
                const warning = document.getElementById('termsWarning');
                if (!checkbox.checked) {
                    warning.style.display = 'block';

                    setTimeout(() => {
                        warning.style.display = 'none';
                    }, 3000);

                    return actions.reject();
                }
                return actions.resolve();
            },
            createOrder: (_data, actions) => {
                const selectedOption = packSelect.options[packSelect.selectedIndex];
                const selectedLabel = selectedOption.textContent || selectedOption.value;
                const price = parseFloat(selectedOption.dataset.price);
                const quantity = 1;
                const productName = "FENDI1 Sticker Pack #1 SHINY FINISH";
                const total = (price * quantity).toFixed(2);
                return actions.order.create({
                    purchase_units: [{
                    amount: { currency_code: "EUR",
                         value: total,
                         breakdown: {
                            item_total: {
                                currency_code: "EUR",
                                value: total
                            }
                         }
                    },
                    description: productName,
                    items: [{
                        name: productName,
                        unit_amount: {
                            currency_code: "EUR",
                            value: price.toFixed(2)
                        },
                        quantity: quantity.toString()
                    }]
                    }],
                    application_context: {
                        shipping_preference: "GET_FROM_FILE"
                    }
                });
            },
            onApprove: async (data, actions) => {
            try {
                const details = await actions.order.capture();
                console.log("PayPal-Details:", details);

                const order = details.purchase_units[0];
                const payer = details.payer;

                const shipping = order.shipping?.address || {};

                const payerName = `${payer.name.given_name} ${payer.name.surname}`;
                const payerEmail = payer.email_address;
                const totalAmount = order.amount.value;
                const orderId = details.id;

                const selectedOption = packSelect.options[packSelect.selectedIndex];
                const selectedLabel = selectedOption.textContent || selectedOption.value;
                const price = parseFloat(selectedOption.dataset.price);

                const orderData = {
                    orderId,
                    payerName,
                    payerEmail,
                    address: {
                        line1: shipping.address_line_1,
                        city: shipping.admin_area_2,
                        postal_code: shipping.postal_code,
                        country: shipping.country_code
                    },
                    items: [
                        {
                            name: stickerName,
                            size: selectedLabel,
                            price: price
                        }
                    ],
                    totalAmount,
                    rawPayPalOrder: details
                };
            const res = await fetch("/create-order", {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(orderData)
            });
            const dataRes = await res.json();
            console.log("serverantwort:", dataRes);
                alert('Thank you for your support, ' + details.payer.name.given_name + '!');
        }   catch(err) {
            console.error("Fehler bei der Bestellung:", err);
            alert("We are very sorry to inform you that there was an issue with your order. Please try again.");
        }
            
            }
        }).render('#paypal-button-container');
    }  else {
        console.log("PayPal SDK wurde nicht geladen");
    }
})
