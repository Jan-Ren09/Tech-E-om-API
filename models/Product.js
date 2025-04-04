const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    description: {
        type: String,
        required: [true, 'Course Description is Required']
    },
    price: {
        type: Number,
        required: [true, 'Course Price is Required']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    image: { 
        type: String,
        required: [true, 'Image URL is required'] 
    }
});

module.exports = mongoose.model('Product', productSchema);
