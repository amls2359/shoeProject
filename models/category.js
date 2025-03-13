const mongoose=require('mongoose')

const categorySchema= new mongoose.Schema({
    category:{type:String},
    islisted:{type:Boolean,default:false}

})
module.exports=mongoose.model('categories',categorySchema)