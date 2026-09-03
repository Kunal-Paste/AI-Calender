import mongoose from "mongoose";

export async function connectDB() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        throw new Error("MONGODB_URI is not set");
    }

    try {
        await mongoose.connect(connectionString);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        throw error;
    }
}

export async function closeDB() {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
}