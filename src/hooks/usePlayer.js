import { useEffect, useState, useRef } from "react";
import Hls from "hls.js";

const usePlayer = () => {
    const videoRef = useRef(null);
    const hlsRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [quality, setQuality] = useState("Auto");
    const [levels, setLevels] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState(-1); // -1 for Auto
    const [isBuffering, setIsBuffering] = useState(false);
    const [showThumbnail, setShowThumbnail] = useState(true); // for thumbnail poster display
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Progress %
    const progress = duration ? (currentTime / duration) * 100 : 0;

    // HLS set up and cleanup
    useEffect(() => {
        const video = videoRef.current;

        if (Hls.isSupported()) {
        const hls = new Hls();
        hlsRef.current = hls;

        hls.loadSource("/hls/master.m3u8"); // use index.m3u8 if single
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play();
            setIsPlaying(true);
            // capturing the available quality levels
            setLevels(hls.levels);
        });

        // tracking quality changes
        hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
            const level = hls.levels[data.level];
            if(level) {
                setQuality(`${level.height}p`);
            }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
            console.error("HLS Error:", data);
        });

        return () => {
            hls.destroy();
        };
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = "/hls/master.m3u8";
        }
    }, []);

    // syncing UI with current video time and duration
    // handling buffering state based on video events
    // handling thumbnail display on play
    useEffect(() => {
        const video = videoRef.current;

        const updateTime = () => {
            setCurrentTime(video.currentTime);
            setDuration(video.duration || 0);
        };

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        const handleBuffering = () => setIsBuffering(true);
        const handlePlaying = () => setIsBuffering(false);

        video.addEventListener("timeupdate", updateTime);
        video.addEventListener("waiting", handleBuffering);
        video.addEventListener("stalled", handleBuffering);
        video.addEventListener("playing", handlePlaying);
        video.addEventListener("playing", () => {
            setShowThumbnail(false);
        });
        document.addEventListener("fullscreenchange", handleFullscreenChange);

        return () => {
            video.removeEventListener("timeupdate", updateTime);
            video.removeEventListener("waiting", handleBuffering);
            video.removeEventListener("stalled", handleBuffering);
            video.removeEventListener("playing", handlePlaying);
            video.removeEventListener("playing", () => {
                setShowThumbnail(false);
            });
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, []);

    // toggle play/pause state
    const togglePlay = () => {
        const video = videoRef.current;

        if(video.paused) {
            video.play();
            setIsPlaying(true);
            setShowThumbnail(false);
        } else {
            video.pause();
            setIsPlaying(false);
        }
    };

    // handle user seek actions
    const handleSeek = (e) => {
        const video = videoRef.current;
        video.currentTime = e.target.value;
        setCurrentTime(e.target.value);
    };

    // handling manual video quality change
    const handleQualityChange = (e) => {
        const levelIndex = Number(e.target.value);
        setSelectedLevel(levelIndex);

        if(hlsRef.current) {
            hlsRef.current.currentLevel = levelIndex;
        }
    };

    // restart video from beginning
    const handleRestart = () => {
        const video = videoRef.current;
        video.currentTime = 0;
        setCurrentTime(0);
        video.play();
        setIsPlaying(true);
        setShowThumbnail(false);
    };

    // toggle fullscreen mode
    const toggleFullscreen = () => {
        const videoContainer = videoRef.current.parentElement;

        if(!document.fullscreenElement) {
            videoContainer.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    }

    return {
        videoRef,
        isPlaying,
        currentTime,
        duration,
        quality,
        levels,
        selectedLevel,
        isBuffering,
        showThumbnail,
        isFullscreen,
        progress,
        togglePlay,
        handleSeek,
        handleQualityChange,
        handleRestart,
        toggleFullscreen
    };
}

export default usePlayer;