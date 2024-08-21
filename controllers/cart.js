const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { errorHandler } = require('../auth');

// Get Cart
module.exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findById(req.cart.id);
    if (!cart) {
      return res.status(403).send({ message: 'Invalid Cart ID' });
    }
    return res.status(200).send(cart);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// Add to Cart
module.exports.addToCart = (req, res) => {
  const { productId, quantity } = req.body;
  
  // Ensure quantity is positive
  if (quantity <= 0) {
    return res.status(400).send({ message: 'Quantity must be greater than 0' });
  }
  
  // Find the product by ID
  Product.findById(productId)
  .then(product => {
    if (!product) {
      return res.status(404).send({ message: 'Product not found' });
    }
    
    // Find the user's cart by userId
    Cart.findOne({ userId: req.user.id })
    .then(cart => {
      if (cart) {
        // Check if the product is already in the cart
        const itemIndex = cart.cartItems.findIndex(item => item.productId.toString() === productId); 
        
        if (itemIndex > -1) {
          // If it exists, update the quantity and subtotal
          cart.cartItems[itemIndex].quantity += quantity;
          cart.cartItems[itemIndex].subtotal = cart.cartItems[itemIndex].quantity * product.price;
        } else {
          // If it doesn't exist, add the new product to the cart
          const newItem = {
            productId,
            quantity,
            subtotal: quantity * product.price
          };
          cart.cartItems.push(newItem);
        }
        
        // Recalculate total price
        cart.totalPrice = cart.cartItems.reduce((acc, item) => acc + item.subtotal, 0);
        return cart.save()
        .then(updatedCart => res.status(200).send(updatedCart));
      } else {
        // If the cart doesn't exist, create a new one
        const newCart = new Cart({
          userId: req.user.id,
          cartItems: [{
            productId,
            quantity,
            subtotal: quantity * product.price
          }],
          totalPrice: quantity * product.price
        });
        
        return newCart.save()
        .then(savedCart => res.status(201).send(savedCart));
      }
    })
    .catch(err => res.status(500).send({ message: 'Error retrieving cart', error: err.message }));
  })
  .catch(err => res.status(500).send({ message: 'Error retrieving product', error: err.message }));
};




// Change Product Quantity
module.exports.updateProductQuantity = async (req, res) => {
  const { productId, quantity } = req.body;
  
  if (quantity < 0) {
    return res.status(400).send({ message: 'Quantity cannot be negative' });
  }
  
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).send({ message: 'Cart not found' });
    }
    
    const itemIndex = cart.cartItems.findIndex(item => item.productId.toString() === productId);
    
    if (itemIndex === -1) {
      return res.status(404).send({ message: 'Product not found in cart' });
    }
    
    if (quantity === 0) {
      cart.cartItems.splice(itemIndex, 1);
    } else {
      const item = cart.cartItems[itemIndex];
      item.quantity = quantity;
      
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).send({ message: 'Product not found' });
      }
      
      item.subtotal = product.price * quantity;
    }
    
    cart.totalPrice = cart.cartItems.reduce((acc, item) => acc + item.subtotal, 0);
    const updatedCart = await cart.save();
    return res.status(200).json(updatedCart);
  } catch (error) {
    errorHandler(error, req, res);
  }
};


// Remove Product from Cart
module.exports.removeProduct = async (req, res) => {
  const { productId } = req.body;

  try {
    const cart = await Cart.findOne({userId: req.user.id});
    if (!cart) {
      return res.status(404).send({ message: 'Cart not found' });
    }

    const itemIndex = cart.cartItems.findIndex(item => item.productId.toString() === productId);

    if (itemIndex === -1) {
      return res.status(404).send({ message: 'Product not found in cart' });
    }

    // Remove the product from the cart
    cart.cartItems.splice(itemIndex, 1);

    // Recalculate the total price
    cart.totalPrice = cart.cartItems.reduce((acc, item) => acc + item.subtotal, 0);

    const updatedCart = await cart.save();
    return res.status(200).json(updatedCart);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// Clear Cart
module.exports.clearCart = async (req, res) => {

  try {
    const cart = await Cart.findOne({ userId: req.user.id });

    if(!cart) {
      return res.status(404).send({ message: 'Cart not found'})
    }

    // Need cart = 0 tapos total price = 0 
    cart.cartItems = [];
    cart.totalPrice = 0

    await cart.save();
    return res.status(200).send({ message: 'Cart cleared Successfully'})
  } catch (err) {
    return res.status(500).send({ message: 'Error clearing cart', error: err.message})
  }
};
