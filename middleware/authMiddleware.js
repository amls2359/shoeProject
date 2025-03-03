// middleware/authMiddleware.js
const authMiddleware = (req, res, next) => {
    if (req.session && req.session.isAuthenticated) {
        next(); // User is authenticated, proceed to the next middleware/route handler
    } else {
        res.redirect('/UserLogin'); // User is not authenticated, redirect to login page
    }
};

module.exports = authMiddleware;