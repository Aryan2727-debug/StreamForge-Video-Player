const getDeviceType = (req) => {
    const userAgent = req.headers["user-agent"] || "";

    // TV platforms
    if (
        userAgent.includes("Tizen") ||
        userAgent.includes("Web0S") ||
        userAgent.includes("WebOS") ||
        userAgent.includes("webOS") ||
        userAgent.includes("Roku") ||
        userAgent.includes("Android TV")
    ) {
        return "tv";
    }

    // Tablets
    if (/iPad|Tablet/i.test(userAgent)) {
        return "tablet";
    }

    // Mobile
    if (/Android|iPhone|Mobile/i.test(userAgent)) {
        return "mobile";
    }

    // Desktop
    if (/Windows|Macintosh|Linux/i.test(userAgent)) {
        return "desktop";
    }

    return "unknown";
};

export default getDeviceType;