//[SECTION] Dependencies and Modules
// The "User" variable is defined using a capitalized letter to indicate that what we are using is the "User" model for the sake of code readability.
const bcrypt = require('bcrypt');
const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const auth = require('../auth')
const { errorHandler } = require('../auth')

//[SECTION] CHAT GPT Integration for additional features update profile
module.exports.updateProfile = async (req, res) => {
  try {
    // Get the user ID from the authenticated token
    const userId = req.user.id;

    // Retrieve the updated profile information from the request body
    const { firstName, lastName, mobileNo } = req.body;

    // Update the user's profile in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, mobileNo },
      { new: true }
    );

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
}

// module.exports = {
//   updateProfile,
// };



//[SECTION] CHAT GPT Integration for additional features RESET PASSWORD
module.exports.resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    //update the userId to id because our version of req.user does not have userId property but id property instead.
    const { id } = req.user; // Extracting user ID from the authorization header

    // Hashing the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    //Update userId to id
    // Updating the user's password in the database
    await User.findByIdAndUpdate(id, { password: hashedPassword });

    // Sending a success response
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



// module.exports = {
//   resetPassword
// };

//[SECTION] User registration
/*
	Steps: 
		1. Create a new User object using the mongoose model and the information from the request body
		2. Make sure that the password is encrypted
		3. Save the new User to the database
*/

module.exports.registerUser = (req, res) => {
	//Creates a variable "newUser" and instantitates a new "User" object using the mongoose model we've provided
	// Uses the information from the request body to provide all the necessary information.
	// Checks if the email is in the right format
    if (!req.body.email.includes("@")){
        return res.status(400).send({ message: 'Invalid email format' });
    }
    // Checks if the mobile number has the correct number of characters
    else if (req.body.mobileNo.length !== 11){
        return res.status(400).send({ message: 'Mobile number is invalid' });
    }
    // Checks if the password has atleast 8 characters
    else if (req.body.password.length < 8) {
        return res.status(400).send({ message: 'Password must be atleast 8 characters long' });
    // If all needed requirements are achieved
    } else {
        let newUser = new User({
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            email : req.body.email,
            mobileNo : req.body.mobileNo,
            password : bcrypt.hashSync(req.body.password, 10)
        })

	    return newUser.save()
	            // if all needed requirements are achieved, send a success message 'User registered successfully' and return the newly created user.
	            .then((result) => res.status(201).send({
	                message: 'User registered successfully',
	                user: result
	            }))
	            .catch(error => errorHandler(error, req, res));
	        }
	    };

//[SECTION] User authentication
/*
	Steps:
		1. Check the database if the user email exists
		2. Compare the password provided in the login form with the password stored in the database
		3. Generate/return a JSWON web token if the user is successfully logged in and return false if not
*/

module.exports.loginUser = (req, res) => {
	// The "findOne" method returns the first record in the collection that matches the search criteria
	// We use the "findOne" method instead of the "find" method which returns all records that match the search criteria
	if(req.body.email.includes("@")){
		return User.findOne({ email : req.body.email })
		.then(result => {

			//User does not exist, return false
			if(result == null) {
				// Send status 404
				return res.status(404).send({ message: 'No email found' });

			//User exists		
			} else {

				//Create the variable "isPasswordCorrect" to return the resulf of comparing the login form password and the database password
				// The "compareSync" method is used to compare a non encrypted password from the login form (req.body) to the encrypted password retrieved from the database, this returns "true" or "false" value depending on the comparisopn
				// A good coding practice for the boolean variable/constants is to use the "is" or "are" at the beginning in the form of is + Noun 
					// example. isSing, isDone, isAdmin, areDone etc.
				const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);

				// If the passwords match/result of the above code is true
				if (isPasswordCorrect)  {

					//Generate an access token
					//Uses the "createAccessToken" method defined in our "auth.js" file
					// Returning an object back to client application is common practice just for us to ensure information is properly labled and real world examples normally return more complex information represented by objects

					// Send status 200
					return res.status(200).send({ 
                        message: 'User logged in successfully',
                        access : auth.createAccessToken(result)
                        })

				//Passwords do not match simply return the boolean value of false.
				} else {
					// Send status 401
					 return res.status(401).send({ message: 'Incorrect email or password' });
				}

			}

		})
		.catch(error => errorHandler(error, req, res));
	} else{
		return res.status(400).send({ message: 'Invalid email format' });
	}
}

