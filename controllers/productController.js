// controllers/productController.js
const Product = require('../models/product');
const Category = require('../models/category');
const fs=require('fs')
const path = require('path');


const productmanagement = async (req, res) => {
  try {
    const products = await Product.find({}).populate('category');
    // Ensure products have valid prices and filter out products without category
    const validProducts = products
      .filter(product => product.category)
      .map(product => ({
        ...product._doc,
        price: product.price ? Number(product.price) : 0,
        // Ensure image paths are correct
        image: product.image ? product.image.map(img => img.replace(/\\/g, '/')) : [],
        // Ensure brand has a default if empty
        brand: product.brand || 'N/A'
      }));
    res.render("productmanagement", { products: validProducts });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).render("productmanagement", { 
      categories: [], 
      errorMessage: "Error loading product management",
      formData: {}
    });
  }
};

// controllers/productController.js
const addproductget = async (req, res) => {
  try {
    console.log('in');
    
    const categories = await Category.find({ islisted: true }).lean();
    const product= await Product.find({isListed:true}).lean()

    res.render("addProduct", {
        categories: categories || [],
        product:product|| [],
        errorMessage: null,
        formData: {},
        errors: {} // Add this empty errors object
    });
  } catch (error) {
    console.log('error');
    
    console.error("Error fetching categories:", error);
    res.render("addProduct", {
        categories: [],
        product:[],
        errorMessage: "Error loading categories",
        formData: {},
        errors: {} // Add this empty errors object
    });
  }
};

const handleFileUpload = (files) => {
  return new Promise((resolve, reject) => {
    if (!files || files.length === 0) return resolve([]);
    
    const images = [];
    let processed = 0;
    
    files.forEach(file => {
      const newFilename = Date.now() + '-' + file.originalname;
      const uploadPath = path.join(__dirname, '../public/uploads', newFilename);
      
      fs.rename(file.path, uploadPath, (err) => {
        if (err) return reject(err);
        images.push('uploads/' + newFilename);
        processed++;
        if (processed === files.length) resolve(images);
      });
    });
  });
};

const addproductpost = async (req, res) => {
  try {
    const { productname, category, price, description, stock, brand } = req.body;
    const errors = {};

    // Validation logic
    if (!productname || productname.trim() === '') {
      errors.productname = 'Product name is required';
    }
    if (!category) {
      errors.category = 'Category is required';
    }
    if (!price || isNaN(price)) {
      errors.price = 'Valid price is required';
    }
    if (!description || description.trim() === '') {
      errors.description = 'Description is required';
    }
    if (!stock || isNaN(stock)) {
      errors.stock = 'Valid stock quantity is required';
    }

    // Check if there are any validation errors
    if (Object.keys(errors).length > 0) {
      const categories = await Category.find({ islisted: false }).lean();
      return res.render("addProduct", {
        categories,
        formData: req.body,
        errors,
        errorMessage: "Please correct the errors below"
      });
    }

    // Handle file upload
    let images = [];
    if (req.files && req.files.length > 0) {
      images = await handleFileUpload(req.files);
    }

    // Create new product
    const newProduct = new Product({
      productname,
      category,
      price: parseFloat(price),
      description,
      stock: parseInt(stock),
      image: images,
      brand: brand || 'N/A',
      isListed: req.body.isListed === 'on'
    });

    await newProduct.save();
    res.redirect('/productmanagement');
    
  } catch (error) {
    console.error("Error adding product:", error);
    const categories = await Category.find({ islisted: false }).lean();
    res.render("addProduct", {
      categories,
      formData: req.body,
      errors: {
        general: "An error occurred while adding the product"
      },
      errorMessage: "Failed to add product"
    });
  }
};



const unlistProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send('PRODUCT NOT FOUND');
    }
    product.isListed = !product.isListed;
    await product.save();
    res.redirect('/productmanagement');
  } catch (err) {
    console.log(err);
    return res.status(500).send("Error changing product status");
  }
};


const getEditProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id }).populate('category');
    const categories = await Category.find();
    res.render('editProduct', { product, categories });
    console.log('Product images:', product.image);
  } catch (err) {
    console.error(err);
    res.status(500).render('editProduct', {
      product: null,
      categories: [],
      errorMessage: 'Failed to get product edit page'
    });
  }
};




const postEditProduct = async (req, res) => {
  try {
    console.log('enter into post');
    
    const { productname, category, price, description, stock, isListed, brand } = req.body;
    const productId = req.params.id;

    const existingProduct = await Product.findById(productId);
    
    let images = existingProduct.image || [];
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => 
        'uploads/' + file.filename // Store with uploads/ prefix
      );
      images = [...images, ...newImages];
    }
    console.log('images:',images);
    

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        productname,
        category,
        price: parseFloat(price),
        description,
        stock: parseInt(stock),
        brand: brand || 'N/A',
        isListed: isListed === 'on' || isListed === 'true',
        image: images
      },
      { new: true }
    );
    
    if (!updatedProduct) {
      return res.status(404).send("Product not found");
    }

    // Update the isListed status of the old category if it's changed
    if (updatedProduct.category) {
      const oldCategory = await Category.findById(updatedProduct.category);
      if (oldCategory) {
        oldCategory.islisted = true; // Update based on your logic
        await oldCategory.save();
      }
    }

    // Update the isListed status of the new category
    if (category) {
      const newCategory = await Category.findById(category);
      if (newCategory) {
        newCategory.islisted = true; // Update based on your logic
        await newCategory.save();
      }
    }
    res.redirect('/productmanagement');
  } catch (err) {
    console.error(err);
    const product = await Product.findById(req.params.id).populate('category');
    const categories = await Category.find();
    res.render('editProduct', { 
      product, 
      categories,
      errorMessage: 'Failed to update product' 
    });
  }
};

const deleteImage=async(req,res)=>
{
  const productId=req.body.productId
  const imageIndex=req.body.imageIndex;
  try
  {
    const product=await Product.findById(productId)
    if(!product)
    {
      return res.status(404).send('Product not found')
    }
    if(imageIndex>0|| imageIndex >=product.image.length)
     {
        return res.send(400).send('Invalid image index')
     }
     product.image.splice(imageIndex,1)
     await product.save()
     .then((c)=>{
      console.log('deleted');
      res.status(200).send('Image removed successfully')
      
     })
     .catch((c)=>{
      console.log(err);
      
     })
}
catch(err)
{
  console.log(err);
  res.status(500).send('Internal server error')
  
}
}

const getdeleteProduct= async(req,res)=>
{
  try
  {
    const productId=req.params.id
    console.log('id:',productId);
    await Product.findByIdAndDelete(productId)
    .then((x)=>{
      console.log('product deleted',x);
      res.redirect('/productmanagement')
    })
    .catch((x)=>{
      console.log('error in deleting the product');
      res.redirect('/productmanagement')
      
    })
 }
  catch(err)
  {
    console.log(err);
    res.status(404).send('Internal server error')
  }
}

const getproducts= async(req,res)=>{
  const pdid=req.params.id
  try
  {
    console.log('entered in the allproductsget');
    const products=await Product.findById({pdid}).populate('category')
    console.log('entered into product collection',products);
    if(!products)
    {
      return res.status(404).send('product not found')
    
    }
    res.render('products',{products})
  }
  catch(err)
  {
     console.log(err);
     res.status(500).send('internal server error')
     
  }

}




module.exports = 
{
  productmanagement,
  addproductget,
  addproductpost,
  getEditProduct,
  postEditProduct,
  unlistProduct,
  deleteImage,
  getdeleteProduct,
  getproducts

};