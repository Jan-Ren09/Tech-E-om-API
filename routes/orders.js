const express = require('express');
const orderController = require('../controllers/order.js');
const { verify } = require('../auth');
const router = express.Router();

router.post('/create', verify, productController.createOrder);