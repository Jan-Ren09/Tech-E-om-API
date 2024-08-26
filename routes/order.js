const express = require("express");
const orderController = require("../controllers/order");
const {verify, verifyAdmin} = require("../auth");
const router = express.Router();

router.post('/checkout', verify, orderController.createOrder);

router.get('/get-all', verify, verifyAdmin, orderController.getAllOrders);

router.get('/userOrders', verify, orderController.getUserOrders);



module.exports = router;