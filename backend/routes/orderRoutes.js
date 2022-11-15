const express = require('express');
const { placeOrder, getOrderDetails, myOrders, getAllOrders, updateOrder, deleteOrder } = require('../controllers/orderControllers');
const { isUserAuthenticated, authRole } =  require('../middlewares/auth');

const router = express.Router();
//placing an order
router.route('/order/new').post(isUserAuthenticated, placeOrder);
//get order deatails --admin
router.route('/order/:id').get(isUserAuthenticated,authRole("admin"),getOrderDetails);
//get my order deatils
router.route('/order/me').get(isUserAuthenticated,myOrders);
//get all orders --admin
router.route('/admin/getorders').get(isUserAuthenticated, authRole("admin"), getAllOrders);
//upadate order and stocks
router.route('/admin/order/:id')
.put(isUserAuthenticated,authRole("admin"), updateOrder)
.delete(isUserAuthenticated, authRole("admin"), deleteOrder)
module.exports = router