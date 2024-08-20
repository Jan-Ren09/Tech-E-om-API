//[SECTION] Dependencies and Modules
const express = require("express");
const mongoose = require("mongoose");
// Google Login
const passport = require('passport');
const session = require('express-session');
require('./passport');
// Allows our backend application to be available to our frontend application
// Allows us to control the app's Cross Origin Resource Sharing settings
const cors = require("cors")

//[SECTION] Routes
//Allows access to routes defined within our application
const userRoutes = require("./routes/user");
//[SECTION] Activity: Allows access to routes defined within our application
const courseRoutes = require("./routes/course");

//[SECTION] Environment Setup
//const port = 4000;
require('dotenv').config();

//[SECTION] Server Setup
//Creates an "app" variable that stores the result of the "express" function that initializes our express application and allows us access to different methods that will make backend creation easy
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

const corsOptions = {
	origin: ['http://localhost:8000'], // Allow requests from this origin (The client's URL) the origin is in Array form if there are multiple origins
	//methods: '*', //Allow only specified HTTP methods // optional only if you want to restrict the methods
	// allowedHeaders: ['Content-Type', 'Authorization'], // Allow only specified headers// optional only if you want to restrict the headers
	credentials: true,
	optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// [Section] Google Login
// Creates a session with the given data
// resave prevents the session from overwriting the secret while the session is active
// saveUninitialized prevents the data from storing data in the session while the data has not yet been initialized
app.use(session({
    secret: process.env.clientSecret,
    resave: false,
    saveUninitialized: false
}));
// Initializes the passport package when the application runs
app.use(passport.initialize());
// Creates a session using the passport package
app.use(passport.session());


mongoose.connect(process.env.MONGO_STRING);

mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas.'))


//[SECTION] Backend Routes
//http://localhost:4000/users
// Defines the "/users" string to be included for all user routes defined in the "user" route file
// Groups all routes in userRoutes under "/users"
app.use("/users", userRoutes);

//[SECTION] Activity: Add course routes
app.use("/courses", courseRoutes);


//[SECTION] Server Gateway Response

if(require.main === module){
	app.listen(process.env.PORT || 3000, () => {
		console.log(`API is now online on port ${process.env.PORT || 3000 }`)
	});
}

module.exports = {app, mongoose};