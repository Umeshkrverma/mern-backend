const express = require('express');
const { createUser, loginUser, logout, forgotPassword, resetPassword, getUserDetails, updatePassword, updateProfile, getUsers, getUserdata, updateUserRole, deleteUser } = require('../controllers/usercontrollers');
const router = express.Router();
const { isUserAuthenticated, authRole } =  require('../middlewares/auth');

//regestering a new user
router.route("/register").post(createUser);
//login a user
router.route("/login").post(loginUser);
//forget password
router.route("/forget/reset").post(forgotPassword);
//reset password
router.route("/reset/:token").put(resetPassword);
//logout a user
router.route("/logout").get(logout);
//getting users self details
router.route("/me").get(isUserAuthenticated,getUserDetails);
//upadting user password
router.route("/password/update").put(isUserAuthenticated,updatePassword);
//updating user profile details
router.route("/me/update").put(isUserAuthenticated, updateProfile);
// getting all users details
router.route("/admin/users").get(isUserAuthenticated,authRole("admin"),getUsers);
//getting all the details of the user by id
router.route("/admin/:id")
.get(isUserAuthenticated,authRole("admin"),getUserdata)
.put(isUserAuthenticated,authRole("admin"),updateUserRole)
.delete(isUserAuthenticated,authRole("admin"),deleteUser);




module.exports = router;
