const Product= require('../models/productmodels');
const ErrorHandler = require('../utils/errorHandler');
const CatchAsyncError = require('../middlewares/CatchAsyncError');
const Apifeature = require('../utils/apifeatures');
//----Admin routes---starts
//creating products
exports.createProducts=CatchAsyncError(async(req, res, next)=>{
    req.body.user = req.user.id;
    const product= await Product.create(req.body);
    
    res.status(201).json({
        success:true,
        product
    })
    
    }
    )
//product updates
exports.updateProduct = CatchAsyncError(async(req, res, next)=>{
    let product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler("product not found", 404))
     }
    product = await Product.findByIdAndUpdate(req.params.id, req.body,{
      new:true,
      runValidators:true,
      useFindAndModify:false  
    });
    res.status(200).json({
        success:true,
        product
    })
})
// deleting a product.

exports.deleteProduct = CatchAsyncError(async(req, res, next)=>{
    let product = await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHandler("product not found", 404))
     }
    else{
    await product.remove();
    res.status(200).json({
        success:true,
        message:"Product removed successfully"
    })
}
})
//--admin routes end----
// get product details
exports.getProductDetails= CatchAsyncError(async(req,res,next)=>{
    const product = await Product.findById(req.params.id);
    if(!product){
       return next(new ErrorHandler("product not found", 404))
    }
    else{
        res.status(200).json({
            success:true,
            product
        })
    }
})

//to get all products
exports.getAllProducts=CatchAsyncError(async(req, res, next)=>{
    const resultperpage = 5;
   // product count if needed ** pending
    const apiFeature = new Apifeature(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultperpage);
    const products = await apiFeature.query;
    res.status(200).json({success:true,
    products})
});
//users reviews
exports.createProductReview = CatchAsyncError(async(req,res,next)=>{
   const {rating, comment, productId} = req.body;
    const review = {
        user: req.user._id,
        name:req.user.name,
        rating: Number(rating),
        comment:comment
    };
    const product = await Product.findById(productId);

    if(!product){
        return next(new ErrorHandler("product not found", 404))
    }
  //check if same user has commented earlier
    const isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
        );
        // console.log(isReviewed);
   // console.log(JSON.stringify(product.reviews[0].user));
   
    if(isReviewed){
        product.reviews.forEach((rev)=>{
            if(rev.user.toString() === req.user._id.toString()){
                rev.rating = rating;rev.comment = comment;
            }
        })
    }
    else{
        product.reviews.push(review)
        product.numOfReviews = product.reviews.length;
    }
    // //calulating overall product rating
   
    let  total = 0;
    product.reviews.forEach((rev)=>total+=rev.rating);
    product.ratings = total/product.reviews.length;
    await product.save({validateBeforeSave:false})
    res.status(200).json({
        success:true,
        reviews: product.reviews
  
    })
})
// get all product reviews
exports.getAllReviews = CatchAsyncError(async(req,res,next)=>{
     const product = await Product.findById(req.query.productId);
     if(!product){
        return next(new ErrorHandler("product not found", 404))
     }
     const reviews  = product.reviews;
     res.status(200).json({
        success:true,
        reviews
     })
})
//deleting a review of a product
exports.deleteReview=CatchAsyncError(async(req,res,next)=>{
    const product= await Product.findById(req.query.productId);
    // get a review to be deleted
  
    const reviews = product.reviews.filter(
        (rev)=>rev._id.toString() !== req.query.r_id.toString()
        );
    let  total = 0;
    reviews.forEach((rev)=>total+=rev.rating);
    const ratings = total/product.reviews.length;

    const numOfReviews = reviews.length;
    await Product.findByIdAndUpdate(req.query.productId,{
        reviews,
        ratings,
        numOfReviews
    },{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })
    res.status(200).json({
        success:true,
        reviews:product.reviews,
        numofReviews:product.numOfReviews,
        ratings:product.ratings
    })
})



