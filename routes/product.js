const express = require('express');
const productController = require('../controllers/product');
const { verify, verifyAdmin } = require('../auth');
const router = express.Router();

// Create Product
router.post('/', verify, verifyAdmin, productController.createProduct);

// Retrieve All Product
router.get('/all', verify, verifyAdmin, productController.retrieveAllProduct);

// Retrieve All Active Product
router.get('/active', productController.retrieveAllActive);

// Filter products by name and price range
router.get('/filter-products',  productController.filterProducts);

// Retrieve Single Product
router.get("/:productId", productController.retrieveOne);

// Update Product Information
router.patch("/:productId/update", verify, verifyAdmin, productController.updateProduct)

// Archive Product
router.patch("/:productId/archive", verify, verifyAdmin, productController.archiveProduct);

// Activate Product
router.patch("/:productId/activate", verify, verifyAdmin, productController.activateProduct);


module.exports = router;