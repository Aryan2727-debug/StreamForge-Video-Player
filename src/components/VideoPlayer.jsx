import { useState, useEffect, useRef } from "react";
import Hls from "hls.js";
import './VideoPlayer.css';

const VideoPlayer = () => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [quality, setQuality] = useState("Auto");
  const [levels, setLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(-1); // -1 for Auto
  const [isBuffering, setIsBuffering] = useState(false);

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
  useEffect(() => {
    const video = videoRef.current;

    const updateTime = () => {
        setCurrentTime(video.currentTime);
        setDuration(video.duration || 0);
    }

    const handleBuffering = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("waiting", handleBuffering);
    video.addEventListener("stalled", handleBuffering);
    video.addEventListener("playing", handlePlaying);

    return () => {
        video.removeEventListener("timeupdate", updateTime);
        video.removeEventListener("waiting", handleBuffering);
        video.removeEventListener("stalled", handleBuffering);
        video.removeEventListener("playing", handlePlaying);
    };
  }, []);

  // toggle play/pause state
  const togglePlay = () => {
    const video = videoRef.current;

    if(video.paused) {
        video.play();
        setIsPlaying(true);
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
  }

  // format time in mm:ss for display
  const formatTime = (time) => {
    if(!time) {
        return "00:00";
    }

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  // handling manual video quality change
  const handleQualityChange = (e) => {
    const levelIndex = Number(e.target.value);
    setSelectedLevel(levelIndex);

    if(hlsRef.current) {
        hlsRef.current.currentLevel = levelIndex;
    }
  }

  return (
    <div className="player-container">
      <video ref={videoRef} className="video" />

      {/* Buffering Spinner */}
      {isBuffering && (
        <div className="spinner-overlay">
            <div className="spinner"></div>
        </div>
      )}

      <div className="controls">
        {/* Play / Pause */}
        <button className="play-btn" onClick={togglePlay}>
          {isPlaying ? (
            // Pause Icon
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <rect x="6" y="5" width="4" height="14" />
            <rect x="14" y="5" width="4" height="14" />
            </svg>
        ) : (
            // Play Icon
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <polygon points="5,3 19,12 5,21" />
            </svg>
        )}
        </button>

        {/* Current Time / Duration Display */}
        <span className="time">
            {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {/* Quality */}
        <span className="quality">{quality}</span>

        {/* Quality Selector */}
        <select
            className="quality-selector"
            value={selectedLevel}
            onChange={handleQualityChange}
        >
            <option value={-1}>Auto</option>
            {levels.map(function(level, index) {
                return (
                    <option key={index} value={index}>
                        {level.height}p
                    </option>
                )
            })}
        </select>

        {/* Seek Bar */}
        <input 
          type="range"
          className="seek-bar"
          min="0"
          max={duration}
          value={currentTime}
          onChange={handleSeek}
        />
      </div>
    </div>
  );
};

export default VideoPlayer;