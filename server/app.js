import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { trackServerEvent } from "./services/analyticsService.js";
import { injectAdsIntoManifest } from "./services/adInsertionService.js";

const app = express();
app.use(cors());
app.use(express.static("public"));
const PORT = 3001;

/*
    MASTER MANIFEST
    Returns original master.m3u8
*/
app.get("/api/manifest/:videoId/master.m3u8", (req, res) => {
    const { videoId } = req.params;
    const manifestPath = path.join(
        path.resolve(),
        "public",
        "hls",
        videoId,
        "master.m3u8"
    );

    if(!fs.existsSync(manifestPath)) {
        return res.status(404).send("Master manifest not found");
    }

    const manifest = fs.readFileSync(manifestPath, "utf-8");
    trackServerEvent("master_manifest_requested", { videoId });

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.send(manifest);
});

/*
    MEDIA PLAYLIST
    Inject ads every 20 seconds
*/
app.get("/api/manifest/:videoId/:playlist", (req, res) => {
    const { videoId, playlist } = req.params;
    const playlistPath = path.join(
        path.resolve(),
        "public",
        "hls",
        videoId,
        playlist
    );

    if(!fs.existsSync(playlistPath)) {
        return res.status(404).send("Playlist not found");
    }

    const originalManifest = fs.readFileSync(playlistPath, "utf-8");
    const modifiedManifest = injectAdsIntoManifest({
        manifestContent: originalManifest,
        videoId
    });

    trackServerEvent("media_manifest_requested", { videoId, playlist });

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.send(modifiedManifest);
});

app.listen(PORT, () => {
    console.log(`🚀 DAI Server running on port ${PORT}`);
});