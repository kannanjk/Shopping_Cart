const  mongoose =require( "mongoose");


const productModel = new mongoose.Schema({
    name: {
        type: String,
        required: 'A product must have a title',
      },
      Model: {
        type: String, 
        required:  'A product must have a title',
      },
      prize: {
        type: Number,
        required: 'A product must have a title',
      },
    
})

const product = mongoose.model('Products', productModel);
module.exports= product