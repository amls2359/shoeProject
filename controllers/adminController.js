const adminCollection=require('../models/admin')
const UserCollection=require('../models/user')
const express=require('express')

const adminLogin=(req,res)=>res.render('adminLogin')

//adminlogin post
const adminloginpost = async (req, res) => {
    
    try {
        const admin = {
            username: "admin",
            password: "12345"
        }

        if (req.body.username === admin.username && req.body.password === admin.password) {
            req.session.admin = admin.username;
            res.redirect("/admin/dashboard");
        } else {
           res.redirect('/admin/adminlogin/?message=InvalidEntry')
            
        }
    } catch (error) {
        console.log("Error:", error);
        res.status(500).send("Internal Server Error");
    }
};

module.exports={
    adminLogin
}