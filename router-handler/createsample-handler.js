const { MongoClient } = require("mongodb");

// Database constants
const dbName = "biosampledb";
const collectionName = "samples";
const uri = "mongodb://localhost:27017";

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// withDB function abstracts the MongoDB connection, operations execution and disconnection process.
const withDB = async (operations) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        return await operations(collection);
    } finally {
        await client.close();
    }
};

// Utility function to generate a unique sample ID
const generateUniqueSampleId = async (collection) => {
    let newId;
    let duplicate = true;
    while (duplicate) {
        newId = `S${Date.now().toString()}-${Math.floor(Math.random() * 1000000).toString()}`;
        const existingSample = await collection.findOne({ sampleId: newId });
        duplicate = Boolean(existingSample);
    }
    return newId;
};

// Utility function to convert types based on field names
const convertTypes = (obj) => {
    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => {
            if (key.includes('Time') || key.includes('Date')) {
                return [key, new Date(value)];
            } else if (key.includes('Volum') || key.includes('num')) {
                return [key, Number(value)];
            } else {
                return [key, value ? value.toString() : null];
            }
        })
    );
};

// Function to generate subsamples based on provided parameters
const generateSubsamples = ({ sampleId, numSubSamples, subSampleType, createUser, subSampleVolume, subSampleVolumeUnit, other }) => {
    return Array.from({ length: numSubSamples }, (_, index) => ({
        sampleId: `${sampleId}-SS${index + 1}`,
        subSampleNumber: index + 1,
        sampleType: subSampleType,
        createUser,
        subSampleVolume,
        subSampleVolumeUnit,
        other,
        createTime: new Date()
    }));
};

// API endpoint function to create a sample
exports.createSample = async (req, res) => {
    try {
        // Check for required fields
        const requiredFields = ['sourceId', 'subjectId', 'sampleType', 'createUser'];
        for (const field of requiredFields) {
            if (!req.body[field]) throw new Error(`Missing required field: ${field}`);
        }

        const result = await withDB(async samplesCollection => {
            let sampleId = req.body.sampleId;

            // Generate unique sampleId for 'urine' or 'blood' if not provided
            if (["urine", "blood"].includes(req.body.sampleType.toLowerCase()) && !sampleId) {
                sampleId = await generateUniqueSampleId(samplesCollection);
            }

            const newSample = convertTypes({
                sampleId,
                ...req.body,
                actions: req.body.actions ? [req.body.actions] : [],
                createTime: req.body.createTime || new Date()
            });

            // Generate subsamples if numSubSamples is provided and > 0
            if (req.body.numSubSamples > 0) {
                newSample.subsamples = generateSubsamples({
                    sampleId: newSample.sampleId,
                    numSubSamples: req.body.numSubSamples,
                    subSampleType: req.body.subSampleType,
                    createUser: req.body.createUser,
                    subSampleVolume: req.body.subSampleVolume,
                    subSampleVolumeUnit: req.body.subSampleVolumeUnit,
                    other: req.body.other
                });
            } else {
                newSample.subsamples = [];
            }

            await samplesCollection.insertOne(newSample);

            // Formulate the response message based on the number of subsamples
            let responseMessage = 'Sample created successfully';
            if (req.body.numSubSamples > 0) {
                responseMessage += ` along with ${req.body.numSubSamples} subsamples`;
            }
            responseMessage += ".";

            // Return the constructed result for the response outside of withDB
            return {
                status: 201,
                message: responseMessage,
                data: { sampleId: newSample.sampleId }
            };
        });

        // Send the response
        res.status(result.status).json(result);

    } catch (error) {
        console.error(error);

        // Error handling based on the error message
        if (error.message.startsWith('Duplicate key error')) {
            res.status(400).json({
                status: 400,
                message: error.message,
            });
        } else {
            res.status(500).json({
                status: 500,
                message: 'Failed to create sample',
                error: error.message,
            });
        }
    }
};
