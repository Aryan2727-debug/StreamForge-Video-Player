import express from "express";
import AnalyticsEvent from "../models/AnalyticsEvent.js";
import authMiddleware from "../middleware/authMiddleware.js";
import getPlatform from "../utils/getPlatform.js";
import getDeviceType from "../utils/getDeviceType.js";

const router = express.Router();

/*
    POST /analytics/events
*/
router.post(
    "/events",
    authMiddleware,
    async (req, res) => {
        try {
            const {
                event,
                timestamp,
                ...metadata
            } = req.body;

            if (!event) {
                return res.status(400).json({ success: false, message: "Event name is required" });
            }

            const analyticsEvent = await AnalyticsEvent.create({
                    event,
                    // eslint-disable-next-line no-undef
                    environment: process.env.NODE_ENV,
                    userId: req.auth.userId,
                    userEmail: req.user.email,
                    sessionId: req.auth.sessionId,
                    platform: getPlatform(req),
                    deviceType: getDeviceType(req),
                    timestamp: timestamp ? new Date(timestamp) : new Date(),
                    metadata
                });

            return res.status(201).json({ success: true, id: analyticsEvent._id });
        } catch (error) {
            console.error("Analytics Event Error:", error);
            return res.status(500).json({ success: false, message: "Failed to save analytics event" });
        }
    }
);

export default router;