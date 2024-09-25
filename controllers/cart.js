const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { errorHandler } = require('../auth');

// Get Cart
module.exports.getCart = async (req, res) => {
  try {
    const cart = await Product.findOne({ userId: req.user.id })
        .populate({
            path: 'cartItems.productId',
            select: 'name'
            
        });

    if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
    }

    cart.cartItems.forEach(item => {
        item.productName = item.productId.name;
        item.productImage = item.productId.image;
    });

    res.json(cart);
} catch (error) {
    res.status(500).json({ message: error.message });
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
      return res.status(404).send({ error: 'Product not found' });
    }
    
    // Find the user's cart by userId
    Cart.findOne({ userId: req.user.id })
    .then(cart => {
      if (cart) {
        // Check if the product is already in the cart
        const itemIndex = cart.cartItems.findIndex(item => item.productId.toString() === productId);

        if (itemIndex > -1) {
          // If the product exists, update the quantity and subtotal
          cart.cartItems[itemIndex].quantity += quantity;
          cart.cartItems[itemIndex].subtotal = cart.cartItems[itemIndex].quantity * product.price;
        } else {
          // If the product doesn't exist, add it to the cart
          const newItem = {
            productId,
            quantity,
            subtotal: quantity * product.price,
            

          };

          // Create a new array with the existing cart items and the new item
          cart.cartItems = [...cart.cartItems, newItem];
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

  if (typeof newQuantity !== 'number' || newQuantity < 0) {
    return res.status(400).send({ error: 'Quantity must be a non-negative number' });
  }
  
  try {
    // Find user's cart
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).send({ error: 'Cart not found' });
    }

    // Find product in the cart
    const itemInCart = cart.cartItems.find(item => item.productId.toString() === productId);
    if (!itemInCart) {
      // Check if product exists in the database
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).send({ error: 'Product not found' });
      }

      // Add product to cart with the specified quantity by creating a new array
      cart.cartItems = [
        ...cart.cartItems,
        {
          productId: productId,
          quantity: newQuantity,
          subtotal: product.price * newQuantity
        }
      ];

    } else {
      // Handle product quantity update or removal
      if (newQuantity === 0) {
        // Remove item from cart
        cart.cartItems = cart.cartItems.filter(item => item.productId.toString() !== productId);
      } else {
        // Check if product exists in the database
        const product = await Product.findById(productId);
        if (!product) {
          return res.status(404).send({ error: 'Product not found' });
        }

        // Update item quantity and subtotal
        itemInCart.quantity = newQuantity;
        itemInCart.subtotal = product.price * newQuantity;
      }
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
    errorHandler(error, req, res);
  }
};






// Remove Product from Cart
module.exports.removeProduct = async (req, res) => {
  const { productId } = req.params;

  try {
    const cart = await Cart.findOne({userId: req.user.id});
    if (!cart) {
      return res.status(404).send({ message: 'Cart not found' });
    }else {
      const itemInCart = cart.cartItems.find(item => item.productId.toString() === productId);
      if (itemInCart) {
        cart.cartItems = cart.cartItems.filter(item => item.productId.toString() !== productId);
        // Recalculate the total price
        cart.totalPrice = cart.cartItems.reduce((acc, item) => acc + item.subtotal, 0);
      }else{
        return res.status(200).send({ error: 'Item not found in cart' });
      }
    }
    const updatedCart = await cart.save();
        return res.status(200).send({message : 'Item remove from cart successfully', updatedCart : updatedCart});
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// Clear Cart
module.exports.clearCart = async (req, res) => {

  try {
    const cart = await Cart.findOne({ userId: req.user.id });

    if(!cart) {
      return res.status(404).send({ error: 'Cart not found', cart : cart})
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
