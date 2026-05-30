export const trackServerEvent = (eventName, payload = {}) => {
    console.log("📡 Server Analytics Event:", {
        event: eventName,
        timestamp: new Date().toISOString(),
        ...payload
    });
};