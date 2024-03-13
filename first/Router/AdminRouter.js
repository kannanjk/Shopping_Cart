const express = require('express')
const { AddProduct, GetAllProducts, deleteProduct, getSingleProduct, UpdateProduct, getAllUser, blockUser, unBlockedUser, getAllUserOrders, addCoupon, deletCoupon, getCoupon, getCoupons, getOneCoupon, editCoupon } = require('../Controler/AdminControler')
const { verifylogin } = require('../Controler/UserControler')

const app = express.Router()

app.post('/add-products',AddProduct)
app.get('/getAllProducts',GetAllProducts)
app.get('/delete-product/:id',deleteProduct)
app.get('/edit-products/:id',getSingleProduct)
app.post('/edit-products/:id',UpdateProduct)
app.get('/account',getAllUser)
app.get('/blockUser/:id',blockUser)
app.get('/unblockUser/:id',unBlockedUser)
app.get('/allorders',getAllUserOrders)
app.post('/addCoupon',addCoupon)
app.get('/getCoupon',getCoupons)
app.route('/getOneCoupon/:id').get(verifylogin,getOneCoupon).post(editCoupon)
app.post('/delete-coupon',deletCoupon)

module.exports = app