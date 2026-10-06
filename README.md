# GUPT BHARATVARSH AI

Free AI Video Maker for cinematic documentary storytelling.

This project lets you:
- write a Hindi documentary script
- generate cinematic scene prompts
- choose a voice and visual style
- generate AI narration
- prepare final cinematic video metadata

## Tech stack
- React + Vite
- JavaScript frontend
- Vite static assets for TTS model files
- Serverless API routes for voice and video generation

## Requirements
- Node.js 18+
- npm

## Install

```bash
npm install
```

## Run locally

```bash
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Production build

```bash
npm run build
```

## Preview production build

```bash
npm run preview -- --host
```

## Environment variables

For the voice API, set:

```bash
FREE_TTS_SERVER_URL=https://your-free-tts-server.example.com
```

This is required if `/api/generate-voice` is being used with an external AI4Bharat-style TTS service.

## Notes
- The project is a frontend-first demo/app scaffold.
- The final MP4 rendering step is still a stub and is ready for real integration with a render backend or external service.
- The app is designed for documentary/historical storytelling in Hindi.
