import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js"
import passport from "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import cookieParser from "cookie-parser";

dotenv.config();

// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 5001;
const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "https://stream-forge-video-player.vercel.app",
    "http://localhost:5174",
];

app.use(
    cors({
        origin: (origin, callback) => {
            if (
                !origin ||
                allowedOrigins.includes(origin)
            ) {
                callback(null, true);
            } else {
                callback(
                    new Error("Not allowed by CORS")
                );
            }
        },
        credentials: true
    })
);

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use("/auth", authRoutes);
app.use("/analytics", analyticsRoutes);

connectDB();

app.get("/", (req, res) => {
    res.json({
        message: "StreamForge API is running"
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});