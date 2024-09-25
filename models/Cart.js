const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is Required']
    },
    cartItems: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: [true, 'Product Id is Required']
            },
            quantity: {
                type: Number,
                default: 0
            },
            subtotal: {
                type: Number,
                default: 0
            },
            image: { 
                type: String,
            }
        }
    ],
    totalPrice: {
        type: Number,
        default: 0
    },
    orderedOn: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Cart', cartSchema);
