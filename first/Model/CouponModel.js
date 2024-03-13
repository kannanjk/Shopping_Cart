const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
    code:{
        type:String, 
        require:true,
        unique:true
    },
    isPercent:{  
        type:Boolean 
    },
    amount:{
        type:Number,
        require:true
    },
    createdAt:{
        type:Date
    },
    expireAfter: {
        type: Date 
      },
      usageLimit: {
        type: Number,
      },
      minCartAmount: {
        type: Number,
      },
      maxDiscountAmount: {
        type: Number,
      },
      userUsed: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
        },
      ],
})

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon