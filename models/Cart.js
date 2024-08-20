const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'User ID is Required']
    },
    cartItems: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                required: [true, 'Product Id is Required']
            },
            quantity: {
                type: Number,
                default: 0
            },
            subtotal: {
                type: Number,
                default: 0
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