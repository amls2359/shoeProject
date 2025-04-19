const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const UserRouter=require('./routes/UserRouter')
const adminRoute=require('./routes/adminRoute')
const productRoute=require('./routes/productRoute')
const path = require('path');
const session=require('express-session')
const Swal = require('sweetalert2')
const app = express();
const port =  3000;

app.use(session({
    secret:'key',
    resave:false,
    saveUninitialized:false,
    cookie:{
        secure:false,
        maxAge:1000*60*60*24
    }
}))

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(bodyParser.json());
app.set('view engine', 'ejs');

app.use('/', UserRouter);
app.use('/admin',adminRoute)
app.use('/',productRoute)

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

mongoose.connect('mongodb://localhost:27017/mymvcproject')
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));