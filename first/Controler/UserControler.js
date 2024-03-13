const userModel = require('../Model/UserModel.js')
const productModel = require('../Model/ProductModel.js')
const bcrypt = require('bcrypt')
const Razorpay = require('razorpay')
const cartModel = require('../Model/CartModel.js')
const paypal = require('paypal-rest-sdk')
const mongoose = require('mongoose')
const OrderModel = require('../Model/OrderModel.js')
const CouponModel = require('../Model/CouponModel.js')

var instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
})
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': process.env.CLIENT_ID,
  'client_secret': process.env.CLIENT_SECRET
});

const verifylogin = (req, res, next) => {
  if (req.session.user) {
    next()
  } else {
    res.redirect('/login')
  }
}

const HomePage = async (req, res) => {
  const products = await productModel.find().lean().exec()
  const user = req.session.user
  const cartCount = await getCartCount(user)
  if (req.session.user) {
    if (req.session.user.isAdmin) {
      res.render('admin/add-products', { user, admin: true })
    } else {
      res.render('user/view-products', { products, user, cartCount, use: true })
    }
  } else {
    res.render('user/view-products', { products, use: true })
  }

}

const LoginPage = (req, res, next) => {
  if (req.session.user) {
    res.redirect('/')
  } else {
    res.render('user/login')
  }
}

const SignUpPage = (req, res) => {
  if (req.session.user) {
    res.redirect('/')
  } else {
    res.render('user/signup')
  }
}

const SignUp = async (req, res) => {
  const ath = new userModel(req.body)
  const { email, password } = req.body
  const pass = await bcrypt.hash(password, 10)
  ath.password = pass
  try {
    const newUser = await userModel.findOne({ email })
    if (newUser) {
      res.render('user/signup', { message: "User alredy exixt" })
    } else {
      const user = await ath.save()
      req.session.user = user
      res.redirect('/login')
    }
  } catch (error) {
    console.log(error);
  }
}

const Login = async (req, res) => {
  const { email, password } = req.body
  const user = await userModel.findOne({ email })
  if (user.access) {
    const pass = bcrypt.compare(password, user.password)
    if (pass) {
      req.session.user = user
      res.redirect('/')
    } else {
      res.render('user/login', { message: 'Password incorrect' })
    }
  } else {
    res.render('user/login', { message: 'user not fount' })
  }
}

const LogOut = (req, res) => {
  req.session.user = null
  res.redirect('/')
}

const addToCart = async (req, res) => {
  const proId = req.params.id
  const userId = req.session.user._id
  const userCart = await cartModel.findOne({ user: userId })
  if (userCart) {
    const proExist = userCart.products.findIndex((produc) => {
      return produc.item == proId
    })
    if (proExist != -1) {
      await cartModel.findOneAndUpdate(
        { user: userId, 'products.item': proId },
        { $inc: { 'products.$.quantity': 1 } },
        { upsert: true }
      )
    } else {
      const proObj = {
        item: proId,
        quantity: 1
      }
      await cartModel.updateOne(
        { user: userId },
        { $push: { products: proObj } }
      )
    }
  } else {
    const proObj = {
      item: proId,
      quantity: 1
    }
    const cart = cartModel({
      user: userId,
      products: [proObj]
    })
    await cart.save()
  }
}

const getCartpro = async (userId) => {
  return await cartModel.aggregate([
    {
      $match: { 'user': new mongoose.Types.ObjectId(userId) }
    },
    {
      $unwind: '$products'
    },
    {
      $project: {
        item: '$products.item',
        quantity: '$products.quantity'
      }
    },
    {
      $lookup: {
        from: productModel.collection.name,
        localField: 'item',
        foreignField: '_id',
        as: 'product'
      }
    },
    {
      $project: {
        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
      }
    }
  ])
}

const cartTot = async (userId) => {
  const tot = await cartModel.aggregate([
    {
      $match: { user: new mongoose.Types.ObjectId(userId) }
    },
    {
      $unwind: '$products'
    },
    {
      $project: {
        item: '$products.item',
        quantity: '$products.quantity'
      }
    },
    {
      $lookup: {
        from: productModel.collection.name,
        localField: 'item',
        foreignField: '_id',
        as: 'product'
      }
    },
    {
      $project: {
        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: { $multiply: ['$quantity', '$product.prize'] } }
      }
    }
  ])
  const total = tot[0].total
  return total
}

const getCartProduct = async (req, res) => {
  const userId = req.session.user._id
  try {
    const products = await getCartpro(userId)
    if (products.length > 0) {
      const totalValue = await cartTot(userId)
      res.render('user/cart', { products, totalValue, user: req.session.user._id, use: true })
    } else {
      res.render('user/cart', { products, user: req.session.user._id, use: true })
    }
  } catch (error) {
    console.log(error);
  }
}

const changeproductquantity = async (req, res) => {
  const cart = req.body.cart
  const count = parseInt(req.body.count)
  const quantity = parseInt(req.body.quantity)
  if (count == -1 && quantity == 1) {
    const a = await cartModel.updateOne(
      { _id: cart },
      { $pull: { products: { item: req.body.product } } }
    )
  } else {
    const b = await cartModel.updateOne(
      { _id: cart, 'products.item': req.body.product },
      { $inc: { 'products.$.quantity': count } }
    )
  }
}

