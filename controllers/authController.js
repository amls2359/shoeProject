// authController.js
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
        res.redirect('/login');
    });
};
module.exports={
    logout
}