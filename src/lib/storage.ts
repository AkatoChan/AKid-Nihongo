import { isTauri } from '@tauri-apps/api/core';
import Database from '@tauri-apps/plugin-sql';
import type { QuizResult, ReviewLog, WordProgress } from './types';

const DB_URL='sqlite:nihongo-master-n4.db';
const KEY='nihongo-master-n4-storage-v1';
type Fallback={progress:WordProgress[]; logs:ReviewLog[]; quizzes:QuizResult[]; prefs:Record<string,string>};
const empty=():Fallback=>({progress:[],logs:[],quizzes:[],prefs:{}});
let dbPromise:Promise<Database>|null=null;
let localCache:Fallback|null=null;
const browserMode=!isTauri();
function db():Promise<Database> { if(!dbPromise) dbPromise=Database.load(DB_URL); return dbPromise }
function browserData():Fallback {
  if(!localCache){try{localCache=JSON.parse(localStorage.getItem(KEY)||'null')||empty()}catch{localCache=empty()}}
  return localCache!;
}
function saveBrowser(){localStorage.setItem(KEY,JSON.stringify(browserData()))}
export const storageMode=browserMode?'browser':'sqlite';
export async function initStorage(){if(browserMode)browserData();else await db()}
export async function getProgress():Promise<WordProgress[]> {
  if(browserMode)return [...browserData().progress];
  return (await db()).select<WordProgress[]>('SELECT * FROM word_progress');
}
export async function getLogs():Promise<ReviewLog[]> {
  if(browserMode)return [...browserData().logs];
  return (await db()).select<ReviewLog[]>('SELECT word_id, quality, created_at FROM review_log ORDER BY created_at DESC LIMIT 5000');
}
export async function getQuizzes():Promise<QuizResult[]> {
  if(browserMode)return [...browserData().quizzes];
  return (await db()).select<QuizResult[]>('SELECT mode, score, total, duration_seconds, created_at FROM quiz_results ORDER BY created_at DESC LIMIT 500');
}
export async function getPref(key:string):Promise<string|null>{
  if(browserMode)return browserData().prefs[key]??null;
  const r=await (await db()).select<{value:string}[]>('SELECT value FROM app_settings WHERE key=$1',[key]);
  return r[0]?.value??null;
}
export async function setPref(key:string,value:string){
  if(browserMode){browserData().prefs[key]=value;saveBrowser();return}
  await (await db()).execute('INSERT INTO app_settings(key,value) VALUES($1,$2) ON CONFLICT(key) DO UPDATE SET value=excluded.value',[key,value]);
}
function nextProgress(old:WordProgress|undefined,wordId:string,quality:number,now:number):WordProgress{
  const p=old||{word_id:wordId,ease:2.5,interval_days:0,repetitions:0,due_at:0,last_reviewed:0,correct_count:0,incorrect_count:0};
  if(quality<3)return {...p, repetitions:0,interval_days:0,ease:Math.max(1.3,p.ease-.2),due_at:now+60_000,last_reviewed:now,incorrect_count:p.incorrect_count+1};
  const ease=Math.max(1.3,p.ease + (0.1-(5-quality)*(0.08+(5-quality)*0.02)));
  const repetitions=p.repetitions+1;
  const interval_days= repetitions===1?1:repetitions===2?3:Math.max(1,Math.round(p.interval_days*ease*(quality===5?1.3:quality===3?.8:1)));
  return {...p,repetitions,interval_days,ease,due_at:now+interval_days*86400000,last_reviewed:now,correct_count:p.correct_count+1};
}
export async function rateWord(wordId:string,quality:1|3|4|5):Promise<WordProgress>{
  const now=Date.now(),all=await getProgress();
  const next=nextProgress(all.find(p=>p.word_id===wordId),wordId,quality,now);
  if(browserMode){const d=browserData();d.progress=d.progress.filter(p=>p.word_id!==wordId).concat(next);d.logs.push({word_id:wordId,quality,created_at:now});saveBrowser();return next}
  const conn=await db();
  await conn.execute(`INSERT INTO word_progress(word_id,ease,interval_days,repetitions,due_at,last_reviewed,correct_count,incorrect_count)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(word_id) DO UPDATE SET
    ease=excluded.ease,interval_days=excluded.interval_days,repetitions=excluded.repetitions,due_at=excluded.due_at,
    last_reviewed=excluded.last_reviewed,correct_count=excluded.correct_count,incorrect_count=excluded.incorrect_count`,
    [next.word_id,next.ease,next.interval_days,next.repetitions,next.due_at,next.last_reviewed,next.correct_count,next.incorrect_count]);
  await conn.execute('INSERT INTO review_log(word_id,quality,created_at) VALUES ($1,$2,$3)',[wordId,quality,now]);
  return next;
}
export async function saveQuiz(result:QuizResult){
  if(browserMode){browserData().quizzes.unshift(result);saveBrowser();return}
  await (await db()).execute('INSERT INTO quiz_results(mode,score,total,duration_seconds,created_at) VALUES ($1,$2,$3,$4,$5)',
    [result.mode,result.score,result.total,result.duration_seconds,result.created_at]);
}
export async function exportBackup():Promise<string>{
  const [progress,logs,quizzes,goal]=await Promise.all([getProgress(),getLogs(),getQuizzes(),getPref('dailyGoal')]);
  return JSON.stringify({format:'nihongo-master-n4-backup-v1',exported_at:new Date().toISOString(),progress,logs,quizzes,prefs:{dailyGoal:goal||'20'}},null,2);
}
export async function importBackup(json:string):Promise<void>{
  const b=JSON.parse(json) as {format:string;progress:WordProgress[];logs:ReviewLog[];quizzes:QuizResult[];prefs?:Record<string,string>};
  if(b.format!=='nihongo-master-n4-backup-v1'||!Array.isArray(b.progress)||!Array.isArray(b.logs)||!Array.isArray(b.quizzes))throw Error('Không đúng định dạng sao lưu');
  if(b.progress.length>100000||b.logs.length>500000||b.quizzes.length>50000)throw Error('Tệp quá lớn');
  if(browserMode){localCache={progress:b.progress,logs:b.logs,quizzes:b.quizzes,prefs:b.prefs||{}};saveBrowser();return}
  const conn=await db();
  for(const p of b.progress){
    if(typeof p.word_id!=='string'||!Number.isFinite(p.ease)||!Number.isFinite(p.due_at))continue;
    await conn.execute(`INSERT INTO word_progress(word_id,ease,interval_days,repetitions,due_at,last_reviewed,correct_count,incorrect_count)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(word_id) DO UPDATE SET
    ease=excluded.ease,interval_days=excluded.interval_days,repetitions=excluded.repetitions,due_at=excluded.due_at,
    last_reviewed=excluded.last_reviewed,correct_count=excluded.correct_count,incorrect_count=excluded.incorrect_count`,
    [p.word_id,p.ease,p.interval_days,p.repetitions,p.due_at,p.last_reviewed,p.correct_count,p.incorrect_count]);
  }
  for(const r of b.logs){if(typeof r.word_id==='string'&&Number.isFinite(r.quality)&&Number.isFinite(r.created_at))
    await conn.execute('INSERT INTO review_log(word_id,quality,created_at) VALUES($1,$2,$3)',[r.word_id,r.quality,r.created_at]);}
  for(const r of b.quizzes){if(typeof r.mode==='string'&&Number.isFinite(r.score)&&Number.isFinite(r.total)&&Number.isFinite(r.created_at))
    await conn.execute('INSERT INTO quiz_results(mode,score,total,duration_seconds,created_at) VALUES($1,$2,$3,$4,$5)',[r.mode,r.score,r.total,r.duration_seconds||0,r.created_at]);}
  if(b.prefs?.dailyGoal)await setPref('dailyGoal',String(b.prefs.dailyGoal));
}
