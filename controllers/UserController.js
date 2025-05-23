const UserCollection = require('../models/user');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer'); 
const session=require('express-session')
require("dotenv").config();
const express=require('express')
const app=express()

// app.use(session({
//     secret: 'your-secret-key',
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false } // Set to true if using HTTPS
//   }));

//! Render Pages
const userlogin = (req, res) => res.render('UserLogin');
const userSignup = (req, res) => res.render('UserSignup');
const guesthomepage = (req, res) => res.render('guesthomepage')
const forgetPassword = (req, res) => res.render('forgetPassword');
const otp = (req, res) => res.render('otp');
const resetPassword = (req, res) => res.render('ResetPassword');
const Homepage=(req,res)=>res.render('Homepage')

let otpStorage = {}; // Temporary storage for OTPs

//! Generate a 6-digit OTP
const generateRandomOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};



//! Send OTP Email Function
const sendOtpEmail = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_ADDRESS, 
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_ADDRESS,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP is: ${otp}. It expires in 1 minute.`,
        };

        await transporter.sendMail(mailOptions);
        console.log("OTP sent to:", email);
    } catch (error) {
        console.error("Error sending OTP:", error);
    }
};



const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };
  
  //! User Login Handler
  const userLoginPost = async (req, res) => {
    const { email, password } = req.body;

    // Check if email or password is empty
    if (!email || !password) {
        return res.render('UserLogin', { 
            errorMessage: 'Please fill in all fields', 
            successMessage: null 
        });
    }

    // Validate email format
    if (!validateEmail(email)) {
        return res.render('UserLogin', { 
            errorMessage: 'Please enter a valid email address', 
            successMessage: null 
        });
    }

    try {
        const user = await UserCollection.findOne({ email });

        if (!user) {
            return res.render('UserLogin', { 
                errorMessage: 'User not found', 
                successMessage: null 
            });
        }
        // Check if the user is blocked
        if (user.isblocked) {
            return res.render('UserLogin', { 
                errorMessage: 'You are blocked. Please contact the admin.', 
                successMessage: null 
            });
        }

        // Compare passwords (plain text comparison for now, but you should use bcrypt)
        if (password !== user.password) { 
            return res.render('UserLogin', { 
                errorMessage: 'Invalid email or password', 
                successMessage: null 
            });
        }

        // Set session data
        req.session.UserId = user._id;
        req.session.email = user.email;
        req.session.isAuthenticated = true;

        // Render the login page with a success message
        return res.render('UserLogin', { 
            successMessage: 'Login successful! Redirecting to homepage...', 
            errorMessage: null 
        });

    } catch (err) {
        console.error("Login error:", err);
        return res.render('UserLogin', { 
            errorMessage: 'An error occurred. Please try again.', 
            successMessage: null 
        });
    }
};
  
//! User Signup Handler
const userSignupPost = async (req, res) => {
    const { email, password, username } = req.body;

    // Validate email format
    if (!validateEmail(email)) {
        return res.render('UserSignup', { 
            errorMessage: 'Please enter a valid email address', 
            successMessage: null 
        });
    }

    try {
        // Check if user already exists with the same email or username
        const existingUser = await UserCollection.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.render('UserSignup', { 
                errorMessage: 'User already exists with this email or username', 
                successMessage: null 
            });
        }
        const newUser = new UserCollection({
            email,
            username,
            password // Store the hashed password
        });

        // Save the user to the database
        await newUser.save();

        // Set session variables
        req.session.UserId = newUser._id;
        req.session.email = newUser.email;
        req.session.isAuthenticated = true;

        // Redirect to the login page with a success message
        req.session.successMessage = 'User registered successfully! You can now log in.';
        res.redirect('/UserLogin');

    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).render('UserSignup', { 
            errorMessage: 'Internal Server Error', 
            successMessage: null 
        });
    }
};
//! Forget Password Handler
const forgetPasswordPost = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.render('forgetPassword', { errorMessage: 'Please enter an email.', successMessage: null });
        }

        const user = await UserCollection.findOne({ email });
        if (!user) {
            return res.render('forgetPassword', { errorMessage: 'User not found. Please check your email.', successMessage: null });
        }

        // Generate and store OTP with timestamp
        const otp = generateRandomOtp();
        otpStorage[email] = {
            otp,
            timestamp: Date.now()
        };

        // Send OTP via email
        await sendOtpEmail(email, otp);

        // ✅ Pass `userEmail` and `showResendButton` when rendering `otp.ejs`
        return res.render('otp', { 
            successMessage: 'OTP has been sent to your email. Please check your inbox.', 
            errorMessage: null, 
            userEmail: email,
            showResendButton: false // Default value
        });

    } catch (error) {
        console.error("Error in forgetPasswordPost:", error);
        return res.render('forgetPassword', { errorMessage: 'Something went wrong. Please try again.', successMessage: null });
    }
};


//! OTP Verification Handler
const otpVerifyPost = async (req, res) => {
    const { email, otp1, otp2, otp3, otp4, otp5, otp6 } = req.body;
    const otp = `${otp1}${otp2}${otp3}${otp4}${otp5}${otp6}`;

    const storedOtpData = otpStorage[email];

    if (!storedOtpData || storedOtpData.otp !== otp) {
        return res.render('otp', { 
            errorMessage: 'Invalid OTP. Try again.', 
            successMessage: null, 
            userEmail: email,
            showResendButton: true // Show resend button
        });
    }

    // Check if OTP has expired (1 minute = 60000 milliseconds)
    if (Date.now() - storedOtpData.timestamp > 60000) {
        return res.render('otp', { 
            errorMessage: 'OTP has expired. Please resend OTP.', 
            successMessage: null, 
            userEmail: email,
            showResendButton: true // Show resend button
        });
    }

    delete otpStorage[email];

    return res.redirect(`/ResetPassword?successMessage=OTP verified successfully!&email=${email}`);
};
//! Reset Password Handler
const resetPasswordPost = async (req, res) => {
    const { newPassword, confirmPassword, email } = req.body;

    if (!newPassword || !confirmPassword || !email) {
        return res.render('resetPassword', { 
            success: false, 
            errorMessage: 'Please fill in all fields.',
            email
        });
    }

    if (newPassword !== confirmPassword) {
        return res.render('resetPassword', { 
            success: false, 
            errorMessage: 'Passwords do not match.',
            email
        });
    }

    try {
        const user = await UserCollection.findOne({ email });

        if (!user) {
            return res.render('resetPassword', { 
                success: false, 
                errorMessage: 'User not found.',
                email
            });
        }

        // Update the user's password
        user.password = newPassword; // Hash this password in a real app!
        await user.save();

        // Show success message for 2 seconds and then redirect
        return res.render('resetPassword', { 
            success: true, 
            message: 'Password reset successful! Redirecting to login...',
            email,
            redirect: true // This flag helps in JavaScript redirection
        });

    } catch (error) {
        console.error('Error resetting password:', error);
        return res.render('resetPassword', { 
            success: false, 
            errorMessage: 'Something went wrong. Please try again.',
            email
        });
    }
};


const resendOtpPost = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ 
            success: false, 
            errorMessage: 'Email is required to resend OTP.' 
        });
    }

    try {
        const newOtp = generateRandomOtp(); 
        otpStorage[email] = {
            otp: newOtp,
            timestamp: Date.now()
        };

        await sendOtpEmail(email, newOtp);

        // Render the OTP page with the success message and other required variables
        return res.render('otp', { 
            successMessage: 'A new OTP has been sent to your email.', 
            userEmail: email, 
            showResendButton: false 
        });

    } catch (error) {
        console.error("Error resending OTP:", error);
        return res.status(500).json({ 
            success: false, 
            errorMessage: 'Something went wrong. Try again.' 
        });
    }
};

const logout = (req, res) => {
    // Destroy the session
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Could not log out.');
        }

        // Clear the session cookie
        res.clearCookie('connect.sid'); // 'connect.sid' is the default name for the session cookie

        // Redirect to the login page or home page
        res.redirect('/UserLogin');
    });
};

module.exports = {
    userlogin,
    userSignup,
    userSignupPost,
    userLoginPost,
    guesthomepage,
    forgetPassword,
    forgetPasswordPost,
    otp,
    otpVerifyPost,
    resetPassword,
    resetPasswordPost,
    sendOtpEmail,
    resendOtpPost,
    Homepage,
    logout
};
