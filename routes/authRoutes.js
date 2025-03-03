const express=require('express')
const authController=require('../controllers/authController')

const router=express.Router();

//login route
router.post('/UserLogin',authController.login)
