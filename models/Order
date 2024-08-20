const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
	userId: {
		type: String,
		required: [true, 'User ID is required']
	},
	productOrders: [
		{
			productId: {
				type: String,
				required: [true, 'Product ID is required']
			},
			quantity: {
				type: Number,
				default: 1
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
	},
	status: {
		type: String,
		default: 'Pending'
	}
});

// Method to calculate subtotals for each product and the total price
orderSchema.methods.calculateTotals = function(products) {
	this.productOrders.forEach(order => {
		
		const product = products.find(p => p._id.toString() === order.productId);

		// Calculate the subtotal for the current product
		if (product) {
			order.subtotal = product.price * order.quantity;
		}
	});

	// Calculate the total price by summing up all subtotals
	this.totalPrice = this.productOrders.reduce((acc, order) => acc + order.subtotal, 0);
};

// Example method to update and save order with computed totals
orderSchema.methods.updateTotalsAndSave = function(products) {
	this.calculateTotals(products);
	return this.save();
};

module.exports = mongoose.model('Order', orderSchema);
