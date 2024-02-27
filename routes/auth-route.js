// auth-route.js

const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    deleteUser,
    getUserById,
} = require('../router-handler/auth-handler');
const auth = require('../middleware/auth'); // Import the auth middleware 

// POST /auth/register
router.post('/register', async (req, res) => {
    const userData = req.body;

    try {
        const newUser = await registerUser(userData);
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// POST /auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await loginUser(email, password);

        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
        } else {
            res.status(200).json(user);
        }
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'Failed to log in user' });
    }
});

// DELETE /auth/delete/:userId
router.delete('/delete/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const deletedUser = await deleteUser(userId);

        if (!deletedUser) {
            res.status(404).json({ error: 'User not found' });
        } else {
            res.status(200).json({ message: 'User deleted successfully' });
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// GET /auth/user/:userId
router.get('/user/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const user = await getUserById(userId);

        if (!user) {
            res.status(404).json({ error: 'User not found' });
        } else {
            res.status(200).json(user);
        }
    } catch (error) {
        console.error('Error getting user by ID:', error);
        res.status(500).json({ error: 'Failed to get user by ID' });
    }
});

module.exports = router;
