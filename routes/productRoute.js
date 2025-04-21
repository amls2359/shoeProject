const express=require('express')
const router=express.Router()
const path=require('path')
const UserCollection=require('../models/user')
const product=require('../models/product')
const productController=require('../controllers/productController')
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
  })
  const upload = multer({ storage: storage }).array('img');

router.get('/productmanagement',productController.productmanagement)
router.get('/addProduct',productController.addproductget)
router.post('/addProductPost',upload,productController.addproductpost)

module.exports=router