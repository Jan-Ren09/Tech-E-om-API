const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { errorHandler } = require('../auth');

// Get Cart
module.exports.getCart = async (req, res) => {
  try {
    if (req.user.isAdmin) {
      return res.status(403).send({ message: 'Admins cannot access the cart' });
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    
    if (!cart) {
      return res.status(404).send({ message: 'Cart not found' });
    }
    return res.status(200).send({cart : cart});

  } catch (error) {
    errorHandler(error, req, res);
  }
};

// Add to Cart
module.exports.addToCart = (req, res) => {
  const { productId, quantity } = req.body;

  // Admin should not be able to add to cart
  if(req.user.isAdmin) {
    return res.status(403).send({ message: 'Admins cannot add to cart'});
  }
  
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
        .then(updatedCart => res.status(200).send({
          message : `Item added to cart successfully`,
          updatedCart : updatedCart}));
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
        .then(savedCart => res.status(201).send({message : `Item added to cart successfully`,
          cart : savedCart}));
      }
    })
    .catch(err => res.status(500).send({ message: 'Error retrieving cart', error: err.message }));
  })
  .catch(error => errorHandler(error, req, res));
};




// Change Product Quantity
module.exports.updateProductQuantity = async (req, res) => {
  const { productId, newQuantity } = req.body;

  // Ensure non-admin users can perform this action
  if (req.user.isAdmin) {
    return res.status(403).send({ message: 'Admins cannot change cart quantity' });
  }

  // Ensure new quantity is a valid, non-negative number
  if (newQuantity === undefined || typeof newQuantity !== 'number' || newQuantity < 0) {
    return res.status(400).send({ message: 'Quantity must be a non-negative number' });
  }

  try {
    // Find user's cart
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).send({ message: 'Cart not found' });
    }

    // Find product in the cart
    const itemInCart = cart.cartItems.find(item => item.productId.toString() === productId);
    if (!itemInCart) {
      return res.status(404).send({ message: 'Product not found in cart' });
    }

    // Handle product quantity update or removal
    if (newQuantity === 0) {
      // Remove item from cart
      cart.cartItems = cart.cartItems.filter(item => item.productId.toString() !== productId);
    } else {
      // Check if product exists in the database
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).send({ message: 'Product not found' });
      }

      // Update item quantity and subtotal
      itemInCart.quantity = newQuantity;
      itemInCart.subtotal = product.price * newQuantity;
    }

    // Recalculate total price for the cart
    cart.totalPrice = cart.cartItems.reduce((acc, item) => acc + item.subtotal, 0);

    // Save the updated cart and return success response
    const updatedCart = await cart.save();
    return res.status(200).send({
      message: 'Item quantity updated successfully',
      updatedCart: updatedCart
    });

  } catch (error) {
    errorHandler(error, req, res); // Ensure proper error handling
  }
};





// Remove Product from Cart
module.exports.removeProduct = async (req, res) => {
  const { productId } = req.params;

  try {
    if (req.user.isAdmin){
      return res.status(403).send({ message: 'Action not allowed: user is an Admin' });
    }
    const cart = await Cart.findOne({userId: req.user.id});
    if (!cart) {
      return res.status(404).send({ message: 'Cart not found' });
    }

    const itemIndex = cart.cartItems.findIndex(item => item.productId.toString() === productId);

    if (itemIndex === -1) {
      return res.status(200).send({ message: 'Failed to remove, Item not found in cart' });
    }

    // Remove the product from the cart
    cart.cartItems.splice(itemIndex, 1);

    // Recalculate the total price
    cart.totalPrice = cart.cartItems.reduce((acc, item) => acc + item.subtotal, 0);

    const updatedCart = await cart.save();
    return res.status(200).send({message : 'Item remove from cart successfully', updatedCart : updatedCart});
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// Clear Cart
module.exports.clearCart = async (req, res) => {

  try {
    if (req.user.isAdmin){
      return res.status(403).send({ message: 'Action not allowed: user is an Admin' });}

    const cart = await Cart.findOne({ userId: req.user.id });

    if(!cart) {
      return res.status(404).send({ message: 'Cart not found', cart : cart})
    }

    // Need cart = 0 tapos total price = 0 
    cart.cartItems = [];
    cart.totalPrice = 0

    await cart.save();
    return res.status(200).send({ message: 'Cart cleared Successfully', 
      cart : cart
    })
  } catch (error) {
    errorHandler(error, req, res);
  }
};
