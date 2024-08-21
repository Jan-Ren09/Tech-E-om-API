const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product'); // Assuming you have a Product model
const { errorHandler } = require('../auth');

module.exports.createOrder = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming user ID is stored in req.user

    // Retrieve the user's cart
    const cart = await Cart.findOne({ userId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Extract product orders from the cart
    const productOrders = cart.items.map(item => ({
      productId: item.productId.toString(),
      quantity: item.quantity,
    }));

    // Fetch all product details
    const products = await Product.find({ _id: { $in: productOrders.map(p => p.productId) } });

    // Create a new order instance
    const order = new Order({ userId, productOrders });

    // Calculate totals and save the order
    await order.updateTotalsAndSave(products);

    // Optionally, clear the cart after creating the order
    cart.items = [];
    await cart.save();

    return res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ error: errorHandler(error) });
  }
};