const removepro = async (req, res) => {
  const userId = req.session.user._id
  const cartId = req.params.id
  await cartModel.updateOne(
    { user: userId },
    { $pull: { products: { item: cartId } } }
  )
  res.json({ status: true })
}

const getTotalAmount = async (req, res) => {
  const userId = req.session.user._id
  const products = await getCartpro(userId)
  if (products.length > 0) {
    const totalValue = await cartTot(userId)
    res.render('user/place-order', { products, user: req.session.user, totalValue, use: true })
  } else {
    res.render('user/place-order', { products, user: req.session.user, use: true })
  }
}

const getCartCount = async (userId) => {
  let count = 0
  const cart = await cartModel.findOne({ user: userId })
  if (cart) {
    return count = cart.products.length
  }
}

const checkCoupon = async (req, res) => {
  try {
    const { user } = req.session;
    const coupon = await CouponModel.findOne({ code: req.body.code });
    const cartTotal = await cartTot(user._id)
    const checkUser = await CouponModel.findOne({ code: req.body.code, 'userUsed.userId': user._id });
    if (coupon && coupon.expireAfter.getTime() > Date.now()) {
      if (cartTotal < coupon.minCartAmount) {
        res.json({
          checkstatus: 'error',
          message: 'Cart amount is not sufficient',
        });
      } else {
        if (checkUser || req.session.couponApplied === req.body.code) {
          res.json({
            checkstatus: 'error',
            message: 'This coupon already applied',
          });
        } else {
          req.session.couponApplied = coupon._id;
          res.json({
            maxDiscountAmt: coupon.maxDiscountAmount,
            message: 'Coupon Successfully added',
          });
        }
      }
    } else {
      res.json({
        checkstatus: 'error',
        message: 'Cannot apply coupon',
      });
    }

  } catch (error) {
    res.status(400).json({
      checkstatus: 'error',
      message: 'Error while checking coupon code',
    });
  }
}

const genaratRaz = (orderId, total) => {
  var options = {
    amount: total * 100,
    currency: "INR",
    receipt: "" + orderId
  };
  instance.orders.create(options, function (err, order) {
    if (err) {
      console.log(err);
    } else {
      return order
    }
  })
}

const genaratPaypal = (orderId, total) => {
  var create_payment_json = {
    "intent": "sale",
    "payer": {
      "payment_method": "paypal"
    },
    "transactions": [{
      "item_list": {
        "items": [{
          "name": orderId,
          "sku": "item",
          "price": total * 100,
          "currency": "USD",
          "quantity": 1
        }]
      },
      "amount": {
        "currency": "USD",
        "total": total
      },
      "description": "This is the payment description."
    }]
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      console.log("Create Payment Response");
      return payment
    }
  });
}

const placeOrder = async (req, res) => {
  const products = await cartModel.findOne({ user: req.body.userId })
  if (products.products.length > 0) {
    const total = await cartTot(req.body.userId)
    const { mobile, address, pincode, name, userId } = req.body
    let status = req.body['payment-method'] === 'COD' ? 'placed' : 'pending'
    const order = new OrderModel({
      deliveryDetils: {
        mobile: mobile,
        address: address,
        totalAmount: total,
        pincode: pincode,
        name: name
      },
      userId: userId,
      paymentmethod: req.body['payment-method'],
      products: products,
      status: status,
      date: new Date()
    })
    const resp = await order.save()
    await cartModel.deleteOne({ user: req.body.userId })
    if (req.body['payment-method'] === 'COD') {
      res.json({ codSuccess: true })
    } else {
      if (req.body['payment-method'] === 'RAZORPAY') {
        const response = genaratRaz(resp._id, total)
        res.json({razorpay:true,response:response})
      } else {
        const response = genaratPaypal(resp._id, total)
        res.json({paypal:true,response:response})
      }
 
    }
  }
}

const verifyPayment = async (req, res) => {
  const crypto = require('crypto')
  let hmac = crypto.createHmac('sha256', 'ZpQUxhvR0TE9Z8LzIMZj8AeK')
  hmac.update(req.body['payment[razorpay_order_id]'] + '|' + req.body['payment[razorpay_payment_id]'])
  hmac = hmac.digest('hex')
  if (hmac == req.body['payment[razorpay_signature]']) {
    resolve()
  } else {
    reject()
  }
  await OrderModel.updateOne(
    { _id: req.body['order[receipt]'] },
    {
      $set: {
        status: 'placed'
      }
    }
  )
}

const successOrder = (req, res) => {
  res.render('user/order-success', { user: req.session.user, use: true })
}

module.exports = {
  SignUp, LogOut, Login, LoginPage, removepro,
  getCartProduct, verifylogin, changeproductquantity,
  HomePage, SignUpPage, addToCart, getTotalAmount,
  checkCoupon, placeOrder, successOrder, verifyPayment
}  