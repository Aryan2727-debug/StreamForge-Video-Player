# 🏗️ StreamForge — Architecture

This document describes the internal architecture of StreamForge: how each system works, how components connect, and how data flows through the player.

---

## 📐 Component Architecture

StreamForge follows a **smart hook + dumb components** pattern. All state and logic lives in a single custom hook (`usePlayer`), and every UI component is a pure presentational layer that receives props.

```
App
└── VideoPlayer (orchestrator — uses usePlayer hook)
    ├── VideoSelector              ← video switching dropdown
    └── player-container
        ├── <video ref={videoRef}> ← HLS stream target
        ├── PosterThumbnail        ← initial poster + center play button
        ├── BufferingSpinner       ← loading overlay
        ├── ActionOverlay          ← temporary action feedback (+5s, -5s, ▶, ⏸, ↻)
        ├── ThumbnailPreview       ← sprite-based hover preview
        └── controls bar
            ├── PlayPauseButtons
            ├── restart button
            ├── time display (mm:ss / mm:ss)
            ├── VolumeControls
            │   ├── mute toggle
            │   └── volume slider
            ├── QualitySelector
            │   ├── quality badge (live readout)
            │   └── quality dropdown
            ├── SeekBar
            └── FullScreenButton
```

### Component Roles

| Component | File | Responsibility |
|---|---|---|
| **App** | `App.jsx` | Root shell — renders `VideoPlayer` |
| **VideoPlayer** | `components/VideoPlayer.jsx` | Orchestrator — calls `usePlayer`, wires props to all child components |
| **PlayPauseButtons** | `components/PlayPauseButtons.jsx` | SVG play/pause icons, calls `togglePlay` |
| **SeekBar** | `components/SeekBar.jsx` | Range input with gradient fill, hover tracking for thumbnails |
| **QualitySelector** | `components/QualitySelector.jsx` | Dropdown: Auto + each HLS level |
| **VolumeControls** | `components/VolumeControls.jsx` | Mute button + horizontal volume slider |
| **FullScreenButton** | `components/FullScreenButton.jsx` | Fullscreen enter/exit toggle |
| **ThumbnailPreview** | `components/ThumbnailPreview.jsx` | Sprite sheet preview positioned above seek bar |
| **PosterThumbnail** | `components/PosterThumbnail.jsx` | Initial poster overlay with center play button |
| **VideoSelector** | `components/VideoSelector.jsx` | Dropdown to switch between available videos |
| **ActionOverlay** | `components/ActionOverlay.jsx` | Temporary centered overlay (▶, ⏸, +5s, -5s, ↻) |
| **BufferingSpinner** | `components/BufferingSpinner.jsx` | Animated red spinner shown during buffering |

---

## 🎣 Hook Responsibilities — `usePlayer`

`usePlayer` (`src/hooks/usePlayer.js`) is the **single source of truth** for the entire player. It owns all state, refs, side effects, and action handlers.

### State (22 reactive values)

| State | Type | Purpose |
|---|---|---|
| `isPlaying` | `boolean` | Whether the video is currently playing |
| `currentTime` | `number` | Current playback position (seconds) |
| `duration` | `number` | Total video length (seconds) |
| `quality` | `string` | Active quality label (e.g. `"720p"`) |
| `levels` | `array` | Available HLS quality levels |
| `selectedLevel` | `number` | User-selected level index (`-1` = Auto) |
| `isBuffering` | `boolean` | Whether the player is buffering |
| `showThumbnail` | `boolean` | Whether the poster overlay is visible |
| `isFullscreen` | `boolean` | Whether the player is in fullscreen |
| `actionOverlay` | `string\|null` | Current overlay type (`"play"`, `"pause"`, `"forward"`, `"backward"`, `"restart"`, or `null`) |
| `hoverTime` | `number\|null` | Hovered timestamp on seek bar (`null` hides preview) |
| `hoverX` | `number` | Horizontal pixel position for thumbnail preview |
| `currentVideo` | `string` | Active video ID (e.g. `"avengers"`) |
| `volume` | `number` | Volume level (`0`–`1`) |
| `isMuted` | `boolean` | Whether the video is muted |
| `progress` | `number` | Derived: `(currentTime / duration) * 100` |

### Refs

| Ref | Purpose |
|---|---|
| `videoRef` | Direct reference to the `<video>` DOM element |
| `hlsRef` | Reference to the active `Hls` instance (avoids re-renders) |

### Effects (3 `useEffect` blocks)

