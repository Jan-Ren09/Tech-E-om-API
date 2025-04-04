const jwt = require("jsonwebtoken");

require('dotenv').config()


//[SECTION] Token Creation
/*
	Analogy 
		Pack the gift and provide a lock with the secret code as the key
*/

module.exports.createAccessToken = (user) => {
	const data = {
		id: user._id,
		email : user.email,
		isAdmin : user.isAdmin
	}
	//Generate a JSON web token using the jwt's sign method
	//Generates the token using the data and the secret code with no additional options provided
	//SECRET_KEY is a User defined string data that will be used to create our JSON web tokens (found in the .env)
	// Used in algorithm for encrypting our data which makes it difficult to decode the information without the defined secret keyword
	// Since this is a critical data, we will use the .env to secure the secret key. "Keeping your secrets secret"
	return jwt.sign(data, process.env.JWT_SECRET_KEY, {});

}


//[SECTION] Token Verification
/*
	Analogy 
		Receive the gift and open the lock to verify if the sender is legitimate and the gift was not tampered.
	- Verify will be used as a middleware in ExpressJS. Functions added as argument in an expressJS route are considered as middleware. 

	- Middlewares is a able to receive the request and response objects as well as what we call the next() function. 
*/

module.exports.verify = (req, res, next) => {
	console.log(req.headers.authorization)

	let token = req.headers.authorization

	if(typeof token === "undefined"){
		return res.status(401).send ({ auth: "Failed. No Token"})
	} else {
		console.log(token);
		token = token.slice(7, token.length)
		console.log(token)

		jwt.verify(token, process.env.JWT_SECRET_KEY, function(err, decodedToken){

			if (err){
				return res.status(403).send({
					auth: "Failed",
					message: err.message
				})
			} else {
				console.log("result from verify method:")
				console.log(decodedToken);
				//if our token is verified  to be correct, then we will update the request and add the user's decoded token details
				req.user = decodedToken

				//it passes details of the request and response to the next function/middleware
				next()
			}
		})
	}
}

//[SECTION] Verify Admin?
module.exports.verifyAdmin = (req, res, next) => {
	//Checks if the owner of the token is an admin
	if(req.user.isAdmin){
		//If it is, move to the next middleware/controller using the next() method
		next()
	} else {
		//Else, end the request-response cycle by sending a status code 403 indicating that the action is forbidden.
		return res.status(403).send({
			auth: "Failed",
			message: "Action Forbidden"
		})
	}
}


//[SECTION] Error Handler
module.exports.errorHandler = (err, req, res, next) => {
	//Logging the error
	console.error(err)

	const statusCode = err.status || 500;
	const errorMessage = err.message || 'Internal Server Error';
	//Sends a standardized error response
	res.status(statusCode).json({
		error: {
			message: errorMessage,
			errorCode: err.code || 'SERVER_ERROR',
			details: err.details || null
		}
	});
};

//[SECTION] Middleware is to check if the user is authenticated
module.exports.isLoggedIn = (req, res, next) => {
	if (req.user) {
		next();
	} else {
		res.sendStatus(401);
	}
}	