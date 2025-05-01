# Web Media Player

A modern web-based media player that supports video and audio playback directly in the browser.

## Features

- Play video files in various formats (MP4, WebM, etc.)
- Play audio files (MP3, WAV, OGG, etc.)
- Simple and intuitive user interface
- Drag and drop file uploads
- Playback controls (play, pause, seek, volume)
- Keyboard shortcuts for easier control
- Fullscreen support for videos

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- Radix UI Components
- Lucide React Icons

## Getting Started

### Prerequisites

- Node.js 18+ installed
- pnpm (recommended) or npm

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/your-username/web-player.git
   cd web-player
   ```

2. Install dependencies

   ```bash
   pnpm install
   # or
   npm install
   ```

3. Run the development server

   ```bash
   pnpm dev
   # or
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Upload your media file by dragging and dropping or clicking the upload area
2. Once uploaded, switch to the Media Player tab
3. Use the playback controls to play, pause, and adjust volume
4. For videos, click the fullscreen button to view in fullscreen mode

## Keyboard Shortcuts

- **Space** - Play/Pause
- **Left Arrow** - Rewind 5 seconds
- **Right Arrow** - Forward 5 seconds
- **Up Arrow** - Volume Up
- **Down Arrow** - Volume Down
- **M** - Mute/Unmute
- **F** - Toggle Fullscreen (videos only)

## Building for Production

```bash
pnpm build
# or
npm run build
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Radix UI](https://www.radix-ui.com/)
