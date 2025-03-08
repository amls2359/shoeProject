const adminCollection=require('../models/admin')
const UserCollection=require('../models/user')
const express=require('express')

const adminLogin=(req,res)=>res.render('admin')


module.exports={
    adminLogin
}