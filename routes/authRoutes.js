const express=require('express')
const authController=require('../controllers/authController')

const router=express.Router();

//login route
router.post('/login',authController.login)

//logout route

router.get('/logout',authController.logout)

module,exports=router;