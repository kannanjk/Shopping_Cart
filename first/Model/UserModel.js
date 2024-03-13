const mongoose =require( 'mongoose')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: ['name require', true]
    },
    email: {
        type: String,
    },
    phone: {
        type: Number,
    },
    password: {
        type: String
    },
    cartId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart',
    },
      access: {
        type: Boolean,
        default: true,
      },
      isAdmin: {
        type: Boolean,
        default: false,
      },
})

const User = mongoose.model('User', userSchema);
module.exports = User