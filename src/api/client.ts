import { generateToken } from './crypto';

const LAMBDA_URL = (import.meta.env.VITE_LAMBDA_URL ?? '').replace(/\/$/, '');
const AUDIO_BASE_URL = (import.meta.env.VITE_AUDIO_BASE_URL ?? '').replace(/\/$/, '');

/** A saved phrase as returned by the backend (see openapi.yaml). */
export interface Phrase {
  phraseId: string;
  userId?: string;
  text: string;
  languageCode: string;
  languageName: string;
  nonLatin: boolean;
  normalS3Key: string;
  slowS3Key: string;
  createdAt: string;
  updatedAt?: string;
  transcription?: string;
  translation?: string;
  translationS3Key?: string;
  tags?: string[];
}

/** Resolve an S3 key to a fully-qualified audio URL. */
export function getAudioUrl(s3Key: string): string {
  return `${AUDIO_BASE_URL}/${s3Key}`;
}

async function authHeaders(): Promise<Record<string, string>> {
  return { 'x-app-token': await generateToken() };
}

async function readError(res: Response): Promise<string> {
  const body = await res.json().catch(() => null);
  return (body && (body.error as string)) || `HTTP ${res.status}`;
}

/**
 * Fetch every saved phrase (oldest first). This app is read-only — saving,
 * editing and deleting happen in the companion TTS phrasebook app.
 */
export async function listPhrases(): Promise<Phrase[]> {
  const res = await fetch(`${LAMBDA_URL}/phrases`, { headers: await authHeaders() });
  if (!res.ok) throw new Error(await readError(res));
  const { phrases } = await res.json() as { phrases: Phrase[] };
  return phrases.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
