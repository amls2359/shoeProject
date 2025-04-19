const express=require('express')
const router=express.Router()
const path=require('path')
const UserCollection=require('../models/user')
const product=require('../models/product')
const productController=require('../controllers/productController')

router.get('/productmanagement',productController.productmanagement)
router.get('/addProduct',productController.addproductget)
router.post('/addProductPost',productController.addproductpost)

module.exports=router