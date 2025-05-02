const checkSession= async(req,res,next)=>
{
  if(req.session.admin)
  {
    next()
  }
  else{
    res.redirect('/admin/adminLogin')
  }
}

module .exports=
{
    checkSession
}