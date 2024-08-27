const Order = require('../models/Order'); // Adjust the path as needed
const Product = require('../models/Product'); // Assuming you have a Product model
const { errorHandler } = require('../auth');

// Controller function to create an order
module.exports.createOrder = async (req, res) => {
    try {
      if (req.user.isAdmin) {
        return res.status(403).send({ message: 'Action not allowed, User is an Admin' });
      }
        const { checkOutItems } = req.body;
        const userId = req.user.id; 

   
        if (!checkOutItems || !checkOutItems.length) {
            return res.status(400).json({ error: 'No Items to Checkout' });
        }

        let orderItems = [];
        let totalAmount = 0;

    
        for (let item of checkOutItems) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ error: `Product with ID ${item.productId} not found` });
            }

            const orderItem = {
                productId: product._id,
                quantity: item.quantity,
                price: product.price,
            };

            orderItems.push(orderItem);
            totalAmount += product.price * item.quantity;
        }

        // Create a new order instance
        const newOrder = new Order({
            userId,
            orderItems,
            totalAmount
        });

        // Save the order to the database
        const savedOrder = await newOrder.save();

      
        res.status(201).json({ message: 'Ordered successfully', order: savedOrder });
    } catch (error) {
        errorHandler(error, req, res)
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
     
      const orders = await Order.find({ userId: req.user.id });

      
      if (!orders.length) {
          return res.status(404).json({ message: `No orders found for user ${req.user.id}` });
      }

    
      res.status(200).send({orders : orders});
  } catch (error) {
     
      errorHandler(error, req, res);
  }
};






