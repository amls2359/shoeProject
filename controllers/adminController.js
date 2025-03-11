const adminCollection=require('../models/admin')
const UserCollection =require('../models/user')
const express=require('express')

const adminLogin=(req,res)=>res.render('adminLogin')
const dashboard=(req,res)=>res.render('dashboard')

//adminlogin post
const adminloginpost = async (req, res) => {
    try {
        const admin = {
            username: "admin",
            password: "12345"
        };
           console.log('before body');
           
        if (req.body.username === admin.username && req.body.password === admin.password) {
            res.redirect("/admin/dashboard");
            console.log('after body');
            
        } else {
            return res.render('adminLogin', { 
                errorMessage: 'Invalid username or password', 
                successMessage: null 
            });
        }
    } catch (error) {
        console.log("Error:", error);
        res.status(500).send("Internal Server Error");
    }
};

module.exports={
    adminLogin,
    adminloginpost,
    dashboard
}