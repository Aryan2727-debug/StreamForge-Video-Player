import usePlayer from '../hooks/usePlayer';
import SeekBar from './SeekBar';
import QualitySelector from './QualitySelector';
import FullScreenButton from './FullScreenButton';
import VolumeControls from './VolumeControls';
import PlayPauseButtons from './PlayPauseButtons';
import ThumbnailPreview from './ThumbnailPreview';
import ActionOverlay from './ActionOverlay';
import BufferingSpinner from './BufferingSpinner';
import PosterThumbnail from './PosterThumbnail';
import VideoSelector from './VideoSelector';
import './VideoPlayer.css';

const VideoPlayer = () => {
    const {
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
        toggleMute,
        handleVolumeChange,
        setCurrentVideo,
        getThumbnailPosition,
        handleMouseMove,
        handleMouseLeave,
        togglePlay,
        handleSeek,
        handleRestart,
        handleQualityChange,
        toggleFullscreen,
        toggleDAI
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

    // thumbnail co-ordinates
    const { x, y } = hoverTime !== null ? getThumbnailPosition(hoverTime) : { x: 0, y: 0 };

    return (
        <>
            {/* Video Selector */}
            <VideoSelector 
                videos={videos}
                currentVideo={currentVideo}
                setCurrentVideo={setCurrentVideo}
            />
            
            {/* Media Player */}
            <div className="player-container">
                <video ref={videoRef} className="video" />

                {/* Poster Thumbnail */}
                <PosterThumbnail 
                    showThumbnail={showThumbnail}
                    togglePlay={togglePlay}
                    currentVideo={currentVideo}
                />

                {/* Buffering Spinner */}
                <BufferingSpinner isBuffering={isBuffering} />

                {/* Action Overlay */}
                <ActionOverlay actionOverlay={actionOverlay} />

                {/* Thumbnail Preview */}
                <ThumbnailPreview 
                    hoverTime={hoverTime}
                    hoverX={hoverX}
                    currentVideo={currentVideo}
                    x={x}
                    y={y}
                    formatTime={formatTime}
                />

                <div className="controls">
                    {/* Play / Pause Buttons */}
                    <PlayPauseButtons 
                        isPlaying={isPlaying}
                        togglePlay={togglePlay}
                    />
                    
                    {/* Restart Button */}
                    <button className="restart-btn" onClick={handleRestart}>
                        ↻
                    </button>

                    {/* Current Time / Duration Display */}
                    <span className="time">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </span>

                    {/* Volume Controls */}
                    <VolumeControls 
                        isMuted={isMuted}
                        volume={volume}
                        toggleMute={toggleMute}
                        handleVolumeChange={handleVolumeChange}
                    />
                    
                    {/* Quality Display and Quality Selector */}
                    <QualitySelector 
                        quality={quality}
                        selectedLevel={selectedLevel}
                        handleQualityChange={handleQualityChange}
                        levels={levels}
                    />

                    {/* DAI Feature Toggle Button */}
                    <button
                        className={`dai-toggle ${
                            isDAIEnabled ? "enabled" : ""
                        }`}
                        onClick={toggleDAI}
                    >
                        {isDAIEnabled
                            ? "DAI/SSAI: ON"
                            : "DAI/SSAI: OFF"}
                    </button>
                    
                    {/* Seek Bar */}
                    <SeekBar 
                        duration={duration}
                        currentTime={currentTime}
                        handleSeek={handleSeek}
                        handleMouseMove={handleMouseMove}
                        handleMouseLeave={handleMouseLeave}
                        progress={progress}
                    />
                    
                    {/* Fullscreen Button */}
                    <FullScreenButton 
                        isFullscreen={isFullscreen}
                        toggleFullscreen={toggleFullscreen}
                    />
                </div>
        </div>
        </>
    );
};

export default VideoPlayer;