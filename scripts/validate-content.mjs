import {readFile} from 'node:fs/promises';
const dir=new URL('../public/content/',import.meta.url);
const files=['n4-vocab','n5-vocab','n4-grammar','n5-grammar','n4-kanji','n5-kanji','readings'];
const load=async(name)=>JSON.parse(await readFile(new URL(name+'.json',dir),'utf8'));
let failed=false;
for(const name of files){
 const data=await load(name);if(!Array.isArray(data)){failed=true;console.error(name,'not array');continue}
 if(data.length){const first=data[0],type=name.split('-').at(-1);const key=type==='vocab'?'word':type==='grammar'?'pattern':type==='kanji'?'character':'text';
   if(data.some(x=>typeof x[key]!=='string'||!x[key].trim())){failed=true;console.error(name,'missing',key)}
 }
 console.log(`${name}: ${data.length} entries`);
}
const read=[...await load('readings'),...await load('readings-extra')];
if(new Set(read.map(x=>x.id)).size!==read.length){failed=true;console.error('Duplicate reading IDs')}
for(const passage of read){for(const question of passage.questions){if(question.options.length!==4||!Number.isInteger(question.answer)||question.answer<0||question.answer>=4){failed=true;console.error('Bad reading question',passage.id)}}}
const originals=await load('exam-bank');const additions=await load('exam-addon');
const bank={vocabulary:[...originals.vocabulary,...additions.vocabulary],grammar:[...originals.grammar,...additions.grammar],listening:[...originals.listening,...additions.listening]};
for(const section of ['vocabulary','grammar','listening']){
 if(!Array.isArray(bank[section])){failed=true;console.error('Missing exam bank',section);continue}
 for(const q of bank[section])if(q.options.length!==4||q.answer<0||q.answer>3||!Number.isInteger(q.answer)||!q.prompt||section==='listening'&&!q.audioScript){failed=true;console.error('Bad question',q.id)}
 console.log('exam-bank',section,bank[section].length)
}
for(const f of ['manual-vi','manual-grammar-vi','manual-vi-addon','kanji-compounds-vi']){
 const d=await load(f);if(!d||Array.isArray(d)||typeof d!=='object'){failed=true;console.error('Bad dictionary:',f)}
 else console.log(f,Object.keys(d).length,'translations')
}
const compounds=await load('kanji-compounds-vi');
for(const [word,item] of Object.entries(compounds))if(!word||!item||typeof item.reading!=='string'||!item.reading||typeof item.meaning_vi!=='string'||!item.meaning_vi){failed=true;console.error('Bad compound',word)}
if(failed)process.exitCode=1;else console.log('Content validation OK');
