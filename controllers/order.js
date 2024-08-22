const Order = require('../models/Order'); // Adjust the path as necessary
const Cart = require('../models/Cart'); // Adjust the path as necessary
const { errorHandler } = require('../auth'); // Import the error handler

// Controller function to create an order
module.exports.createOrder = async (req, res) => {
  try {
      const { orderItems } = req.body;
      const { userId, cartId } = req; // Assuming verify middleware adds userId and cartId to req

      // Validate required fields
      if (!orderItems || orderItems.length === 0) {
          return errorHandler(res, 400, 'Order items are required');
      }

      // Initialize totalAmount
      let totalAmount = 0;

      // Validate and fetch product details
      for (const item of orderItems) {
          if (!item.productId || !item.quantity) {
              return errorHandler(res, 400, 'Product ID and quantity are required for each item');
          }

          // Fetch product details
          const product = await Product.findById(item.productId);
          if (!product) {
              return errorHandler(res, 404, `Product with ID ${item.productId} not found`);
          }

          // Calculate total amount
          totalAmount += product.price * item.quantity;
      }

      // Create a new order
      const newOrder = new Order({
          userId,
          cartId,
          orderItems,
          totalAmount
      });

      // Save the order to the database
      const savedOrder = await newOrder.save();

      // Respond with the created order
      res.status(201).json({
          message: 'Order created successfully',
          order: savedOrder
      });
    } catch (error) {
      errorHandler(error, req, res);
    }
};
