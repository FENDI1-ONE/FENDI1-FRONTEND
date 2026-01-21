let cart = JSON.parse(localStorage.getItem("f1_cart_v1")) || [];

const cartContainer = document.getElementById("cart-items");
const totalSpan = document.getElementById("total");

// Warenkorb anzeigen
let total = 0;
cart.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.name} – ${item.price.toFixed(2)} €`;
    cartList.appendChild(li);
    total += item.price;
});
totalSpan.textContent = total.toFixed(2);

// PayPal Button für kompletten Warenkorb
paypal.Buttons({
    createOrder: function(data, actions) {

        const total = cart.reduce((sum, p) => {
            if (p.selectedPack && typeof p.selectedPack.price === "number") {
                return sum + p.selectedPack.price * (p.qty || 1);
            }
            return sum + p.price || 0) * (p.qty || 1);
    }, 0).toFixed(2);

    const items = cart.map(p => {
        const itemPrice = p.selectedPack?.price || p.price;
        const itemSize = p.selectedPack?.size || p.size || "-";

        return {
            name: p.name,
            unit_amount: {currency_code: "EUR", value: itemPrice.toFixed(2) },
            quantity: p.qty.toString(),
            description: `${p.name} (${itemSize})`
        };
    });
        return actions.order.create({
            purchase_units: [{
                description: "FENDI1 Warenkorb",
                amount: {
                    currency_code: "EUR",
                    value: total,
                    breakdown: { item_total: { currency_code: "EUR", value: total } }
                },
                items: items
            }],
            application_context: {
                shipping_preference: "GET_FROM_FILE"
            }
        });
    },
    onApprove: async (data, actions) => {
        const details = await actions.order.capture();
        const orderId = details.id;
        const payerName = details.payer.name.given_name;
        const payerEmail = details.payer.email_address;

        const formattedItems = cart.map(p => ({
            name: p.name,
            size: p.selectedPack?.label || p.size,
            price: p.selectedPack?.price || p.price
        }));

        const totalAmount = formattedItems.reduce((sum, i) => sum + (i.price || 0), 0).toFixed(2);

        const shippingAddress = details.purchase_units?.[0]?.shipping?.address || {};

        await fetch("https://fendi1-merch.onrender.com/send-confirmation", {
            method: "POST",
            headers: {"Content-Type": "application/json" },
            body: JSON.stringify({
                orderId,
                payerName,
                payerEmail,
                address: shippingAddress,
                items: formattedItems,
                totalAmount,
                rawPayPalOrder: details
            })
        });
        return actions.order.capture().then(function(details) {
            alert("Danke für deinen Kauf, " + details.payer.name.given_name + "!");
            localStorage.removeItem("cart"); // Warenkorb leeren
        });
    }
}).render("#paypal-cart");
