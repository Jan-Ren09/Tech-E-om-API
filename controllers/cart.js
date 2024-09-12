const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { errorHandler } = require('../auth');

// Get Cart
module.exports.getCart = async (req, res) => {
  try {

    const cart = await Cart.findOne({ userId: req.user.id });
    
    if (!cart) {
      return res.status(404).send({ error: 'Cart not found' });
    }
    return res.status(200).send({cart : cart});

  } catch (error) {
    errorHandler(error, req, res);
  }
};

// Add to Cart
module.exports.addToCart = (req, res) => {
    
  const userId  = req.user.id;
  const { productId, quantity, subtotal } = req.body;

  return Cart.findOne({ userId: userId })
  .then(cart => {
      console.log({ cart: cart });
      if(!cart) {
          const newCart = new Cart({
              userId: userId,
              cartItems: [{
                  productId: productId,
                  quantity: quantity,
                  subtotal: subtotal
              }],
              totalPrice: subtotal
          })

          return newCart.save()
          .then(savedCart => {
              if(!savedCart){
                  return res.status(404).send({error: "Failed to save cart"});
              } else {
                  return res.status(201).send({ 
                      message: "Item added to cart successfully",
                      cart: savedCart
                  });
              }
          })
          .catch(error => res.status(500).json({ error: 'Internal server Error', error }))
        } else {
            const cartItemIndex = cart.cartItems.findIndex(item => item.productId.toString() === productId);

            if(cartItemIndex >= 0) {
                cart.cartItems[cartItemIndex].quantity += quantity;
                cart.cartItems[cartItemIndex].subtotal += subtotal; 
            } else {
                const newCartItem = {
                    productId: productId,
                    quantity: quantity,
                    subtotal: subtotal
                };
                cart.cartItems.push(newCartItem);
            }

            cart.totalPrice = cart.cartItems.reduce((total, item) => total + item.subtotal, 0);

            return cart.save()
            .then(addCart => {
                return res.status(201).json({ 
                    message: 'Item added to cart successfully',
                    cart: addCart
                })
            })
            .catch(error => res.status(500).json({ error: 'Internal server Error', error }))
        }
    }) 
    .catch(error => res.status(500).json({ error: 'Failed to find cart', error }))

}



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
