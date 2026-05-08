import './VideoPlayer.css';

const PosterThumbnail = ({ showThumbnail, togglePlay, currentVideo }) => {
    return (
        <>
            {showThumbnail && (
                <div className="poster-overlay" onClick={togglePlay}>
                    <img
                        src={`main-thumbnail/${currentVideo}/thumbnail.png`}
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
        </>
    )
};

export default PosterThumbnail;