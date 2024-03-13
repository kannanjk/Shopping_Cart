const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema(
    {
        deliveryDetils: {
            mobile: {
                type: String
            },
            address: {
                type: String,
            },
            totalAmount: {
                type: String
            },
            pincode: {
                type: String
            },
            name: {
                type: String
            }
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        paymentmethod:{
            type:String
        },
        products: [
            {
                item: {
                    type: mongoose.Schema.Types.ObjectId,
                },
                quantity:{
                    type:Number
                }
            }
        ],
        status:{
            type:String
        },
        date:{
            type: Date
        }
    })

const Order = mongoose.model('Order', orderSchema);
module.exports = Order