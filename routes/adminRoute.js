const express=require('express')
const router=express.Router()
const adminController=require('../controllers/adminController')

router.get('/adminLogin',adminController.adminLogin)
router.post('/adminloginpost',adminController.adminloginpost)

router.get('/dashboard',adminController.dashboard)

module.exports=router