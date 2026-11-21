import type { Content, Vocab, Grammar, Kanji, Reading, Manifest, ExamBank } from './types';

async function loadJSON<T>(name: string): Promise<T> {
  const r = await fetch(`/content/${name}.json`, { cache: 'no-store' });
  if (!r.ok) throw Error(`Không thể tải dữ liệu ${name} (${r.status})`);
  return r.json() as Promise<T>;
}
export async function loadContent(): Promise<Content> {
  const [v4,v5,g4,g5,k4,k5,readings,examBank,manualVi,manualGrammarVi,manifest] = await Promise.all([
    loadJSON<Vocab[]>('n4-vocab'), loadJSON<Vocab[]>('n5-vocab'),
    loadJSON<Grammar[]>('n4-grammar'), loadJSON<Grammar[]>('n5-grammar'),
    loadJSON<Kanji[]>('n4-kanji'), loadJSON<Kanji[]>('n5-kanji'),
    loadJSON<Reading[]>('readings'), loadJSON<ExamBank>('exam-bank'),
    loadJSON<Record<string,string>>('manual-vi'),loadJSON<Record<string,string>>('manual-grammar-vi'),loadJSON<Manifest>('manifest')
  ]);
  const unique = <T,>(items: T[], getKey: (t:T)=>string) => Array.from(new Map(items.map(x=>[getKey(x),x])).values());
  return {
    vocab: unique([...v4,...v5],v=>v.id).filter(v=>v.word&&v.reading&&v.meanings?.length).map(v=>({...v,meaning_vi:v.meaning_vi||manualVi[v.word]||manualVi[v.reading]})),
    grammar: unique([...g4,...g5],g=>g.id).filter(g=>g.pattern&&g.meaning).map(g=>({...g,meaning_vi:g.meaning_vi||manualGrammarVi[g.pattern]})),
    kanji: unique([...k4,...k5],k=>k.character).filter(k=>k.character),
    readings,examBank,manualVi,manifest
  };
}
export const vocabMeaning = (v: Vocab) => v.meaning_vi?.trim() || 'Chưa có bản dịch tiếng Việt';
export const grammarMeaning = (g: Grammar) => g.meaning_vi?.trim() || 'Chưa có bản dịch tiếng Việt';
export const searchable = (s: string) => s.toLocaleLowerCase().normalize('NFKC');
