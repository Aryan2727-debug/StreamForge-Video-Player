import './VideoPlayer.css';

const SeekBar = ({ duration, currentTime, handleSeek, handleMouseMove, handleMouseLeave, progress }) => {
    return (
        <input
            type="range"
            className="seek-bar"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                background: `linear-gradient(to right, blue ${progress}%, #ccc ${progress}%)`,
            }}
        />
    )
};

export default SeekBar;