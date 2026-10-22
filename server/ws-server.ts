import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();
const PORT = parseInt(process.env.WS_PORT || '3001', 10);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

function getLanguagePrompt(language: string): string {
  switch (language) {
    case 'Hinglish':
      return `You are an expert multilingual speech-to-text transcriber specializing in Indian code-switched Hindi-English (Hinglish).
Guidelines:
1. Transcribe the audio verbatim in natural Hinglish.
2. For Hindi spoken words, write them phonetically in Roman / Latin alphabet (e.g., 'kya haal hai', 'meeting schedule kar do', 'bhai kaam ho gaya').
3. For English words, write standard English (e.g., 'production', 'deployment', 'dashboard').
4. Convert ALL spoken numbers to digits, whether spoken in Hindi or English. Examples: 'dus' → '10', 'bees' → '20', 'paanch' → '5', 'ek' → '1', 'do' → '2', 'teen' → '3', 'chaar' → '4', 'sau' → '100', 'hazaar' → '1000', 'dedh sau' → '150', 'saade teen' → '3:30'.
5. Do NOT translate Hindi to English. Output only the verbatim speech with numbers as digits.`;

    case 'Hindi':
      return `You are an expert Hindi speech-to-text engine. Transcribe the spoken audio verbatim using proper Devanagari script (हिन्दी). Output clear punctuation without adding meta commentary.`;

    case 'Marathi':
      return `You are an expert Marathi speech-to-text engine. Transcribe the spoken audio verbatim using proper Marathi Devanagari script (मराठी). Output clear punctuation.`;

    case 'Tamil':
      return `You are an expert Tamil speech-to-text engine. Transcribe the spoken audio verbatim using proper Tamil script (தமிழ்).`;

    case 'Telugu':
      return `You are an expert Telugu speech-to-text engine. Transcribe the spoken audio verbatim using proper Telugu script (తెలుగు).`;

    case 'Bengali':
      return `You are an expert Bengali speech-to-text engine. Transcribe the spoken audio verbatim using proper Bengali script (বাংলা).`;

    case 'English':
      return `You are a precise English speech-to-text transcriber. Transcribe the spoken audio verbatim in standard English with correct punctuation.`;

    default:
      return `You are an expert multilingual speech-to-text engine supporting English and Indian languages (Hindi, Marathi, Tamil, Telugu, Bengali, and mixed Hinglish).
Detect the language automatically and transcribe the spoken words verbatim.
If the speaker is code-switching between Hindi and English (Hinglish), transcribe Hindi words phonetically in Latin script and English in standard spelling.`;
  }
}

async function transcribeAudio(audioBase64: string, language: string, audioMimeType: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  // Map browser MIME types to Gemini-supported types
  let geminiMimeType = audioMimeType;
  if (audioMimeType.startsWith('audio/webm')) {
    geminiMimeType = 'audio/webm';
  } else if (audioMimeType.startsWith('audio/ogg')) {
    geminiMimeType = 'audio/ogg';
  }

  const body = {
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: geminiMimeType,
              data: audioBase64,
            },
          },
          {
            text: getLanguagePrompt(language) + '\n\nTranscribe the speech in this audio verbatim. Output ONLY the transcribed words, nothing else.',
          },
        ],
      },
    ],
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`[${response.status}] ${errBody.slice(0, 300)}`);
  }

  const json = await response.json();
  return json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

const wss = new WebSocketServer({ port: PORT });

console.log(`[VoiceScribe] WebSocket Audio Streaming Server running on ws://localhost:${PORT}`);
if (GEMINI_API_KEY) {
  console.log(`[VoiceScribe] Google Gemini Engine initialized (Model: ${GEMINI_MODEL})`);
} else {
  console.log(`[VoiceScribe] Running in Safe Demonstration Mode (Configure GEMINI_API_KEY in .env for live AI transcription)`);
}

wss.on('connection', (ws: WebSocket) => {
  console.log('[WebSocket] Client connected for audio streaming');

  let audioChunks: Buffer[] = [];
  let currentLanguage = 'Auto-detect';
  let audioMimeType = 'audio/webm';
  const startTime = Date.now();

  ws.on('message', async (data: Buffer | string) => {
    if (Buffer.isBuffer(data)) {
      audioChunks.push(data);
      if (audioChunks.length % 5 === 0) {
        const totalSize = audioChunks.reduce((acc, c) => acc + c.length, 0);
        console.log(`[Audio] Received ${audioChunks.length} chunks, total ${(totalSize / 1024).toFixed(1)}KB`);
      }
    } else {
      try {
        const payload = JSON.parse(data.toString());

        if (payload.action === 'config') {
          currentLanguage = payload.language || 'Auto-detect';
          audioMimeType = payload.mimeType || 'audio/webm';
          console.log(`[WebSocket] Language: ${currentLanguage}, Audio format: ${audioMimeType}`);
        } else if (payload.action === 'stop') {
          console.log(`[Stop] client_text: "${(payload.client_text || '').slice(0, 80)}", chunks: ${audioChunks.length}, mimeType: ${audioMimeType}`);
          const duration = payload.duration || Math.max(1, Math.round((Date.now() - startTime) / 1000));
          let fullText = '';

          if (audioChunks.length > 0 && GEMINI_API_KEY) {
            const fullAudioBuffer = Buffer.concat(audioChunks);
            audioChunks = [];
            console.log(`[Gemini] Sending ${(fullAudioBuffer.length / 1024).toFixed(1)}KB of ${audioMimeType} audio...`);

            try {
              fullText = await transcribeAudio(fullAudioBuffer.toString('base64'), currentLanguage, audioMimeType);
              console.log(`[Gemini] Transcription: "${fullText.slice(0, 100)}"`);
            } catch (err: any) {
              console.error('[Gemini Error]:', err.message);
            }
          }

          if (!fullText) {
            fullText = payload.client_text || '(No speech detected)';
            console.log(`[Fallback] Using browser text: "${fullText.slice(0, 80)}"`);
          }

          try {
            const saved = await prisma.transcription.create({
              data: {
                text: fullText,
                language: currentLanguage,
                duration_s: parseFloat(duration),
              },
            });

            ws.send(JSON.stringify({ type: 'final', record: saved }));
            console.log(`[Saved] Transcription #${saved.id}`);
          } catch (dbErr: any) {
            console.error('[Database Error]:', dbErr.message);
            ws.send(JSON.stringify({ type: 'error', message: 'Failed to save transcription' }));
          }
        }
      } catch (e: any) {
        console.error('[Message Error]:', e.message);
      }
    }
  });

  ws.on('close', () => console.log('[WebSocket] Client disconnected'));
  ws.on('error', (err) => console.error('[WebSocket Error]:', err));
});
