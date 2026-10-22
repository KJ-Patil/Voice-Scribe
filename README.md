# VoiceScribe — Real-Time Multilingual Speech-to-Text

A full-stack web application for real-time speech-to-text transcription with specialized support for Hinglish (Hindi + English code-switching), built with Next.js, Google Gemini API, and PostgreSQL.

## Features

- **Real-Time Transcription** — Click the mic, speak, and see text appear live using browser Speech Recognition + Gemini AI for final high-quality transcription.
- **Multilingual Support** — Hinglish, Hindi, English, Marathi, Tamil, Telugu, and Bengali.
- **Hinglish Number Conversion** — Spoken Hindi numbers like "dus" become "10" in the transcription.
- **Database Persistence** — All transcriptions stored in PostgreSQL (Neon) via Prisma ORM with full UTF-8 support for Devanagari, Tamil, Telugu, and Bengali scripts.
- **Dashboard with CRUD** — Search, filter by language, pagination, edit, delete (with confirmation), and copy-to-clipboard.
- **WebSocket Audio Streaming** — Browser mic audio streams to the Node.js WebSocket server, which sends the complete recording to Gemini for transcription.
- **Server-Side Security** — Gemini API key stays on the server, never reaches the browser. Zod validation on all inputs. Rate limiting on API endpoints.
- **Light/Dark Mode** — Theme switcher with glassmorphism, claymorphism, and neumorphism design.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion |
| Backend | Next.js API Routes + Node.js WebSocket Server |
| Database | PostgreSQL (Neon) via Prisma ORM |
| Speech AI | Google Gemini API (gemini-3.5-flash) |
| Live Preview | Browser Web Speech API |
| Fonts | Inter + Noto Sans Devanagari |

## Quick Start

### Prerequisites
- Node.js 18+
- A free [Neon](https://neon.tech) PostgreSQL database
- A free [Google AI Studio](https://aistudio.google.com) Gemini API key

### 1. Clone and install
```bash
git clone https://github.com/YOUR_USERNAME/voicescribe.git
cd voicescribe
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Edit `.env` and add your credentials:
```
DATABASE_URL="postgresql://user:pass@your-neon-host/neondb?sslmode=require"
GEMINI_API_KEY="your-gemini-api-key"
```

### 3. Setup database
```bash
npx prisma db push
npx prisma generate
```

### 4. Run the app
```bash
npm run dev
```
This starts both the Next.js frontend (`http://localhost:3000`) and the WebSocket server (`ws://localhost:3001`) concurrently.

## Testing the App

1. Open `http://localhost:3000` in **Chrome or Edge** (required for Speech Recognition).
2. Select a language (e.g., Hinglish).
3. Click the **Speak** mic button and allow microphone permission.
4. Speak a test phrase: *"Kal subah 10 baje meeting hai, client ko report send karna hai."*
5. Watch live text appear in the transcript box.
6. Click **Stop** — the transcription saves to the database and appears in the dashboard.
7. Test **Edit**, **Delete**, **Copy**, **Search**, and **Language Filter** in the dashboard.

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Main page (recorder + dashboard)
│   │   ├── layout.tsx                # Root layout with fonts
│   │   ├── globals.css               # Tailwind + glassmorphism/clay/neu styles
│   │   └── api/transcriptions/       # REST API routes (CRUD)
│   ├── components/
│   │   ├── HeroRecorder.tsx          # Mic button + live transcript card
│   │   ├── Dashboard.tsx             # Transcription history with search/filter
│   │   ├── Navbar.tsx                # Top navbar with theme toggle
│   │   ├── EditModal.tsx             # Edit transcription modal
│   │   └── DeleteConfirmModal.tsx    # Delete confirmation modal
│   ├── hooks/
│   │   └── useVoiceRecorder.ts       # Audio capture + WebSocket + Speech API
│   └── lib/
│       ├── prisma.ts                 # Prisma client singleton
│       ├── validations.ts            # Zod schemas
│       └── rate-limiter.ts           # Sliding-window rate limiter
├── server/
│   └── ws-server.ts                  # WebSocket server + Gemini integration
├── prisma/
│   ├── schema.prisma                 # Prisma schema (PostgreSQL)
│   ├── seed.ts                       # Database seed script
│   └── migrations/                   # Migration SQL
├── .env.example                      # Environment template (no secrets)
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/transcriptions` | List with search, language filter, pagination |
| POST | `/api/transcriptions` | Create new transcription |
| GET | `/api/transcriptions/:id` | Get single transcription |
| PUT | `/api/transcriptions/:id` | Update transcription text |
| DELETE | `/api/transcriptions/:id` | Delete transcription |

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Neon/Supabase) |
| `GEMINI_API_KEY` | Google Gemini API key (server-side only) |
| `GEMINI_MODEL` | Gemini model name (default: `gemini-3.5-flash`) |
| `WS_PORT` | WebSocket server port (default: `3001`) |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL for browser (default: `ws://localhost:3001`) |

## License

MIT
