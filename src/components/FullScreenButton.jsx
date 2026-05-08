import './VideoPlayer.css';

const FullScreenButton = ({ isFullscreen, toggleFullscreen }) => {
    return (
        <>
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
        </>

    )
};

export default FullScreenButton;