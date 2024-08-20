//[SECTION] Activity: Dependencies and Modules
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment")
const User = require("../models/User");
const { errorHandler } = require('../auth');


//[SECTION] CHAT GPT INTEGRATION getting emails of enrolled users
module.exports.getEmailsOfEnrolledUsers = async (req, res) => {
  const courseId = req.params.courseId; // Use req.params instead of req.body

  try {
    // Find the course by courseId
    const enrollments = await Enrollment.find({ 'enrolledCourses.courseId': courseId });

    if (!enrollments.length) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Get the userIds of enrolled users from the course
    const userIds = enrollments.map(enrollment => enrollment.userId);

    // Find the users with matching userIds
    const enrolledUsers = await User.find({ _id: { $in: userIds } }); // Use userIds variable instead of undefined "users"

    // Extract the emails from the enrolled users
    const emails = enrolledUsers.map(user => user.email); // Use map instead of forEach

    res.status(200).json({ userEmails: emails }); // Use the correct variable name userEmails instead of emails
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while retrieving enrolled users' });
  }
};


//[SECTION] CHAT GPT INTEGRATION Search Course Function
module.exports.searchCoursesByName = async (req, res) => {
  try {
    const { courseName } = req.body;

    // Use a regular expression to perform a case-insensitive search
    const courses = await Course.find({
      name: { $regex: courseName, $options: 'i' }
    });

    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// module.exports = {
//   searchCoursesByName
// };

//[SECTION] Activity: Create a course
/*
    Steps: 
    1. Instantiate a new object using the Course model and the request body data
    2. Save the record in the database using the mongoose method "save"
    3. Use the "then" method to send a response back to the client appliction based on the result of the "save" method
*/
// module.exports.addCourse = (req, res) => {

//     // Creates a variable "newCourse" and instantiates a new "Course" object using the mongoose model
//     // Uses the information from the request body to provide all the necessary information 

//   try {

//     let newCourse = new Course({
//         name : reqBody.name,
//         description : req.body.description,
//         price : req.body.price
//     });

//     // Saves the created object to our database
//     //Return is used here to end the controller function
//     return newCourse.save()
//     .then(result => res.send(result))
//     //Error handling is done using .catch() to capture any errors that occur during the course save operation

//     //.catch(err => err) captures the error but does not take any action, it's only capturing the error to pass it on to the next .then() or .catch() medthod in the chain. Postman is waiting for a response to be sent back to it but is not receiving anything.
//     //.catch(err => res.send(err)) captures the error and takes action by sending it back to the client with the use of res.send.
//     // Error handling is done using .catch() to catch any erros that occur during the course save operation
//     .catch(err => res.send(err));

//     } catch (err) {
//         //This will only be displayed in terminal
//         console.log("Result of console.error:")
//         console.log(err);

//         /*
//             Use console.error when:

//                  - You want to log the error for debugging and monitoring purposes, especially in production environments.
//                  - You need to log additional information or stack traces that can aid in debugging.
//                  - The information is not suitable or safe to be exposed to end-users.

//             The practice of seperating console logging/error for developers and sending clear, user-friendly error messages to the clients is a good approach for handling erros in expressJS controller.
//         */

//         // An additional try..catch block is added to catch errors that might occur during variable assignments or other sycnhronous operations.
//         res.send("Error in Variables")
//     } 
// }


module.exports.addCourse = (req, res) => {

    // Creates a variable "newCourse" and instantiates a new "Course" object using the mongoose model
    // Uses the information from the request body to provide all the necessary information 

    let newCourse = new Course({
        name : req.body.name,
        description : req.body.description,
        price : req.body.price
    });

    //[SECTION] Activity: Validate if course already exists
    //Check if course exists using the findOne() method
    Course.findOne({ name: req.body.name })
    .then(existingCourse => {
        //if existing course return true

        // Notice that we didn't response directly in string, instead we added an object with a value of a string. This is a proper response from API to Client. Direct string will only cause an error when connecting it to your frontend.
            
        // using res.send({ key: value }) is a common and appropriate way to structure a response from an API to the client. This approach allows you to send structured data back to the client in the form of a JSON object, where "key" represents a specific piece of data or a property, and "value" is the corresponding value associated with that key.
        if (existingCourse) {
            return res.status(409).send({message: 'Course Already Exists'});
        } else{
            //if not duplicate, save the course
            return newCourse.save()
            /*
            Response Body: The response body is a JSON object containing key-value pairs. It can be:

                - success: true - sending a boolean value of true indicates that the course was added successfully.
                
                - message: A descriptive message indicating that the course was added successfully. This provides clear feedback to the client about the outcome of their request.

                - result: Additional details about the newly created course. Including the result of the creation operation in the response allows the client to immediately access information about the newly created resource without needing to make an additional request.
            */
            .then(result => res.status(201).send({
                success: true,
                message: 'Course Added Successfully',
                result: result
            }))
            .catch(error => errorHandler(error, req, res));
        }
    }).catch(error => errorHandler(error, req, res));
};


//[SECTION] Activity: Retrieve all courses
/*
    Steps: 
    1. Retrieve all courses using the mongoose "find" method
    2. Use the "then" method to send a response back to the client appliction based on the result of the "find" method
*/
module.exports.getAllCourses = (req, res) => {
    return Course.find({})
    .then(result => {
        // if the result is not null send status 30 and its result
        if(result.length > 0){
            return res.status(200).send(result);
        }
        else{
            // 404 for not found courses
            return res.status(404).send({message: 'No Courses Found'});
        }
    })
    .catch(error => errorHandler(error, req, res));

};

//[SECTION] Retrieve all active courses
/*
    Steps: 
    1. Retrieve all courses using the mongoose "find" method with the "isActive" field values equal to "true"
    2. Use the "then" method to send a response back to the client appliction based on the result of the "find" method
*/
//[SECTION] Activity: Retrieve all active courses
module.exports.getAllActive = (req, res) => {

    Course.find({ isActive : true }).then(result => {
        if (result.length > 0){
            //if the course is active, return the course.
            return res.status(200).send(result);
        }
        else {
            //if there is no active courses, return 'No active courses found'.
            return res.status(200).send({ message: 'No active courses found' });
        }
    }).catch(err => res.status(500).send(err));

};


//[SECTION] Retrieve a specific course
/*
    Steps: 
    1. Retrieve a course using the mongoose "findById" method
    2. Use the "then" method to send a response back to the client appliction based on the result of the "find" method
*/
module.exports.getCourse = (req, res) => {
    Course.findById(req.params.courseId)
    .then(course => {
        if (course) {
            //if the course is found, return the course.
            return res.status(200).send(course);
        } else {
            //if the course is not found, return 'Course not found'.
            return res.status(404).send({ message: 'Course not found' });
        }
    })
    .catch(error => errorHandler(error, req, res)); 
};

//[SECTION] Update a course
/*
    Steps: 
    1. Create an object containing the data from the request body
    2. Retrieve and update a course using the mongoose "findByIdAndUpdate" method, passing the ID of the record to be updated as the first argument and an object containing the updates to the course
    3. Use the "then" method to send a response back to the client appliction based on the result of the "find" method
*/
module.exports.updateCourse = (req, res)=>{

    let updatedCourse = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price
    }

    // findByIdandUpdate() finds the the document in the db and updates it automatically
    // req.body is used to retrieve data from the request body, commonly through form submission
    // req.params is used to retrieve data from the request parameters or the url
    // req.params.courseId - the id used as the reference to find the document in the db retrieved from the url
    // updatedCourse - the updates to be made in the document
    return Course.findByIdAndUpdate(req.params.courseId, updatedCourse)
    .then(course => {
        if (course) {
            //add status 200
            res.status(200).send({ success: true, message: 'Course updated successfully' });
        } else {
            // add status 404
            es.status(404).send({ message: 'Course not found' })
        }
    })
    .catch(error => errorHandler(error, req, res));
};

//[SECTION] Archive a course
/*
    Steps: 
    1. Create an object and with the keys to be updated in the record
    2. Retrieve and update a course using the mongoose "findByIdAndUpdate" method, passing the ID of the record to be updated as the first argument and an object containing the updates to the course
    3. If a course is updated send a response of "true" else send "false"
    4. Use the "then" method to send a response back to the client appliction based on the result of the "findByIdAndUpdate" method
*/
module.exports.archiveCourse = (req, res) => {

    let updateActiveField = {
        isActive: false
    }

    Course.findByIdAndUpdate(req.params.courseId, updateActiveField)
        .then(course => {
            // Check if a course was found
            if (course) {
                // If course found, check if it was already archived
                if (!course.isActive) {
                    // If course already archived, return a 200 status with a message indicating "Course already archived".
                   return res.status(200).send({ 
                       message: 'Course already archived',
                       course: course
                       });
                }
                // If course not archived, return a 200 status with a boolean true.
                return res.status(200).send({ 
                        success: true, 
                        message: 'Course archived successfully'
                    });
            } else {
                // If course not found, return a 404 status with a boolean false.
               return res.status(404).send({ message: 'Course not found' });
            }
        })
        .catch(error => errorHandler(error, req, res));
};

//[SECTION] Activate a course
/*
    Steps: 
    1. Create an object and with the keys to be updated in the record
    2. Retrieve and update a course using the mongoose "findByIdAndUpdate" method, passing the ID of the record to be updated as the first argument and an object containing the updates to the course
    3. If the user is an admin, update a course else send a response of "false"
    4. If a course is updated send a response of "true" else send "false"
    5. Use the "then" method to send a response back to the client appliction based on the result of the "findByIdAndUpdate" method
*/
module.exports.activateCourse = (req, res) => {

    let updateActiveField = {
        isActive: true
    }
    
    Course.findByIdAndUpdate(req.params.courseId, updateActiveField)
        .then(course => {
            // Check if a course was found
            if (course) {
                // If course found, check if it was already activated
                if (course.isActive) {
                    // If course already activated, return a 200 status with a message indicating "Course already activated".
                   return res.status(200).send({ 
                       message: 'Course already activated', 
                       course: course
                   });;
                }
                // If course not yet activated, return a 200 status with a boolean true.
                return res.status(200).send({
                        success: true,
                        message: 'Course activated successfully'
                    });
            } else {
                // If course not found, return a 404 status with a boolean false.
                return res.status(404).send({ message: 'Course not found' });
            }
        })
        .catch(error => errorHandler(error, req, res));
};