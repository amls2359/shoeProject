const express=require('express')
const router=express.Router()
const adminController=require('../controllers/adminController')


const checkSession =async(req,res,next)=>
{
    console.log('Reached session');
    if(req.session && req.session.admin)
    {
        console.log('session found');
        next()
    }
    else
    {
        res.redirect('/admin/adminLogin')
    }
    
}


router.get('/adminLogin',adminController.adminLogin)
router.post('/adminloginpost',adminController.adminloginpost)

router.get('/dashboard',checkSession,adminController.dashboard)

router.get('/usermanagement',adminController.usermanagement)
router.get('/blockuser/:id',checkSession,adminController.block)
router.get('/unblockuser/:id',adminController.unblock)

router.get('/categorymanagement',checkSession,adminController.categoryManagement)
router.get('/addcategory',checkSession,adminController.addcategoryget)

router.post('/addCategoryPost',adminController.addCategoryPost)
router.get('/unListcategory/:id',checkSession,adminController.UnList)
router.get('/editCategory/:id',adminController.editCategoryget)
router.post('/editCategory/:id',adminController.editCategorypost)

module.exports=router