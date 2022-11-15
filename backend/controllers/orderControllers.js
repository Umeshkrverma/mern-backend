const Order = require('../models/orderModels');
const Product= require('../models/productmodels');
const ErrorHandler = require('../utils/errorHandler');
const CatchAsyncError = require('../middlewares/CatchAsyncError');


//placing a new order.
exports.placeOrder = CatchAsyncError(async(req,res,next)=>{
const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
} = req.body
const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt:Date.now(),
    user:req.user._id
})
res.status(201).json({
    success:true,
    order
})
})
// getting orders deatils ---admin
exports.getOrderDetails = CatchAsyncError(async(req,res,next)=>{
    const order = await Order.find({_id:req.params.id}).populate(
        "user",
        "name email"
    );
    if(!order){
        return next(new ErrorHandler("order not found with this id", 404))
    }
    console.log(req.user._id);
    console.log(order.user);
    res.status(200).json({
        success:true,
        order
    })
});
//get single order details --self
exports.myOrders = (async(req,res,next)=>{
 // not working properly....
 try{
    const orders = await Order.find({user:req.user._id});
    console.log(typeof(orders))
    res.status(200).json({
    success:true,
    orders
 })}catch(error){
    console.trace(error)
 }
})
;
//get all orders ---admin
exports.getAllOrders = CatchAsyncError(async(req,res,next)=>{
   const orders = await Order.find();
   let totalAmount = 0;
   orders.forEach(
    (order)=>totalAmount+=order.totalPrice
   )
    res.status(200).json({
       success:true,
       orders,
       totalAmount
    })
   });
   // update orders
   exports.updateOrder = CatchAsyncError(async(req, res  ,next)=>{
    const order = await Order.findById(req.params.id); 
    if(!order){
        return next(new ErrorHandler("order not found with id", 404))
    }
    if(order.orderStatus==="Delivered"){
      return   next(new ErrorHandler("You have Already delivered the order", 404))
    }
    order.orderItems.forEach(
        (order)=>{ updateStock(order.product , order.quantity)}
    );
    order.orderStatus = req.body.status; 
    if(req.body.status ="Delivered"){
        order.deliveredAt = Date.now();
    }
    await order.save({validateBeforeSave:false})
    res.status(200).json({
        success:true,
        delivery:order.orderStatus
    })
   })
   //stock updater
   async function updateStock(id ,quantity){
    const product = await Product.findById(id);
    product.stock -= quantity;
    await product.save({validateBeforeSave:false})
   }
   //deleting a order
   exports.deleteOrder = CatchAsyncError(async(req, res ,next)=>{
    const order = await Order.findById(req.params.id)
    if(!order){
        return next(new ErrorHandler("No such order found", 404))
    }
    await order.remove()
    res.status(200).json({
        success:true
    })
   })