// auth-handler.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017/biosampledb'; // Update with your MongoDB connection string
const dbName = 'biosampledb';

async function registerUser(userData) {
    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    try {
        await client.connect();
        const db = client.db(dbName);
        const usersCollection = db.collection('users');

        // Check if the email already exists
        const existingUser = await usersCollection.findOne({ email: userData.email });
        if (existingUser) {
            throw new Error('An account with this email already exists');
        }

        // Hash the user's password before saving it to the database
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(userData.password, salt);

        // Create a new user document
        const newUser = {
            email: userData.email,
            password: passwordHash,
            firstName: userData.firstName,
            lastName: userData.lastName,
        };

        // Insert the new user document
        const result = await usersCollection.insertOne(newUser);

        return result.ops[0];
    } catch (error) {
        throw error;
    } finally {
        client.close();
    }
}

async function loginUser(email, password) {
    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    try {
        await client.connect();
        const db = client.db(dbName);
        const usersCollection = db.collection('users');

        // Find the user by email
        const user = await usersCollection.findOne({ email });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Compare the provided password with the hashed password stored in the database
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            throw new Error('Invalid credentials');
        }

        // User is authenticated
        return user;
    } catch (error) {
        throw error;
    } finally {
        client.close();
    }
}

async function deleteUser(userId) {
    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    try {
        await client.connect();
        const db = client.db(dbName);
        const usersCollection = db.collection('users');

        // Delete the user by their ID
        const result = await usersCollection.deleteOne({ _id: userId });

        if (result.deletedCount === 0) {
            throw new Error('User not found');
        }

        return result;
    } catch (error) {
        throw error;
    } finally {
        client.close();
    }
}

async function getUserById(userId) {
    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    try {
        await client.connect();
        const db = client.db(dbName);
        const usersCollection = db.collection('users');

        // Find the user by their ID
        const user = await usersCollection.findOne({ _id: userId });

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    } catch (error) {
        throw error;
    } finally {
        client.close();
    }
}

module.exports = { registerUser, loginUser, deleteUser, getUserById };
