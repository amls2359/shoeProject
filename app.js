const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const UserRouter = require('./routes/UserRouter');
const adminRoute = require('./routes/adminRoute');
const productRoute = require('./routes/productRoute');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo'); // Add this package

const app = express();
const port = 3001;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/mymvcproject')
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

// Session configuration with MongoStore
app.use(session({
    secret: 'your-secret-key-should-be-long-and-complex', // Change this to a strong secret
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/mymvcproject' }),
    cookie: {
        secure: false, // Set to true if using HTTPS
    }
}));

// Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files setup
app.use(express.static(path.join(__dirname, 'public')));
// For product images - make sure this matches where you're saving images
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/images',express.static(path.join(__dirname,'/images')))

// Routes
app.use('/', UserRouter);
app.use('/', productRoute); 
app.use('/admin', adminRoute);

// Error handling middleware
// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('addProduct', { 
      errorMessage: 'Something went wrong!',
      errors: {},
      formData: {},
      categories: [] 
    });
  });
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});