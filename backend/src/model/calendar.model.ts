import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        provider: {
            type: String,
            enum: ["calendar"],
            required: true,
        },

        status: {
            type: String,
            enum: ["connected", "disconnected", "pending"],
            required: true,
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);

connectionSchema.index(
    { userId: 1, provider: 1 },
    { unique: true }
);

export const Connection = mongoose.model(
    "Connection",
    connectionSchema
);