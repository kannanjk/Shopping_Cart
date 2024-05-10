const express = require('express')
const { HomePage, LogOut, Login, LoginPage, SignUp, SignUpPage, addToCart, verifylogin, getCartProduct, changeproductquantity, removepro, getTotalAmount, placeOrder, successOrder, verifyPayment, checkCoupon } = require('../Controler/UserControler.js')

const router = express.Router()

router.get('/', HomePage)
router.get('/login', LoginPage)
router.get('/signup', SignUpPage)
router.post('/signup', SignUp) 
router.post('/login', Login)
router.get('/logOut', LogOut)
router.get('/add-to-cart/:id', verifylogin, addToCart)
router.get('/cart', verifylogin, getCartProduct)
router.post('/changeproductquantity', changeproductquantity)
router.get('/removepro/:id', removepro) 
router.post('/verifycoupon', verifylogin, checkCoupon) 
router.get('/place-order', verifylogin, getTotalAmount)
router.post('/place-order', placeOrder) //verfylogin 
router.get('/order-success', successOrder)
router.post('/verify-Payment', verifyPayment)


module.exports = router



// document.getElementById("couponError").style.color="blue";
// document.getElementById("couponError").innerHTML="coupon applied successfully";
// document.getElementById("discountAmount").innerHTML =
//   "Rs." + response.cutOff;
// document.getElementById("grandTotalAmount").innerHTML =
//   response.grandtotal;
// document.getElementById("applyBtn").disabled = true;