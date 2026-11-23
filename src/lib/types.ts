export interface Example { ja: string; en?: string; vi?: string; furigana?: string; tatoeba_id?: number }
export interface Vocab {
  id: string; word: string; reading: string; romaji?: string; meanings: string[];
  meaning_vi?: string; level: 'N4' | 'N5'; pos?: string[]; examples?: Example[]; source?: string;
}
export interface Grammar {
  id: string; pattern: string; reading?: string; romaji?: string; level: string;
  meaning: string; meaning_vi?: string; formation?: string; formation_vi?: string;
  explain_vi?: string; examples?: Example[]; notes?: string; notes_vi?: string;
  tags?: string[]; source?: string;
}
export interface Kanji {
  character: string; level: string; strokes?: number; onyomi?: string[];
  kunyomi?: string[]; meanings: string[]; meaning_vi?: string; words?: string[]; source?: string;
}
export interface ReadingQuestion { question: string; options: string[]; answer: number; explanation_vi: string }
export interface Reading { id: string; title: string; category: string; level: string; text: string; questions: ReadingQuestion[]; source?: string; difficulty?: string }
export interface Manifest {
  content_version: string; corpus: string; downloaded_at?: string | null;
  source_name: string; source_url: string; license: string; counts: Record<string, number>
}
export interface ExamBank { vocabulary: Question[]; grammar: Question[]; listening: Question[]; metadata?: { official: boolean; source: string; license: string } }
export interface CompoundEntry { reading: string; meaning_vi: string; example_ja?: string; example_vi?: string }
export interface PastPaper { id: string; title: string; year: number; session: string; status: 'partial' | 'complete'; sourceNote: string; questions: Question[] }
export interface Content {
  vocab: Vocab[]; grammar: Grammar[]; kanji: Kanji[]; readings: Reading[]; examBank: ExamBank; manualVi: Record<string,string>; kanjiCompounds: Record<string,CompoundEntry>; pastPapers: PastPaper[]; manifest: Manifest
}
export interface WordProgress {
  word_id: string; ease: number; interval_days: number; repetitions: number;
  due_at: number; last_reviewed: number; correct_count: number; incorrect_count: number
}
export interface ReviewLog { word_id: string; quality: number; created_at: number }
export interface QuizResult { mode: string; score: number; total: number; duration_seconds: number; created_at: number }
export type ExamSection = 'vocabulary' | 'language' | 'listening';
export interface Question { id: string; type: 'word' | 'grammar' | 'reading' | 'listening'; prompt: string; sub?: string; options: string[]; answer: number; explanation: string; section?: ExamSection; task?: string; audioScript?: string | null }
