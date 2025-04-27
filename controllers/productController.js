// controllers/productController.js
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
    res.status(500).render("addProduct", { 
      categories: [], 
      errorMessage: "Error loading product management",
      formData: {}
    });
  }
};

// controllers/productController.js
const addproductget = async (req, res) => {
  try {
      const categories = await Category.find({ islisted: false }).lean();
      res.render("addProduct", {
          categories: categories || [],
          errorMessage: null,
          formData: {}
      });
  } catch (error) {
      console.error("Error fetching categories:", error);
      res.render("addProduct", {
          categories: [],
          errorMessage: "Error loading categories",
          formData: {}
      });
  }
};

const handleFileUpload = (files) => {
  return new Promise((resolve, reject) => {
    if (!files || !files.image) return resolve([]);
    const images = [];
    const fileArray = Array.isArray(files.image) ? files.image : [files.image];
    let processed = 0;
    
    fileArray.forEach(file => {
      const newFilename = Date.now() + '-' + file.name;
      const uploadPath = path.join(__dirname, '../public/uploads', newFilename);
      file.mv(uploadPath, (err) => {
        if (err) return reject(err);
        images.push(newFilename);
        processed++;
        if (processed === fileArray.length) resolve(images);
      });
    });
  });
};

const addproductpost = async (req, res) => {
  try {
      // Validate required fields
      const { productname, price, stock, category, newCategory, model, description, brand, isListed } = req.body;
      
      if (!productname?.trim()) throw new Error('Product name is required');
      if (!price) throw new Error('Price is required');
      if (!stock) throw new Error('Stock is required');

      // Handle file uploads
      req.files = req.files || [];
      const images = req.files.map(file => 
          path.join('uploads', file.filename).replace(/\\/g, '/')
      );

      // Process category
      let categoryObj;
      if (category === 'new') {
          if (!newCategory?.trim()) throw new Error('New category name is required');
          categoryObj = new Category({ 
              name: newCategory.trim(),
              islisted: true 
          });
          await categoryObj.save();
      } else {
          categoryObj = await Category.findById(category);
          if (!categoryObj) throw new Error('Selected category not found');
      }

      // Create new product
      const newProduct = new Product({
          productname: productname.trim(),
          category: categoryObj._id,
          price: parseFloat(price) || 0,
          model: model?.trim(),
          description: description?.trim(),
          image: images,
          stock: parseInt(stock) || 0,
          brand: brand?.trim(),
          isListed: isListed === 'on'
      });

      await newProduct.save();
      res.redirect('/productmanagement');
  } catch (error) {
      console.error("Error adding product:", error);
      
      // Get categories again in case of error
      const categories = await Category.find({ islisted: true }).lean();
      
      // Render the same page with error message
      res.render("addProduct", {
          categories: categories || [],
          errorMessage: error.message,
          formData: req.body
      });
  }
};

const getEditProduct=async(req,res)=>
{
  try
  {
    console.log('Request body:', req.body);
    console.log('Files:', req.files);
    const product = await Product.findOne({_id:req.params.id}).populate('category')
    const categories=await Category.find()
    res.render('editProduct',{product,categories})
  }
  catch(err)
  {
    console.error(err);
    return res.status(500).send('Failed to get product edit page')
    
  }

}

const postEditProduct = async (req, res) => {
  try {
    console.log('Request body:', req.body);
console.log('Files:', req.files);
    const { productname, category, price, description, stock, isListed } = req.body;
    const productId = req.params.id;

    // Get existing product to preserve existing images
    const existingProduct = await Product.findById(productId);
    
    // Handle image uploads
    let images = existingProduct.image || []; // Start with existing images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => 
        path.join('uploads', file.filename).replace(/\\/g, '/')
      );
      images = [...images, ...newImages]; // Combine existing and new images
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        productname,
        category,
        price: parseFloat(price),
        description,
        stock: parseInt(stock),
        isListed: isListed === 'true',isListed: isListed === 'on' || isListed === 'true',
        image: images
      },
      { new: true }
    );

    if (!updatedProduct) {
      throw new Error('Product not found');
    }

    res.redirect('/productmanagement');
  } catch (err) {
    console.error(err);
    // Render the edit page again with error message
    const product = await Product.findById(req.params.id).populate('category');
    const categories = await Category.find();
    res.render('editProduct', { 
      product, 
      categories,
      errorMessage: 'Failed to update product' 
    });
  }
};


module.exports = {
  productmanagement,
  addproductget,
  addproductpost,
  getEditProduct,
  postEditProduct

};