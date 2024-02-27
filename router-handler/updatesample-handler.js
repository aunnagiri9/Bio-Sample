const { MongoClient } = require("mongodb");

const dbName = "biosampledb";
const collectionName = "samples";
const uri = "mongodb://localhost:27017";

exports.updateSample = async (req, res) => {
    const { condition, data } = req.body;

    if (!condition || !data) {
        return res.status(400).json({ message: "Missing required parameters." });
    }

    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        let updateObject;

        // Determine the identifier for updating (either sampleId or _id)
        //Ensure that proper indexes exist for your update conditions,especially for the sampleId and _id fields, for efficient querying.
        const identifier = data.sampleId ? { sampleId: data.sampleId } : { _id: data._id };

        switch (condition) {
            case "updateSubsamples":
                updateObject = {
                    $push: {
                        subsamples: { $each: data.subsamples }
                    }
                };
                break;

            case "updateActionsLocation":
                updateObject = {
                    $push: {
                        actions: data.action,
                    },
                    $set: {
                        location: data.location
                    }
                };
                break;

            case "updateRNAQuantification":
                updateObject = {
                    $set: {
                        RNAInfo: data.RNAInfo
                    }
                };
                break;

            default:
                updateObject = {
                    $set: {
                        sourceId: data.sourceId,
                        subjectId: data.subjectId,
                        createUser: data.createUser,
                        type: data.type || "default-type",
                        createTime: data.createTime || new Date(),
                        createMethod: data.createMethod || "default-method",
                        volume: data.volume || 0,
                        volumeUnit: data.volumeUnit || "default-unit",
                        curStep: data.curStep || "default-step",
                    },
                };
                break;
        }

        // Update logic based on whether it's a batch operation or single sample update
        let response;
        if (Array.isArray(identifier.sampleId)) {
            response = await collection.updateMany(
                { sampleId: { $in: identifier.sampleId } },
                updateObject
            );
        } else {
            response = await collection.findOneAndUpdate(
                identifier,
                updateObject,
                { returnOriginal: false }
            );
        }

        return res.status(200).json({
            status: 'success',
            data: response
        });
    } catch (error) {
        console.error("Error updating sample:", error);
        return res.status(500).json({ status: 'error', message: error.message });
    } finally {
        // Ensure the connection is closed to release resources.
        client.close();
    }
};
