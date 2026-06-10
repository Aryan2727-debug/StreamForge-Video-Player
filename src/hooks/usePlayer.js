import { useEffect, useState, useRef } from "react";
import playerConfig from "../config/playerConfig";
import Hls from "hls.js";
import { trackEvent } from "../services/analytics";

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
    const [volume, setVolume] = useState(1); // for volume controls
    const [isDAIEnabled, setIsDAIEnabled] = useState(playerConfig.dai.enabled); // for DAI ad integration
    const [isMuted, setIsMuted] = useState(false); // for mute/unmute state
    const [isAdPlaying, setIsAdPlaying] = useState(false); // to track if currently playing an ad

    // List of videos
    const videos = playerConfig.videos;

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
        const hls = new Hls({
            maxBufferHole: 2,
            highBufferWatchdogPeriod: 2,
            nudgeOffset: 0.1,
            nudgeMaxRetry: 10,
            backBufferLength: 90
        });
        hlsRef.current = hls;

        const manifestUrl = isDAIEnabled
            ? `http://localhost:3001/api/manifest/${currentVideo}/master.m3u8`
            : `/hls/${currentVideo}/master.m3u8`;
        hls.loadSource(manifestUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play();
            setIsPlaying(true);
            trackEvent("playback_started", { video: currentVideo });
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
    }, [currentVideo, isDAIEnabled]);

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
        video.addEventListener("ended", handlePlaybackEnded);
        document.addEventListener("fullscreenchange", handleFullscreenChange);

        return () => {
            video.removeEventListener("timeupdate", updateTime);
            video.removeEventListener("waiting", handleBuffering);
            video.removeEventListener("stalled", handleBuffering);
            video.removeEventListener("playing", handlePlaying);
            video.removeEventListener("playing", () => {
                setShowThumbnail(false);
            });
            video.removeEventListener("ended", handlePlaybackEnded);
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
                    trackEvent("seek_backward", { video: currentVideo, seconds: 5 });
                    break;
                case "ArrowRight":
                    video.currentTime = Math.min(video.duration, video.currentTime + 5);
                    triggerOverlay("forward");
                    trackEvent("seek_forward", { video: currentVideo, seconds: 5 });
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

    function handlePlaybackEnded() {
        trackEvent("playback_ended", { video: currentVideo });
    }

    // toggle play/pause state
    function togglePlay() {
        const video = videoRef.current;

        if(video.paused) {
            video.play();
            setIsPlaying(true);
            setShowThumbnail(false);
            triggerOverlay("play");
            trackEvent("play", { video: currentVideo, currentTime: video.currentTime });
        } else {
            video.pause();
            setIsPlaying(false);
            triggerOverlay("pause");
            trackEvent("pause", { video: currentVideo, currentTime: video.currentTime });
        }
    };

    // handle user seek actions
    function handleSeek(e) {
        const video = videoRef.current;
        video.currentTime = e.target.value;
        setCurrentTime(e.target.value);
        trackEvent("seek", { video: currentVideo, seekTime: e.target.value });
    };

    // handling manual video quality change
    function handleQualityChange(e) {
        const levelIndex = Number(e.target.value);
        setSelectedLevel(levelIndex);

        if(hlsRef.current) {
            hlsRef.current.currentLevel = levelIndex;
        }
        trackEvent("quality_change", { video: currentVideo, quality: levelIndex });
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
        trackEvent("restart", { video: currentVideo });
    };

    // toggle fullscreen mode
    function toggleFullscreen() {
        const videoContainer = videoRef.current.parentElement;

        if(!document.fullscreenElement) {
            videoContainer.requestFullscreen();
            setIsFullscreen(true);
            trackEvent("enter_fullscreen", { video: currentVideo });
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
            trackEvent("exit_fullscreen", { video: currentVideo });
        }
    };

    // show temporary overlays for actions like play/pause, forward/backward, restart
    function triggerOverlay(type) {
        setActionOverlay(type);
        setTimeout(() => {
            setActionOverlay(null);
        }, 1000);
        trackEvent("action_overlay", { video: currentVideo, action: type });
    };

    // get thumbnail position based on hover time for progress bar thumbnail preview
    function getThumbnailPosition(time) {
        const index = Math.floor(time / playerConfig.thumbnailConfig.THUMB_INTERVAL);
        const row = Math.floor(index / playerConfig.thumbnailConfig.COLUMNS);
        const col = index % playerConfig.thumbnailConfig.COLUMNS;

        return {
            x: col * playerConfig.thumbnailConfig.THUMB_WIDTH,
            y: row * playerConfig.thumbnailConfig.THUMB_HEIGHT
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
    };

    function handleVolumeChange(e) {
        const video = videoRef.current;
        const newVolume = parseFloat(e.target.value);
        video.volume = newVolume;
        setVolume(newVolume);

        if(newVolume === 0) {
            video.muted = true;
            setIsMuted(true);
        } else {
            video.muted = false;
            setIsMuted(false);
        }
        trackEvent("volume_change", { video: currentVideo, volume: newVolume });
    };

    function toggleMute() {
        const video = videoRef.current;
        video.muted = !video.muted;
        setIsMuted(video.muted);
        trackEvent(video.muted ? "mute" : "unmute", { video: currentVideo });
    };

    function toggleDAI() {
        setIsDAIEnabled(prev => {
            const next = !prev;
            trackEvent(
                next
                    ? "dai_enabled"
                    : "dai_disabled",
                {
                    video: currentVideo
                }
            );

        return next;
        });
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
        volume,
        isMuted,
        isDAIEnabled,
        isAdPlaying,
        setIsAdPlaying,
        toggleMute,
        handleVolumeChange,
        setCurrentVideo,
        getThumbnailPosition,
        handleMouseMove,
        handleMouseLeave,
        togglePlay,
        handleSeek,
        handleQualityChange,
        handleRestart,
        toggleFullscreen,
        toggleDAI
    };
}

export default usePlayer;