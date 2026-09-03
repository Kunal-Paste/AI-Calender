import "dotenv/config";
import cors from "cors";
import express from "express";
import { success } from "zod";
import { connectDB } from "./db/mongo.js";

const app = express();
const port = Number(process.env.PORT) || 5000;
const appOrigin = process.env.APP_URL ?? "http://localhost:3000";


app.use(
    cors({
        origin:appOrigin,
        credentials:true
    })
)

app.use(express.json());

app.get("/health", async(_req,res)=> {
    try {
        res.json({
            status:"ok",
            service:"agentic-callender-app"
        })
    } catch{
        res.status(500).json({
            success:false,
            message:"internal server error"
        })
    }
})

async function startServer() {
    try {
        await connectDB();

        app.listen(port, () => {
            console.log(
                `Agentic calendar app is running on port: ${port}`
            );
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();