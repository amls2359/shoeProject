const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs') 
const productController = require('../controllers/productController')
const multer = require('multer');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
})

const upload = multer({ storage: storage }).array('image');

const checkSession=async(req,res,next)=>{
    if(req.session.admin)
    {
        next()
    }
    else
    {
        res.redirect('/admin/adminLogin')
    }
}
router.get('/productmanagement',checkSession, productController.productmanagement)
router.get('/addProduct',checkSession, productController.addproductget)
router.post('/addProductPost', upload, productController.addproductpost)
router.get('/editProduct/:id',checkSession,productController.getEditProduct)
router.post('/editProduct/:id', upload, productController.postEditProduct);
router.get('/unlistProduct/:id',productController.unlistProduct)
router.post('/deleteimage',productController.deleteImage)
router.get('/deleteproduct/:id',productController.getdeleteProduct)
router.get('/allproduct/:id',productController.getproducts)
router.get('/productdetails/id',productController.productdetails)
module.exports = router