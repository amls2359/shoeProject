const adminCollection=require('../models/admin')
const product=require('../models/product')
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
            req.session.admin=admin.username;
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

const categoryManagement = async (req, res) => {
    try {
        const categories = await Category.find({}).sort({ name: 1 });
        res.render("categorymanagement", { categories });
    } catch (error) {
        console.log("Error fetching categories:", error);
        res.status(500).send("Internal server error");
    }
};

const addcategoryget = async (req, res) => {
    try {
        res.render("addcategory");
    } catch (error) {
        console.log("error", error);
        res.status(500).send("internal server error");
    }
};

const addCategoryPost = async (req, res) => {
    const name = req.body.name.trim();
    
    try {
        // Check if category already exists (case-insensitive)
        const existingCategory = await Category.findOne({
            name: { $regex: new RegExp("^" + name + "$", "i") }
        });

        if (existingCategory) {
            return res.render("addcategory", {
                errorMessage: "Category already exists!",
                successMessage: null
            });
        }

        const newCategory = new Category({
            name: name,  // Using 'name' field consistently
            islisted: true
        });

        await newCategory.save();
        res.redirect("/admin/categorymanagement");
    } catch (err) {
        console.error("Error inserting category:", err);
        res.status(500).send("Error inserting category");
    }
};

const UnList = async (req, res) => {    
    try {
      // Find the category by ID
      const category = await Category.findOne({ _id: req.params.id });
  
      if (!category) {
        // return res.status(404).send("Category not found.");
      }
  
      // Update the 'islisted' field to its opposite value
      category.islisted = !category.islisted;
  
      // Save the updated category
      await category.save();
      res.redirect("/admin/categorymanagement");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to toggle category block status.");
    }
}

const editCategoryget = async (req, res) => {
    try {
        const id = req.params.id;
        console.log("Fetching category with ID:", id);
        const category = await Category.findOne({ _id: id });
        console.log("Category found:", category);
        res.render("editcategory", { 
            category: category,
            message: null // Initialize message as null
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send("Failed to display the category edit page.");
    }
}

const editCategorypost = async (req, res) => {
    try {
        const id = req.params.id;
        const categoryname = req.body.categoryname ? req.body.categoryname.trim() : null;

        // Fetch the category details from the database first
        const category = await Category.findById(id);

        if (!categoryname) {
            return res.render('editcategory', { 
                message: "Category name is required!", 
                category: category // Pass the existing category back to the form
            });
        }

        console.log(`this is the id ${id} and this is the categoryname ${categoryname}`);

        // Check if there's already a category with the new name
        const existingCategory = await Category.findOne({
            category: { $regex: new RegExp("^" + categoryname + "$", "i") },
            _id: { $ne: id }
        });

        if (existingCategory) {
            return res.render('editcategory', { 
                message: "Category already exists!", 
                category: category // Pass the existing category back to the form
            });
        }

        // Update the category name
        await Category.updateOne(
            { _id: id },
            { $set: { category: categoryname } }
        );

        // Redirect to category management page upon successful update
        return res.redirect("/admin/categorymanagement");
    } catch (err) {
        console.error("Error editing category:", err);
        // In case of error, render the form again with the original category data
        const category = await Category.findById(id);
        return res.render('editcategory', { 
            message: "Failed to edit category.", 
            category: category 
        });
    }
}



module.exports={
    adminLogin,
    adminloginpost,
    dashboard,
    usermanagement,block,unblock,
    categoryManagement,addcategoryget,addCategoryPost,UnList,editCategoryget,editCategorypost,

}