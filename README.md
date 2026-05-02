# 🎬 StreamForge - HLS Video Player (Basic Setup)

This project is a simple React-based video player that plays HLS (HTTP Live Streaming) video using adaptive bitrate streaming.

---

## 🚀 What This Project Does

- Converts a single video into HLS format  
- Breaks video into small chunks (`.ts` files)  
- Creates playlists (`.m3u8`) for streaming  
- Plays video in browser using hls.js  
- Supports adaptive bitrate (multiple qualities)  

---

## 🧱 Tech Stack

- React (Vite)  
- JavaScript  
- CSS  
- hls.js  
- FFmpeg  

---

## ⚙️ Setup Instructions

### 1. Create Project

npm create vite@latest streamforge
cd streamforge
npm install
npm run dev

---

### 2. Install HLS Library

npm install hls.js

---

### 3. Add Video

Place your video inside:

public/videos/sample.mp4

---

### 4. Generate HLS Files (Adaptive Bitrate)

Run this command:

ffmpeg -i public/videos/sample.mp4 ^
-filter_complex "[0:v]split=3[v1][v2][v3];[v1]scale=1280:720[v1out];[v2]scale=854:480[v2out];[v3]scale=426:240[v3out]" ^
-map "[v1out]" -map 0:a ^
-map "[v2out]" -map 0:a ^
-map "[v3out]" -map 0:a ^
-c:v libx264 -c:a aac ^
-f hls ^
-hls_time 6 ^
-hls_playlist_type vod ^
-master_pl_name master.m3u8 ^
-var_stream_map "v:0,a:0 v:1,a:1 v:2,a:2" ^
public/hls/stream_%v.m3u8

---

## 📂 Output Structure

After running FFmpeg:

public/hls/
 ├── master.m3u8
 ├── stream_0.m3u8
 ├── stream_1.m3u8
 ├── stream_2.m3u8
 ├── stream_0_000.ts
 ├── stream_1_000.ts
 └── ...

---

## 🧠 What These Files Mean

### master.m3u8
- Main playlist file  
- Contains all available video qualities  
- Player selects quality automatically  

### stream_0.m3u8, stream_1.m3u8, stream_2.m3u8
- Each represents one quality level (720p, 480p, 240p)  
- Contains list of video segments  

### .ts files
- Small video chunks (~6 seconds each)  
- Loaded sequentially during playback  

---

## ▶️ Video Player (React)

Basic usage:

hls.loadSource("/hls/master.m3u8");

---

## 🔄 How Streaming Works

1. Player loads master.m3u8  
2. Selects best quality  
3. Loads corresponding stream_x.m3u8  
4. Plays .ts chunks sequentially  
5. Switches quality based on network  

---

## ❗ Notes

- index.m3u8 is not needed (single quality only)  
- Always use master.m3u8 for adaptive streaming  
- Keep HLS files inside public/  

---

## 🚀 Next Steps

- Add custom player controls (play/pause, seek)  
- Display current video quality  
- Add manual quality selector  
- Handle buffering and errors  

---

## 💡 Summary

This project demonstrates how modern video streaming works:

- Video is split into segments  
- Playlists control playback  
- Player dynamically adjusts quality  
