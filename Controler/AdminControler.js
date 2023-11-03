const mongoose = require("mongoose")
const productModel = require("../Model/ProductModel.js")
const userModel = require('../Model/UserModel.js')
const OrderModel = require('../Model/OrderModel.js')
const CouponModel = require('../Model/CouponModel.js')

const AddProduct = async (req, res) => {
    try {
        const product = new productModel(req.body)
        const a = await product.save()
        res.render('admin/add-products', { admin: true })
        let image = req.files.image
        image.mv('./public/product-image/' + a._id + '.jpg', (err) => {
            if (!err) {
                return
            } else {
                console.log(err);
            }
        })
    } catch (error) {
        console.log(error);
    }
}

const GetAllProducts = async (req, res) => {
    const products = await productModel.find().lean().exec()
    res.render('admin/view-products', { products, admin: true })
}

const deleteProduct = async (req, res) => {
    const { id } = req.params
    productModel.findByIdAndDelete(id)
    res.redirect('/admi/getAllProducts')
}

const getSingleProduct = async (req, res) => {
    const { id } = req.params
    const product = await productModel.findById(id).lean().exec()
    res.render('admin/edit-products', { product, admin: true })
}

const UpdateProduct = async (req, res) => {
    const { id } = req.params
    const product = await productModel.findByIdAndUpdate(id, req.body, {
        new: true,
    })
    res.redirect('/admi/getAllProducts')
}

const getAllUser = async (req, res) => {
    const accounts = await userModel.find().lean().exec()
    res.render('admin/allusers', { accounts, admin: true })
}

const blockUser = async (req, res) => {
    const userId = req.params.id
    await userModel.updateOne(
        { _id: new mongoose.Types.ObjectId(userId) },
        { $set: { access: false } },
    )
    res.redirect('/admi/account')
}

const unBlockedUser = async (req, res) => {
    const userId = req.params.id
    await userModel.updateOne(
        { _id: new mongoose.Types.ObjectId(userId) },
        { $set: { access: true } },
    )
    res.redirect('/admi/account')
}

const getAllUserOrders = async (req, res) => {
    const allorders = await OrderModel.find().lean().exec()
    res.render('admin/all-orders', { allorders, admin: true })
}

const addCoupon = async (req, res) => {
    try {
        const { code, isPercent, amount, usageLimit, minCartAmount, maxDiscountAmount } = req.body;
        const createdAt = new Date();
        let expireAfter = createdAt.getTime() + req.body.expireAfter * 24 * 60 * 60 * 1000;
        expireAfter = new Date(expireAfter);
        const coupon = { code, isPercent, amount, usageLimit, expireAfter, createdAt, minCartAmount, maxDiscountAmount };
        await CouponModel.create(coupon);
    } catch (error) {
        res.status(400).json({
            status: 'error while adding coupon',
            message: error,
        });
    }
}

const deletCoupon = async (req, res) => {
    try {
        await CouponModel.findByIdAndDelete(req.body.couponId)
        res.json({
            delete: 'success',
        });
    } catch (error) {
        res.json({
            delete: 'failed',
        });
    }
}

const getCoupons = async (req, res) => {
    const coupon = await CouponModel.find()
    req.session.pageIn = 'coupon'
}

const getOneCoupon = async (req, res) => {
    const couponId = req.params.id
    req.session.pageIn = 'coupon'
    const coupon = await CouponModel.find({ _id: mongoose.Types.ObjectId(couponId) })
}

const editCoupon = async (req, res) => {
    try {
        const { code, isPercent, amount, usageLimit, minCartAmount, maxDiscountAmount } = req.body;
        const coupon = { code, isPercent, amount, usageLimit, minCartAmount, maxDiscountAmount };
        await CouponModel.findByIdAndUpdate(req.params.id, coupon);
    } catch (error) {
        res.status(400).json({
            status: 'error while editing coupon',
            message: err,
        });
    }
}

module.exports = {
    AddProduct, GetAllProducts, deleteProduct, getSingleProduct, UpdateProduct,
    getAllUser, blockUser, unBlockedUser, getAllUserOrders,
    addCoupon, deletCoupon, getCoupons, getOneCoupon, editCoupon
}