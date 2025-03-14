const mongoose=require('mongoose')

const categorySchema= new mongoose.Schema({
    category:{type:String},
    islisted:{type:Boolean,default:false}

})
const category=mongoose.model('categories',categorySchema)
module.exports=
{
    category
}