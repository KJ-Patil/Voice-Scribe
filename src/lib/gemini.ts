const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

function getRefinePrompt(language: string): string {
  switch (language) {
    case 'Hinglish':
      return `You are an expert Hinglish text refiner. The user spoke in Hindi-English mix (Hinglish) and a browser speech engine captured the raw text below.
Your job:
1. Keep the Hinglish as-is — Hindi words in Roman script, English words in English.
2. Convert ALL spoken Hindi numbers to digits: "ek" → "1", "do" → "2", "teen" → "3", "chaar" → "4", "paanch" → "5", "chhe" → "6", "saat" → "7", "aath" → "8", "nau" → "9", "dus" → "10", "gyarah" → "11", "barah" → "12", "bees" → "20", "tees" → "30", "pachaas" → "50", "sau" → "100", "hazaar" → "1000", "lakh" → "100000", "dedh" → "1.5", "dhai" → "2.5", "saade" → "X.5".
3. Convert English spoken numbers to digits too: "ten" → "10", "twenty" → "20", etc.
4. Fix minor grammar and punctuation without changing meaning.
5. Output ONLY the refined text, nothing else.`;

    case 'Hindi':
      return `You are a Hindi text refiner. Fix punctuation, convert spoken numbers to digits (e.g., "दस" → "10", "बीस" → "20"), and clean up the text. Output ONLY the refined Devanagari text.`;

    case 'Marathi':
      return `You are a Marathi text refiner. Fix punctuation, convert spoken numbers to digits, and clean up the text. Output ONLY the refined Marathi text.`;

    case 'Tamil':
      return `You are a Tamil text refiner. Fix punctuation, convert spoken numbers to digits, and clean up the text. Output ONLY the refined Tamil text.`;

    case 'Telugu':
      return `You are a Telugu text refiner. Fix punctuation, convert spoken numbers to digits, and clean up the text. Output ONLY the refined Telugu text.`;

    case 'Bengali':
      return `You are a Bengali text refiner. Fix punctuation, convert spoken numbers to digits, and clean up the text. Output ONLY the refined Bengali text.`;

    case 'English':
      return `You are an English text refiner. Fix punctuation, capitalize properly, convert spoken numbers to digits (e.g., "ten" → "10"), and clean up the text. Output ONLY the refined text.`;

    default:
      return `You are a multilingual text refiner. Fix punctuation, convert spoken numbers to digits, and clean up the text. Output ONLY the refined text.`;
  }
}

export async function refineWithGemini(rawText: string, language: string): Promise<string> {
  if (!GEMINI_API_KEY || !rawText || rawText === '(No speech detected)') {
    return rawText;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const body = {
    contents: [
      {
        parts: [
          {
            text: `${getRefinePrompt(language)}\n\nRaw text:\n"${rawText}"`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 1024,
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(`[Gemini] Refinement failed: ${response.status}`);
      return rawText;
    }

    const json = await response.json();
    const refined = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (refined && refined.length > 0) {
      console.log(`[Gemini] Refined: "${rawText.slice(0, 50)}" → "${refined.slice(0, 50)}"`);
      return refined;
    }
  } catch (err: any) {
    console.error('[Gemini] Refinement error:', err.message);
  }

  return rawText;
}
