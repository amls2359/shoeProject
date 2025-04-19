const Product = require('../models/product');
const Category = require('../models/category');
const path = require('path');

const productmanagement = async (req, res) => {
    try {
        const products = await Product.find({}).populate('category');
        // Ensure products have valid prices and filter out products without category
        const validProducts = products
            .filter(product => product.category)
            .map(product => ({
                ...product._doc,
                price: product.price ? Number(product.price) : 0
            }));
            
        res.render("productmanagement", { products: validProducts });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).render("error", { message: "Error loading product management" });
    }
};

const addproductget = async (req, res) => {
    try {
        const categories = await Category.find({});
        res.render("addProduct", {
            categories,
            error: null,
            formData: {}
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).render("addProduct", {
            categories: [],
            error: "Error loading form",
            formData: {}
        });
    }
};

const handleFileUpload = (files) => {
    return new Promise((resolve, reject) => {
        if (!files || !files.image) return resolve([]);

        const images = [];
        const fileArray = Array.isArray(files.image) ? files.image : [files.image];
        
        fileArray.forEach(file => {
            const newFilename = Date.now() + '-' + file.name;
            const uploadPath = path.join(__dirname, '../public/uploads', newFilename);
            
            file.mv(uploadPath, (err) => {
                if (err) return reject(err);
                images.push(newFilename);
            });
        });

        resolve(images);
    });
};

const addproductpost = async (req, res) => {
    try {
        // Validate required fields
        if (!req.body.productname || !req.body.price || !req.body.stock) {
            throw new Error('Product name, price, and stock are required');
        }

        // Handle file uploads
        const images = await handleFileUpload(req.files);

        // Process category
        const categoryName = req.body.newCategory || req.body.category;
        if (!categoryName) throw new Error('Category is required');

        let category = await Category.findOne({ name: categoryName });
        if (!category) {
            category = new Category({ name: categoryName });
            await category.save();
        }

        // Ensure price is a valid number
        const price = parseFloat(req.body.price) || 0;

        // Create new product
        const newProduct = new Product({
            productname: req.body.productname.trim(),
            category: category._id,
            price: price,
            model: req.body.model?.trim(),
            description: req.body.description?.trim(),
            image: images,
            stock: parseInt(req.body.stock) || 0,
            brand: req.body.brand?.trim(),
            isListed: req.body.isListed === 'on'
        });

        await newProduct.save();
        res.redirect('/productmanagement');
    } catch (error) {
        console.error("Error:", error);
        const categories = await Category.find({});
        res.render("addProduct", {
            categories,
            error: error.message,
            formData: req.body
        });
    }
};

module.exports = {
    productmanagement,
    addproductget,
    addproductpost
};