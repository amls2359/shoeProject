const adminCollection=require('../models/admin')
const UserCollection =require('../models/user')
const Category=require('../models/category')
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
        const searchQuery = req.query.search || ''; // Get search query from URL

        // Build the query object
        const query = {};

        if (searchQuery) {
            query.$or = [
                { username: { $regex: searchQuery, $options: 'i' } }, // Case-insensitive username search
                { email: { $regex: searchQuery, $options: 'i' } }, // Case-insensitive email search
            ];
        }

        // Fetch users based on the query
        const userdata = await UserCollection.find(query);

        // Render the view with user data and search query
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
            return res.status(404).send('User not found');
        }
        user.isblocked = true; // Block the user
        await user.save();
        res.redirect('/admin/usermanagement');
    } catch (err) {
        console.log(err);
        return res.status(500).send('Failed to block user');
    }
};

const unblock = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await UserCollection.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        user.isblocked = false; // Unblock the user
        await user.save();
        res.redirect('/admin/usermanagement');
    } catch (err) {
        console.error(err);
        return res.status(500).send('Failed to unblock user');
    }
};

const categorymanagement= async(req,res)=>{
    res.render('categorymanagement')
}
const addcategoryget=async(req,res)=>{
    res.render('addcategory')
}

const addCategoryPost= async (req, res) => {
    console.log("reached post category")
    const name = req.body.name.trim();  
    console.log(name);
    const newCategory = await Category.findOne({
        category: { $regex: new RegExp("^" + name + "$", "i") },
      });
    if (newCategory === null) {
      try {
        console.log("worked");
        const newCategory = new Category({
            category: name,
        });
        newCategory.save();
      } catch (err) {
        console.error(err);
        return res.status(500).send("Error inserting category");
      }
      res.redirect("/admin/categorymanagement");
    }
     else
     {
        res.render('addcategory',{
           errorMessage:'Category already exist!',
           successMessage:null
       })
      }
  }

module.exports={
    adminLogin,
    adminloginpost,
    dashboard,
    usermanagement,
    block,
    unblock,
    categorymanagement,
    addcategoryget,
    addCategoryPost

}