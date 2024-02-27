const express = require('express');
const router = express.Router();
const updateSampleHandler = require('../router-handler/updatesample-handler');

// Middleware to parse JSON data from the request body
router.use(express.json());

// Define an Express route to update sample information
router.put('/update', async (req, res) => {
    // The updateSampleHandler directly deals with req and res
    await updateSampleHandler.updateSample(req, res);
});

module.exports = router;
