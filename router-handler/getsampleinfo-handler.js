const { MongoClient } = require("mongodb");

const dbName = "biosampledb";
const collectionName = "samples";
const uri = "mongodb://localhost:27017";

const withDB = async (operation) => {
    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    try {
        await client.connect();
        const db = client.db(dbName);
        return await operation(db);
    } catch (error) {
        console.error("An error occurred:", error);
        throw error;
    } finally {
        await client.close();
    }
};

exports.performDatabaseOperation = async (req, res) => {
    const { condition, data } = req;

    if (!condition) {
        return res.status(400).json({
            status: 400,
            message: 'Missing condition parameter',
        });
    }

    try {
        switch (condition) {
            case "all":
                const allSamples = await withDB(async (db) => {
                    const collection = db.collection(collectionName);
                    return collection.find().toArray();
                });

                if (!allSamples.length) {
                    return res.status(404).json({
                        status: 404,
                        message: 'No samples found',
                    });
                }
                return res.status(200).json(allSamples);

            case "getSampleInfo":
                if (!data.sampleId) {
                    return res.status(400).json({
                        status: 400,
                        message: 'Missing sampleId parameter',
                    });
                }
                const sample = await withDB(async (db) => {
                    const collection = db.collection(collectionName);
                    return collection.findOne({ sampleId: data.sampleId });
                });

                if (!sample) {
                    return res.status(404).json({
                        status: 404,
                        message: `No sample info found with ID ${data.sampleId}`,
                    });
                }
                return res.status(200).json(sample);

            case "getSingleSampleBySourceId":
                if (!data.sourceId) {
                    return res.status(400).json({
                        status: 400,
                        message: 'Missing sourceId parameter',
                    });
                }
                const singleSample = await withDB(async (db) => {
                    const collection = db.collection(collectionName);
                    return collection.findOne({ sourceId: data.sourceId });
                });

                if (!singleSample) {
                    return res.status(404).json({
                        status: 404,
                        message: `No sample found with sourceId ${data.sourceId}`,
                    });
                }
                return res.status(200).json(singleSample);

            case "getSubSamplesBySourceId":
                if (!data.sourceId) {
                    return res.status(400).json({
                        status: 400,
                        message: 'Missing sourceId parameter',
                    });
                }
                const sampleWithSubsamples = await withDB(async (db) => {
                    const collection = db.collection(collectionName);
                    return collection.findOne({ sourceId: data.sourceId });
                });

                if (!sampleWithSubsamples) {
                    return res.status(404).json({
                        status: 404,
                        message: `No sample found with sourceId ${data.sourceId}`,
                    });
                }

                if (sampleWithSubsamples.subsample && sampleWithSubsamples.subsample > 0) {
                    return res.status(200).json(sampleWithSubsamples.subsamples);
                } else {
                    return res.status(404).json({
                        status: 404,
                        message: `No subsamples found for sourceId ${data.sourceId}`,
                    });
                }

            case "getSamplesWithLimitAndSkip":
                if (!data.limit || !data.skip) {
                    return res.status(400).json({
                        status: 400,
                        message: 'Missing limit or skip parameter',
                    });
                }
                const samplesWithLimitAndSkip = await withDB(async (db) => {
                    const collection = db.collection(collectionName);
                    return collection.find()
                        .sort({ createTime: -1 })
                        .limit(data.limit)
                        .skip(data.skip)
                        .toArray();
                });

                if (!samplesWithLimitAndSkip.length) {
                    return res.status(404).json({
                        status: 404,
                        message: 'No samples found with given parameters',
                    });
                }
                return res.status(200).json(samplesWithLimitAndSkip);

            case "getSamplesByTypeAndOrStatusDate":
                let query = {};
                if (data.sampleTypes && data.sampleTypes.length > 0) {
                    query.sampleType = { $in: data.sampleTypes };
                }
                if (data.status) {
                    query.status = data.status;
                }
                if (data.date) {
                    query.createTime = { $gte: new Date(data.date) };
                }

                const samplesByTypeAndOrStatusDate = await withDB(async (db) => {
                    const collection = db.collection(collectionName);
                    return collection.find(query).toArray();
                });

                if (!samplesByTypeAndOrStatusDate.length) {
                    return res.status(404).json({
                        status: 404,
                        message: 'No samples found with given parameters',
                    });
                }
                return res.status(200).json(samplesByTypeAndOrStatusDate);

            default:
                return res.status(400).json({
                    status: 400,
                    message: 'Invalid condition',
                });
        }
    } catch (error) {
        console.error('Error in performDatabaseOperation:', error);
        return res.status(500).json({
            status: 500,
            message: 'Internal server error',
            error: error.message,
        });
    }
};
