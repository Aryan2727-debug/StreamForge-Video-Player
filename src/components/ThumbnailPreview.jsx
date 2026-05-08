import './VideoPlayer.css';

const ThumbnailPreview = ({ hoverTime, hoverX, currentVideo, x, y, formatTime }) => {
    return (
        <>
            {hoverTime !== null && (
                <div
                    className="thumbnail-preview"
                    style={{
                        left: `${hoverX}px`,
                        backgroundImage: `url(/sprite/${currentVideo}/sprite.jpg)`,
                        backgroundPosition: `-${x}px -${y}px`,
                    }}
                >
                    <div className="thumbnail-time">
                        {formatTime(hoverTime)}
                    </div>
                </div>
            )}
        </>
    )
};

export default ThumbnailPreview;