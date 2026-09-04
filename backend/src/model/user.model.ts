import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        authUserId: {
            type: String,
            required: true,
            unique: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
        },

        name: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

export const User = mongoose.model("User", userSchema);