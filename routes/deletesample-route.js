const express = require('express');
const router = express.Router();
const deleteSampleHandler = require('../router-handler/deletesample-handler');

// Middleware to parse JSON data from the request body
router.use(express.json());

// Define an Express route to delete a sample
router.delete('/delete', async (req, res) => {
    // The deleteSampleHandler directly deals with req and res
    await deleteSampleHandler.deleteSample(req, res);
});

module.exports = router;
