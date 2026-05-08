import './VideoPlayer.css';

const VolumeControls = ({ isMuted, volume, toggleMute, handleVolumeChange }) => {
    return (
        <>
            <div className="volume-controls">
                {/* Mute Button */}
                <button
                    className="control-btn"
                    onClick={toggleMute}
                >
                    {isMuted || volume === 0 ? "🔇" : "🔊"}
                </button>

                {/* Volume Slider */}
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="volume-slider"
                    style={{
                        "--volume-percent": volume * 100,
                    }}
                />
            </div>
        </>
    )
};

export default VolumeControls;