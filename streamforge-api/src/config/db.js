import mongoose from "mongoose";

const connectDB = async () => {
    try {
        // eslint-disable-next-line no-undef
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.error("❌ MongoDB Connection Failed");
        console.error(error);
        // eslint-disable-next-line no-undef
        process.exit(1);
    }
};

export default connectDB;