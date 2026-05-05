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
    const [actionOverlay, setActionOverlay] = useState(null); // for showing temporary overlays like Play/Pause, +5s/-5s
    const [hoverTime, setHoverTime] = useState(null); // for thumbnail preview on progress bar hover
    const [hoverX, setHoverX] = useState(0); // for positioning thumbnail preview
    const [currentVideo, setCurrentVideo] = useState("avengers"); // default video

    // List of videos
    const videos = [
        { id: "sample_1920x1080", title: "Earth from Space" },
        { id: "avengers", title: "Avengers: Endgame" }
    ];

    // Constants for Thumbnail Preview
    const THUMB_WIDTH = 160;
    const THUMB_HEIGHT = 90;
    const THUMB_INTERVAL = 5; // seconds per thumbnail
    const COLUMNS = 5; 

    // Progress %
    const progress = duration ? (currentTime / duration) * 100 : 0;

    // HLS set up and cleanup
    useEffect(() => {
        const video = videoRef.current;

        if (!video) return;

        if (hlsRef.current) {
            hlsRef.current.destroy();
        }

        if (Hls.isSupported()) {
        const hls = new Hls();
        hlsRef.current = hls;

        hls.loadSource(`/hls/${currentVideo}/master.m3u8`); // use index.m3u8 if single
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
            video.src = `/hls/${currentVideo}/master.m3u8`;
        }
    }, [currentVideo]);

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

    // Registering keyboard events
    useEffect(() => {
        const handleKeyDown = (e) => {
            const video = videoRef.current;
            if(!video) return;

            // Prevent event triggering when focus is on input elements
            const activeTag = document.activeElement.tagName.toLowerCase();
            if(activeTag === "input" || activeTag === "textarea") return;

            switch(e.code) {
                case "Space":
                    e.preventDefault();
                    togglePlay();
                    break;
                case "ArrowLeft":
                    video.currentTime = Math.max(0, video.currentTime - 5);
                    triggerOverlay("backward");
                    break;
                case "ArrowRight":
                    video.currentTime = Math.min(video.duration, video.currentTime + 5);
                    triggerOverlay("forward");
                    break;
                case "KeyF":
                    toggleFullscreen();
                    break;
                case "KeyR":
                    handleRestart();
                    break;
                default:
                    break;
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    // toggle play/pause state
    function togglePlay() {
        const video = videoRef.current;

        if(video.paused) {
            video.play();
            setIsPlaying(true);
            setShowThumbnail(false);
            triggerOverlay("play");
        } else {
            video.pause();
            setIsPlaying(false);
            triggerOverlay("pause");
        }
    };

    // handle user seek actions
    function handleSeek(e) {
        const video = videoRef.current;
        video.currentTime = e.target.value;
        setCurrentTime(e.target.value);
    };

    // handling manual video quality change
    function handleQualityChange(e) {
        const levelIndex = Number(e.target.value);
        setSelectedLevel(levelIndex);

        if(hlsRef.current) {
            hlsRef.current.currentLevel = levelIndex;
        }
    };

    // restart video from beginning
    function handleRestart() {
        const video = videoRef.current;
        video.currentTime = 0;
        setCurrentTime(0);
        triggerOverlay("restart");
        video.play();
        setIsPlaying(true);
        setShowThumbnail(false);
    };

    // toggle fullscreen mode
    function toggleFullscreen() {
        const videoContainer = videoRef.current.parentElement;

        if(!document.fullscreenElement) {
            videoContainer.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // show temporary overlays for actions like play/pause, forward/backward, restart
    function triggerOverlay(type) {
        setActionOverlay(type);
        setTimeout(() => {
            setActionOverlay(null);
        }, 1000);
    };

    // get thumbnail position based on hover time for progress bar thumbnail preview
    function getThumbnailPosition(time) {
        const index = Math.floor(time / THUMB_INTERVAL);
        const row = Math.floor(index / COLUMNS);
        const col = index % COLUMNS;

        return {
            x: col * THUMB_WIDTH,
            y: row * THUMB_HEIGHT
        };
    };

    // handle mouse move on progress bar to show thumbnail preview
    function handleMouseMove(e) {
        const rect = e.target.getBoundingClientRect();
        const containerRect = videoRef.current.parentElement.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const time = percent * duration;
        const x = e.clientX - containerRect.left;
        setHoverTime(time);
        setHoverX(x);
    };

    // hide thumbnail preview when mouse leaves progress bar
    function handleMouseLeave() {
        setHoverTime(null);
    }

    return {
        videos,
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
        actionOverlay,
        hoverTime,
        hoverX,
        currentVideo,
        setCurrentVideo,
        getThumbnailPosition,
        handleMouseMove,
        handleMouseLeave,
        togglePlay,
        handleSeek,
        handleQualityChange,
        handleRestart,
        toggleFullscreen
    };
}

export default usePlayer;