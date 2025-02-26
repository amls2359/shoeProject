const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const UserRouter=require('./routes/UserRouter')
const path = require('path');

const app = express();
const port =  3000;

app.use(bodyParser.urlencoded({ extended: true })); 
app.use(bodyParser.json());
app.set('view engine', 'ejs');

app.use('/', UserRouter);

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

mongoose.connect('mongodb://localhost:27017/mymvcproject')
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));