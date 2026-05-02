import { useEffect, useRef } from "react";
import Hls from "hls.js";

const VideoPlayer = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;

    if (Hls.isSupported()) {
      const hls = new Hls();

      hls.loadSource("/hls/master.m3u8"); // use index.m3u8 if single
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS Levels:', hls.levels);
        video.play();
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

  return (
    <video
      ref={videoRef}
      controls
      width="800"
      style={{ background: "black" }}
    />
  );
};

export default VideoPlayer;