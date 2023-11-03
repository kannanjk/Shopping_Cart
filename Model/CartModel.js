const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
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
    ]
})

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart