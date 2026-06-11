import { API_BASE_URL } from "../config/api";

// eslint-disable-next-line no-unused-vars
let analyticsContext = {
    userId: null,
    sessionId: null
};

export const initializeAnalytics = ({
    userId,
    sessionId
}) => {
    analyticsContext = {
        userId,
        sessionId
    };
};

export const clearAnalytics = () => {
    analyticsContext = {
        userId: null,
        sessionId: null
    };
};

const sendAnalyticsEvent = async (
    analyticsEvent
) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/analytics/events`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(analyticsEvent)
            }
        );

        if (!response.ok) {
            console.error("Analytics API failed:", response.status);
        }
    } catch (error) {
        console.error("Analytics send failed:", error);
    }
};

export const trackEvent = (
    eventName,
    payload = {}
) => {
    const analyticsEvent = {
        event: eventName,
        timestamp: new Date().toISOString(),
        ...payload
    };

    console.log("📊 Client Analytics Event:", analyticsEvent);

    sendAnalyticsEvent(analyticsEvent);
};