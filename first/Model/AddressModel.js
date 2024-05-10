const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    address: [
        {
            address:{
                type:String
            }
        }
    ]
})

const Address = mongoose.model('Address', addressSchema);

module.exports = Address