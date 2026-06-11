const getPlatform = (req) => {
    const userAgent = req.headers["user-agent"] || "";

    if (userAgent.includes("Tizen")) {
        return "samsung-tizen";
    }

    if (
        userAgent.includes("Web0S") ||
        userAgent.includes("WebOS") ||
        userAgent.includes("webOS")
    ) {
        return "lg-webos";
    }

    if (userAgent.includes("Roku")) {
        return "roku";
    }

    if (userAgent.includes("Android TV")) {
        return "android-tv";
    }

    return "web";
};

export default getPlatform;