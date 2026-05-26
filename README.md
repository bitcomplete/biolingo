# Biolingo — Sound Critic

## Prerequisites

- Node.js 18+
- OpenAI API key with Realtime API access (`gpt-realtime`)
- A browser with microphone permission

## Install

```bash
npm install
```

## Configure your API key

Either copy the example env file:

```bash
cp .env.example .env.local
# edit .env.local and set VITE_OPENAI_API_KEY=sk-...
```

…or leave it unset and paste the key into the in-app modal when prompted (stored in `sessionStorage`).

## Run

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`) and grant mic access.

## Other scripts

```bash
npm run build       # type-check + production build
npm run preview     # serve the production build
npm run typecheck   # tsc --noEmit
```