//[SECTION] Check if the email already exists
/*
    Steps: 
    1. Use mongoose "find" method to find duplicate emails
    2. Use the "then" method to send a response back to the client appliction based on the result of the "find" method
*/
module.exports.checkEmailExists = (req, res) => {
/*
	- The status code of a response is a three-digit integer code that describes the result of the request and the semantics of the response, including whether the request was successful and what content is enclosed (if any). All valid status codes are within the range of 100 to 599, inclusive.
	- The first digit of the status code defines the class of response. The last two digits do not have any categorization role. There are five values for the first digit:
	- 1xx (Informational): The request was received, continuing process
	- 2xx (Successful): The request was successfully received, understood, and accepted
	- 3xx (Redirection): Further action needs to be taken in order to complete the request
	- 4xx (Client Error): The request contains bad syntax or cannot be fulfilled
	- 5xx (Server Error): The server failed to fulfill an apparently valid request
	- HTTP response status codes indicate whether or not a specific HTTP request has been successfully completed
	- For a get request, 200 code refers to successful request, meaning the server processed the request and returned a response back to the client without any errors
	
	Mini activity instructions: 
	
	If there is a duplicate email send true with the correct status code back to the client

	IF there is no duplicate email, send false with the appropriate status code back to the client

	If an error occured in the .catch() / in the server's end, send the error with the 500 http status back to the client.


*/
    // The result is sent back to the client via the "then" method found in the route file
    if(req.body.email.includes("@")){
	    return User.find({ email : req.body.email })
	    .then(result => {

	        // The "find" method returns a record if a match is found
	        if (result.length > 0) {

	            return res.status(409).send({message: "Duplicate email found"})
	            // This is the http status code for duplicate record which is used when there is another resource with the same data in the request. (e.g. email/accounts)
	        // No duplicate email found
	        // The user is not yet registered in the database
	        } else {
	        	// 404 refers to documents or resources that are not found e.g. pages in the website or the documents/resources that are not found in the database.
	            return res.status(404).send({message: "No Duplicate email found"});
	        };
	    })
	    .catch(error => errorHandler(error, req, res));
    }else{
    	res.status(400).send({message: "Invalid email format"})
    }
};

//[Section] Activity: Retrieve user details
/*
    Steps:
    1. Retrieve the user document using it's id
    2. Change the password to an empty string to hide the password
    3. Return the updated user record
*/
module.exports.getProfile = (req, res) => {
    return User.findById(req.user.id)
    .then(user => {

        if(!user){
            // if the user has invalid token, send a message 'invalid signature'.
            return res.status(403).send({ message: 'invalid signature' })
        }else {
            // if the user is found, return the user.
            user.password = "";
            return res.status(200).send(user);
        }  
    })
    .catch(error => errorHandler(error, req, res));
};

//[SECTION] Enroll a user to a course
/*
	Steps: 
	1. Retrieve the user's id
	2. Double check the token/decoded after our middleware
	3. Try to indicate the courses being enrolled to in our reqeuest body
	4. Make sure to check the users authentication (reg user or admin user)
	5. Make sure that this function is only available to the regular users.
*/

module.exports.enroll = (req, res) => {
	//The user's id from the decoded token after verify
	console.log(req.user.id);
	//The course from our requesst body
	console.log(req.body.enrolledCourses);

	// an admin shouldn't have the capability to enroll in the course booking api
	if(req.user.isAdmin){
		return res.status(403).send({ message: 'Admin is forbidden' });
	}

	let newEnrollment = new Enrollment ({
		userId: req.user.id,
		enrolledCourses: req.body.enrolledCourses,
		totalPrice: req.body.totalPrice
	})

	return newEnrollment.save()
	.then(enrolled => {
		return res.status(201).send({
            success: true,
            message: 'Enrolled successfully'
        });
	})
	.catch(error => errorHandler(error, req, res))
}


//[SECTION] Activity: Get enrollments
/*
    Steps:
    1. Use the mongoose method "find" to retrieve all enrollments for the logged in user
    2. If no enrollments are found, return a 404 error. Else return a 200 status and the enrollment record
*/
module.exports.getEnrollments = (req, res) => {
    return Enrollment.find({userId : req.user.id})
	    .then(enrollments => {
	        if (enrollments.length > 0) {
	            return res.status(200).send(enrollments);
	        }
	        return res.status(404).send({
                    message: 'No enrolled courses'
                });
	    })
	    .catch(error => errorHandler(error, req, res));
};	