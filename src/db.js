//db.js

const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017/biosampledb'; // Replace with your MongoDB connection string
const dbName = 'biosampledb';

async function connectToMongoDB() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db(dbName);
        return { client, db };
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        throw error;
    }
}

module.exports = connectToMongoDB;
