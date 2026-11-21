#!/usr/bin/env node
/**
 * Opt-in build-time enrichment using Bunchaway Japanese→Vietnamese dictionary,
 * CC BY-SA 4.0. No runtime network requests.
 * Source: https://github.com/bunchaway/tu-dien-nhat-viet
 * Usage: npm run sync:vi (download ~29 MB once)
 * Or:    node scripts/sync-vi.mjs C:\\path\\to\\final.csv
 */
import {readFile,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const content=join(root,'public','content');
const csvURL='https://raw.githubusercontent.com/bunchaway/tu-dien-nhat-viet/main/final.csv';
function* parseCSV(text){
  let row=[],cell='',quoted=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(c==='"'){
      if(quoted&&text[i+1]==='"'){cell+='"';i++}else quoted=!quoted;
    }else if(c===','&&!quoted){row.push(cell);cell=''}
    else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);yield row;row=[];cell=''}
    else cell+=c;
  }
  if(row.length||cell){row.push(cell);yield row}
}
const hasJa=s=>/[\u3040-\u30ff\u3400-\u9fff]/u.test(s);
const hasVi=s=>/[À-ỹĐđ]/u.test(s);
const tidy=s=>s.trim().replace(/^['"\s]+|['"\s]+$/g,'');
const normalize=s=>tidy(s).normalize('NFKC');
function candidateTranslation(row,matchedIndex){
  // An unambiguous diacritic-bearing Vietnamese field is required to avoid
  // accidentally writing English, romaji or database metadata as a translation.
  const results=row.map((s,i)=>({s:tidy(s),i})).filter(({s,i})=>i!==matchedIndex&&s.length>=2&&s.length<=350&&!hasJa(s)&&hasVi(s)&&!/^https?:/i.test(s));
  results.sort((a,b)=>{const score=x=>[+/(nghĩa|dịch|tiếng việt|dùng để|là|cái|con|một|sự|có thể|chỉ)/i.test(x.s),-x.s.length];const l=score(a),r=score(b);return r[0]-l[0]||r[1]-l[1]});
  const best=results[0]?.s.replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
  if(!best)return null;
  // Avoid importing very long usage notes as a single gloss.
  const first=best.split(/(?:\r?\n|\s\|\s)/)[0].trim();
  return first.length<=160?first:first.slice(0,157)+'…';
}
async function main(){
 const input=process.argv[2];
 let txt;
 if(input){txt=await readFile(input,'utf8');console.log('Reading local CSV:',input)}
 else {console.log('Downloading CC BY-SA Japanese–Vietnamese dictionary (~29MB) once...');const r=await fetch(csvURL,{headers:{'User-Agent':'NihongoMasterN4-VietnameseImport/0.2'}});if(!r.ok)throw Error(`Failed HTTP ${r.status} (${csvURL})`);txt=await r.text()}
 if(txt.charCodeAt(0)===0xfeff)txt=txt.slice(1);
 const files=['n4-vocab','n5-vocab'];
 const dict=await Promise.all(files.map(async f=>JSON.parse(await readFile(join(content,f+'.json'),'utf8'))));
 const terms=new Map();
 for(const arr of dict)for(const x of arr){for(const term of [x.word,x.reading]){
   const k=normalize(term);if(!terms.has(k))terms.set(k,[]);terms.get(k).push(x);
 }}
 let scanned=0,recognized=0;
 const found=new Map();
 for(const row of parseCSV(txt)){
   scanned++;
   if(row.length<2)continue;
   const keys=[];
   for(let i=0;i<row.length;i++){
     const v=normalize(row[i]);
     if(!hasJa(v)||v.length>30)continue;
     if(terms.has(v))keys.push({v,i});
   }
   if(!keys.length)continue;
   for(const {v,i} of keys){
     const vi=candidateTranslation(row,i);
     if(vi){if(!found.has(v))found.set(v,vi);recognized++}
   }
 }
 let updated=0;
 const next=dict.map(arr=>arr.map(x=>{
   if(x.meaning_vi?.trim())return x;
   const vi=found.get(normalize(x.word))||found.get(normalize(x.reading));
   if(!vi)return x;updated++;return {...x,meaning_vi:vi,meaning_vi_source:'Bunchaway Japanese–Vietnamese dictionary · CC BY-SA 4.0'};
 }));
 console.log(`CSV records: ${scanned}; matched forms: ${found.size}; new translated entries: ${updated}`);
 if(updated<20){throw Error('Fewer than 20 matches; no files changed. CSV may have a different layout. Check data source and script before importing.')} 
 for(let i=0;i<files.length;i++)await writeFile(join(content,files[i]+'.json'),JSON.stringify(next[i],null,2),'utf8');
 console.log('Import complete. Keep DATA-LICENSE.md attribution when distributing the app.');
}
main().catch(e=>{console.error('Import failed (existing content retained if no files were written):',e.message);process.exitCode=1});
