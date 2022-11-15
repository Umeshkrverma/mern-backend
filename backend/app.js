const express = require('express');
const cookieParser = require('cookie-parser')
const app = express();
app.use(express.json());
app.use(cookieParser());

const product  = require("./routes/productRoutes"); //product handler
const ErrorHandler = require('./middlewares/error'); //error handler
const user = require('./routes/userRoutes')// user handler
const order = require('./routes/orderRoutes'); // order handler
//import routes..
app.use("/api/v1",product);
app.use("/api/v1/user", user);
app.use("/api/v1", order)
//error middlewares.....
app.use(ErrorHandler)

module.exports= app;