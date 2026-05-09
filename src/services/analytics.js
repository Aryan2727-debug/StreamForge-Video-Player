export const trackEvent = (eventName, payload = {}) => {
    const analyticsEvent = {
        event: eventName,
        timestamp: new Date().toISOString(),
        ...payload
    };
    console.log("📊 Client Analytics Event:", analyticsEvent)
};