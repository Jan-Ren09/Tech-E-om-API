//[SECTION] Dependencies and Modules
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors")

//[SECTION] Routes
//Allows access to routes defined within our application
const userRoutes = require("./routes/user");
//[SECTION] Activity: Allows access to routes defined within our application
const productRoutes = require("./routes/product");
// Cart
const cartRoutes = require("./routes/cart");

const orderRoutes = require("./routes/order");

//[SECTION] Environment Setup
//const port = 4000;
require('dotenv').config();

//[SECTION] Server Setup
//Creates an "app" variable that stores the result of the "express" function that initializes our express application and allows us access to different methods that will make backend creation easy
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

const corsOptions = {
	origin: ['https://digitaldigs-vert.vercel.app'], // Allow requests from this origin (The client's URL) the origin is in Array form if there are multiple origins
	//methods: '*', //Allow only specified HTTP methods // optional only if you want to restrict the methods
	// allowedHeaders: ['Content-Type', 'Authorization'], // Allow only specified headers// optional only if you want to restrict the headers
	credentials: true,
	optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// [Section] Google Login for stretch goals

mongoose.connect(process.env.MONGO_STRING);

mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas.'))


//[SECTION] Backend Routes
//http://localhost:4000/users
// Defines the "/users" string to be included for all user routes defined in the "user" route file
// Groups all routes in userRoutes under "/users"
app.use("/users", userRoutes);

//[SECTION] Activity: Add course routes
app.use("/products", productRoutes);

// Cart routes
app.use("/cart", cartRoutes);
//
app.use("/order", orderRoutes);


//[SECTION] Server Gateway Response

if(require.main === module){
	app.listen(process.env.PORT || 3000, () => {
		console.log(`API is now online on port ${process.env.PORT || 3000 }`)
	});
}

module.exports = {app, mongoose};
