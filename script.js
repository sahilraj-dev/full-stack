// script.js - Lab Sheet 2: Making It Interactive (Vanilla JavaScript)

// Task 1: Product objects array
var products = [
    { id: 1, name: 'Rose Bouquet Blush',       price: 1299, image: 'images/rose-bouquet.jpg',       badge: 'Bestseller' },
    { id: 2, name: 'Sunflower Sunshine Bundle', price: 999,  image: 'images/sunflower-bouquet.jpg',  badge: 'New'        },
    { id: 3, name: 'Pastel Tulip Pot',          price: 1149, image: 'images/tulip-pot.jpg',          badge: ''           },
    { id: 4, name: 'Lavender Dream Bundle',     price: 749,  image: 'images/lavender-bundle.jpg',    badge: ''           },
    { id: 5, name: 'Daisy Flower Basket',       price: 899,  image: 'images/daisy-basket.jpg',       badge: ''           },
    { id: 6, name: 'Teddy Bear with Bouquet',   price: 1499, image: 'images/amigurumi-bear.jpg',     badge: 'Popular'    },
    { id: 7, name: 'Premium Gift Box Set',      price: 2199, image: 'images/gift-box.jpg',           badge: ''           },
    { id: 8, name: 'Flower Keychain Set',       price: 499,  image: 'images/flower-keychain.jpg',    badge: 'New'        },
    { id: 9, name: 'Floral Wall Hanging',       price: 1799, image: 'images/wall-hanging.jpg',       badge: ''           },
    { id: 10, name: 'Lily Vase Arrangement',    price: 1349, image: 'images/lily-vase.jpg',          badge: ''           }
];

// Load cart from localStorage or start empty
var cart = JSON.parse(localStorage.getItem('cart')) || [];

// Run on every page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartBadge(); // Task 8

    if (document.getElementById('products-grid')) {
        renderProducts();     // Task 2
    }

    if (document.getElementById('cart-body')) {
        renderCartItems();    // Task 4
    }

    if (document.getElementById('checkout-form')) {
        populateCheckoutSummary();
        setupCheckoutValidation(); // Task 6
    }
});

// ====================================================
// Task 8: Update cart badge on every page
// ====================================================
function updateCartBadge() {
    var totalItems = cart.reduce(function(sum, item) {
        return sum + item.quantity;
    }, 0);
    document.querySelectorAll('.cart-badge').forEach(function(badge) {
        badge.textContent = totalItems;
    });
}

// ====================================================
// Task 2: Dynamically render products using DOM methods
// ====================================================
function renderProducts() {
    var grid = document.getElementById('products-grid');
    grid.innerHTML = '';

    products.forEach(function(product) {
        // build badge html
        var badgeHtml = '';
        if (product.badge) {
            var badgeClass = product.badge.toLowerCase() === 'new' ? 'product-badge new' : 'product-badge';
            badgeHtml = '<span class="' + badgeClass + '">' + product.badge + '</span>';
        }

        // use template literal for card html
        var cardHtml = '<div class="product-card-image">' +
                badgeHtml +
                '<img src="' + product.image + '" alt="' + product.name + '">' +
            '</div>' +
            '<div class="product-card-body">' +
                '<h3>' + product.name + '</h3>' +
            '</div>' +
            '<div class="product-card-footer">' +
                '<span class="product-price">Rs. ' + product.price + '</span>' +
                '<button class="btn btn-cart btn-sm" onclick="addToCart(' + product.id + ')">Add to Cart</button>' +
            '</div>';

        // use createElement
        var card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = cardHtml;
        grid.appendChild(card);
    });
}

// ====================================================
// Task 3: Add to Cart with localStorage
// ====================================================
function addToCart(productId) {
    // use array find()
    var product = products.find(function(p) { return p.id === productId; });
    if (!product) return;

    var existingItem = cart.find(function(item) { return item.id === productId; });

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 });
    }

    // persist with localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();

    alert(product.name + ' added to cart!');
}

// Make addToCart global so inline onclick="" works
window.addToCart = addToCart;

// ====================================================
// Task 4: Render cart items dynamically from localStorage
// ====================================================
function renderCartItems() {
    var tbody = document.getElementById('cart-body');
    tbody.innerHTML = '';

    if (cart.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:40px; color:#888;">Your cart is empty. <a href="products.html">Shop now</a></td></tr>';
        calculateTotal();
        return;
    }

    cart.forEach(function(item, index) {
        var tr = document.createElement('tr');
        tr.innerHTML =
            '<td data-label="Product">' +
                '<div class="cart-item-info">' +
                    '<img src="' + item.image + '" alt="' + item.name + '" class="cart-item-img">' +
                    '<div><div class="cart-item-name">' + item.name + '</div></div>' +
                '</div>' +
            '</td>' +
            '<td data-label="Price">Rs. ' + item.price + '</td>' +
            '<td data-label="Quantity">' +
                '<input type="number" class="cart-qty" value="' + item.quantity + '" min="1" onchange="updateQuantity(' + index + ', this.value)">' +
            '</td>' +
            '<td data-label="Subtotal">Rs. ' + (item.price * item.quantity) + '</td>' +
            '<td><button class="remove-btn" onclick="removeFromCart(' + index + ')">X</button></td>';
        tbody.appendChild(tr);
    });

    calculateTotal();
}

