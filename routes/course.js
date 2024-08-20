//[SECTION] Activity: Dependencies and Modules
const express = require("express");
const courseController = require("../controllers/course");
const auth = require("../auth");

//Deconstruct the "auth" module so that we can simply store "verify" and "verifyAdmin" in their variables and reuse it in our routes.
const { verify, verifyAdmin } = auth

//[SECTION] Activity: Routing Component
const router = express.Router();


//[SECTION CHAT GPT INTEGRATION]
router.post('/search', courseController.searchCoursesByName);

router.post('/:courseId/enrolled-users', courseController.getEmailsOfEnrolledUsers);

//[SECTION] Activity: Route for creating a course
router.post("/", verify, verifyAdmin, courseController.addCourse);

//[SECTION] Activity: Route for retrieving all courses
router.get("/all", verify, verifyAdmin, courseController.getAllCourses);

//[SECTION] Two added routes for the activity
router.get("/", courseController.getAllActive);

router.get("/specific/:id", courseController.getCourse);
//[SECTION] Activity: Export Route System
// Allows us to export the "router" object that will be accessed in our "index.js" file


//[SECTION] Route for updating a course (Admin)
router.patch("/:courseId", verify, verifyAdmin, courseController.updateCourse);

//[SECTION] Activity: Route to archiving a course (Admin)
router.patch("/:courseId/archive", verify, verifyAdmin, courseController.archiveCourse);

//[SECTION] Activity: Route to activating a course (Admin)
router.patch("/:courseId/activate", verify, verifyAdmin, courseController.activateCourse);


module.exports = router;