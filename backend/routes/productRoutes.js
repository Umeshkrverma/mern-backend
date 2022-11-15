const express = require('express');
const {
        getAllProducts, 
        createProducts,
        updateProduct, 
        deleteProduct, 
        getProductDetails, 
        createProductReview, 
        getAllReviews,
        deleteReview} = require("../controllers/productControllers");

const { isUserAuthenticated, authRole } = require('../middlewares/auth');
const router = express.Router();

//getting available products
router.route("/products").get(getAllProducts);
//creating a product by admin
router.route("/admin/product/new").post(isUserAuthenticated,authRole("admin"),createProducts);
//admin routes
router
.route("/admin/product/:id")
.put(isUserAuthenticated,authRole("admin"),updateProduct)
.delete(isUserAuthenticated,authRole("admin"),deleteProduct)
.get(getProductDetails);
//adding review to the product
router.route("/review").put(isUserAuthenticated,createProductReview);
//modifying reviews of a product
router.route("/reviews").get(getAllReviews).delete(isUserAuthenticated ,deleteReview)



module.exports = router;