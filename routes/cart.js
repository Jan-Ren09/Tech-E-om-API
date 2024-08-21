const express = require("express");
const cartController = require("../controllers/cart");
const {verify, verifyAdmin} = require("../auth");
const router = express.Router();

// Get cart
router.get('/', verify, cartController.getCart);

// Add to cart
router.post('/add', verify, cartController.addToCart);

// Change product quantity
router.put('/quantity', verify, cartController.updateProductQuantity);


module.exports = router;