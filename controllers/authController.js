const User=require('../models/user')
exports.login=(req,res)=>{
    const {email,password}=req.body
    
//check for credentials
    User.findOne({email,password},(err,user)=>{
        if(err||!user)
        {
            return res.status(401).send('Invalid email or password')
        }
    })
}