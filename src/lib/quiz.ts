import type { Content, Question, Vocab, Grammar } from './types';
import { vocabMeaning, grammarMeaning } from './content';

export function shuffle<T>(arr:T[]):T[] {
  const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;
}
function translated(x:{meaning_vi?:string}){return !!x.meaning_vi?.trim()}
function uniqueMeanings(words:Vocab[],current:Vocab):string[]{
  const seen=new Set([vocabMeaning(current)]);
  return shuffle(words.filter(x=>x.id!==current.id&&translated(x))).map(vocabMeaning).filter(x=>{
    if(seen.has(x))return false;seen.add(x);return true;
  }).slice(0,3);
}
function makeWordQuestion(v:Vocab,all:Vocab[]):Question|null{
  const answer=vocabMeaning(v),other=uniqueMeanings(all,v);
  if(!translated(v)||other.length<3)return null;
  const options=shuffle([answer,...other]);
  return {id:`word-${v.id}`,type:'word',prompt:v.word,sub:`Cách đọc: ${v.reading}`,
    options,answer:options.indexOf(answer),explanation:`${v.word}（${v.reading}）— ${answer}.`};
}
function makeGrammarQuestion(g:Grammar,all:Grammar[]):Question|null{
  const answer=grammarMeaning(g);
  const seen=new Set([answer]);
  const other=shuffle(all.filter(x=>x.id!==g.id&&translated(x))).map(grammarMeaning).filter(x=>{if(seen.has(x))return false;seen.add(x);return true}).slice(0,3);
  if(!translated(g)||other.length<3)return null;
  const options=shuffle([answer,...other]);
  return {id:`grammar-${g.id}`,type:'grammar',prompt:g.pattern,sub:'Mẫu ngữ pháp này có ý nghĩa gì?',options,
    answer:options.indexOf(answer),explanation:`${g.pattern}: ${answer}. ${g.explain_vi||g.notes_vi||''}`};
}
export function makeQuiz(c:Content,mode:'quick'|'grammar',limit?:number):Question[]{
  const wordPool=c.vocab.filter(v=>v.level==='N4'&&translated(v));
  const grammarPool=c.grammar.filter(g=>g.level==='N4'&&translated(g));
  const wordNum=mode==='quick'?8:0;
  const grammarNum=mode==='quick'?2:(limit||10);
  const a=shuffle(wordPool).slice(0,wordNum).map(w=>makeWordQuestion(w,wordPool)).filter((x):x is Question=>!!x);
  const b=shuffle(grammarPool).slice(0,grammarNum).map(g=>makeGrammarQuestion(g,grammarPool)).filter((x):x is Question=>!!x);
  return shuffle([...a,...b]).slice(0,limit||10);
}
export function makeReadingQuiz(c:Content,onlyLong=false):Question[]{
  const rs=onlyLong?c.readings.filter(r=>r.id.startsWith('n4-long-')):c.readings;
  return shuffle(rs).flatMap(r=>shuffle(r.questions).map((q,i)=>({id:`reading-${r.id}-${i}`,type:'reading' as const,section:'language' as const,task:'読解',
    prompt:q.question,sub:`${r.category}\n${r.text}`,options:q.options,answer:q.answer,explanation:q.explanation_vi})));
}
const kanjiWord=(v:Vocab)=>/[\u3400-\u9fff]/u.test(v.word)&&v.word.length<=5&&v.reading!==v.word&&v.reading.length>=2;
function makeKanjiReadingQuestions(c:Content,count:number):Question[]{
  const source=shuffle(c.vocab.filter(v=>v.level==='N4'&&kanjiWord(v)));
  const seen=new Set<string>(),result:Question[]=[];
  const readings=[...new Set(source.map(x=>x.reading))];
  for(const w of source){
    if(result.length===count)break;
    if(seen.has(w.word))continue;seen.add(w.word);
    const wrong=shuffle(readings.filter(x=>x!==w.reading&&x.length<=w.reading.length+2&&x.length>=Math.max(1,w.reading.length-2))).slice(0,3);
    if(wrong.length<3)continue;
    const options=shuffle([w.reading,...wrong]);
    result.push({id:'jr-'+w.id,type:'word',section:'vocabulary',task:'漢字読み',prompt:`「${w.word}」の読み方はどれですか。`,options,answer:options.indexOf(w.reading),explanation:`${w.word} = ${w.reading}${w.meaning_vi?' — '+w.meaning_vi:''}`});
  }
  return result;
}
function makeKanjiWritingQuestions(c:Content,count:number):Question[]{
  const words=shuffle(c.vocab.filter(v=>v.level==='N4'&&kanjiWord(v)));
  const result:Question[]=[],seen=new Set<string>();
  for(const w of words){
    if(result.length>=count)break;
    if(seen.has(w.reading))continue;seen.add(w.reading);
    const wrong=shuffle(words.filter(x=>x.word!==w.word&&x.reading!==w.reading&&x.word.length<=w.word.length+1)).slice(0,3).map(x=>x.word);
    if(wrong.length<3)continue;
    const options=shuffle([w.word,...wrong]);
    result.push({id:'jw-'+w.id,type:'word',section:'vocabulary',task:'表記',prompt:`「${w.reading}」を漢字で書くと、どれですか。`,options,answer:options.indexOf(w.word),explanation:`${w.reading} → ${w.word}${w.meaning_vi?' ('+w.meaning_vi+')':''}`});
  }
  return result;
}
const valid=(q:Question)=>q.options?.length===4&&q.answer>=0&&q.answer<4;
/**
 * Original JLPT-*style* practice, not an official exam or calibrated score.
 * Three stages follow 25/55/35-minute N4 allocations; question counts are approximations.
 */
export function makeFullMock(c:Content):Question[]{
  const context=shuffle(c.examBank.vocabulary).filter(valid).slice(0,11).map(q=>({...q,section:'vocabulary' as const}));
  const vocabulary=shuffle([...makeKanjiReadingQuestions(c,9),...makeKanjiWritingQuestions(c,9),...context]).slice(0,28);
  const grammar=shuffle(c.examBank.grammar).filter(valid).slice(0,22).map(q=>({...q,section:'language' as const}));
  const reading=makeReadingQuiz(c,true).slice(0,14).map(q=>({...q,section:'language' as const}));
  const listening=shuffle(c.examBank.listening).filter(valid).slice(0,15).map(q=>({...q,section:'listening' as const}));
  return [...vocabulary,...grammar,...reading,...listening];
}
