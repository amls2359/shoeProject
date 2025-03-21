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

const categorymanagement= async (req, res) => {
    try {
        const categories = await Category.find({}).sort({ _id: -1 }); // Fetch all categories sorted by ID in descending order
        res.render('categorymanagement', {categories });
    } catch (err) {
        console.error("Error fetching categories:", err);
        res.status(500).send("Error fetching categories");
    }
};

const addcategoryget = async(req,res)=>{
    try{ 
        res.render("addcategory");    
    }
    catch(error){
        console.log("error",error);
        res.status(500).send("internal server error");
    }
}

const addCategoryPost = async (req, res) => {
    console.log("Reached post category");
    const name = req.body.name.trim(); // Trim whitespace from the input
    console.log("Category Name:", name);

    try {
        // Check if the category already exists (case-insensitive)
        const existingCategory = await Category.findOne({
            category: { $regex: new RegExp("^" + name + "$", "i") },
        });

        if (existingCategory) {
            // If the category already exists, render the addcategory page with an error message
            console.log("Category already exists");
            return res.render("addcategory", {
                errorMessage: "Category already exists!",
                successMessage: null,
            });
        }

        // If the category does not exist, create a new one
        console.log("Creating new category");
        const newCategory = new Category({
            category: name,
        });

        await newCategory.save(); // Save the new category to the database
        console.log("Category saved successfully");

        // Redirect to the category management page
        res.redirect("/admin/categorymanagement");
    } catch (err) {
        console.error("Error inserting category:", err);
        res.status(500).send("Error inserting category");
    }  await category.updateMany({ category: category._id }, { isListed: category.islisted });
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
        console.log("Fetching category with ID:", id); // Add this line for debugging
        const category = await Category.findOne({ _id: id });
        console.log("Category found:", category); // Add this line for debugging
        res.render("editcategory", { category: category });
    } catch (err) {
        console.error(err);
        return res.status(500).send("Failed to display the category edit page.");
    }
}

const editCategorypost = async (req, res) => {
    try {
        const id = req.params.id;
        const categoryname = req.body.categoryname ? req.body.categoryname.trim() : null;

        if (!categoryname) {
            return res.render('editcategory', { message: "Category name is required!", category: category });
        }

        console.log(`this is the id ${id} and this is the categoryname ${categoryname}`);

        // Fetch the category details from the database
        const category = await Category.findById(id);

        // Check if there's already a category with the new name
        const existingCategory = await Category.findOne({
            category: { $regex: new RegExp("^" + categoryname + "$", "i") },
            _id: { $ne: id } // Ensure the category being checked is not the one being edited
        });

        if (existingCategory) {
            // If a category with the new name exists, render the same page with an error message
            return res.render('editcategory', { message: "Category already exists!", category: category });
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
        return res.status(500).send("Failed to edit category.");
    }
}




module.exports={
    adminLogin,
    adminloginpost,
    dashboard,
    usermanagement,block,unblock,
    categorymanagement,addcategoryget,addCategoryPost,UnList,editCategoryget,editCategorypost
}