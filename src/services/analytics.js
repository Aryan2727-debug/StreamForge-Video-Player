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

export const trackEvent = (
    eventName,
    payload = {}
) => {
    const analyticsEvent = {
        event: eventName,
        timestamp: new Date().toISOString(),
        userId: analyticsContext.userId,
        sessionId: analyticsContext.sessionId,
        ...payload
    };

    console.log("📊 Client Analytics Event:", analyticsEvent);
};