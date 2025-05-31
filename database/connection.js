import mongoose from "mongoose";

const connectdb = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `${process.env.MONGO_URI}AI-POWERED-IT-SUPPORT-PLATFORM`
        );
        console.log(
            `\nMONGO DB CONNECTED SUCCESSFULLY: ${connectionInstance.connection.host}`
        );
    } catch (error) {
        console.log("MONGO DB CONNECTION FAILED", error);
        process.exit(1);
    };
};

export default connectdb;