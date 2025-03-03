const express=require('express')
const router=express.Router()
const UserController=require('../controllers/UserController')
const authMiddleware=require('../middleware/authMiddleware')

router.get('/UserLogin',UserController.userlogin)
router.post('/userLoginPost',UserController.userLoginPost)

router.post('/userSignupPost',UserController.userSignupPost)
router.get('/UserSignup',UserController.userSignup)

router.get('/forgetPassword',UserController.forgetPassword)
router.post('/forgetPasswordPost',UserController.forgetPasswordPost)

// In your route handler for rendering the reset password page
router.get('/resetPassword', (req, res) => {
    const email = req.query.email; // Assuming email is passed as a query parameter
    res.render('resetPassword', { email });
  });
router.post('/resetPasswordPost',UserController.resetPasswordPost)

router.get('/otp',UserController.otp)
router.post('/sendOtpEmail',UserController.sendOtpEmail)

router.post('/resendOtpPost',UserController.resendOtpPost)

router.post('/otpVerifyPost',UserController.otpVerifyPost)




router.get('/Homepage',UserController.homepage)




module.exports=router;