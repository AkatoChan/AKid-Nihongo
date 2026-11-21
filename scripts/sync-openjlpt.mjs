#!/usr/bin/env node
/**
 * One-time build-time ingestion of CC BY-SA 4.0 OpenJLPT. Never invoked by the app.
 * Sources: https://github.com/evanclan/OpenJLPT ; attribution DATA-LICENSE.md.
 * Usage: npm run sync:data (internet needed only for this command).
 */
import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const contentDir=join(root,'public','content');
const rawRef=process.env.OPENJLPT_REF||'main';
if(!/^[\w.\/-]+$/.test(rawRef))throw Error('Invalid OPENJLPT_REF');
const base=`https://raw.githubusercontent.com/evanclan/OpenJLPT/${rawRef}`;
const specs=[
  ['n4-vocab','data/json/vocab/n4.json','vocab','N4'],
  ['n5-vocab','data/json/vocab/n5.json','vocab','N5'],
  ['n4-grammar','data/json/grammar/n4.json','grammar','N4'],
  ['n5-grammar','data/json/grammar/n5.json','grammar','N5'],
  ['n4-kanji','data/json/kanji/n4.json','kanji','N4'],
  ['n5-kanji','data/json/kanji/n5.json','kanji','N5']
];
const getLocal=async name=>JSON.parse(await readFile(join(contentDir,`${name}.json`),'utf8'));
async function download(path){
  const res=await fetch(`${base}/${path}`,{headers:{'User-Agent':'NihongoMasterN4/0.1 (educational offline dataset bundler)'}});
  if(!res.ok)throw Error(`HTTP ${res.status}: ${path}`);
  return await res.text();
}
const out={};const checksums={};
try{
 console.log(`Syncing OpenJLPT @ ${rawRef}, one-time internet access...`);
 const remote=await Promise.all(specs.map(async ([name,path])=>{
   const txt=await download(path);checksums[name]=createHash('sha256').update(txt).digest('hex');return JSON.parse(txt);
 }));
 for(let i=0;i<specs.length;i++){
   const [name,,type,level]=specs[i];const input=remote[i];
   if(!Array.isArray(input)||input.length<10)throw Error(`Unexpected upstream ${name} format`);
   const starter=await getLocal(name); // preserved starter translations and original items
   let merged=[];
   if(type==='vocab'){
     const byWord=new Map(starter.map(x=>[`${x.word}|${x.reading}`,x]));
     merged=input.map(x=>{const prev=byWord.get(`${x.word}|${x.reading}`);return {...x,id:prev?.id||x.id,openjlpt_id:x.id,level,source:'OpenJLPT',...(prev?.meaning_vi?{meaning_vi:prev.meaning_vi}:{})}});
     const used=new Set(merged.map(x=>`${x.word}|${x.reading}`));
     merged.push(...starter.filter(x=>!used.has(`${x.word}|${x.reading}`)&&x.source==='Tự biên soạn'));
   }else if(type==='grammar'){
     const byPattern=new Map(starter.map(x=>[x.pattern,x]));
     merged=input.map(x=>{const prev=byPattern.get(x.pattern);return {...x,level,source:'OpenJLPT',
       ...(prev?.meaning_vi?{meaning_vi:prev.meaning_vi,formation_vi:prev.formation_vi,explain_vi:prev.explain_vi,notes_vi:prev.notes_vi}:{})}});
     const used=new Set(merged.map(x=>x.pattern));
     merged.push(...starter.filter(x=>!used.has(x.pattern)&&x.source==='Tự biên soạn'));
   }else{
     const byChar=new Map(starter.map(x=>[x.character,x]));
     merged=input.map(x=>({...x,level,source:'OpenJLPT',
       ...(byChar.get(x.character)?.meaning_vi?{meaning_vi:byChar.get(x.character).meaning_vi}:{})}));
   }
   out[name]=merged;
 }
 const [notice,license]=await Promise.all([download('NOTICE.md'),download('LICENSE')]);
 const readings=await getLocal('readings');
 const counts={n4_vocab:out['n4-vocab'].length,n5_vocab:out['n5-vocab'].length,
   n4_grammar:out['n4-grammar'].length,n5_grammar:out['n5-grammar'].length,
   n4_kanji:out['n4-kanji'].length,n5_kanji:out['n5-kanji'].length,readings:readings.length};
 const manifest={content_version:`openjlpt-${rawRef}`,corpus:'full',downloaded_at:new Date().toISOString(),
   source_name:'OpenJLPT, assembled from Waller, JMdict/KANJIDIC2, Tatoeba + original N4 Vietnamese lessons',
   source_url:'https://github.com/evanclan/OpenJLPT',license:'CC BY-SA 4.0 (OpenJLPT); see DATA-LICENSE.md',counts,
   upstream_ref:rawRef,sha256:checksums,modifications:'Retained source entries, added curated Vietnamese translations; appended original practice items.'};
 const files={...Object.fromEntries(Object.entries(out).map(([k,v])=>[`${k}.json`,JSON.stringify(v,null,2)])),
   'manifest.json':JSON.stringify(manifest,null,2),'openjlpt-NOTICE.md':notice,'openjlpt-LICENSE.txt':license};
 // All fetches and checks complete before any content is replaced.
 await mkdir(contentDir,{recursive:true});
 for(const [name,txt] of Object.entries(files))await writeFile(join(contentDir,`${name}.tmp`),txt,'utf8');
 for(const name of Object.keys(files))await rename(join(contentDir,`${name}.tmp`),join(contentDir,name));
 console.log('Data imported successfully:',counts);
 console.log('After this, npm run desktop:build bundles the data entirely offline.');
}catch(e){console.error('Sync failed; existing offline content stays available.');console.error(e);process.exitCode=1}
