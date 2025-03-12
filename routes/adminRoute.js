const express=require('express')
const router=express.Router()
const adminController=require('../controllers/adminController')

router.get('/adminLogin',adminController.adminLogin)
router.post('/adminloginpost',adminController.adminloginpost)

router.get('/dashboard',adminController.dashboard)

router.get('/usermanagement',adminController.usermanagement)
router.get('/blockuser/:id',adminController.block)
router.get('/unblockuser/:id',adminController.unblock)


module.exports=router