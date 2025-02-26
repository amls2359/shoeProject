const express=require('express')
const router=express.Router()
const UserController=require('../controllers/UserController')


router.get('/UserLogin',UserController.userlogin)
router.post('/userLoginPost',UserController.userLoginPost)

router.post('/userSignupPost',UserController.userSignupPost)
router.get('/UserSignup',UserController.userSignup)

router.get('/forgetPassword',UserController.forgetPassword)
router.post('/forgetPasswordPost',UserController.forgetPasswordPost)

router.get('/ResetPassword',UserController.resetPassword)
router.post('/resetPasswordPost',UserController.resetPasswordPost)

router.get('/otp',UserController.otp)
router.post('/sendOtpEmail',UserController.sendOtpEmail)

router.post('/resendOtpPost',UserController.resendOtpPost)

router.post('/otpVerifyPost',UserController.otpVerifyPost)




router.get('/Homepage',UserController.homepage)




module.exports=router;