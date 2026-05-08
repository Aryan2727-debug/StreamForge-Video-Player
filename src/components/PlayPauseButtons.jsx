import './VideoPlayer.css';

const PlayPauseButtons = ({ isPlaying, togglePlay }) => {
    return (
        <>
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
        </>

    )
};

export default PlayPauseButtons;