const Order = require('../models/Order'); 
const Cart = require('../models/Cart');
const { errorHandler } = require('../auth');

// Controller function to create an order
module.exports.createOrder = async (req, res) => {
  try {
    // Check if the user is an admin
    if (req.user.isAdmin) {
      return res.status(403).send({ message: 'Action not allowed, User is an Admin' });
    }

    // Fetch the user's cart
    const userCart = await Cart.findOne({ userId: req.user.id });

    // Check if the cart exists
    if (!userCart) {
      return res.status(400).send({ message: 'The user has no cart' });
    }

    // Check if the cart has items
    if (userCart.cartItems.length === 0) {
      return res.status(400).send({ message: 'No items to checkout' });
    }

    const totalAmount = userCart.totalPrice;

    // Create a new order using the Order model
    const newOrder = new Order({
      userId: req.user.id,
      orderItems: userCart.cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.subtotal / item.quantity // Calculating unit price from subtotal and quantity
      })),
      totalAmount: totalAmount
    });

    // Save the new order
    const savedOrder = await newOrder.save();

    // Delete the user's cart after saving the order
    await Cart.findOneAndDelete({ userId: req.user.id });

    // Send a success response
    res.status(201).send({ message: 'Order created successfully', order: savedOrder });

  } catch (error) {
    errorHandler(error, req, res); // Use your existing error handler
  }
};

module.exports.getAllOrders = async (req, res) => {
try {
  const orders = await Order.find({});

        res.status(200).send({orders : orders});

}catch (error) {
    errorHandler(error, req, res)
  }
};



module.exports.getUserOrders = async (req, res) => {
  try {

    if (req.user.isAdmin) {
      return res.status(403).send({ message: 'Action not allowed, User is an Admin' });
    }
     
      const orders = await Order.find({ userId: req.user.id });

      
      if (!orders.length) {
          return res.status(404).json({ error: `No orders found for user ${req.user.id}` });
      }

    
      res.status(200).send({orders : orders});
  } catch (error) {
     
      errorHandler(error, req, res);
  }
};






