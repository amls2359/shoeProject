const User=require('../models/user')
exports.login=(req,res)=>{
    const {email,password}=req.body

//check for credentials
    User.findOne({email,password},(err,user)=>{
        if(err||!user)
        {
            return res.status(401).send('Invalid email or password')
        }
        req.session.userId=user._id;
        req.session.isLoggedIn=true
        res.redirect('/Homepage')
    })
}
exports.logout=(req,res)=>{
    //Destroy session
    req.session.destroy((err)=>{
        if(err)
        {
            return res.status(500).send('Could not log out')
        }
        res.redirect('/UserLogin')
    })
}