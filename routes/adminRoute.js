const express=require('express')
const router=express.Router()
const adminController=require('../controllers/adminController')

router.get('/adminLogin',adminController.adminLogin)
router.post('/adminloginpost',adminController.adminloginpost)

router.get('/dashboard',adminController.dashboard)

router.get('/usermanagement',adminController.usermanagement)
router.get('/blockuser/:id',adminController.block)
router.get('/unblockuser/:id',adminController.unblock)

router.get('/categorymanagement',adminController.categorymanagement)
router.get('/addcategory',adminController.addcategoryget)

router.post('/addCategoryPost',adminController.addCategoryPost)
router.get('/unListcategory/:id',adminController.UnList)
router.get('/editCategory/:id',adminController.editCategoryget)
router.post('/editCategory/:id',adminController.editCategorypost)

router.get('/addProduct',adminController.addproductget)

module.exports=router