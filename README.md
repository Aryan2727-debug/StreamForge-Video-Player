# 🎬 StreamForge - HLS Video Player (Advanced)

A custom-built React-based video player that supports HLS streaming, adaptive bitrate playback, custom controls, keyboard interactions, and thumbnail previews using sprite sheets.

---

## 🚀 What This Project Does

- Converts video into HLS format (adaptive bitrate)
- Streams video using `.m3u8` playlists and `.ts` segments
- Implements a **custom video player UI (no native controls)**
- Supports adaptive quality switching
- Supports optional **Server-Side Ad Insertion (SSAI / DAI)**
- Dynamically stitches ad segments into HLS manifests
- Supports feature-flag based SSAI enable/disable
- Adds keyboard shortcuts and interaction feedback
- Displays thumbnail previews using sprite sheets

---

## 🧱 Tech Stack

- React (Vite)  
- JavaScript  
- Node.js
- Express
- CSS  
- hls.js  
- FFmpeg  

---

## ✨ Features

### 🎛️ Custom Player Controls
- Fully custom UI built from scratch (no native browser controls)
- Play / Pause toggle with animated icons
- Restart button to replay the video from the beginning
- Current time / total duration display (formatted as `mm:ss`)
- Quality indicator showing the currently active resolution
- Quality selector dropdown (Auto + all available HLS levels)
- Custom seek bar with live progress fill (gradient-based)
- Fullscreen toggle with dynamic enter/exit icons
- Volume slider with mute toggle

### 📡 Adaptive Bitrate Streaming (HLS)
- Streams video using `hls.js` and `.m3u8` playlists
- Automatically picks the best quality based on network conditions
- Supports manual quality override via the quality selector
- Tracks `LEVEL_SWITCHED` events to keep the UI in sync
- Native HLS fallback for Safari (`application/vnd.apple.mpegurl`)
- Graceful HLS error logging

### 📺 Server-Side Ad Insertion (SSAI / DAI)
StreamForge supports optional Server-Side Ad Insertion (SSAI), also known as Dynamic Ad Insertion (DAI).

Instead of the player requesting ads separately, the backend dynamically modifies HLS manifests and stitches ad segments directly into the content stream.

The player receives a single HLS playlist and treats ads as part of the video stream.

### Architecture

Frontend Player
↓
<br />
Playback Request
↓
<br />
Node.js + Express DAI Backend
↓
<br />
Manifest Manipulation
↓
<br />
Ad Injection
↓
<br />
Modified HLS Manifest
↓
<br />
hls.js Playback

## Current V1 Capabilities

- Mid-roll ad insertion
- Manifest-level ad stitching
- Duration-based ad scheduling
- HLS discontinuity handling
- Ad break signaling
- Analytics tracking
- Feature-flag controlled enable/disable

### 🎬 Playback Feedback Overlays
- Temporary action overlays for Play, Pause, +5s, -5s, and Restart
- Buffering spinner overlay shown during `waiting` / `stalled` events
- Poster thumbnail with a center play button before playback starts

### 🖼️ Thumbnail Preview on Hover
- Sprite-sheet based thumbnail preview while hovering the seek bar
- Hover position dynamically calculated and clamped within the player
- Hovered timestamp displayed under the preview image

### 🖥️ Fullscreen Support
- Native Fullscreen API integration
- Listens to `fullscreenchange` to keep UI state consistent
- Icon and behavior update automatically on enter/exit

### 📊 Analytics Integration
- Lightweight event tracking via `analytics.js` service
- Tracks all user interactions: play, pause, seek, quality change, restart, fullscreen, volume, mute
- Each event is logged as a structured JSON object with `event`, `timestamp`, and contextual payload
- Easily extensible — swap `console.log` for a `fetch()` call to send events to a backend

### 🧹 Lifecycle & Cleanup
- HLS instance is properly destroyed on unmount
- All video and document event listeners are cleaned up
- Refs (`videoRef`, `hlsRef`) used to avoid unnecessary re-renders

---

## 🖼️ Thumbnail Integration (Sprite Sheet Approach)

StreamForge uses a **sprite sheet** to display thumbnail previews when the user hovers over the seek bar. Instead of loading dozens of individual images at runtime, all thumbnails are packed into a single image, and the correct frame is shown by shifting `background-position` in CSS.

### 🔧 How It Works

1. Frames are extracted from the source video at a fixed interval (1 frame every 5 seconds).
2. All extracted frames are tiled into a single sprite image (5 columns × 4 rows).
3. On hover over the seek bar, the player computes which thumbnail corresponds to the hovered timestamp:
   - `index = floor(hoverTime / THUMB_INTERVAL)`
   - `row = floor(index / COLUMNS)`
   - `col = index % COLUMNS`
   - `x = col * THUMB_WIDTH`, `y = row * THUMB_HEIGHT`
4. The thumbnail tile is rendered using `background-image` + `background-position` from `/sprite/sprite.jpg`.

### 📐 Sprite Configuration

| Property | Value |
| --- | --- |
| Thumbnail width | `160px` |
| Thumbnail height | `90px` |
| Interval per thumbnail | `5s` |
| Grid layout | `5 columns × 4 rows` |
| Sprite path | `/public/sprite/sprite.jpg` |

### 🛠️ FFmpeg Commands Used

**Step 1 — Extract individual thumbnails (1 every 5 seconds, scaled to 160×90):**

```bash
ffmpeg -i public/videos/sample_1920x1080.mp4 -vf "fps=1/5,scale=160:90" thumbnails/thumb_%03d.jpg
```

**Step 2 — Combine extracted thumbnails into a single 5×4 sprite sheet:**

```bash
ffmpeg -i thumbnails/thumb_%03d.jpg -vf "tile=5x4" public/sprite/sprite.jpg
```

### ✅ Why Sprite Sheets?

- **One HTTP request** instead of N image fetches
- **Instant** preview rendering on hover (no flicker / loading delay)
- **Lightweight** — a single optimized JPEG vs. many small files
- **Simple math** to map a timestamp to a tile position

---

## ⚙️ Setup Instructions

### 1. Create Project

```bash
npm create vite@latest streamforge
cd streamforge
npm install
npm run dev
```
---

### 2. Install HLS Library

```bash
npm install hls.js
```

---

### 3. Add Video

Place your video inside:

public/videos/sample.mp4

---

### 4. Generate HLS Files (Adaptive Bitrate)

Run this command:

```bash
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
```

---

## 📂 Output Structure

After running FFmpeg:

public/hls/
<br />
 ├── master.m3u8
<br/>
 ├── stream_0.m3u8
<br/>
 ├── stream_1.m3u8
<br/>
 ├── stream_2.m3u8
<br/>
 ├── stream_0_000.ts
<br/>
 ├── stream_1_000.ts
<br/>
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

```bash
hls.loadSource("/hls/master.m3u8");
```

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