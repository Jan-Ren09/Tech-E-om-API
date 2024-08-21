const Product = require('../models/Products');
const { errorHandler } = require('../auth');

// Create Product
module.exports.createProduct = async (req, res) => {
    try {
        const existingProduct = await Product.findOne({ name: req.body.name });
        if (existingProduct) {
            return res.status(409).send({ message: 'Product already exists' });
        }

        const newProduct = new Product({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
        });

        const result = await newProduct.save();
        return res.status(201).send({
            success: true,
            message: 'Product has been added',
            result,
        });
    } catch (error) {
        errorHandler(error, req, res);
    }
};

// Retrieve all products
module.exports.retrieveAllProduct = async (req, res) => {
    try {
        const result = await Product.find({});
        if (result.length > 0) {
            return res.status(200).send(result);
        } else {
            return res.status(404).send({ message: 'No Product Found' });
        }
    } catch (error) {
        errorHandler(error, req, res);
    }
};

// Retrieve all active products
module.exports.retrieveAllActive = async (req, res) => {
    try {
        const result = await Product.find({ isActive: true });
        if (result.length > 0) {
            return res.status(200).send(result);
        } else {
            return res.status(200).send({ message: 'No active products found' });
        }
    } catch (error) {
        errorHandler(error, req, res);
    }
};

// Retrieve single product
module.exports.retrieveOne = async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);
        if (!product) {
            return res.status(404).send({ message: 'Invalid product ID' });
        } else {
            return res.status(200).send(product);
        }
    } catch (error) {
        errorHandler(error, req, res);
    }
};

// Update product
module.exports.updateProduct = async (req, res) => {
    try {
        const updatedProduct = {
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
        };

        const product = await Product.findByIdAndUpdate(req.params.productId, updatedProduct, { new: true });
        if (product) {
            return res.status(200).send({ success: true, message: 'Product updated successfully', product });
        } else {
            return res.status(404).send({ message: 'Product not found' });
        }
    } catch (error) {
        errorHandler(error, req, res);
    }
};

// Archive Product
module.exports.archiveProduct = async (req, res) => {
    try {
        const updateActiveField = { isActive: false };
        const product = await Product.findByIdAndUpdate(req.params.productId, updateActiveField, { new: true });

        if (product) {
            if (!product.isActive) {
                return res.status(200).send({ message: 'Product already archived', product });
            }
            return res.status(200).send({ success: true, message: 'Product archived successfully' });
        } else {
            return res.status(404).send({ message: 'Product not found' });
        }
    } catch (error) {
        errorHandler(error, req, res);
    }
};

// Activate Product
module.exports.activateProduct = async (req, res) => {
    try {
        const updateActiveField = { isActive: true };
        const product = await Product.findByIdAndUpdate(req.params.productId, updateActiveField, { new: true });

        if (product) {
            if (product.isActive) {
                return res.status(200).send({ message: 'Product already activated', product });
            }
            return res.status(200).send({ success: true, message: 'Product activated successfully' });
        } else {
            return res.status(404).send({ message: 'Product not found' });
        }
    } catch (error) {
        errorHandler(error, req, res);
    }
};
