const jwt= require('jsonwebtoken');
const ErrorHandler = require('../utils/errorHandler');
const CatchAsyncError = require('./CatchAsyncError');
const User = require('../models/usermodel');

//checking if user is logged in
exports.isUserAuthenticated = CatchAsyncError(async(req, res ,next)=>{
    const { token } = req.cookies;
    if(!token){
        return next(new ErrorHandler("Please Login to access this Resource"))
    }
    const decodedData = jwt.verify(token , process.env.JWTKEY);

    req.user = await User.findById(decodedData.id)
    console.log(req.user)
    next()
})
//checking for the role of user logged in
exports.authRole = (...roles)=>{
    return (req, res, next)=>{
if(!roles.includes(req.user.role)){
    return next(new ErrorHandler(`role: ${req.user.role} is not allowed to access this resource`, 403))
}
next()
    }
}