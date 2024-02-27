const express = require('express');
const router = express.Router();
const getSampleInfoHandler = require('../router-handler/getsampleinfo-handler');

// Middleware to parse JSON data from the request body
router.use(express.json());

// Define an Express route to get all samples
router.get('/all', (req, res) => {
    req.condition = "all";
    getSampleInfoHandler.performDatabaseOperation(req, res);
});

// Define an Express route to get sample information by sampleId
router.get('/getinfo/:sampleId', (req, res) => {
    req.data = { sampleId: req.params.sampleId };
    req.condition = "getSampleInfo";
    getSampleInfoHandler.performDatabaseOperation(req, res);
});


// Define an Express route to get a single sample by its sourceId
router.get('/getsample/:sourceId', (req, res) => {
    req.data = { sourceId: req.params.sourceId };
    req.condition = "getSingleSampleBySourceId";
    getSampleInfoHandler.performDatabaseOperation(req, res);
});

// Define an Express route to get sub-samples by their sourceId
router.get('/getsubsamples/:sourceId', (req, res) => {
    req.data = { sourceId: req.params.sourceId };
    req.condition = "getSubSamplesBySourceId";
    getSampleInfoHandler.performDatabaseOperation(req, res);
});

// Define an Express route to get samples with given limit and skip
router.get('/getsamples', (req, res) => {
    req.condition = "getSamplesWithLimitAndSkip";
    getSampleInfoHandler.performDatabaseOperation(req, res);
});

// Define an Express route to get samples by type and/or status date
router.get('/getsamplesbycriteria', (req, res) => {
    req.condition = "getSamplesByTypeAndOrStatusDate";
    getSampleInfoHandler.performDatabaseOperation(req, res);
});

// Additional routes upon more conditions

module.exports = router;
