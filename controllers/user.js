//[SECTION] Dependencies and Modules
// The "User" variable is defined using a capitalized letter to indicate that what we are using is the "User" model for the sake of code readability.
const bcrypt = require('bcrypt');
const User = require("../models/User");
// const Enrollment = require("../models/Enrollment");
const auth = require('../auth')
const { errorHandler } = require('../auth')


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


module.exports.registerUser = async (req, res) => {
	try {
	  // async and await
	  const existingUser = await User.findOne({ email: req.body.email });
	  if (existingUser) {
		return res.status(409).send({ message: 'User email already registered' });
	  }
  
	  // Checks if the email is in the correct format
	  if (!req.body.email.includes("@")) {
		return res.status(400).send({ message: 'Invalid email format' });
	  }
	  // Checks if the mobile number has the correct number of characters
	  else if (req.body.mobileNo.length !== 11) {
		return res.status(400).send({ message: 'Mobile number is invalid' });
	  }
	  // Checks if the password has at least 8 characters
	  else if (req.body.password.length < 8) {
		return res.status(400).send({ message: 'Password must be at least 8 characters long' });
	  } else {
		// If all needed requirements are met, create the new user
		let newUser = new User({
		  firstName: req.body.firstName,
		  lastName: req.body.lastName,
		  email: req.body.email,
		  mobileNo: req.body.mobileNo,
		  password: bcrypt.hashSync(req.body.password, 10)
		});
  
		// Save the new user to the database
		return newUser.save()
		  .then(result => res.status(201).send({
			message: 'User registered successfully',
			user: result
		  }))
		  .catch(error => errorHandler(error, req, res));
	  }
	} catch (error) {
	  errorHandler(error, req, res);
	}
  };



module.exports.loginUser = (req, res) => {

	if(req.body.email.includes("@")){
		return User.findOne({ email : req.body.email })
		.then(result => {

			//User does not exist, return false
			if(result == null) {
				// Send status 404
				return res.status(400).send({ error: 'No email found' });

			//User exists		
			} else {


				const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);

				// If the passwords match/result of the above code is true
				if (isPasswordCorrect)  {


					// Send status 200
					return res.status(200).send({
                        access : auth.createAccessToken(result)
                        })

				} else {
					
					 return res.status(401).send({ error: 'Email and password do not match' });
				}

			}

		})
		.catch(error => errorHandler(error, req, res));
	} else{
		return res.status(404).send({ error: 'Invalid email' });
	}
}


module.exports.checkEmailExists = (req, res) => {

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


module.exports.getProfile = (req, res) => {
    return User.findById(req.user.id)
    .then(user => {

        if(!user){
            // if the user has invalid token, send a message 'invalid signature'.
            return res.status(404).send({ error: 'User not found' })
        }else {
            // if the user is found, return the user.
            user.password = "";
            return res.status(200).send({user : 
				{_id : user.id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				isAdmin : user.isAdmin,
				mobileNo: user.mobileNo,
				__v : user._
			}});
        }  
    })
    .catch(error => errorHandler(error, req, res));
};

module.exports.makeUserAdmin = async (req, res) => {
    try {
        // Find the user by the id provided in the URL params
        const user = await User.findById(req.params.id);

        // Update the user's role to admin
        user.isAdmin = true;

        // Save the updated user
        await user.save();

        res.status(200).json({ updatedUser: user});
    } catch (error) {
		res.status(500).send({error: "Failed in Find", details : error});
	  }
};


module.exports.changePassword = async (req, res) => {
	try {
	  const { newPassword } = req.body;
	  const { id } = req.user; // Extracting user ID from the authorization header
  
	  // Hashing the new password
	  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
	  // Updating the user's password in the database
	  await User.findByIdAndUpdate(id, { password: hashedPassword });
  
	  // Sending a success response
	  res.status(200).json({ message: 'Password reset successfully' });
	} catch (error) {
	  console.error(error);
	  errorHandler(error, req, res);
	}
};
