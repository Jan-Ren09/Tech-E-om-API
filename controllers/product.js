const Product = require('../models/Products');
const User = require('../models/User');
const { errorHandler } = require('../auth')

// Create Product
module.exports.createProduct = (req, res) => {
    
    let newProduct = new Product({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price
    });

    Product.findOne({ name: req.body.name })
    .then(existingProduct => {

        if (existingCourse) {
            return res.status(409).send({ message: 'Product already exists'});

        } else {
            return newProduct.save()
            .then(resutl => res.status(201).send({
                success: true,
                message: 'Product has been added',
                result: result
            }))
            .catch(error => errorHandler(error, req, res));
        }
    }).catch(error => errorHandler(error, req, res));
};

// Retrieve all product
module.exports.retrieveAllProduct = (req, res) => {
    return Product.find({})
    .then(result => {

        if(result.length > 0){
            return res.status(200).send(result);
        } else {
            return res.status(404).send({message: 'No Product Found'});
        }

    })
    .catch(error => errorHandler(error, req, res));

}

// Retrieve all active product
module.exports.retrieveAllActive = (req, res) => {

    Course.find({ isActive : true }).then(result => {

        if (result.length > 0){
            return res.status(200).send(result);

        } else {
            return res.status(200).send({ message: 'No active courses found' });
        }

    }).catch(err => res.status(500).send(err));

};

// Retrieve single product
module.exports.retrieveOne = (req, res) => {
    return Product.findById(req.product.id)
    .then(prodcut => {
        
        if(!product) {
            return res.status(403).send({ message: 'Invalid product ID'});

        } else {
            return res.status(200).send(product);
        }
    })
    .catch(error => errorHandler(error, req, res));
};

// Update product
module.exports.updateProduct = (req, res) => {
    let updatedProduct = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price
    }

    return Course.findByIdAndUpdate(req.params.productId, updatedProduct)
    .then(product => {
        if (product) {

            res.status(200).send({ success: true, message: 'Course updated successfully' });
        } else {

            es.status(404).send({ message: 'Course not found' })
        }
    })
    .catch(error => errorHandler(error, req, res));
};