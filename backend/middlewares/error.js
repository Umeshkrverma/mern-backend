const ErrorHandler = require("../utils/errorHandler");

module.exports  = (err, req, res, next)=>{
err.message  =  err.message || "Internal Server Error";
err.statusCode = err.statusCode || 500;

// handling wrong id error in mongodb
// if(err.name==="CastError"){
//     const message = `Resource not found Invalid: ${err.path}`
//     err = new ErrorHandler(message, 404)
// }
// Dulpicate key error in monodb
if(err.code==11000){
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err = new ErrorHandler(message, 400)
}
// wrong jwt token
if(err.name=="JsonWebTokenError"){
    const message = `json web token is invalid try again later`;
    err = new ErrorHandler(message, 400)
}
//
if(err.name=="TokenExpiredError"){
    const message = `json web token is expired try again later`;
    err = new ErrorHandler(message, 400)
}

res.status(err.statusCode).json({
    success:false,
   error:err.message,
  
})
}