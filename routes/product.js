const express = require('express');
const productController = require('../controllers/product');
const { verify, verifyAdmin } = require('../auth');
const router = express.Router();

// Create Product
router.post('/create', verify, verifyAdmin, productController.createProduct);

// Retrieve All Product
router.get('/all', productController.retrieveAllProduct);

// Retrieve All Active Product
router.get('/', productController.retrieveAllActive);

// Retrieve Single Product
router.get("/search", productController.retrieveOne);

// Update Product Information
router.patch("/:productId", verify, verifyAdmin, productController.updateProduct)

module.exports = router;