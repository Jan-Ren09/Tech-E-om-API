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


module.exports.registerUser = (req, res) => {
    const { email, password, username } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate email format
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if email is already registered
    User.findOne({ email })
        .then(existingUser => {
            if (existingUser) {
                return res.status(409).json({ message: 'User email already registered' });
            }
            // Check if username is already taken
            return User.findOne({ username });
        })
        .then(existingUsername => {
            if (existingUsername) {
                return res.status(409).json({ message: 'Username already taken' });
            }

            // Hash the password and create a new user
            return bcrypt.hash(password, 10);
        })
        .then(hashedPassword => {
            const newUser = new User({
                email,
                password: hashedPassword,
                username
            });
            return newUser.save();
        })
        .then(savedUser => {
            return res.status(201).json({ message: 'Registered successfully' });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ message: 'Internal server error' });
        });
};



module.exports.loginUser = (req, res) => {

	if(req.body.email.includes("@")){
		return User.findOne({ email : req.body.email })
		.then(result => {

			//User does not exist, return false
			if(result == null) {
				
				return res.status(404).send({ error: 'No email found' });

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
		return res.status(400).send({ error: 'Invalid email' });
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
		const errorDetails = {
            stringValue: error?.stringValue || '',
            valueType: error?.kind || '',
            kind: error?.kind || '',
            value: error?.value || '',
            path: error?.path || '',
            reason: error?.reason || '',
            name: error?.name || '',
            message: error.message
	  };
	  return res.status(500).send({ error: 'Failed in Find', details: errorDetails})
	};
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
	  res.status(201).json({ message: 'Password reset successfully' });
	} catch (error) {
	  console.error(error);
	  errorHandler(error, req, res);
	}
};

module.exports.updateProfile = async (req, res) => {
    try {

        const userId = req.user.id;

       
        const { firstName, lastName, mobileNo } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { firstName, lastName, mobileNo },
            { new: true }
        );

        res.send(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Failed to update profile' });
    }
}