| Effect | Trigger | Responsibility |
|---|---|---|
| **HLS Setup** | `[currentVideo]` | Creates/destroys HLS instance, loads manifest, captures levels, handles Safari fallback |
| **Video Sync** | `[]` (mount only) | Listens to `timeupdate`, `waiting`, `stalled`, `playing`, `fullscreenchange` — keeps state in sync with the video element |
| **Keyboard Shortcuts** | `[]` (mount only) | Registers `keydown` listener for Space, Arrow keys, F, R |

### Action Methods

| Method | What it does |
|---|---|
| `togglePlay()` | Play/pause the video, trigger overlay, fire analytics |
| `handleSeek(e)` | Set `video.currentTime` from range input |
| `handleQualityChange(e)` | Set `hlsRef.currentLevel` for manual quality switch |
| `handleRestart()` | Reset to `0`, play, trigger overlay |
| `toggleFullscreen()` | Enter/exit fullscreen via Fullscreen API |
| `triggerOverlay(type)` | Show action feedback for 1 second then clear |
| `getThumbnailPosition(time)` | Compute sprite `{x, y}` offset from a timestamp |
| `handleMouseMove(e)` | Compute `hoverTime` and `hoverX` from mouse position on seek bar |
| `handleMouseLeave()` | Clear `hoverTime` to hide thumbnail preview |
| `handleVolumeChange(e)` | Set volume, auto-mute if `0` |
| `toggleMute()` | Toggle `video.muted` |

---

## 📡 HLS Flow

