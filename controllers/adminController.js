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
        if (req.body.username === admin.username && req.body.password === admin.password) {
            res.redirect("/admin/dashboard"); 
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

const usermanagement = async (req, res) => {
    try {
        const searchQuery = req.query.search || '';
        const query = {};

        if (searchQuery) {
            query.$or = [
                { username: { $regex: searchQuery, $options: 'i' } },
                { email: { $regex: searchQuery, $options: 'i' } },
            ];
        }

        const userdata = await UserCollection.find(query);
        console.log('Userdata:', userdata); // Log the userdata
        res.render('usermanagement', { userdata, searchQuery });
    } catch (error) {
        console.log("Error:", error);
        res.status(500).send("Internal Server Error");
    }
};

const block = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await UserCollection.findById(userId);
        if (!user) {
            console.log('User not found');
            return res.status(404).send('User not found');
        }
        user.isblocked = !user.isblocked; // Toggle the block status
        await user.save();
        console.log('User after block/unblock:', user); // Log the user object
        res.redirect('/admin/usermanagement');
    } catch (err) {
        console.log(err);
        return res.status(500).send('Failed to block or unblock user');
    }
};

const unblock = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await UserCollection.findById(userId);
        if (!user) {
            console.log('User is not found');
            return res.status(404).send('User not found');
        }
        user.isblocked = false; // Explicitly set to unblocked
        await user.save();
        console.log('User after unblock:', user); // Log the user object
        res.redirect('/admin/usermanagement');
    } catch (err) {
        console.error(err);
        return res.status(500).send('Failed to unblock user.');
    }
};



module.exports={
    adminLogin,
    adminloginpost,
    dashboard,
    usermanagement,
    block,
    unblock

}