import express from "express";
import AnalyticsEvent from "../models/AnalyticsEvent.js";
import User from "../models/User.js";
import Session from "../models/Session.js";
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

/*
    GET /analytics/summary
*/
router.get(
    "/summary",
    authMiddleware,
    async (req, res) => {
        try {
            const [
                totalUsers,
                totalSessions,
                totalEvents,
                totalVideoPlays,
                totalVideosCompleted
            ] = await Promise.all([
                User.countDocuments(),
                Session.countDocuments(),
                AnalyticsEvent.countDocuments(),
                AnalyticsEvent.countDocuments({ event: "play" }),
                AnalyticsEvent.countDocuments({ event: "playback_completed" })
            ]);

            return res.json({
                totalUsers,
                totalSessions,
                totalEvents,
                totalVideoPlays,
                totalVideosCompleted
            });
        } catch (error) {
            console.error("Analytics Summary Error:", error);
            return res.status(500).json({ success: false, message: "Failed to fetch analytics summary" });
        }
    }
);

/*
    GET /analytics/events
*/
router.get(
    "/events",
    authMiddleware,
    async (req, res) => {
        try {
            const events =
                await AnalyticsEvent.find()
                    .sort({
                        timestamp: -1
                    })
                    .limit(100);

            return res.json(events);
        } catch (error) {
            console.error("Analytics Events Error:", error);
            return res.status(500).json({ success: false, message: "Failed to fetch analytics events" });
        }
    }
);

/*
    GET /analytics/event-breakdown
*/
router.get(
    "/event-breakdown",
    authMiddleware,
    async (req, res) => {
        try {
            const breakdown = await AnalyticsEvent.aggregate([
                    {
                        $group: {
                            _id: "$event",
                            count: {
                                $sum: 1
                            }
                        }
                    },
                    {
                        $sort: {
                            count: -1
                        }
                    }
                ]);

            return res.json(
                breakdown.map(item => ({
                    event: item._id,
                    count: item.count
                }))
            );
        } catch (error) {
            console.error("Event Breakdown Error:", error);
            return res.status(500).json({ success: false, message: "Failed to fetch event breakdown" });
        }
    }
);

/*
    GET /analytics/top-videos
*/
router.get(
    "/top-videos",
    authMiddleware,
    async (req, res) => {
        try {
            const topVideos =
                await AnalyticsEvent.aggregate([
                    {
                        $match: {
                            event: "playback_started"
                        }
                    },
                    {
                        $group: {
                            _id: "$metadata.video",
                            plays: {
                                $sum: 1
                            }
                        }
                    },
                    {
                        $sort: {
                            plays: -1
                        }
                    }
                ]);

            return res.json(
                topVideos.map(video => ({
                    video: video._id,
                    plays: video.plays
                }))
            );
        } catch (error) {
            console.error("Top Videos Error:", error);
            return res.status(500).json({success: false, message: "Failed to fetch top videos" });
        }
    }
);

/*
    GET /analytics/platform-breakdown
*/
router.get(
    "/platform-breakdown",
    authMiddleware,
    async (req, res) => {
        try {
            const breakdown =
                await AnalyticsEvent.aggregate([
                    {
                        $group: {
                            _id: "$platform",
                            count: {
                                $sum: 1
                            }
                        }
                    },
                    {
                        $sort: {
                            count: -1
                        }
                    }
                ]);

            return res.json(
                breakdown.map(item => ({
                    platform: item._id,
                    count: item.count
                }))
            );
        } catch (error) {
            console.error("Platform Breakdown Error:", error);
            return res.status(500).json({ success: false, message: "Failed to fetch platform breakdown" });
        }
    }
);

/*
    GET /analytics/device-breakdown
*/
router.get(
    "/device-breakdown",
    authMiddleware,
    async (req, res) => {
        try {
            const breakdown =
                await AnalyticsEvent.aggregate([
                    {
                        $group: {
                            _id: "$deviceType",
                            count: {
                                $sum: 1
                            }
                        }
                    },
                    {
                        $sort: {
                            count: -1
                        }
                    }
                ]);

            return res.json(
                breakdown.map(item => ({
                    deviceType: item._id,
                    count: item.count
                }))
            );
        } catch (error) {
            console.error("Device Breakdown Error:", error);
            return res.status(500).json({ success: false, message: "Failed to fetch device breakdown" });
        }
    }
);

/*
    GET /analytics/environment-breakdown
*/
router.get(
    "/environment-breakdown",
    authMiddleware,
    async (req, res) => {
        try {
            const breakdown =
                await AnalyticsEvent.aggregate([
                    {
                        $group: {
                            _id: "$environment",
                            count: {
                                $sum: 1
                            }
                        }
                    },
                    {
                        $sort: {
                            count: -1
                        }
                    }
                ]);

            return res.json(
                breakdown.map(item => ({
                    environment: item._id,
                    count: item.count
                }))
            );
        } catch (error) {
            console.error("Environment Breakdown Error:", error);
            return res.status(500).json({ success: false, message: "Failed to fetch environment breakdown" });
        }
    }
);

export default router;