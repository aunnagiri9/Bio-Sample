const { MongoClient, ObjectId } = require("mongodb");

const dbName = "biosampledb";
const collectionName = "samples";
const uri = "mongodb://localhost:27017";

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

exports.deleteSample = async (req, res) => {
    console.log('Entering deleteSample function with sampleId:', req.body.sampleId, 'and docId:', req.body.docId);

    if (!req.body.sampleId && !req.body.docId) {
        return res.status(400).json({
            status: 400,
            message: "Missing sampleId or docId parameter"
        });
    }

    try {
        await client.connect();

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        let filter;
        if (req.body.sampleId) {
            filter = { sampleId: req.body.sampleId };
        } else if (req.body.docId) {
            filter = { _id: ObjectId(req.body.docId) };
        }

        const deletedSample = await collection.findOneAndDelete(filter);
        console.log('Deleted result:', deletedSample);

        if (deletedSample.value) {
            return res.status(200).json({
                status: 200,
                message: "Sample deleted successfully"
            });
        } else {
            return res.status(404).json({
                status: 404,
                message: "Sample not found"
            });
        }
    } catch (error) {
        console.error('Error deleting sample:', error);
        return res.status(500).json({
            status: 500,
            message: "Failed to delete sample",
            error: error.message
        });
    } finally {
        client.close();
    }
};
