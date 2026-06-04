import { getAudioUrl, type Phrase } from './api/client';

/** The unit the Home picker and the player work with. */
export interface DeckPhrase {
  id: string;
  en: string; // English translation — the hero line
  native: string; // native-script text
  ro: string; // romanization / transcription (shown when nonLatin)
  font: string; // CSS font variable for the native text
  code: string; // BCP-47 language code
  languageName: string;
  nonLatin: boolean;
  normalUrl: string;
  slowUrl: string;
  tags: string[];
}

export interface LanguageGroup {
  languageName: string;
  native: string; // language's own name (e.g. 日本語) for the section header
  font: string;
  phrases: DeckPhrase[];
}

// Native font + endonym lookups, keyed by lowercase language name. Falls back
// to the BCP-47 code prefix, then to the UI font / the English name.
const FONT_BY_NAME: Record<string, string> = {
  japanese: 'var(--jp)',
  korean: 'var(--kr)',
  thai: 'var(--th)',
  chinese: 'var(--zh)',
  mandarin: 'var(--zh)',
};
const FONT_BY_CODE: Record<string, string> = {
  ja: 'var(--jp)',
  ko: 'var(--kr)',
  th: 'var(--th)',
  zh: 'var(--zh)',
};
const ENDONYM: Record<string, string> = {
  japanese: '日本語',
  korean: '한국어',
  thai: 'ภาษาไทย',
  chinese: '中文',
  mandarin: '中文',
  spanish: 'Español',
  french: 'Français',
  german: 'Deutsch',
  italian: 'Italiano',
  english: 'English',
};

function fontFor(languageName: string, code: string): string {
  const name = languageName.trim().toLowerCase();
  if (FONT_BY_NAME[name]) return FONT_BY_NAME[name];
  const prefix = code.slice(0, 2).toLowerCase();
  return FONT_BY_CODE[prefix] ?? 'var(--ui)';
}

function endonymFor(languageName: string): string {
  return ENDONYM[languageName.trim().toLowerCase()] ?? languageName;
}

export function toDeckPhrase(p: Phrase): DeckPhrase {
  return {
    id: p.phraseId,
    en: p.translation?.trim() || p.text,
    native: p.text,
    ro: p.transcription?.trim() || '',
    font: fontFor(p.languageName, p.languageCode),
    code: p.languageCode,
    languageName: p.languageName,
    nonLatin: p.nonLatin,
    normalUrl: getAudioUrl(p.normalS3Key),
    slowUrl: getAudioUrl(p.slowS3Key),
    tags: p.tags ?? [],
  };
}

/**
 * Group phrases by language for the Home picker, preserving the API's order
 * (oldest first) both for the groups and the phrases within them.
 */
export function groupByLanguage(phrases: Phrase[]): LanguageGroup[] {
  const groups = new Map<string, LanguageGroup>();
  for (const p of phrases) {
    const key = p.languageName;
    let g = groups.get(key);
    if (!g) {
      g = {
        languageName: p.languageName,
        native: endonymFor(p.languageName),
        font: fontFor(p.languageName, p.languageCode),
        phrases: [],
      };
      groups.set(key, g);
    }
    g.phrases.push(toDeckPhrase(p));
  }
  return [...groups.values()];
}
