const CART_KEY = "f1_cart_v1";

const images = {
    white: [
        "assets/mainPicLovedrugs.png",
        "assets/lovedrugsbackdetail.png",
        "assets/lovedrugsrightdetail.png",
        "assets/lovedrugsleftdetail.png"
    ]
};

const mainImage = document.getElementById("main-hoodie");
const thumbnailContainer = document.getElementById("thumbnail-container");
const sizeSelect = document.getElementById("hoodie2-size");
const selectedSize = document.querySelector("#hoodie2-size");
const hoodieName = `LOVE&DRUGS "IWEMNK" Hoodie`;
const hoodiePrice = 49.99;

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
    } catch(e) {
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

function updateProductData() {
    const sku = `shirt-${selectedColor}-${selectedSize}`;
    const price = 49.99;
    paypalContainer.dataset.sku = sku;
    paypalContainer.dataset.price = price;
    paypalContainer.dataset.name = hoodieName;
}

document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();

let selectedColor = "white";
let selectedSize = "S";


function loadThumbnails(color) {
    const list = images[color];
    if (!list || !list.length) return;
    mainImage.src = list[0];
    thumbnailContainer.innerHTML = "";
    list.forEach((src, idx) => {
        const thumb = document.createElement("img");
        thumb.src = src;
        thumb.className = "thumbnail";
        if (idx === 0) thumb.classList.add("active-thumb");
        thumb.addEventListener("click", () => {
            mainImage.src = src;
            thumbnailContainer.querySelectorAll("img").forEach(t => t.classList.remove("active-thumb"));
            thumb.classList.add("active-thumb");
        });
        thumbnailContainer.appendChild(thumb);
    });
}

sizeSelect.addEventListener("change", () => {
    selectedSize = sizeSelect.value;
    updateProductData();
})

const defaultColor = "white";
loadThumbnails(defaultColor);


const addBtn = document.querySelector(".add-to-cart-btn");

if (addBtn && sizeSelect) {
    addBtn.addEventListener("click", () => {
        const price = 49.99;
        const sku = `hoodie-${selectedColor}-${selectedSize}`;
        const name = hoodieName;
        const qty = 1;
        let img = images.white[0];

        const product = {
            sku, 
            name,
            price,
            color: selectedColor,
            size: selectedSize,
            qty: qty,
            img: img
        };
        addToCart(product);

        addBtn.textContent = "✔ Added succesfully!";
        setTimeout(() => {addBtn.textContent = "Add to cart";}, 1200);
    });
}

const paypalContainer = document.getElementById("paypal-button-container");
  if (paypalContainer && sizeSelect) {
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
        createOrder: function(_data, actions) {
            const selectedSize = document.querySelector("#hoodie2-size");
            const price = 49.99;
            const quantity = 1;
            const productName = hoodieName;
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

            const hoodieData = {
                name: hoodieName,
                price: hoodiePrice,
                size: selectedSize
            };

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
                items: [hoodieData],
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
        } catch(err) {
            console.error("Fehler bei der Bestellung:", err);
            alert("We are very sorry to inform you that there was an issue with your order. Please try again.");
        }
    
        }
    }).render('#paypal-button-container');

} else {
    console.error("PayPal SDK wurde nicht geladen");
}

})
