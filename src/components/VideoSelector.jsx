import './VideoPlayer.css';

const VideoSelector = ({ videos, currentVideo, setCurrentVideo }) => {
    return (
        <>
            <div className="video-selector">
                <label className="video-label">Select Video</label>

                <div className="select-wrapper">
                    <select
                        value={currentVideo}
                        onChange={(e) => setCurrentVideo(e.target.value)}
                    >
                    {videos.map((v) => (
                        <option key={v.id} value={v.id}>
                            {v.title}
                        </option>
                    ))}
                    </select>
                </div>
            </div>
        </>
    )
};

export default VideoSelector;