StreamForge uses [hls.js](https://github.com/video-dev/hls.js/) to stream adaptive bitrate video via the HLS protocol.

### Startup Sequence

```
1. VideoPlayer mounts
      ↓
2. usePlayer hook runs → HLS Setup effect fires
      ↓
3. Hls.isSupported() check
      ├── YES → new Hls() instance created
      └── NO  → Safari fallback: video.src = master.m3u8
      ↓
4. hls.loadSource("/hls/{currentVideo}/master.m3u8")
   hls.attachMedia(videoRef)
      ↓
5. MANIFEST_PARSED event fires
      ├── Capture levels[] (all available quality variants)
      ├── Auto-play the video
      └── selectedLevel = -1 (auto mode)
      ↓
6. Playback starts → .ts segments loaded sequentially
      ↓
7. LEVEL_SWITCHED event fires on quality changes
      └── Update quality display (e.g. "720p")
```

### Video Switching

When the user selects a different video from the dropdown:

1. `setCurrentVideo(newVideoId)` updates state
2. HLS Setup effect re-runs (dependency: `[currentVideo]`)
3. Previous `Hls` instance is destroyed
4. A new `Hls` instance loads the new video's `master.m3u8`

### Expected File Structure

```
public/hls/{videoId}/
├── master.m3u8          ← master playlist (lists all quality variants)
├── stream_0.m3u8        ← 720p variant playlist
├── stream_1.m3u8        ← 480p variant playlist
├── stream_2.m3u8        ← 240p variant playlist
├── stream_0_000.ts      ← 720p segments
├── stream_1_000.ts      ← 480p segments
└── stream_2_000.ts      ← 240p segments
```

### Safari Fallback

Safari supports HLS natively. If `Hls.isSupported()` returns `false`, the player checks for `video.canPlayType("application/vnd.apple.mpegurl")` and sets the `<video>` source directly.

---

## 🎚️ Quality Switching

### Auto Mode (default)

- `selectedLevel = -1`
- `hlsRef.currentLevel = -1`
- hls.js automatically picks the optimal quality based on measured bandwidth and buffer health

### Manual Mode

1. User selects a quality from the dropdown (e.g. 720p)
2. `handleQualityChange(e)` fires → `hlsRef.currentLevel = levelIndex`
3. hls.js begins loading segments at the requested quality
4. `LEVEL_SWITCHED` event updates the quality badge in the UI

### UI

```
┌──────────────────────────────────────────┐
│ quality badge: "720p"  (live readout)    │
│ dropdown:                                │
│   ├── Auto       (selectedLevel = -1)    │
│   ├── 720p       (index 0)              │
│   ├── 480p       (index 1)              │
│   └── 240p       (index 2)              │
└──────────────────────────────────────────┘
```

---

## ⏳ Buffering System

The buffering system tracks whether the video element is waiting for data and displays a visual indicator.

### State Machine

```
idle ──[waiting / stalled]──► buffering ──[playing]──► idle
```

### Implementation

| Video Event | State Change |
|---|---|
| `waiting` | `isBuffering = true` |
| `stalled` | `isBuffering = true` |
| `playing` | `isBuffering = false` |

### Visual

When `isBuffering` is `true`, the `BufferingSpinner` component renders:

- A semi-transparent radial gradient overlay covering the video
- A rotating red-accented ring spinner centered in the viewport
- CSS animation: `sf-spin` (360° infinite rotation)

---

## 🖼️ Sprite System & Thumbnail Mapping

StreamForge uses a **sprite sheet** approach for seek bar thumbnail previews — a single JPEG containing all frames tiled in a grid.

### Sprite Generation (FFmpeg)

**Step 1** — Extract one frame every 5 seconds, scaled to 160×90:

```bash
ffmpeg -i public/videos/{video}.mp4 -vf "fps=1/5,scale=160:90" thumbnails/{video}/thumb_%03d.jpg
```

**Step 2** — Tile extracted frames into a 5-column sprite sheet:

```bash
ffmpeg -i thumbnails/{video}/thumb_%03d.jpg -vf "tile=5x4" public/sprite/{video}/sprite.jpg
```

### Sprite Configuration (`playerConfig.js`)

| Property | Value |
|---|---|
| `THUMB_WIDTH` | `160px` |
| `THUMB_HEIGHT` | `90px` |
| `THUMB_INTERVAL` | `5` seconds |
| `COLUMNS` | `5` |

### Thumbnail Position Calculation

Given a `hoverTime` (in seconds):

```
index = floor(hoverTime / THUMB_INTERVAL)   // which frame
row   = floor(index / COLUMNS)              // which row in the grid
col   = index % COLUMNS                     // which column in the grid
x     = col * THUMB_WIDTH                   // px offset from left
y     = row * THUMB_HEIGHT                  // px offset from top
```

### Rendering Flow

```
1. User hovers over SeekBar
      ↓
2. handleMouseMove(e)
      ├── Compute hoverTime from mouse X position & duration
      └── Compute hoverX (pixel offset within the player container)
      ↓
3. getThumbnailPosition(hoverTime)
      └── Returns { x, y } sprite offsets
      ↓
4. ThumbnailPreview renders:
      ├── background-image: url(/sprite/{video}/sprite.jpg)
      ├── background-position: -${x}px -${y}px
      ├── width: 160px, height: 90px
      └── Positioned absolutely at hoverX
      ↓
5. User moves mouse away → handleMouseLeave()
      └── hoverTime = null → preview hidden
```

---

## 📊 Analytics Integration

StreamForge includes a lightweight analytics service (`src/services/analytics.js`) that tracks all meaningful user interactions.

### Architecture

```
User Action
    ↓
usePlayer method (togglePlay, handleSeek, etc.)
    ↓
trackEvent(eventName, payload)
    ↓
Console output (structured JSON)
```

### `trackEvent` Function

```javascript
export const trackEvent = (eventName, payload = {}) => {
    const analyticsEvent = {
        event: eventName,
        timestamp: new Date().toISOString(),
        ...payload
    };
    console.log("📊 Analytics Event:", analyticsEvent);
};
```

Each call produces a structured object:

```json
{
    "event": "play",
    "timestamp": "2026-05-08T14:30:00.000Z",
    "video": "avengers",
    "currentTime": 45.2
}
```

### Tracked Events

| Event | Payload | Trigger |
|---|---|---|
| `play` | `video`, `currentTime` | Play button or Space key |
| `pause` | `video`, `currentTime` | Pause button or Space key |
| `seek` | `video`, `seekTime` | Dragging the seek bar |
| `seek_forward` | `video`, `seconds: 5` | ArrowRight key |
| `seek_backward` | `video`, `seconds: 5` | ArrowLeft key |
| `quality_change` | `video`, `quality` (level index) | Quality dropdown selection |
| `restart` | `video` | Restart button or R key |
| `enter_fullscreen` | `video` | Fullscreen button or F key |
| `exit_fullscreen` | `video` | Fullscreen button or F key |
| `volume_change` | `video`, `volume` (0–1) | Volume slider |
| `mute` | `video` | Mute toggle |
| `unmute` | `video` | Mute toggle |
| `action_overlay` | `video`, `action` (type) | Any overlay trigger |

### Extensibility

The current implementation logs to the console. To send events to a backend:

```javascript
export const trackEvent = (eventName, payload = {}) => {
    const analyticsEvent = {
        event: eventName,
        timestamp: new Date().toISOString(),
        ...payload
    };
    console.log("📊 Analytics Event:", analyticsEvent);

    // Example: send to a backend endpoint
    // fetch("/api/analytics", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(analyticsEvent)
    // });
};
```

---

## ⚙️ playerConfig

`src/config/playerConfig.js` centralizes all player configuration.

```javascript
const playerConfig = {
    videos: [
        { id: "sample_1920x1080", title: "Earth from Space" },
        { id: "avengers", title: "Avengers: Endgame" }
    ],
    thumbnailConfig: {
        THUMB_WIDTH: 160,
        THUMB_HEIGHT: 90,
        THUMB_INTERVAL: 5,
        COLUMNS: 5
    }
};
```

### `videos`

An array of available video objects. Each video must have:

- `id` — Used to resolve file paths: `/hls/{id}/master.m3u8`, `/sprite/{id}/sprite.jpg`, `/main-thumbnail/{id}/thumbnail.png`
- `title` — Display name shown in the `VideoSelector` dropdown

### `thumbnailConfig`

Controls how the sprite sheet math works:

| Key | Type | Description |
|---|---|---|
| `THUMB_WIDTH` | `number` | Width of each thumbnail tile in the sprite (px) |
| `THUMB_HEIGHT` | `number` | Height of each thumbnail tile in the sprite (px) |
| `THUMB_INTERVAL` | `number` | Seconds between each extracted frame |
| `COLUMNS` | `number` | Number of columns in the sprite grid |

---

## ⌨️ Keyboard Shortcuts

| Key | Action | Analytics Event |
|---|---|---|
| `Space` | Toggle play / pause | `play` / `pause` |
| `ArrowLeft` | Seek backward 5 seconds | `seek_backward` |
| `ArrowRight` | Seek forward 5 seconds | `seek_forward` |
| `F` | Toggle fullscreen | `enter_fullscreen` / `exit_fullscreen` |
| `R` | Restart video | `restart` |

Shortcuts are disabled when focus is on `<input>` or `<textarea>` elements. The listener is attached to `document` and cleaned up on unmount.

---

## 🔄 Data Flow Summary

```
                    ┌──────────────────────────┐
                    │      playerConfig.js      │
                    │  (videos, thumbnailConfig) │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │     usePlayer (hook)       │
                    │                            │
                    │  ┌─────────┐ ┌──────────┐ │
                    │  │ videoRef│ │  hlsRef   │ │
                    │  └────┬────┘ └─────┬────┘ │
                    │       │            │       │
                    │  ┌────▼────────────▼────┐ │
                    │  │   22 state values     │ │
                    │  │   11 action methods   │ │
                    │  └──────────┬───────────┘ │
                    └─────────────┼─────────────┘
                                  │ props
               ┌──────────────────┼──────────────────┐
               │                  │                   │
    ┌──────────▼──┐    ┌─────────▼────────┐   ┌─────▼──────────┐
    │ VideoPlayer │    │  trackEvent()     │   │  <video> DOM   │
    │ (orchestrator)│  │  (analytics.js)   │   │  element       │
    └──┬──┬──┬──┬─┘    └──────────────────┘   └────────────────┘
       │  │  │  │
       │  │  │  └── FullScreenButton, VolumeControls
       │  │  └───── SeekBar, QualitySelector
       │  └──────── ActionOverlay, BufferingSpinner
       └─────────── PosterThumbnail, ThumbnailPreview, VideoSelector
```

---

## 🧹 Lifecycle & Cleanup

All side effects are properly cleaned up to prevent memory leaks:

| Resource | Cleanup |
|---|---|
| `Hls` instance | `hls.destroy()` in effect return |
| `timeupdate` listener | Removed in effect return |
| `waiting` / `stalled` / `playing` listeners | Removed in effect return |
| `fullscreenchange` listener | Removed in effect return |
| `keydown` listener | Removed in effect return |
| `actionOverlay` timeout | Clears after 1 second |

---

## 📦 Dependency Map

```
streamforge
├── react 19.x
├── react-dom 19.x
├── hls.js 1.x
└── vite (dev)
```

```
src/
├── main.jsx                  ← Entry point
├── App.jsx                   ← Root component
├── App.css                   ← OTT theme & layout
├── index.css                 ← Base resets & CSS vars
├── config/
│   └── playerConfig.js       ← Video list & thumbnail config
├── services/
│   └── analytics.js          ← Event tracking service
├── hooks/
│   └── usePlayer.js          ← All player state & logic
└── components/
    ├── VideoPlayer.jsx       ← Orchestrator component
    ├── VideoPlayer.css       ← All player styling (700+ lines)
    ├── PlayPauseButtons.jsx
    ├── SeekBar.jsx
    ├── QualitySelector.jsx
    ├── VolumeControls.jsx
    ├── FullScreenButton.jsx
    ├── ThumbnailPreview.jsx
    ├── PosterThumbnail.jsx
    ├── VideoSelector.jsx
    ├── ActionOverlay.jsx
    └── BufferingSpinner.jsx
```
