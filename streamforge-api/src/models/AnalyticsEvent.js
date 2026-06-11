import mongoose from "mongoose";

const analyticsEventSchema = new mongoose.Schema(
    {
        event: {
            type: String,
            required: true,
        },
        environment: {
            type: String,
            enum: ["development", "production"],
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        userEmail: {
            type: String,
            default: null,
        },
        sessionId: {
            type: String,
            default: null,
        },
        platform: {
            type: String,
            default: 'web',
        },
        deviceType: {
            type: String,
            enum: ["desktop", "mobile", "tablet", "tv", "unknown"],
            default: "unknown",
        },
        timestamp: {
            type: Date,
            required: true
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("AnalyticsEvent", analyticsEventSchema);