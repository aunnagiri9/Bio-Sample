const express = require('express');
const router = express.Router();
const createSampleHandler = require('../router-handler/createsample-handler');

// Middleware to parse JSON data from the request body
router.use(express.json());

// Define an Express route to create a sample
router.post('/create', async (req, res) => {
    // The createSampleHandler directly deals with req and res
    await createSampleHandler.createSample(req, res);
});


// Additional routes can be added as needed...

module.exports = router;
