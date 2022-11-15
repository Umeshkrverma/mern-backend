const ErrorHandler = require('../utils/errorHandler');
const CatchAsyncError = require('../middlewares/CatchAsyncError');
const User = require('../models/usermodel');
const setToken = require('../utils/jwtTokens');
const sendEmail = require('../utils/sendEmail.js');
const crypto = require('crypto');

//regestering a new user
exports.createUser = CatchAsyncError(async (req, res, next) => {
    const { name, password, email } = req.body;

    const user = await User.create({
        name: name,
        email: email,
        password: password,
        avatar: {
            public_id: 'my avatar',
            url: 'myavatar.com'
        }
    })
    setToken(user, 201, res)
})

//user login
exports.loginUser = CatchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    // check if user has entered email & password
    if (!email || !password) {
        return next(new ErrorHandler("Please Enter email & Password", 400))
    }
    // if all fields entered find the user *** use unique attribute
    const user = await User.findOne({ email }).select("+password");
    // if user is not found
    if (!user) {
        return next(new ErrorHandler("invalid email or password", 401))
    }
    let isPasswordMatched = await user.comparePassword(password); //check password before  generating token

    if (!isPasswordMatched) {
        return next(new ErrorHandler("invalid email or password", 401))
    }
    else {
        setToken(user, 200, res);
    }
})
//user logout
exports.logout = CatchAsyncError(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });
    res.json({
        success: true,
        message: "logged out"
    })
})
//forgot password method
exports.forgotPassword = CatchAsyncError(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        next(new ErrorHandler("User not found", 404))
    }
    // get reset password token
    const resetToken = user.getPasswordToken();

    //saving token generated
    await user.save({ validateBeforeSave: false })

    //generating mail url
    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/user/reset/${resetToken}`;
    const message = `your password reset link is :\n\n ${resetPasswordUrl} \n\n 
    if you have not requested it then,  Please ignore it `;

    try {
        await sendEmail({
            email: user.email,
            subject: `E-commerce password recovery`,
            message
        })
        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`
        })

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false })
        return next(new ErrorHandler(error.message, 500))
    }
})
//reset password method after reset mail is sent
exports.resetPassword = CatchAsyncError(async (req, res, next) => {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })
    if (!user) {
        return next(new ErrorHandler("Reset password token is invalid or expired", 400))
    }
    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Confirm password must exactly match above password", 400))
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false })
    setToken(user, 200, res)
})

//get user deatails
exports.getUserDetails = CatchAsyncError(async(req, res ,next)=>{
   const user =  await User.findById(req.user.id)

   res.status(200).json({
    success:true,
    user
   })
})

//update user passwords
exports.updatePassword = CatchAsyncError(async(req, res ,next)=>{

    const user = await User.findById(req.user.id).select("+password");
    const isPasswordMatched =await user.comparePassword(req.body.oldPassword);
    if(!isPasswordMatched){
        return next(new ErrorHandler("Old password is incorrect", 400))
    }
    if(req.body.newpassword !== req.body.confirmPassword){
        return next(new ErrorHandler("password should match exactly match confirm password", 400))
    }

    user.password = req.body.newpassword;
    await user.save();
    setToken(user , 200, res)
})

//update user profile deatils
exports.updateProfile = CatchAsyncError(async(req,res,next)=>{

    const newUser  = {
        name: req.body.name,
        email: req.body.email
    }
    // we will use cloudify
    const user =await User.findByIdAndUpdate(req.user.id, newUser,{
        new:true,
        runValidators:true,
        useFindAndModify:false,
      
    });
    res.status(200).json({
        success:true
    })
})
// getting users deatils who are registered --admin

exports.getUsers = CatchAsyncError(async(req,res,next)=>{
    const users = await User.find();
    res.status(200).json({
        success:true,
        users
    })
})
//getting deatils of a single user by ---  admin

exports.getUserdata = CatchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler("user not found", 400))
    }
    res.status(200).json({
        success:true,
        user
    })
})

//update user roles by admin
exports.updateUserRole = CatchAsyncError(async(req,res,next)=>{

    const newUser  = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }
    const user =await User.findByIdAndUpdate(req.params.id, newUser,{
        new:true,
        runValidators:true,
        useFindAndModify:false,
      
    });
    res.status(200).json({
        success:true
    })
})

// deleting a user --admin
exports.deleteUser = CatchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.params.id);
    if(!user){
        return next(new ErrorHandler(`user with id ${req.params.id} not found`))
    }
    await user.remove();
   
    res.status(200).json({
        success:true
    })
})
