const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const path = require('path');

app.use(express.json());

// MongoDB connection setup
const connectToMongoDB = require('./db');

async function startServer() {
    try {
        const { client, db } = await connectToMongoDB();

        // Routes setup
        const createSampleRoute = require('../routes/createsample-route');
        const deleteSampleRoute = require('../routes/deletesample-route');
        const getSampleInfoRoute = require('../routes/getsampleinfo-route');
        const updateSampleRoute = require('../routes/updatesample-route');
        const authRoute = require('../routes/auth-route'); // Include auth route

        app.use('/samples/createSample', createSampleRoute);
        app.use('/samples/deleteSample', deleteSampleRoute);
        app.use('/samples/getSampleInfo', getSampleInfoRoute);
        app.use('/samples/updateSample', updateSampleRoute);
        app.use('/auth', authRoute); // Mount the auth route

        app.listen(port, () => {
            console.log(`Server is running on Port: ${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
}

startServer();
