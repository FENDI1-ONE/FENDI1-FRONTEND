/* cart.js — cleaned & stable version */
(() => {
  const CART_KEY = "f1_cart_v1";

  // DOM refs (may be null on non-cart pages — we guard)
  const burger = () => document.getElementById("burger");
  const nav = () => document.getElementById("nav");
  const cartCountEl = () => document.querySelector(".cart-count");
  const cartWrap = () => document.getElementById("cart-page");
  const tbody = () => document.getElementById("cart-items");
  const totalEl = () => document.getElementById("cart-total");
  const emptyEl = () => document.getElementById("cart-empty");
  const hasItemsEl = () => document.getElementById("cart-has-items");
  const paypalContainer = () => document.getElementById("paypal-button-container");
  const orderInput = () => document.getElementById("order-id-input");
  const checkBtn = () => document.getElementById("check-order-btn");
  const orderResult = () => document.getElementById("order-result");

  const PRODUCT_CATALOG = {
    "ccl_hoodie": {
      productId: "ccl_hoodie",
      productName: `"COULDN'T CARE LESS" Hoodie`,
      price: 49.99,
      img: "assets/newhoodieBlackFrontLayDown.png",
      type: "hoodie",
      variants: {
        sizes: ["S","M","L","XL","XXL","3XL"]
      }
    },

    "ccl_shirt": {
      productId: "ccl_shirt",
      productName: `"COULDN'T CARE LESS" Shirt`,
      price: 29.99,
      img: "assets/cclShirtBlackFront&Back.png",
      type: "shirt",
      variants: {
        sizes: ["S","M","L","XL","XXL","3XL"]
      }
    },

    "l&d_hoodie": {
      productId: "l&d_hoodie",
      productName: `LOVE&DRUGS "IWEMNK" Hoodie`,
      price: 49.99,
      img: "assets/mainPicLoveDrugs.png",
      type: "hoodie",
      variants: {
        sizes: ["S","M","L","XL","XXL","3XL"]
      }
    },

    "l&d_shirt": {
      productId: "l&d_shirt",
      productName: `LOVE&DRUGS "IWEMNK" Shirt`,
      price: 29.99,
      img: "assets/love&drugsFront&Back.png",
      type: "shirt",
      variants: {
        sizes: ["S","M","L","XL","XXL","3XL"]
      }
    },

    "stickers": {
      productId: "sticker",
      productName: "FENDI1 STICKER PACK #1",
      img: "assets/STICKERshiny.jpeg",
      type: "stickers",
      variants: {
        "Pack of 10": 1.99,
        "Pack of 25": 4.49,
        "Pack of 50": 7.99,
        "Pack of 100": 14.99
      }
    },
        

  };

  // --- Storage helpers ---
  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  }
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
  }

  // --- Cart operations ---
  function addToCart(product) {
    const cart = getCart();
    // if you want merging same sku: implement here. For now push
    cart.push(product);
    saveCart(cart);
  }
  function removeFromCart(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
  }
  function clearCart() {
    saveCart([]);
    renderCart();
  }
  function cartTotalValue(cart = null) {
    const c = Array.isArray(cart) ? cart : getCart();
    return c.reduce((s, i) => s + (parseFloat(i.price) || 0) * (parseInt(i.qty,10) || 1), 0);
  }
  function updateCartCount() {
    const el = cartCountEl();
    if (!el) return;
    const count = getCart().reduce((s,i) => s + (parseInt(i.qty,10) || 0), 0);
    el.textContent = count > 99 ? "99+" : String(count);
  }

  // --- Render cart table ---
  function renderCart() {
    const wrap = cartWrap();
    if (!wrap) return; // not on cart page

    const tbodyEl = tbody();
    const totalElement = totalEl();
    const emptyElement = emptyEl();
    const hasItemsElement = hasItemsEl();

    const cart = getCart();
    if (!tbodyEl || !totalElement || !emptyElement || !hasItemsElement) {
      console.warn("cart.js: missing DOM elements in cart.html");
      return;
    }

    tbodyEl.innerHTML = "";

    if (!cart.length) {
      emptyElement.style.display = "block";
      hasItemsElement.style.display = "none";
      totalElement.textContent = "0,00 €";
      if (paypalContainer()) paypalContainer().innerHTML = "";
      return;
    }

    emptyElement.style.display = "none";
    hasItemsElement.style.display = "block";

    cart.forEach((item, idx) => {
      const price = parseFloat(item.price) || 0;
      const qty = parseInt(item.qty, 10) || 1;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><img class="cart-row-img" src="${item.img || 'assets/placeholder.png'}" alt=""></td>
        <td>
          <div style="font-weight:700">${item.name}</div>
          ${item.option ? `<div style="opacity:.7;font-size:14px">${item.option}</div>` : ''}
          <div style="opacity:.7;font-size:14px">SKU: ${item.sku || "-"}</div>
        </td>
        <td>${price.toFixed(2).replace('.',',')} €</td>
        <td style="white-space:nowrap">
          <button class="btn btn-light" data-qty-minus="${idx}">–</button>
          <span style="display:inline-block; min-width:28px; text-align:center">${qty}</span>
          <button class="btn btn-light" data-qty-plus="${idx}">+</button>
        </td>
        <td>${(price * qty).toFixed(2).replace('.',',')} €</td>
        <td><button class="btn btn-danger" data-remove="${idx}">Remove</button></td>
      `;
      tbodyEl.appendChild(row);
    });

    // attach handlers (delegation would be nicer but this is simple)
    tbodyEl.querySelectorAll('[data-qty-minus]').forEach(b => {
      b.onclick = () => {
        const i = parseInt(b.dataset.qtyMinus, 10);
        const c = getCart();
        c[i].qty = Math.max(1, (parseInt(c[i].qty,10) || 1) - 1);
        saveCart(c);
        renderCart();
      };
    });
    tbodyEl.querySelectorAll('[data-qty-plus]').forEach(b => {
      b.onclick = () => {
        const i = parseInt(b.dataset.qtyPlus, 10);
        const c = getCart();
        c[i].qty = (parseInt(c[i].qty,10) || 0) + 1;
        saveCart(c);
        renderCart();
      };
    });
    tbodyEl.querySelectorAll('[data-remove]').forEach(b => {
      b.onclick = () => removeFromCart(parseInt(b.dataset.remove,10));
    });

    // total
    const total = cartTotalValue(cart);
    totalElement.textContent = total.toFixed(2).replace('.',',') + " €";

    // mount PayPal buttons (re-mount every render to keep amounts in sync)
    mountPayPal(cart);
  }

  // --- PayPal mount (only if SDK loaded) ---
  function mountPayPal(cart) {
    const container = paypalContainer();
    if (!container) return;
    if (!window.paypal) {
      container.innerHTML = "<p>PayPal not loaded</p>";
      return;
    }

    // clear first
    container.innerHTML = "";

    // build items for PayPal
    const items = cart.map(p => {
      const price = parseFloat(p.selectedPack?.price ?? p.price) || 0;
      const quantity = parseInt(p.qty,10) || 1;
      const size = p.selectedPack?.label || p.option || p.size || "-";
      return {
        name: p.name,
        unit_amount: { currency_code: "EUR", value: price.toFixed(2) },
        quantity: String(quantity),
        description: `${p.name} (${size})`
      };
    });

    const total = items.reduce((s,i) => s + parseFloat(i.unit_amount.value) * parseInt(i.quantity,10), 0).toFixed(2);

    paypal.Buttons({
      style: { layout: "vertical" },
      onClick: (data, actions) => {
        const checkbox = document.getElementById("acceptTerms");
        const warning = document.getElementById("termsWarning");
        if (checkbox && !checkbox.checked) {
          if (warning) {
            warning.style.display = "block";
            setTimeout(() => warning.style.display = "none", 3000);
          }
          return actions.reject();
        }
        return actions.resolve();
      },
      createOrder: (_data, actions) => {
        return actions.order.create({
          purchase_units: [{
            amount: { currency_code: "EUR", value: total, breakdown: { item_total: { currency_code: "EUR", value: total } } },
            items
          }],
          application_context: { shipping_preference: "GET_FROM_FILE" }
        });
      },
      onApprove: async (_data, actions) => {
        try {
          const details = await actions.order.capture();
          console.log("PayPal capture details:", details);

          // build order payload
          const purchaseUnit = details.purchase_units?.[0] || {};
          const shipping = purchaseUnit.shipping?.address || {};
          const payer = details.payer || {};

          const formattedCart = cart.map(p => ({
            name: p.name,
            size: p.selectedPack?.label || p.size || p.option || "-",
            price: p.selectedPack?.price ?? p.price,
            quantity: p.qty
          }));

          const totalAmount = cartTotalValue(cart).toFixed(2);

          const newOrder = {
            orderId: details.id,
            payerName: `${payer.name?.given_name || ''} ${payer.name?.surname || ''}`.trim(),
            payerEmail: payer.email_address || '',
            address: {
              line1: shipping.address_line_1 || '',
              city: shipping.admin_area_2 || '',
              postal_code: shipping.postal_code || '',
              country: shipping.country_code || ''
            },
            items: formattedCart,
            totalAmount,
            rawPayPalOrder: details
          };

          console.log("Creating order on server:", newOrder);

          // send to your server (relative path -> current origin)
          // make sure your server route is /create-order and accessible
          const resp = await fetch("/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newOrder)
          });

          const json = await resp.json().catch(()=>({}));
          console.log("Server response:", json);

          alert(`Thank you for your support ${newOrder.payerName || ''} ❤️`);
          clearCart();

        } catch (err) {
          console.error("Error in onApprove:", err);
          alert("There was a problem processing your order. Try again.");
        }
      },
      onError: err => {
        console.error("PayPal error:", err);
        alert("PayPal error. Try again later.");
      }
    }).render(container);
  }

  function renderOrder(order) {
  const itemsHTML = order.items.map(item => `
    <div class="order-item">
      <span>${item.name} (${item.size})</span>
      <span>${item.quantity || 1}x</span>
      <span>${item.price.toFixed(2)}€</span>
    </div>
  `).join("");

  return `
    <div class="order-box">
      <h3>Order #${order.orderId}</h3><br>
      
      <h4>Customer</h4><br>
      <p>${order.payerName}<br>${order.payerEmail}</p><br>

      <h4>Shipping Address</h4><br>
      <p>
        ${order.address.line1}<br>
        ${order.address.postal_code} ${order.address.city}<br>
        ${order.address.country}
      </p><br>

      <h4>Items:</h4><br>
      <div class="order-items">${itemsHTML}</div><br>

      <h4>Total:</h4>
      <p><strong>${order.totalAmount}€</strong></p>
    </div>
  `;
}


  // --- Check order (frontend) ---
  async function checkOrderFrontend() {
    const input = orderInput();
    const result = orderResult();
    if (!input || !result) return;
    const id = input.value.trim();
    if (!id) return alert("Please enter an order ID.");

    result.innerHTML = "<p>Searching for your order…</p>";
    try {
      const res = await fetch(`/check-order?orderId=${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      result.innerHTML = renderOrder(data);
    } catch (err) {
      console.error(err);
      result.innerHTML = `<p style="color:red;">No order found with ID "${id}"</p>`;
    }
  }

  window.checkOrderFrontend = checkOrderFrontend;

  // --- Init on DOM ready ---
  document.addEventListener("DOMContentLoaded", () => {
    // burger toggle (if present)
    const b = burger();
    if (b && nav()) {
      b.addEventListener("click", () => nav().classList.toggle("show"));
    }

    updateCartCount();

    // only on cart page
    if (cartWrap()) {
      renderCart();
      const cb = checkBtn();
      if (cb) {
        cb.removeEventListener("click", checkOrderFrontend); // safe remove before add
        cb.addEventListener("click", checkOrderFrontend);
      }
    }

    // product page add to cart binding: if you have a button with `.add-to-cart` and related selects,
    // we leave a simple generic handler — but product pages often need per-page logic.
    const addBtn = document.querySelector(".add-to-cart");
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        // minimal safe gather — adapt on product pages to pass correct values
        const name = document.querySelector(".product-details h2")?.textContent?.trim() || "Product";
        const priceText = document.querySelector(".price")?.textContent || "0";
        // try to extract number
        const price = parseFloat(priceText.replace(/[^\d,.-]/g,'').replace(',','.')) || 0;
        const qty = 1;
        const sku = `sku-${Date.now()}`;
        const img = document.querySelector(".product-gallery img")?.src || "assets/placeholder.png";

        addToCart({ sku, name, price, qty, img });
        addBtn.textContent = "✔ Hinzugefügt!";
        setTimeout(()=> addBtn.textContent = "Add to cart", 1200);
        renderCart();
      });
    }
  });

  // expose small API for debugging if needed
  window._f1cart = {
    getCart, saveCart, addToCart, removeFromCart, clearCart, renderCart
  };

})();
