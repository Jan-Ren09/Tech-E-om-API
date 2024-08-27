const express = require("express");
const cartController = require("../controllers/cart");
const {verify, verifyAdmin} = require("../auth");
const router = express.Router();

// Get cart
router.get('/get-cart', verify, cartController.getCart);

// Add to cart
router.post('/add-to-cart', verify, cartController.addToCart);

// Change product quantity
router.patch('/update-cart-quantity', verify, cartController.updateProductQuantity);

// Remove product
router.patch('/:productId/remove-from-cart', verify, cartController.removeProduct);

// Clear cart
router.put('/clear-cart', verify, cartController.clearCart);

module.exports = router;