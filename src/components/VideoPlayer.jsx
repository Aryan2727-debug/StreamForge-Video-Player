import usePlayer from '../hooks/usePlayer';
import './VideoPlayer.css';

const VideoPlayer = () => {
    const {
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
        togglePlay,
        handleSeek,
        handleRestart,
        handleQualityChange,
        toggleFullscreen,
    } = usePlayer();

    // format time in mm:ss for display
    const formatTime = (time) => {
        if(!time) {
            return "00:00";
        }

        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    };

    return (
        <div className="player-container">
        <video ref={videoRef} className="video" />

        {/* Poster Thumbnail */}
        {showThumbnail && (
            <div className="poster-overlay" onClick={togglePlay}>
            <img
                src="/thumbnail.png"
                alt="thumbnail"
                className="poster-image"
            />

            <div className="center-play-btn">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="white">
                <polygon points="5,3 19,12 5,21" />
                </svg>
            </div>
            </div>
        )}

        {/* Buffering Spinner */}
        {isBuffering && (
            <div className="spinner-overlay">
            <div className="spinner"></div>
            </div>
        )}

        {actionOverlay && (
            <div className="action-overlay">
                {actionOverlay === "play" && "▶"}
                {actionOverlay === "pause" && "⏸"}
                {actionOverlay === "backward" && "-5s"}
                {actionOverlay === "forward" && "+5s"}
                {actionOverlay === "restart" && "↻"}
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

            {/* Restart Button */}
            <button className="restart-btn" onClick={handleRestart}>
                ↻
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
            {levels.map(function (level, index) {
                return (
                <option key={index} value={index}>
                    {level.height}p
                </option>
                );
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
            style={{
                background: `linear-gradient(to right, blue ${progress}%, #ccc ${progress}%)`,
            }}
            />

            {/* Fullscreen Button */}
            <button className="fullscreen-btn" onClick={toggleFullscreen}>
                {isFullscreen ? (
                    // Exit fullscreen icon
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M6 16h2v2h2v2H6v-4zm8 0h4v4h-4v-2h2v-2h-2v-2zm-8-8V4h4v2H8v2H6zm10 0V6h-2V4h4v4h-2z" />
                    </svg>
                ) : (
                    // Enter fullscreen icon
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M7 14H5v5h5v-2H7v-3zm12 5v-5h-2v3h-3v2h5zM7 7h3V5H5v5h2V7zm10 3h2V5h-5v2h3v3z" />
                    </svg>
                )}
            </button>
        </div>
        </div>
    );
};

export default VideoPlayer;