const Product = require('../models/Product');
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
        return res.status(201).send(result);
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
        const productId = req.params.productId;
        console.log("Updating product with ID:", productId);

        const updatedProduct = {
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
        };

        const product = await Product.findByIdAndUpdate(productId, updatedProduct, { new: true });
        console.log("Product update result:", product);

        if (product) {
            return res.status(200).send({ success: true, message: 'Product updated successfully'});
        } else {
            return res.status(404).send({ error: 'Product not found' });
        }
    } catch (error) {
        errorHandler(error, req, res);
    }
};

// Archive Product
module.exports.archiveProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);

        if (!product) {
            return res.status(404).send({ error: 'Product not found' });
        }

        if (!product.isActive) {
            return res.status(200).send({ message: 'Product already archived', archivedProduct: product });
        }

        product.isActive = false;
        const archivedProduct = await product.save();

        return res.status(200).send({ success: true, message: 'Product archived successfully' });

    } catch (error) {
        errorHandler(error, req, res);
    }
};

// Activate Product
module.exports.activateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);

        if (!product) {
            return res.status(404).send({ error: 'Product not found' });
        }

        if (product.isActive) {
            return res.status(200).send({ message: 'Product already active', activateProduct: product });
        }

        product.isActive = true;
        const updatedProduct = await product.save();

        return res.status(200).send({ success: true, message: 'Product activated successfully'});

    } catch (error) {
        errorHandler(error, req, res);
    }
};

module.exports.searchByPrice = async (req, res) => {
    const { minPrice, maxPrice } = req.body;
  
    try {
        // Build the filter query
        let filter = {};
        
        if (minPrice !== undefined) {
            const min = parseFloat(minPrice);
            if (!isNaN(min)) {
                filter.price = { ...filter.price, $gte: min }; // Greater than or equal to minPrice
            }
        }
    
        if (maxPrice !== undefined) {
            const max = parseFloat(maxPrice);
            if (!isNaN(max)) {
                filter.price = { ...filter.price, $lte: max }; // Less than or equal to maxPrice
            } 
        }
    
        // Log the constructed filter query
        console.log('Constructed Filter Query:', filter);
    
        const products = await Product.find(filter);

        // Check if any products were found
        if (products.length === 0) {
            return res.status(404).send({ message: 'No products found within that price range' });
        }
    
        return res.status(200).json(products);
    } catch (error) {
        console.error('Error:', error);
        errorHandler(error, req, res);
    }
};




module.exports.searchByName = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).send({ message: 'Please enter the product name' });
        }

        const filter = { name: { $regex: name, $options: 'i' } };
        const products = await Product.find(filter);

        if (products.length === 0) {
            return res.status(404).send({ message: 'No products found with that name' });
        }

        return res.status(200).json(products);
    } catch (error) {
        console.error('Error:', error);
        errorHandler(error, req, res);
    }
};


