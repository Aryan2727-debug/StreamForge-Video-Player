import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js"
import passport from "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";

dotenv.config();

// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 5000;
const app = express();

app.use(
    cors({
        // eslint-disable-next-line no-undef
        origin: process.env.CLIENT_URL,
        credentials: true
    })
);

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use("/auth", authRoutes);

connectDB();

app.get("/", (req, res) => {
    res.json({
        message: "StreamForge API is running"
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});