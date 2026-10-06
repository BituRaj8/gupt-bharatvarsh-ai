# GUPT BHARATVARSH AI

Production-ready deployment guide for the project.

## 1) Install dependencies

```bash
npm install
```

## 2) Run locally

```bash
npm run dev
```

## 3) Production build check

```bash
npm run build
```

## 4) Preview production build

```bash
npm run preview -- --host
```

## 5) Environment variables

Create a `.env` file in the project root if the backend voice API needs external TTS access:

```bash
FREE_TTS_SERVER_URL=https://your-free-tts-server.example.com
```

## 6) Deploy to Vercel

1. Push the repository to GitHub.
2. Open Vercel dashboard.
3. Import the GitHub repository.
4. Set the project to use the root folder.
5. Add the environment variable:
   - `FREE_TTS_SERVER_URL`
6. Deploy.

## 7) Important notes

- This project is a frontend-first app with API routes for voice/video generation.
- The final MP4 render step is still a stub and should be connected to a real rendering backend/service.
- If the voice API is used with an external provider, make sure the TTS server is publicly reachable and CORS-safe.

## 8) Production checklist

- [ ] `npm install` succeeds
- [ ] `npm run build` succeeds
- [ ] `.env` variables are configured
- [ ] Vercel project import is successful
- [ ] app loads correctly after deployment
- [ ] `/api/generate-voice` resolves properly with configured URL
