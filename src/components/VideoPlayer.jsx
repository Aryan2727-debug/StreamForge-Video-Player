import { useState, useEffect, useRef } from "react";
import Hls from "hls.js";
import './VideoPlayer.css';

const VideoPlayer = () => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;

    if (Hls.isSupported()) {
      const hls = new Hls();

      hls.loadSource("/hls/master.m3u8"); // use index.m3u8 if single
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play();
        setIsPlaying(true);
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

  return (
    <div className="player-container">
      <video ref={videoRef} className="video" />

      <div className="controls">
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
      </div>
    </div>
  );
};

export default VideoPlayer;