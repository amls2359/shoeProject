const UserCollection = require('../models/user');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer'); 
require("dotenv").config();

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
            text: `Your OTP is: ${otp}. It expires in 5 minutes.`,
        };

        await transporter.sendMail(mailOptions);
        console.log("OTP sent to:", email);
    } catch (error) {
        console.error("Error sending OTP:", error);
    }
};

//! Render Pages
const userlogin = (req, res) => res.render('UserLogin');
const userSignup = (req, res) => res.render('UserSignup');
const homepage = (req, res) => res.render('Homepage');
const forgetPassword = (req, res) => res.render('forgetPassword');
const otp = (req, res) => res.render('otp');
const resetPassword = (req, res) => res.render('ResetPassword');


//! User Login Handler
const userLoginPost = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserCollection.findOne({ email });

        if (!user) {
            return res.render('UserLogin', { errorMessage: 'User not found', successMessage: null });
        }

        if (password !== user.password) { 
            return res.render('UserLogin', { errorMessage: 'Invalid email or password', successMessage: null });
        }

        return res.render('UserLogin', { 
            successMessage: 'Login successful! Redirecting to homepage...', 
            errorMessage: null 
        });

    } catch (err) {
        return res.render('UserLogin', { 
            errorMessage: 'Invalid email or password', 
            successMessage: null 
        });
    }
};

//! User Signup Handler


const userSignupPost = async (req, res) => {
    const { email, password, username } = req.body;
    try {
        const existingUser = await UserCollection.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.render('UserSignup', { errorMessage: 'User already exists with this email or username' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new UserCollection({
            email,
            username,
            password: hashedPassword // Store the hashed password
        });

        await newUser.save();
        res.render('UserSignup', {
            successMessage: 'User registered successfully! You can now log in.',
            errorMessage: null
        });

    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).render('UserSignup', { errorMessage: 'Internal Server Error', successMessage: null });
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

        // Generate and store OTP
        const otp = generateRandomOtp();
        otpStorage[email] = otp;

        // Send OTP via email
        await sendOtpEmail(email, otp);

        // ✅ Pass `userEmail` when rendering `otp.ejs`
        return res.render('otp', { successMessage: 'OTP has been sent to your email. Please check your inbox.', errorMessage: null, userEmail: email });

    } catch (error) {
        console.error("Error in forgetPasswordPost:", error);
        return res.render('forgetPassword', { errorMessage: 'Something went wrong. Please try again.', successMessage: null });
    }
};


//! OTP Verification Handler
//! OTP Verification Handler
const otpVerifyPost = async (req, res) => {
    const { email, otp1, otp2, otp3, otp4, otp5, otp6 } = req.body;
    const otp = `${otp1}${otp2}${otp3}${otp4}${otp5}${otp6}`;

    if (!otpStorage[email] || otpStorage[email] !== otp) {
        return res.render('otp', { 
            errorMessage: 'Invalid OTP. Try again.', 
            successMessage: null, 
            userEmail: email 
        });
    }

    delete otpStorage[email];

    return res.redirect(`/ResetPassword?successMessage=OTP verified successfully!&email=${email}`);
};

//! Reset Password Handler
const resetPasswordPost = async (req, res) => {
    const { newPassword, confirmPassword, email } = req.body;

    if (!newPassword || !confirmPassword) {
        return res.status(400).json({ 
            success: false, 
            message: 'Please fill in all fields.' 
        });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ 
            success: false, 
            message: 'Passwords do not match.' 
        });
    }

    try {
        const user = await UserCollection.findOne({ email });

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found.' 
            });
        }

        // Update the user's password
        user.password = newPassword; // Assuming you're storing plain text passwords
        await user.save();

        return res.status(200).json({ 
            success: true, 
            message: 'Password reset successful! Redirecting to login page...' 
        });

    } catch (error) {
        console.error('Error resetting password:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Something went wrong. Please try again.' 
        });
    }
};

const resendOtpPost = async (req, res) => {
    console.log('Request body:', req.body); // Log the request body

    const { email } = req.body;

    if (!email) {
        console.log('Email is missing in the request body.'); // Log missing email
        return res.status(400).json({ 
            success: false, 
            message: 'Email is required to resend OTP.' 
        });
    }

    try {
        const newOtp = generateRandomOtp(); 
        console.log(`Generated new OTP for ${email}: ${newOtp}`); // Log the new OTP

        otpStorage[email] = newOtp; // Store the new OTP
        console.log('Updated otpStorage:', otpStorage); // Log the updated otpStorage

        await sendOtpEmail(email, newOtp); // Send the OTP via email
        console.log('OTP email sent successfully.'); // Log email success

        return res.status(200).json({ 
            success: true, 
            message: 'A new OTP has been sent to your email.' 
        });

    } catch (error) {
        console.error("Error resending OTP:", error); // Log the error
        return res.status(500).json({ 
            success: false, 
            message: 'Something went wrong. Try again.' 
        });
    }
};

module.exports = {
    userlogin,
    userSignup,
    userSignupPost,
    userLoginPost,
    homepage,
    forgetPassword,
    forgetPasswordPost,
    otp,
    otpVerifyPost,
    resetPassword,
    resetPasswordPost,
    sendOtpEmail,
    resendOtpPost
};
