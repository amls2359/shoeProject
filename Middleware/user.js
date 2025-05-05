
const User=require('../models/user')

const checkSessionBlocked= async(req,res)=>{
  if(req.session.userid)
  {
    const userdetails= await User.findOne({_id:req.session.userid})
    if(!userdetails.isblocked)
    {
      next()
    }
    else
    {
      req.session.destroy((err)=>{
        if(err)
        {
          console.log('Error destroying session:',err);
          res.redirect('/')
        }
        else
        {
          res.redirect('/')
        }
      })
    }
  }
  else
  {
    res.redirect('/')
  }
}

module.exports= checkSessionBlocked