// Update item quantity
function updateQuantity(index, newQty) {
    var qty = parseInt(newQty);
    if (qty > 0) {
        cart[index].quantity = qty;
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartItems();
        updateCartBadge();
    }
}
window.updateQuantity = updateQuantity;

// Remove item from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartItems();
    updateCartBadge();
}
window.removeFromCart = removeFromCart;

// ====================================================
// Task 5: calculateTotal() using reduce()
// ====================================================
function calculateTotal() {
    var cartSubtotalEl = document.getElementById('cart-subtotal');
    var cartTotalEl    = document.getElementById('cart-total');

    if (!cartSubtotalEl || !cartTotalEl) return;

    // array reduce to sum all items
    var subtotal = cart.reduce(function(sum, item) {
        return sum + (item.price * item.quantity);
    }, 0);

    var shipping   = cart.length > 0 ? 99  : 0;
    var wrapping   = cart.length > 0 ? 49  : 0;
    var grandTotal = subtotal + shipping + wrapping;

    cartSubtotalEl.textContent = 'Rs. ' + subtotal;
    cartTotalEl.textContent    = 'Rs. ' + grandTotal;
}

// ====================================================
// Checkout: populate order summary from cart
// ====================================================
function populateCheckoutSummary() {
    var summaryItems     = document.getElementById('checkout-summary-items');
    var subtotalEl       = document.getElementById('checkout-subtotal');
    var totalEl          = document.getElementById('checkout-total');

    if (!summaryItems) return;

    summaryItems.innerHTML = '';
    var subtotal = 0;

    // use map() + join for rendering
    summaryItems.innerHTML = cart.map(function(item) {
        subtotal += item.price * item.quantity;
        return '<div class="order-item">' +
                   '<span class="item-name">' + item.name + ' x' + item.quantity + '</span>' +
                   '<span class="item-price">Rs. ' + (item.price * item.quantity) + '</span>' +
               '</div>';
    }).join('');

    if (subtotalEl) subtotalEl.textContent = 'Rs. ' + subtotal;
    if (totalEl)    totalEl.textContent    = 'Rs. ' + (cart.length > 0 ? subtotal + 99 + 49 : 0);
}

// ====================================================
// Task 6 & 7: Form validation with inline error messages
// ====================================================
function setupCheckoutValidation() {
    var form = document.getElementById('checkout-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // clear old errors
        document.querySelectorAll('.error-text').forEach(function(el) { el.remove(); });

        var name    = document.getElementById('name').value.trim();
        var address = document.getElementById('address').value.trim();
        var pincode = document.getElementById('pincode').value.trim();
        var phone   = document.getElementById('phone').value.trim();
        var city    = document.getElementById('city').value.trim();

        var isValid = true;

        // name must not be empty
        if (name === '') {
            showError('name', 'Name cannot be empty');
            isValid = false;
        }

        // address must not be empty
        if (address === '') {
            showError('address', 'Address cannot be empty');
            isValid = false;
        }

        // pincode must be exactly 6 digits (regex)
        var pinRegex = /^\d{6}$/;
        if (!pinRegex.test(pincode)) {
            showError('pincode', 'Pincode must be exactly 6 digits');
            isValid = false;
        }

        // phone must be exactly 10 digits (regex)
        var phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone)) {
            showError('phone', 'Phone must be exactly 10 digits');
            isValid = false;
        }

        if (isValid) {
            if (cart.length === 0) {
                showError('name', 'Your cart is empty! Please add items first.');
                return;
            }

            // Task 7: show confirmation message on page
            var successDiv = document.getElementById('order-success');
            if (successDiv) {
                successDiv.style.display = 'block';
                successDiv.innerHTML =
                    '<h3 style="margin-bottom:8px;">Order Placed Successfully!</h3>' +
                    '<p>Thank you, ' + name + '! Your items will be delivered to ' + city + ' within 5-7 business days.</p>';
            }

            form.style.display = 'none';

            // clear cart from localStorage
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartBadge();
        }
    });
}

// Helper: show inline error message below an input
function showError(inputId, message) {
    var input = document.getElementById(inputId);
    if (!input) return;
    var err = document.createElement('div');
    err.className = 'error-text';
    err.style.cssText = 'color:red; font-size:12px; margin-top:4px;';
    err.textContent = message;
    input.parentNode.appendChild(err);
}
