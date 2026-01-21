const CART_KEY = "f1_cart_v1";


    const images = {
        black: [
            "assets/newhoodieBlackFrontLayDown.png",
            "assets/backLayDownHoodieBlack.png",
            "assets/newhoodieBlackLeft.png",
            "assets/newhoodieBlackRight.png"
        ],
        white: [
            "assets/hoodieWhiteFront.jpeg",
            "assets/hoodieWhiteBack.jpeg",
            "assets/hoodieWhiteLeftDetail.jpeg",
            "assets/hoodieWhiteRightDetail.jpeg"
        ]
    };

    const mainImage = document.getElementById("main-hoodie1");
    const thumbnailContainer = document.getElementById("thumbnail-container");
    const colorBoxes = document.querySelectorAll(".color-box");
    const sizeSelect = document.getElementById("hoodie-size");
    const addToCartBtn = document.querySelector(".add-to-cart-btn");
    const selectedColor = document.querySelector("#color-box-group");
    const selectedSize = document.querySelector("#hoodie-size");
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const hoodieName = `"COULDN'T CARE LESS" Hoodie`;
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
        const sku = `hoodie-${selectedColor}-${selectedSize}`;
        const price = 49.99;
        paypalContainer.dataset.sku = sku;
        paypalContainer.dataset.price = price;
        paypalContainer.dataset.name = hoodieName;
    }


    document.addEventListener("DOMContentLoaded", () => {
        updateCartCount();

    // Aktive Farbe markieren
    function setActiveColor(color) {
        colorBoxes.forEach(b => {
            const isActive = b.dataset.color === color;
            b.classList.toggle('is-active', isActive);
            b.setAttribute("aria-pressed", isActive ? "true" : "false");
        });
    }

    let selectedColor = "black";
    let selectedSize = "S";

    // Thumbnails für die Farbe laden
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

    // Color Box Events
    colorBoxes.forEach(box => {
        box.addEventListener("click", () => {
            colorBoxes.forEach(s => s.classList.remove("active"));
            box.classList.add("active");
            selectedColor = box.dataset.color;
            loadThumbnails(selectedColor);
            setActiveColor(selectedColor);
        });
    });

    sizeSelect.addEventListener("change", () => {
        selectedSize = sizeSelect.value;
        updateProductData();
    })

    // Standardfarbe beim Laden
    const defaultColor = "black";
    setActiveColor(defaultColor);
    loadThumbnails(defaultColor);

    const addBtn = document.querySelector(".add-to-cart-btn");

if (addBtn && sizeSelect) {
    addBtn.addEventListener("click", () => {
        const price = 49.99;
        const sku = `hoodie-${selectedColor}-${selectedSize}`;
        const name = hoodieName;
        const qty = 1;
        let img;
        if (selectedColor.toLowerCase() === "black") {
            img = images.black[0];
        } else if (selectedColor.toLowerCase() === "white") {
            img = images.white[0];
        }
        
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

        addBtn.textContent = "✔ added succesfully!";
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
            const selectedSize = document.querySelector("#hoodie-size").value;
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
    
