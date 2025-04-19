const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    category: { type: String },
    islisted: { type: Boolean, default: false }
})

// Change to 'Category' to match what your code expects
const Category = mongoose.model('Category', categorySchema)

module.exports = Category