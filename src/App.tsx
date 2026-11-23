import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  BookOpen, BookText, Brain, ChartNoAxesCombined, Check, CheckCircle2, ChevronDown,
  ChevronLeft, ChevronRight, CircleHelp, Clock3, CloudOff, Download, Flame, GraduationCap,
  Heart, Info, Layers3, LayoutDashboard, Menu, Moon, Play, RotateCcw,
  Search, Settings2, ShieldCheck, Sparkles, Sun, Target, TrendingUp, Trophy, Volume2,
  WandSparkles, X, Zap, type LucideIcon
} from 'lucide-react';
import { loadContent, grammarMeaning, searchable, vocabMeaning } from './lib/content';
import { makeQuiz, makeReadingQuiz, makeFullMock, shuffle } from './lib/quiz';
import PastPapers from './components/PastPapers';
import {
  exportBackup, getLogs, getPref, getProgress, getQuizzes, importBackup, initStorage,
  rateWord, saveQuiz, setPref, storageMode
} from './lib/storage';
import type { Content, CompoundEntry, ExamSection, Grammar, Kanji, Question, QuizResult, Reading, ReviewLog, Vocab, WordProgress } from './lib/types';

type Page='dashboard'|'vocab'|'flashcards'|'grammar'|'kanji'|'reading'|'exam'|'past'|'stats'|'settings';
type ExamMode='quick'|'mock'|'grammar'|'reading';
type Exam={mode:ExamMode; questions:Question[]; index:number; answers:Record<number,number>; started:number; phaseIndex:number; phaseStarted:number; finished:boolean; saved:boolean};
const phaseOrder:ExamSection[]=['vocabulary','language','listening'];
const phaseLimits=[25*60,55*60,35*60];
const phaseNames=['Từ vựng · 文字・語彙','Ngữ pháp & Đọc hiểu · 文法・読解','Nghe hiểu · 聴解'];
const navSections:{title:string;items:{id:Page;label:string;icon:LucideIcon}[]}[]=[
  {title:'TỔNG QUAN',items:[{id:'dashboard',label:'Tổng quan',icon:LayoutDashboard},{id:'stats',label:'Tiến độ học tập',icon:ChartNoAxesCombined}]},
  {title:'HỌC TẬP',items:[{id:'vocab',label:'Từ vựng',icon:BookOpen},{id:'flashcards',label:'Flashcards',icon:Layers3},{id:'grammar',label:'Ngữ pháp',icon:BookText},{id:'kanji',label:'Kanji',icon:WandSparkles},{id:'reading',label:'Đọc hiểu',icon:BookOpen}]},
  {title:'LUYỆN THI',items:[{id:'exam',label:'Luyện đề N4',icon:GraduationCap},{id:'past',label:'Giải đề theo năm',icon:BookText}]}
];
const formatTime=(s:number)=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
const dateKey=(ms:number)=>{const d=new Date(ms);return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`};
const localDayStart=()=>{const d=new Date();d.setHours(0,0,0,0);return d.getTime()};
const speak=(text:string,notify:(m:string)=>void)=>{
  if(!('speechSynthesis' in window)){notify('Thiết bị không hỗ trợ đọc văn bản.');return}
  const voices=window.speechSynthesis.getVoices();
  const jp=voices.find(v=>v.lang.toLowerCase().startsWith('ja'));
  if(!jp){notify('Windows chưa có giọng tiếng Nhật offline. Có thể cài thêm Japanese speech trong Settings.');return}
  window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang='ja-JP';utterance.rate=.82;utterance.voice=jp;
  window.speechSynthesis.speak(utterance);
};
function Japanese({text}:{text:string}){
  // OpenJLPT uses {食|た}べる notation. Render it as native HTML ruby without unsafe HTML.
  const matches=[...text.matchAll(/\{([^{}|]+)\|([^{}|]+)\}/g)];let from=0;
  const parts:(string|ReactNode)[]=[];
  matches.forEach((m,i)=>{if(m.index!>from)parts.push(text.slice(from,m.index));parts.push(<ruby key={i}>{m[1]}<rt>{m[2]}</rt></ruby>);from=m.index!+m[0].length});
  if(from<text.length)parts.push(text.slice(from));return <>{parts}</>;
}
const I=({icon:Icon,size=18}:{icon:LucideIcon;size?:number})=><Icon size={size} strokeWidth={1.9}/>;

export default function App(){
  const [content,setContent]=useState<Content|null>(null);
  const [error,setError]=useState('');
  const [page,setPage]=useState<Page>('dashboard');
  const [progress,setProgress]=useState<WordProgress[]>([]);
  const [logs,setLogs]=useState<ReviewLog[]>([]);
  const [quizzes,setQuizzes]=useState<QuizResult[]>([]);
  const [goal,setGoal]=useState(20);
  const [dark,setDark]=useState(false);
  const [search,setSearch]=useState('');
  const [notice,setNotice]=useState('');
  const [clock,setClock]=useState(Date.now());
  const [menu,setMenu]=useState(false);
  const [exam,setExam]=useState<Exam|null>(null);
  const notify=useCallback((s:string)=>setNotice(s),[]);
  const refresh=useCallback(async()=>{const [p,l,q]=await Promise.all([getProgress(),getLogs(),getQuizzes()]);setProgress(p);setLogs(l);setQuizzes(q)},[]);
  useEffect(()=>{let live=true;(async()=>{
    try{const data=await loadContent();await initStorage();const g=await getPref('dailyGoal');const t=await getPref('theme');if(!live)return;
      setContent(data);setGoal(Number(g)||20);setDark(t==='dark');await refresh();
    }catch(e){if(live)setError(String(e))}
  })();return()=>{live=false}},[refresh]);
  useEffect(()=>{document.documentElement.classList.toggle('dark',dark)},[dark]);
  useEffect(()=>{const h=setInterval(()=>setClock(Date.now()),1000);return()=>clearInterval(h)},[]);
  useEffect(()=>{if(!notice)return;const h=setTimeout(()=>setNotice(''),3500);return()=>clearTimeout(h)},[notice]);
  const studiedToday=logs.filter(x=>x.created_at>=localDayStart()).length;
  const learned=progress.filter(p=>p.correct_count>0).length;
  const due=progress.filter(p=>p.due_at<=clock).length;
  const mastery=content?Math.min(100,Math.round(learned/content.vocab.length*100)):0;
  const streak=useMemo(()=>{
    const days=new Set(logs.map(l=>dateKey(l.created_at)));let n=0;const d=new Date();
    if(!days.has(dateKey(d.getTime())))d.setDate(d.getDate()-1);
    while(days.has(dateKey(d.getTime()))){n++;d.setDate(d.getDate()-1)}return n;
  },[logs]);
  const setNavigation=(p:Page)=>{setPage(p);setMenu(false);setSearch('');if(p!=='exam')setExam(null)};
  const makeStart=(mode:ExamMode)=>{
    if(!content)return;
    const questions=mode==='reading'?makeReadingQuiz(content).slice(0,10):mode==='mock'?makeFullMock(content):makeQuiz(content,mode);
    if(questions.length<4){notify('Chưa đủ dữ liệu để tạo bài kiểm tra.');return}
    setExam({mode,questions,index:0,answers:{},started:Date.now(),phaseIndex:0,phaseStarted:Date.now(),finished:false,saved:false});setPage('exam');setSearch('');
  };
  const finishExam=useCallback(async (current:Exam)=>{
    if(current.saved)return;
    const score=current.questions.filter((q,i)=>current.answers[i]===q.answer).length;
    await saveQuiz({mode:current.mode,score,total:current.questions.length,duration_seconds:Math.round((Date.now()-current.started)/1000),created_at:Date.now()});
    await refresh();
  },[refresh]);
  const finalize=()=>{if(!exam||exam.finished)return;const next={...exam,finished:true,saved:true};setExam(next);void finishExam(exam)};
  const nextSection=()=>{
    if(!exam||exam.finished)return;
    if(exam.mode!=='mock'||exam.phaseIndex>=2){finalize();return}
    const nextIndex=exam.phaseIndex+1;
    const questionIndex=exam.questions.findIndex(q=>q.section===phaseOrder[nextIndex]);
    setExam({...exam,index:questionIndex<0?exam.index:questionIndex,phaseIndex:nextIndex,phaseStarted:Date.now()});
    notify(`Đã chuyển sang phần ${nextIndex+1}: ${phaseNames[nextIndex]}`);
  };
  const remain=exam?.mode==='mock'?Math.max(0,phaseLimits[exam.phaseIndex]-Math.floor((clock-exam.phaseStarted)/1000)):null;
  useEffect(()=>{if(exam&&!exam.finished&&remain===0)nextSection()},[remain,exam?.finished]);
  const heading=({dashboard:'Tổng quan',vocab:'Kho từ vựng',flashcards:'Flashcards',grammar:'Ngữ pháp N4',kanji:'Kanji N4',reading:'Luyện đọc hiểu',exam:'Luyện đề JLPT N4',past:'Giải đề theo năm',stats:'Tiến độ học tập',settings:'Cài đặt'})[page];
  if(error)return <div className="fatal"><CircleHelp size={38}/><h1>Không thể khởi tạo ứng dụng</h1><p>{error}</p><p>Hãy kiểm tra thư mục <code>public/content</code> và quyền truy cập SQLite.</p></div>;
  if(!content)return <div className="app-loading"><div className="load-logo">日</div><h2>Nihongo Master N4</h2><p>Đang nạp tài liệu offline...</p></div>;
  return <div className="app-shell">
    <aside className={`sidebar ${menu?'open':''}`}>
      <div className="brand"><div className="brand-logo">日</div><div><strong>nihongo<span>.</span></strong><small>MASTER N4</small></div></div>
      <div className="study-switch"><div className="flag-jp">日</div><div className="study-switch-text"><strong>JLPT N4</strong><span>Hành trình của bạn</span></div><ChevronDown size={15}/></div>
      <div className="sidebar-scroll">
        {navSections.map(group=><div className="nav-section" key={group.title}><span className="nav-label">{group.title}</span>
          {group.items.map(item=><button key={item.id} className={`nav-link ${page===item.id?'selected':''}`} onClick={()=>setNavigation(item.id)}><I icon={item.icon}/><span>{item.label}</span>{item.id==='flashcards'&&due>0?<span className="nav-count">{due}</span>:null}</button>)}
        </div>)}
      </div>
      <div className="sidebar-bottom">
        <div className="sidebar-tip"><Sparkles size={18}/><strong>Tiến bộ từng ngày!</strong><p>Chỉ cần 20 phút đều đặn, tiếng Nhật sẽ trở nên dễ dàng hơn.</p><div className="sidebar-sakura">✿</div></div>
        <button className={`nav-link ${page==='settings'?'selected':''}`} onClick={()=>setNavigation('settings')}><Settings2 size={18}/> Cài đặt</button>
        <div className="sidebar-footer"><CloudOff size={15}/> Offline · {storageMode==='sqlite'?'SQLite':'Chế độ trình duyệt'}</div>
      </div>
    </aside>
    {menu&&<div className="mobile-overlay" onClick={()=>setMenu(false)}/>}
    <main className="main-area">
      <header className="topbar"><button className="mobile-menu icon-button" onClick={()=>setMenu(!menu)}><Menu size={20}/></button>
        <div className="topbar-breadcrumb">Học tập <ChevronRight size={14}/><strong>{heading}</strong></div>
        <div className="topbar-actions"><div className="global-search"><Search size={18}/><input aria-label="Tìm từ vựng" placeholder="Tìm từ vựng, cách đọc..." value={search} onChange={e=>{setSearch(e.target.value);if(e.target.value)setPage('vocab')}}/><kbd>⌕</kbd></div>
          <button aria-label="Đổi giao diện" className="icon-button" title="Chuyển chế độ sáng/tối" onClick={()=>{const n=!dark;setDark(n);void setPref('theme',n?'dark':'light')}}>{dark?<Sun size={19}/>:<Moon size={19}/>}</button>
          <div className="avatar">K</div></div>
      </header>
      <div className="main-scroll"><div className="content-wrapper">
        {page==='dashboard'&&<Dashboard content={content} studiedToday={studiedToday} goal={goal} streak={streak} learned={learned} mastery={mastery} due={due} progress={progress} quizzes={quizzes} onNavigate={setNavigation} onTest={makeStart}/>}
        {page==='vocab'&&<Vocabulary content={content} search={search} setSearch={setSearch} progress={progress} notify={notify}/>}
        {page==='flashcards'&&<Flashcards content={content} progress={progress} onRate={async(id,q)=>{await rateWord(id,q);await refresh()}} notify={notify}/>}
        {page==='grammar'&&<GrammarPage grammar={content.grammar} onTest={()=>makeStart('grammar')} notify={notify}/>}
        {page==='kanji'&&<KanjiPage kanji={content.kanji} vocab={content.vocab} manualVi={content.manualVi} compounds={content.kanjiCompounds} notify={notify}/>}
        {page==='reading'&&<ReadingPage readings={content.readings} notify={notify} onSave={async(score,total)=>{await saveQuiz({mode:'reading',score,total,duration_seconds:0,created_at:Date.now()});await refresh()}}/>}
        {page==='exam'&&(exam?<ExamPanel exam={exam} timeLeft={remain} setExam={setExam} onFinish={nextSection} onRestart={()=>setExam(null)} notify={notify}/>:<ExamHome content={content} onStart={makeStart} quizzes={quizzes} onPast={()=>setPage('past')}/>)}
        {page==='past'&&<PastPapers papers={content.pastPapers} notify={notify} onSave={async (mode,score,total,duration_seconds)=>{await saveQuiz({mode,score,total,duration_seconds,created_at:Date.now()});await refresh()}}/>}
        {page==='stats'&&<Stats content={content} progress={progress} quizzes={quizzes} logs={logs} streak={streak} goal={goal}/>}
        {page==='settings'&&<Settings content={content} goal={goal} setGoal={async n=>{setGoal(n);await setPref('dailyGoal',String(n))}} dark={dark} setDark={async n=>{setDark(n);await setPref('theme',n?'dark':'light')}} notify={notify} onImport={refresh}/>}
      </div></div>
    </main>
    {notice&&<div className="toast"><CheckCircle2 size={17}/>{notice}<button aria-label="Đóng" onClick={()=>setNotice('')}><X size={14}/></button></div>}
  </div>;
}

function SectionTitle({eyebrow,title,action}:{eyebrow?:string;title:string;action?:ReactNode}){
  return <div className="section-heading"><div>{eyebrow&&<span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2></div>{action}</div>;
}
function ProgressCircle({value,size=110}:{value:number;size?:number}){
  return <div className="progress-circle" style={{width:size,height:size,background:`conic-gradient(var(--purple) ${Math.min(100,value)*3.6}deg, var(--progress-track) 0deg)`}}><div><strong>{value}%</strong><small>hoàn thành</small></div></div>;
}
function Dashboard({content,studiedToday,goal,streak,learned,mastery,due,progress,quizzes,onNavigate,onTest}:{content:Content;studiedToday:number;goal:number;streak:number;learned:number;mastery:number;due:number;progress:WordProgress[];quizzes:QuizResult[];onNavigate:(p:Page)=>void;onTest:(m:ExamMode)=>void}){
  const dateText=new Intl.DateTimeFormat('vi-VN',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
  const featured=content.vocab.filter(x=>x.level==='N4').slice(20,23);
  return <>
    <div className="welcome-line"><span>{dateText}</span><span className="offline-pill"><CloudOff size={13}/> Học offline, không gián đoạn</span></div>
    <h1 className="page-title">おかえりなさい！ <span className="wave">✿</span></h1>
    <p className="page-subtitle">Chào mừng trở lại! Mỗi ngày một chút, giỏi tiếng Nhật thêm một chút.</p>
    <div className="hero-card">
      <div className="hero-content"><div className="hero-badge"><Sparkles size={14}/> HÀNH TRÌNH JLPT N4</div>
        <h2>Học đều mỗi ngày,<br/><em>chinh phục N4</em> tự tin.</h2>
        <p>Không cần học quá nhiều trong một ngày. Quan trọng là bạn không bỏ cuộc!</p>
        <div className="hero-actions"><button className="btn btn-white" onClick={()=>onNavigate('flashcards')}><Play size={17} fill="currentColor"/> Bắt đầu ôn tập</button><button className="btn btn-hero-ghost" onClick={()=>onTest('quick')}>Kiểm tra nhanh <ChevronRight size={17}/></button></div>
      </div><div className="hero-art" aria-hidden="true"><div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/><div className="hero-kanji">日本語</div><div className="hero-sakura s1">✿</div><div className="hero-sakura s2">✿</div><div className="hero-star">✦</div><div className="hero-small-jp">一歩ずつ、前へ。</div></div>
    </div>
    <div className="metrics-grid">
      <Metric icon={Flame} tone="orange" label="Chuỗi ngày học" value={`${streak} ngày`} detail="Duy trì thói quen"/>
      <Metric icon={BookOpen} tone="purple" label="Từ đã ôn" value={learned.toLocaleString('vi-VN')} detail={`Trong ${content.vocab.length} mục từ`}/>
      <Metric icon={Clock3} tone="blue" label="Đến hạn ôn lại" value={String(due)} detail="Theo phương pháp SRS"/>
      <Metric icon={Trophy} tone="green" label="Bài kiểm tra" value={String(quizzes.length)} detail="Đã hoàn thành"/>
    </div>
    <div className="dashboard-grid">
      <div className="card lesson-card"><SectionTitle eyebrow="MỤC TIÊU HẰNG NGÀY" title="Hôm nay bạn học thế nào?"/><div className="goal-layout"><ProgressCircle value={Math.min(100,Math.round(studiedToday/goal*100))}/><div><strong>{studiedToday} <span>/ {goal} lượt ôn</span></strong><p>{studiedToday>=goal?'Tuyệt vời! Bạn đã hoàn thành mục tiêu hôm nay.':'Bạn đang tiến gần hơn đến mục tiêu của mình.'}</p><button className="text-action" onClick={()=>onNavigate('flashcards')}>Ôn tiếp ngay <ChevronRight size={16}/></button></div></div>
        <div className="goal-footer"><Target size={16}/> Mục tiêu nhỏ, thành tựu lớn <span>がんばって！</span></div>
      </div>
      <div className="card mastery-card"><SectionTitle eyebrow="HÀNH TRÌNH CỦA BẠN" title="Tiến độ tổng quan"/><div className="mastery-center"><div className="mastery-number">{mastery}<small>%</small></div><p>Từ vựng đã từng trả lời đúng</p><div className="linear-progress"><span style={{width:`${mastery}%`}}/></div><div className="mastery-detail"><span>{learned} từ đã ghi nhớ</span><span>{content.vocab.length-learned} từ còn lại</span></div></div><button className="card-bottom-link" onClick={()=>onNavigate('stats')}>Xem thống kê chi tiết <ChevronRight size={16}/></button></div>
    </div>
    <SectionTitle title="Học gì hôm nay?" eyebrow="KHÁM PHÁ" action={<button className="text-action" onClick={()=>onNavigate('vocab')}>Xem tất cả <ChevronRight size={16}/></button>}/>
    <div className="course-grid"><button onClick={()=>onNavigate('vocab')} className="course-card course-purple"><div className="course-icon"><BookOpen size={25}/></div><span>TỪ VỰNG</span><strong>Kho từ vựng N4</strong><p>{content.vocab.filter(v=>v.level==='N4').length} mục từ trong máy</p><ChevronRight className="course-arrow" size={20}/></button>
      <button onClick={()=>onNavigate('grammar')} className="course-card course-orange"><div className="course-icon"><BookText size={25}/></div><span>NGỮ PHÁP</span><strong>Học theo mẫu câu</strong><p>{content.grammar.filter(g=>g.level==='N4').length} mẫu ngữ pháp</p><ChevronRight className="course-arrow" size={20}/></button>
      <button onClick={()=>onNavigate('reading')} className="course-card course-blue"><div className="course-icon"><BookOpen size={25}/></div><span>ĐỌC HIỂU</span><strong>Luyện đọc N4</strong><p>{content.readings.length} bài đọc có đáp án</p><ChevronRight className="course-arrow" size={20}/></button>
    </div>
    <div className="bottom-grid"><div className="card today-words"><SectionTitle title="Một vài từ vựng hôm nay" action={<span className="tiny-tag">N4 · GỢI Ý</span>}/>
      {featured.map(v=><div className="today-word" key={v.id}><div className="mini-jp">{v.word}</div><div><strong>{v.reading}</strong><span>{vocabMeaning(v)}</span></div><span className="word-type">N4</span></div>)}
      </div><div className="card tip-card"><span className="tip-eyebrow"><Heart size={16}/> GÓC ĐỘNG LỰC</span><h3>継続は力なり。</h3><p>Kiên trì chính là sức mạnh. Hãy học vừa đủ nhưng học đều nhé!</p><div className="tip-flower">✿</div><div className="tip-author">一日一歩 · Mỗi ngày một bước</div></div></div>
    <p className="dashboard-footnote">Dữ liệu: {content.manifest.corpus==='full'?'OpenJLPT mở rộng':'Gói khởi đầu offline'} · Phân loại N4 mang tính tham khảo, không phải danh sách chính thức của JLPT. · {progress.length} thẻ đã có lịch sử.</p>
  </>;
}
function Metric({icon:Icon,tone,label,value,detail}:{icon:LucideIcon;tone:string;label:string;value:string;detail:string}){
  return <div className="metric-card"><div className={`metric-icon tone-${tone}`}><Icon size={20}/></div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}
function Vocabulary({content,search,setSearch,progress,notify}:{content:Content;search:string;setSearch:(s:string)=>void;progress:WordProgress[];notify:(s:string)=>void}){
  const [level,setLevel]=useState<'all'|'N4'|'N5'>('N4');
  const [filter,setFilter]=useState<'all'|'new'|'known'>('all');
  const [selected,setSelected]=useState<Vocab|null>(null);
  const [pageNo,setPageNo]=useState(0);
  const known=new Set(progress.filter(p=>p.correct_count>0).map(p=>p.word_id));
  const filtered=content.vocab.filter(v=>(level==='all'||v.level===level)&&
    (filter==='all'||(filter==='known'?known.has(v.id):!known.has(v.id)))&&
    (searchable([v.word,v.reading,v.romaji||'',v.meaning_vi||'',...(v.meanings||[])].join(' ')).includes(searchable(search))));
  const perPage=24,pages=Math.max(1,Math.ceil(filtered.length/perPage)),shown=filtered.slice(Math.min(pageNo,pages-1)*perPage,(Math.min(pageNo,pages-1)+1)*perPage);
  return <><PageIntro label="VOCABULARY · 単語" title="Từ vựng tiếng Nhật" description="Tra cứu từ, luyện phát âm và đánh dấu tiến độ qua flashcard." icon={BookOpen}/>
    <div className="filter-bar"><div className="field-search"><Search size={18}/><input value={search} placeholder="Tìm theo Kanji, Kana, Romaji hoặc nghĩa..." onChange={e=>{setSearch(e.target.value);setPageNo(0)}}/></div>
      <div className="segmented">{(['N4','N5','all'] as const).map(x=><button key={x} className={level===x?'active':''} onClick={()=>{setLevel(x);setPageNo(0)}}>{x==='all'?'Tất cả':x}</button>)}</div>
      <select className="nice-select" value={filter} onChange={e=>{setFilter(e.target.value as typeof filter);setPageNo(0)}}><option value="all">Tất cả trạng thái</option><option value="new">Chưa học</option><option value="known">Đã ôn đúng</option></select>
    </div>
    <div className="result-row"><span>Hiển thị <b>{filtered.length}</b> mục từ</span><span>{content.manifest.corpus==='full'?'Bộ OpenJLPT':'Gói khởi đầu'}</span></div>
    <div className="vocab-grid">{shown.map(v=><button className="vocab-item" key={v.id} onClick={()=>setSelected(v)}><div className="vocab-item-top"><span className="tiny-tag">{v.level}</span>{known.has(v.id)?<CheckCircle2 className="known-icon" size={16}/>:<ChevronRight size={17}/>}</div><strong className="vocab-jp">{v.word}</strong><span className="vocab-reading">{v.reading}</span><div className="vocab-meaning">{vocabMeaning(v)}</div></button>)}</div>
    {!filtered.length&&<Empty title="Không tìm thấy từ vựng" description="Hãy thử một cách viết khác hoặc bỏ bộ lọc."/>}
    {pages>1&&<div className="pagination"><button disabled={pageNo===0} onClick={()=>setPageNo(x=>x-1)}><ChevronLeft size={17}/> Trước</button><span>Trang {Math.min(pageNo,pages-1)+1} / {pages}</span><button disabled={pageNo>=pages-1} onClick={()=>setPageNo(x=>x+1)}>Sau <ChevronRight size={17}/></button></div>}
    {selected&&<Modal onClose={()=>setSelected(null)}><div className="word-modal-head"><span className="pill">{selected.level} · TỪ VỰNG</span><button className="icon-button" onClick={()=>speak(selected.word,notify)} title="Phát âm tiếng Nhật"><Volume2 size={21}/></button></div><h2 className="modal-jp">{selected.word}</h2><div className="modal-reading">{selected.reading} <span>· {selected.romaji||''}</span></div><div className="modal-divider"/><span className="eyebrow">NGHĨA</span><h3>{vocabMeaning(selected)}</h3><details className="subtle original-gloss"><summary>Xem nghĩa gốc tiếng Anh (tham khảo)</summary><p>{selected.meanings.join('; ')}</p></details>
      {selected.examples?.length?<div className="example-block"><span className="eyebrow">VÍ DỤ</span>{selected.examples.slice(0,2).map((e,i)=><div className="example" key={i}><strong><Japanese text={e.furigana||e.ja}/></strong><p>{e.vi||'Câu ví dụ này chưa có bản dịch tiếng Việt.'}</p>{e.tatoeba_id&&<small className="subtle">Câu ví dụ: Tatoeba #{e.tatoeba_id}</small>}</div>)}</div>:<div className="example-block subtle">Chưa có câu ví dụ trong gói dữ liệu này.</div>}
      <div className="modal-footer"><span>Nguồn: {selected.source||'OpenJLPT'}</span><button className="btn btn-primary" onClick={()=>setSelected(null)}>Đã hiểu <Check size={16}/></button></div></Modal>}
  </>;
}
function Flashcards({content,progress,onRate,notify}:{content:Content;progress:WordProgress[];onRate:(id:string,q:1|3|4|5)=>Promise<void>;notify:(s:string)=>void}){
  const [level,setLevel]=useState<'N4'|'N5'>('N4');
  const [queue,setQueue]=useState<string[]>([]);
  const [flipped,setFlipped]=useState(false);
  const [completed,setCompleted]=useState(0);
  const [busy,setBusy]=useState(false);
  const [started,setStarted]=useState(false);
  const now=Date.now();
  const choose=useCallback((lvl:'N4'|'N5')=>{
    const words=content.vocab.filter(v=>v.level===lvl),byId=new Map(progress.map(p=>[p.word_id,p]));
    const dueWords=shuffle(words.filter(v=>byId.has(v.id)&&(byId.get(v.id)?.due_at||0)<=Date.now()));
    const newWords=shuffle(words.filter(v=>!byId.has(v.id)));
    return [...dueWords,...newWords].slice(0,20).map(v=>v.id);
  },[content,progress]);
  const start=()=>{setQueue(choose(level));setFlipped(false);setCompleted(0);setStarted(true)};
  const card=content.vocab.find(v=>v.id===queue[0]);
  const rate=async(q:1|3|4|5)=>{
    if(!card||busy)return;setBusy(true);
    try{await onRate(card.id,q);setQueue(x=>x.slice(1));setCompleted(x=>x+1);setFlipped(false)}
    catch(e){notify(`Không thể lưu lượt ôn: ${String(e)}`)}finally{setBusy(false)}
  };
  const dueCount=content.vocab.filter(v=>v.level===level).filter(v=>progress.some(p=>p.word_id===v.id&&p.due_at<=now)).length;
  return <><PageIntro label="SPACED REPETITION" title="Flashcards thông minh" description="Lật thẻ, tự đánh giá mức độ ghi nhớ và để thuật toán lên lịch ôn lại." icon={Layers3}/>
    <div className="flash-settings"><div className="segmented">{(['N4','N5'] as const).map(x=><button key={x} className={level===x?'active':''} onClick={()=>{setLevel(x);setStarted(false);setQueue([])}}>{x}</button>)}</div><div className="flash-status"><Clock3 size={17}/> {dueCount} thẻ đến hạn · Tối đa 20 thẻ/buổi</div></div>
    {!started?<div className="flash-welcome"><div className="flash-icon"><Layers3 size={34}/></div><h2>Sẵn sàng luyện trí nhớ?</h2><p>Ứng dụng ưu tiên những thẻ đến hạn ôn, sau đó mới đưa từ mới vào buổi học.</p><button className="btn btn-primary big" onClick={start}>Bắt đầu buổi học <Play size={17}/></button></div>:
      !card?<div className="flash-welcome"><div className="finished-icon"><CheckCircle2 size={40}/></div><h2>Hoàn thành buổi ôn! 🎉</h2><p>Bạn vừa ôn xong {completed} thẻ. Những từ khó sẽ xuất hiện lại sớm hơn.</p><button className="btn btn-primary" onClick={start}><RotateCcw size={17}/> Ôn thêm một lượt</button></div>:
      <div className="flash-stage"><div className="flash-progress"><span>THẺ {completed+1} / {completed+queue.length}</span><span>JLPT {level}</span></div><div className="linear-progress"><span style={{width:`${completed/(completed+queue.length)*100}%`}}/></div>
        <button className={`flash-card ${flipped?'is-flipped':''}`} onClick={()=>setFlipped(x=>!x)} aria-label="Lật flashcard">
          <span className="flash-corner">{flipped?'MẶT SAU · NGHĨA':'MẶT TRƯỚC · TIẾNG NHẬT'}</span>
          <div className="flash-center">{flipped?<><strong className="flash-answer">{vocabMeaning(card)}</strong><p>{card.word} · {card.reading}</p><small>Hãy tự đặt một câu tiếng Nhật với từ này.</small></>:<><strong className="flash-word">{card.word}</strong><p className="flash-kana">{card.reading}</p><span className="flash-hint">Bạn nhớ nghĩa của từ này không?</span></>}</div>
          <div className="flash-card-bottom"><span><RotateCcw size={15}/> Nhấn để lật thẻ</span><span>✿</span></div>
        </button>
        <div className="flash-actions">{!flipped?<button className="btn btn-primary reveal" onClick={()=>setFlipped(true)}>Hiện đáp án <ChevronRight size={18}/></button>:
          <><p>Bạn nhớ từ này tốt đến mức nào?</p><div className="rate-buttons"><button disabled={busy} className="rating again" onClick={()=>void rate(1)}><RotateCcw size={16}/> Quên <small>1 phút</small></button><button disabled={busy} className="rating hard" onClick={()=>void rate(3)}><Brain size={16}/> Khó <small>1 ngày</small></button><button disabled={busy} className="rating good" onClick={()=>void rate(4)}><Check size={16}/> Nhớ <small>Ôn sau</small></button><button disabled={busy} className="rating easy" onClick={()=>void rate(5)}><Zap size={16}/> Rất dễ <small>Ôn sau</small></button></div></>}
        </div></div>}
  </>;
}
function GrammarPage({grammar,onTest,notify}:{grammar:Grammar[];onTest:()=>void;notify:(s:string)=>void}){
  const [q,setQ]=useState('');const [selected,setSelected]=useState<Grammar|null>(null);const [level,setLevel]=useState<'N4'|'all'>('N4');
  const filtered=grammar.filter(g=>(level==='all'||g.level===level)&&searchable([g.pattern,g.reading||'',g.meaning,g.meaning_vi||'',g.formation_vi||''].join(' ')).includes(searchable(q)));
  return <><PageIntro label="GRAMMAR · 文法" title="Ngữ pháp dễ hiểu" description="Học cấu trúc, cách chia, ví dụ và mẹo phân biệt bằng tiếng Việt." icon={BookText}/>
    <div className="filter-bar"><div className="field-search"><Search size={18}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Tìm cấu trúc hoặc ý nghĩa..."/></div><div className="segmented"><button className={level==='N4'?'active':''} onClick={()=>setLevel('N4')}>N4</button><button className={level==='all'?'active':''} onClick={()=>setLevel('all')}>Tất cả</button></div><button className="btn btn-primary" onClick={onTest}>Kiểm tra ngữ pháp <ChevronRight size={16}/></button></div>
    <div className="result-row">{filtered.length} cấu trúc</div>
    <div className="grammar-list">{filtered.map((g,i)=><button className="grammar-row" key={g.id} onClick={()=>setSelected(g)}><div className="grammar-index">{String(i+1).padStart(2,'0')}</div><div className="grammar-row-info"><strong>{g.pattern}</strong><span>{grammarMeaning(g)}</span></div><span className="pill">{g.level}</span><ChevronRight size={19}/></button>)}</div>
    {!filtered.length&&<Empty title="Chưa tìm thấy mẫu câu" description="Hãy thử từ khóa khác."/>}
    {selected&&<Modal onClose={()=>setSelected(null)}><span className="pill">NGỮ PHÁP · {selected.level}</span><h2 className="grammar-modal-title">{selected.pattern}</h2><h3 className="purple-text">{grammarMeaning(selected)}</h3>
      <div className="explain-section"><span className="eyebrow">CẤU TRÚC</span><div className="formation-block">{selected.formation_vi||'Chưa có công thức bằng tiếng Việt'}</div></div>
      {selected.explain_vi&&<p className="modal-explain">{selected.explain_vi}</p>}
      <div className="explain-section"><span className="eyebrow">VÍ DỤ</span>{selected.examples?.slice(0,3).map((e,i)=><div className="example" key={i}><div className="example-ja"><Japanese text={e.furigana||e.ja}/><button className="icon-button" onClick={()=>speak(e.ja,notify)}><Volume2 size={17}/></button></div><p>{e.vi||'Chưa có bản dịch tiếng Việt cho câu ví dụ.'}</p></div>)}</div>
      {selected.notes_vi&&<div className="note-box"><Info size={18}/><span>{selected.notes_vi}</span></div>}
      <div className="modal-footer"><span>Nguồn: {selected.source||'OpenJLPT'} · Giải thích tự biên soạn khi có</span><button className="btn btn-primary" onClick={()=>setSelected(null)}>Đã hiểu</button></div></Modal>}
  </>;
}
function KanjiPage({kanji,vocab,manualVi,compounds,notify}:{kanji:Kanji[];vocab:Vocab[];manualVi:Record<string,string>;compounds:Record<string,CompoundEntry>;notify:(s:string)=>void}){
  const [q,setQ]=useState('');
  const [selected,setSelected]=useState<Kanji|null>(null);
  const [compound,setCompound]=useState<string|null>(null);
  const filtered=kanji.filter(k=>searchable([k.character,k.meaning_vi||'',...(k.meanings||[]),...(k.onyomi||[]),...(k.kunyomi||[])].join(' ')).includes(searchable(q)));
  const open=(k:Kanji)=>{setSelected(k);setCompound(null)};
  const examples=selected?[...new Set([...(selected.words||[]),...vocab.filter(w=>w.word!==selected.character&&w.word.includes(selected.character)).map(w=>w.word)])].slice(0,24):[];
  const entry=compound?vocab.find(v=>v.word===compound)||vocab.find(v=>v.reading===compound):undefined;
  const compoundEntry=compound?compounds[compound]:undefined;
  const gloss=entry?.meaning_vi||(compound?manualVi[compound]:undefined)||compoundEntry?.meaning_vi;
  return <><PageIntro label="KANJI · 漢字" title="Thư viện Kanji" description="Chạm vào từ ghép để xem cách đọc, nghĩa tiếng Việt và ví dụ." icon={WandSparkles}/>
    <div className="filter-bar"><div className="field-search"><Search size={18}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Tìm Kanji, cách đọc hoặc nghĩa..."/></div><span className="tiny-tag">{kanji.length} chữ Kanji</span></div>
    <div className="kanji-grid">{filtered.map(k=><button className="kanji-item" key={k.character} onClick={()=>open(k)}><strong>{k.character}</strong><span>{k.meaning_vi||manualVi[k.character]||'Chưa dịch'}</span><small>{k.onyomi?.[0]||'—'}</small></button>)}</div>
    {!filtered.length&&<Empty title="Không tìm thấy Kanji" description="Thử tìm theo âm đọc hoặc nghĩa."/>}
    {selected&&<Modal onClose={()=>{setSelected(null);setCompound(null)}}><span className="pill">KANJI · {selected.level}</span><div className="kanji-detail"><strong>{selected.character}</strong><div><span className="eyebrow">Ý NGHĨA</span><h2>{selected.meaning_vi||manualVi[selected.character]||'Chưa có nghĩa tiếng Việt'}</h2><p>{selected.strokes??'—'} nét</p><button className="btn btn-light" onClick={()=>speak(selected.character,notify)}><Volume2 size={16}/> Nghe phát âm</button></div></div>
      <div className="kanji-readings"><div><span className="eyebrow">ÂM ON (音読み)</span><strong>{selected.onyomi?.join('、')||'—'}</strong></div><div><span className="eyebrow">ÂM KUN (訓読み)</span><strong>{selected.kunyomi?.join('、')||'—'}</strong></div></div>
      {examples.length>0&&<div className="explain-section"><span className="eyebrow">TỪ CÓ CHỨA KANJI NÀY · BẤM VÀO TỪ ĐỂ TRA</span><div className="kanji-words">{examples.map(w=><button className={`compound-pill ${compound===w?'active':''}`} type="button" onClick={()=>setCompound(w)} key={w}>{w}<ChevronRight size={13}/></button>)}</div></div>}
      {compound&&<div className="compound-detail" aria-live="polite"><div className="compound-title"><div><span className="eyebrow">CHI TIẾT TỪ GHÉP</span><h3>{compound}</h3><p>{entry?.reading||compoundEntry?.reading||'Chưa có cách đọc trong kho N4/N5'}</p></div><button type="button" className="icon-button" title="Đọc từ ghép" onClick={()=>speak(entry?.word||compound,notify)}><Volume2 size={20}/></button></div>
        <strong>{gloss||'Chưa có nghĩa tiếng Việt cho từ này trong dữ liệu offline'}</strong>
        {!gloss&&<p className="subtle">Từ ghép này có trong danh sách ví dụ Kanji nhưng chưa có mục từ tương ứng. Có thể bổ sung qua kho từ điển Nhật–Việt.</p>}
        {entry?.examples?.[0]&&<div className="example"><Japanese text={entry.examples[0].furigana||entry.examples[0].ja}/>{entry.examples[0].vi&&<p>{entry.examples[0].vi}</p>}</div>}{!entry?.examples?.[0]&&compoundEntry?.example_ja&&<div className="example"><Japanese text={compoundEntry.example_ja}/>{compoundEntry.example_vi&&<p>{compoundEntry.example_vi}</p>}</div>}
      </div>}
      <p className="subtle">Kanji và từ ví dụ: OpenJLPT (CC BY-SA 4.0). Bản dịch chỉ hiển thị khi có dữ liệu tiếng Việt.</p></Modal>}
  </>;
}
function ReadingPage({readings,notify,onSave}:{readings:Reading[];notify:(s:string)=>void;onSave:(score:number,total:number)=>Promise<void>}){
  const [selected,setSelected]=useState(readings.find(x=>x.id.startsWith('n4-long-'))?.id||readings[0]?.id||'');const [answers,setAnswers]=useState<Record<number,number>>({});
  const [submitted,setSubmitted]=useState(false);
  const r=readings.find(x=>x.id===selected)||readings[0];
  const choose=(id:string)=>{setSelected(id);setAnswers({});setSubmitted(false)};
  if(!r)return <Empty title="Chưa có bài đọc" description="Hãy thêm nội dung trong public/content/readings.json"/>;
  const score=r.questions.filter((q,i)=>answers[i]===q.answer).length;
  return <><PageIntro label="READING · 読解" title="Đọc hiểu từng ngày" description="Đọc văn bản tiếng Nhật, tự chọn đáp án và xem giải thích." icon={BookOpen}/>
    <div className="reading-layout"><div className="reading-sidebar"><h3>Danh sách bài đọc</h3>{[...readings].sort((a,b)=>b.text.length-a.text.length).map((a,i)=><button key={a.id} className={a.id===r.id?'active':''} onClick={()=>choose(a.id)}><span>{String(i+1).padStart(2,'0')}</span><div><strong>{a.title}</strong><small>{a.category} · {a.text.length} ký tự</small></div><ChevronRight size={16}/></button>)}</div>
      <div className="reading-main"><div className="reading-paper"><div className="paper-top"><span>読解 · JLPT N4 · {r.text.length} chữ</span><button title="Đọc tiếng Nhật" className="icon-button" onClick={()=>speak(r.text,notify)}><Volume2 size={20}/></button></div><div className="paper-category">{r.category}</div><p className="japanese-paragraph">{r.text}</p><div className="paper-foot">✿　落ち着いて、ゆっくり読もう。</div></div>
      <div className="reading-questions"><div className="reading-question-header"><h3>Câu hỏi đọc hiểu</h3><span>{Object.keys(answers).length}/{r.questions.length} đã trả lời</span></div>
        {r.questions.map((q,i)=><div className="reading-question" key={i}><strong>Câu {i+1}. {q.question}</strong><div className="answer-grid">{q.options.map((option,j)=><button key={j} disabled={submitted} className={`answer-option ${answers[i]===j?'picked':''} ${submitted&&q.answer===j?'correct':''} ${submitted&&answers[i]===j&&j!==q.answer?'incorrect':''}`} onClick={()=>setAnswers(x=>({...x,[i]:j}))}><span>{String.fromCharCode(65+j)}</span>{option}</button>)}</div>{submitted&&<div className="explanation"><CheckCircle2 size={16}/>{q.explanation_vi}</div>}</div>)}
        {submitted?<div className="reading-score"><Trophy size={23}/><strong>Đúng {score}/{r.questions.length} câu</strong><button className="btn btn-light" onClick={()=>choose(r.id)}>Làm lại <RotateCcw size={16}/></button></div>:<button className="btn btn-primary" disabled={Object.keys(answers).length<r.questions.length} onClick={()=>{setSubmitted(true);void onSave(score,r.questions.length)}}>Nộp bài đọc hiểu <Check size={16}/></button>}
      </div></div></div>
  </>;
}
function ExamHome({content,onStart,quizzes,onPast}:{content:Content;onStart:(m:ExamMode)=>void;quizzes:QuizResult[];onPast:()=>void}){
  const tests=[{mode:'mock' as const,icon:GraduationCap,title:'Đề mô phỏng JLPT N4 · 3 phần',desc:'Từ vựng 25′ · Ngữ pháp & đọc 55′ · Nghe 35′',details:'Câu hỏi tự biên soạn · 115 phút nếu dùng hết giờ',tone:'green'},
    {mode:'quick' as const,icon:Zap,title:'Kiểm tra nhanh',desc:'10 câu hỗn hợp · không giới hạn giờ',details:'Từ vựng + ngữ pháp',tone:'purple'},
    {mode:'grammar' as const,icon:BookText,title:'Bài kiểm tra ngữ pháp',desc:'10 câu chọn ý nghĩa mẫu câu',details:'Chuyên đề ngữ pháp',tone:'orange'},
    {mode:'reading' as const,icon:BookOpen,title:'Bài kiểm tra đọc hiểu',desc:'10 câu hỏi từ bài đọc',details:'Luyện đọc và hiểu ý',tone:'blue'}];
  return <><PageIntro label="PRACTICE · 模擬試験" title="Luyện đề JLPT N4" description="Luyện 3 phần theo khung thời gian N4, xem đáp án và giải thích sau khi nộp bài." icon={GraduationCap}/>
    <div className="exam-note"><Info size={19}/><p><b>Đây là đề mô phỏng tự biên soạn, không phải đề JLPT chính thức.</b> Có 3 phần và thời gian 25 / 55 / 35 phút theo khung N4, nhưng số câu, phân bố dạng bài và thang điểm chưa được chuẩn hóa. Phần nghe dùng giọng TTS tiếng Nhật sẵn có trên Windows; muốn thi thử với audio gốc hãy mở <a target="_blank" rel="noreferrer" href="https://www.jlpt.jp/e/samples/sampleindex.html">đề mẫu chính thức tại JLPT</a>.</p></div>
    <div className="past-home-banner"><div><strong>Muốn giải đề theo kỳ thi?</strong><p>Chọn bộ tài liệu năm 2025, làm toàn bộ các câu đã nhập và xem lời giải chi tiết từng câu sai.</p></div><button className="btn btn-primary" type="button" onClick={onPast}>Giải đề theo năm <ChevronRight size={17}/></button></div>
    <div className="exam-structure"><div><strong>01 · 文字・語彙</strong><span>25 phút · chữ Hán, cách đọc, từ trong ngữ cảnh</span></div><div><strong>02 · 文法・読解</strong><span>55 phút · ngữ pháp, bài đọc dài</span></div><div><strong>03 · 聴解</strong><span>35 phút · nghe hội thoại tự biên soạn</span></div></div>
    <div className="exam-grid">{tests.map(t=><div key={t.mode} className="exam-card"><div className={`course-icon tone-${t.tone}`}><I icon={t.icon} size={27}/></div><h3>{t.title}</h3><p>{t.desc}</p><div className="exam-card-sub"><ShieldCheck size={16}/>{t.details}</div><button className="btn btn-primary" onClick={()=>onStart(t.mode)}>Làm bài <ChevronRight size={17}/></button></div>)}</div>
    <div className="card exam-history"><SectionTitle title="Lịch sử làm bài" eyebrow="GẦN ĐÂY"/>{quizzes.length?quizzes.slice(0,7).map((q,i)=><div className="history-row" key={`${q.created_at}-${i}`}><span className="history-icon"><CheckCircle2 size={17}/></span><span>{({quick:'Kiểm tra nhanh',grammar:'Ngữ pháp',reading:'Đọc hiểu',mock:'Đề mô phỏng 3 phần'})[q.mode]||q.mode}</span><strong>{q.score}/{q.total}</strong><small>{new Date(q.created_at).toLocaleDateString('vi-VN')}</small></div>):<p className="subtle">Chưa có bài kiểm tra nào.</p>}</div>
    <p className="dashboard-footnote">Kho học: {content.vocab.length} từ · {content.grammar.length} ngữ pháp · {content.readings.length} bài đọc · {content.examBank.listening.length} hội thoại luyện nghe.</p>
  </>;
}
function ExamPanel({exam,setExam,timeLeft,onFinish,onRestart,notify}:{exam:Exam;setExam:(x:Exam)=>void;timeLeft:number|null;onFinish:()=>void;onRestart:()=>void;notify:(s:string)=>void}){
  const inSection=(i:number)=>exam.mode!=='mock'||exam.questions[i]?.section===phaseOrder[exam.phaseIndex];
  const visibleIds=exam.questions.map((_,i)=>i).filter(inSection);
  const q=exam.questions[exam.index];
  const answered=visibleIds.filter(i=>exam.answers[i]!==undefined).length;
  const score=exam.questions.filter((item,i)=>exam.answers[i]===item.answer).length;
  const sectionTitle=exam.mode==='mock'?phaseNames[exam.phaseIndex]:({quick:'Kiểm tra nhanh',grammar:'Kiểm tra ngữ pháp',reading:'Đọc hiểu',mock:'Đề mô phỏng N4'})[exam.mode];
  const idxInSection=visibleIds.indexOf(exam.index);
  if(exam.finished)return <div className="exam-finished"><div className="finished-icon"><Trophy size={43}/></div><h1>Hoàn thành bài luyện! ✨</h1><div className="score-huge">{score}<small>/{exam.questions.length}</small></div><p>Đúng {Math.round(score/exam.questions.length*100)}% câu hỏi trong bài luyện tự biên soạn; <b>không phải điểm JLPT quy đổi</b>.</p>
    {exam.mode==='mock'&&<div className="exam-section-results">{phaseOrder.map((stage,i)=>{const qs=exam.questions.map((x,j)=>({x,j})).filter(z=>z.x.section===stage);return <div key={stage}><strong>{phaseNames[i]}</strong><span>{qs.filter(z=>exam.answers[z.j]===z.x.answer).length}/{qs.length} đúng</span></div>})}</div>}
    <div className="exam-review">{exam.questions.map((x,i)=><div key={x.id+i} className="review-result"><span className={exam.answers[i]===x.answer?'result-right':'result-wrong'}>{exam.answers[i]===x.answer?<Check size={17}/>:<X size={17}/>}</span><div><strong>Câu {i+1}. {x.prompt}</strong><p>Đáp án: {x.options[x.answer]}</p><small>{x.explanation}</small>{x.audioScript&&<details className="script-review"><summary>Xem lời thoại bài nghe</summary><p>{x.audioScript}</p></details>}</div></div>)}</div><button className="btn btn-primary" onClick={onRestart}><RotateCcw size={17}/> Chọn bài kiểm tra khác</button></div>;
  if(!q)return <Empty title="Không có câu hỏi" description="Hãy tạo một bài kiểm tra mới."/>;
  const isListening=q.type==='listening';
  const playListening=()=>{if(q.audioScript)speak(q.audioScript.replace(/^(?:男|女)[:：]/gm,''),notify)};
  return <div className="active-exam"><div className="exam-topline"><div><span className="eyebrow">{exam.mode==='mock'?`PHẦN ${exam.phaseIndex+1} / 3 · ĐỀ MÔ PHỎNG`: 'BÀI LUYỆN ĐANG DIỄN RA'}</span><h1>{sectionTitle}</h1></div><div className="exam-time"><Clock3 size={18}/>{timeLeft!==null?formatTime(timeLeft):'Không giới hạn'}</div></div>
    {exam.mode==='mock'&&<div className="phase-tracker">{phaseNames.map((x,i)=><div key={i} className={i===exam.phaseIndex?'active':i<exam.phaseIndex?'done':''}><span>{i+1}</span>{x}</div>)}</div>}
    <div className="exam-steps"><div className="linear-progress"><span style={{width:`${visibleIds.length?answered/visibleIds.length*100:0}%`}}/></div><span>{answered}/{visibleIds.length} câu trả lời của phần này</span></div>
    <div className="question-card"><div className="question-overline"><span>CÂU {Math.max(0,idxInSection)+1}/{visibleIds.length}</span><span>{q.task|| (q.type==='word'?'TỪ VỰNG':q.type==='grammar'?'NGỮ PHÁP':q.type==='listening'?'NGHE HIỂU':'ĐỌC HIỂU')}</span></div>
      {q.type==='reading'&&q.sub&&<div className="exam-reading-text">{q.sub}</div>}
      {isListening&&<div className="listen-practice"><div className="listen-icon"><Volume2 size={28}/></div><strong>Nghe hội thoại tiếng Nhật</strong><p>Nhấn để phát lời thoại bằng giọng Nhật có sẵn trên máy. Nếu chưa có giọng Nhật, hãy cài trong Windows Settings → Language & region.</p><button type="button" className="btn btn-primary" onClick={playListening}><Volume2 size={18}/> Phát hội thoại</button><details><summary>Không có giọng Nhật? Xem transcript để luyện thay thế</summary><p>{q.audioScript}</p></details></div>}
      <h2 className={q.type==='reading'||isListening?'':'question-jp'}>{q.prompt}</h2>{q.type==='word'&&q.sub&&<p className="subtle">{q.sub}</p>}
      <div className="exam-answers">{q.options.map((opt,i)=><button className={exam.answers[exam.index]===i?'picked':''} key={i} onClick={()=>setExam({...exam,answers:{...exam.answers,[exam.index]:i}})}><span>{String.fromCharCode(65+i)}</span>{opt}<span className="answer-end">{exam.answers[exam.index]===i?<Check size={17}/>:null}</span></button>)}</div>
    </div><div className="exam-controls"><button className="btn btn-light" disabled={idxInSection<=0} onClick={()=>setExam({...exam,index:visibleIds[idxInSection-1]})}><ChevronLeft size={17}/> Câu trước</button><button className="btn btn-light" onClick={onRestart}>Thoát bài</button>{idxInSection>=visibleIds.length-1?<button className="btn btn-primary" onClick={onFinish}>{exam.mode==='mock'&&exam.phaseIndex<2?'Nộp phần & tiếp tục':'Nộp bài'} <Check size={17}/></button>:<button className="btn btn-primary" onClick={()=>setExam({...exam,index:visibleIds[idxInSection+1]})}>Câu tiếp <ChevronRight size={17}/></button>}</div>
    <div className="exam-dots">{visibleIds.map((i,j)=><button title={`Câu ${j+1}`} className={`${exam.index===i?'current':''} ${exam.answers[i]!==undefined?'answered':''}`} key={i} onClick={()=>setExam({...exam,index:i})}>{j+1}</button>)}</div>
    {exam.mode==='mock'&&<p className="subtle mock-warning">Có thể chuyển phần sớm khi hoàn thành. Khi hết giờ, app tự chuyển sang phần tiếp theo; các phần trước sẽ không thể quay lại. Điểm chỉ phản ánh số câu đúng của bài luyện, không phải điểm thi JLPT chính thức.</p>}
  </div>;
}
function Stats({content,progress,quizzes,logs,streak,goal}:{content:Content;progress:WordProgress[];quizzes:QuizResult[];logs:ReviewLog[];streak:number;goal:number}){
  const today=localDayStart();const days=[...Array(7)].map((_,i)=>{const d=new Date(today);d.setDate(d.getDate()-(6-i));const count=logs.filter(l=>dateKey(l.created_at)===dateKey(d.getTime())).length;return {label:new Intl.DateTimeFormat('vi-VN',{weekday:'short'}).format(d),count,date:d}});
  const max=Math.max(goal,...days.map(d=>d.count),1);
  const correct=logs.filter(l=>l.quality>=3).length;
  const total=logs.length;
  const best=quizzes.length?Math.max(...quizzes.filter(q=>q.total>0).map(q=>q.score/q.total*100)):0;
  return <><PageIntro label="ANALYTICS · 進歩" title="Nhìn lại hành trình" description="Các con số nhỏ ghi lại nỗ lực học tiếng Nhật của bạn." icon={TrendingUp}/>
    <div className="metrics-grid"><Metric icon={BookOpen} tone="purple" label="Đã học ít nhất 1 lần" value={String(progress.length)} detail={`/${content.vocab.length} từ`}/><Metric icon={CheckCircle2} tone="green" label="Tỷ lệ lượt nhớ" value={`${total?Math.round(correct/total*100):0}%`} detail={`${correct}/${total} lượt trả lời đúng`}/><Metric icon={Flame} tone="orange" label="Chuỗi ngày liên tiếp" value={`${streak} ngày`} detail="Duy trì thói quen"/><Metric icon={Trophy} tone="blue" label="Điểm cao nhất" value={`${Math.round(best)}%`} detail="Trong các lần làm bài"/></div>
    <div className="stats-grid"><div className="card weekly-card"><SectionTitle eyebrow="7 NGÀY QUA" title="Hoạt động ôn tập"/><div className="bar-chart">{days.map((d,i)=><div className="chart-column" key={i}><strong>{d.count||''}</strong><div className="chart-bar-bg"><div className="chart-bar" style={{height:`${Math.max(d.count?7:0,d.count/max*100)}%`}}/></div><span>{d.label}</span></div>)}</div><p className="subtle">Mỗi lượt đánh giá flashcard được tính là một lần ôn. Mục tiêu: {goal} lượt/ngày.</p></div>
      <div className="card overview-stats"><SectionTitle eyebrow="TỔNG QUAN" title="Mức độ ghi nhớ"/><div className="stats-row"><span>Đã trả lời đúng ít nhất 1 lần</span><strong>{progress.filter(x=>x.correct_count>0).length}</strong></div><div className="stats-row"><span>Đã đến hạn ôn</span><strong>{progress.filter(x=>x.due_at<=Date.now()).length}</strong></div><div className="stats-row"><span>Từ chưa từng học</span><strong>{Math.max(0,content.vocab.length-progress.length)}</strong></div><div className="stats-row"><span>Lượt ôn tập</span><strong>{total}</strong></div><div className="stats-row"><span>Bài kiểm tra đã làm</span><strong>{quizzes.length}</strong></div><div className="stats-row"><span>Điểm kiểm tra trung bình</span><strong>{quizzes.length?Math.round(quizzes.reduce((a,b)=>a+(b.total?b.score/b.total:0),0)/quizzes.length*100):0}%</strong></div></div></div>
    <div className="card exam-history"><SectionTitle title="Lịch sử kiểm tra"/>{quizzes.length?quizzes.slice(0,15).map((q,i)=><div className="history-row" key={i}><span className="history-icon"><GraduationCap size={18}/></span><span>{q.mode}</span><strong>{q.score} / {q.total} ({Math.round(q.score/q.total*100)}%)</strong><small>{new Date(q.created_at).toLocaleString('vi-VN')}</small></div>):<p className="subtle">Chưa có lịch sử kiểm tra.</p>}</div>
  </>;
}
function Settings({content,goal,setGoal,dark,setDark,notify,onImport}:{content:Content;goal:number;setGoal:(n:number)=>Promise<void>;dark:boolean;setDark:(b:boolean)=>Promise<void>;notify:(s:string)=>void;onImport:()=>Promise<void>}){
  const [backupText,setBackupText]=useState('');const [showBackup,setShowBackup]=useState(false);
  const copyBackup=async()=>{try{const text=await exportBackup();setBackupText(text);setShowBackup(true);await navigator.clipboard.writeText(text);notify('Đã sao chép dữ liệu sao lưu vào clipboard.')}catch{notify('Đã hiển thị sao lưu; hãy sao chép nội dung trong ô.');setShowBackup(true)}};
  const doImport=async()=>{if(!backupText.trim()){notify('Hãy dán nội dung sao lưu trước.');return}try{await importBackup(backupText);await onImport();notify('Đã nhập dữ liệu sao lưu!')}catch(e){notify(`Không thể nhập: ${String(e)}`)}};
  return <><PageIntro label="PREFERENCES" title="Cài đặt ứng dụng" description="Tùy chỉnh mục tiêu, giao diện và quản lý dữ liệu học của bạn." icon={Settings2}/>
    <div className="settings-grid"><div className="card setting-card"><div className="setting-head"><div className="setting-icon"><Target size={23}/></div><div><h3>Mục tiêu học mỗi ngày</h3><p>Số lượt đánh giá flashcard bạn muốn thực hiện</p></div></div><div className="goal-picker">{[10,20,30,50].map(n=><button key={n} className={goal===n?'active':''} onClick={()=>void setGoal(n)}>{n} lượt</button>)}</div></div>
      <div className="card setting-card"><div className="setting-head"><div className="setting-icon"><Moon size={23}/></div><div><h3>Giao diện</h3><p>Chọn chủ đề phù hợp với môi trường học</p></div></div><div className="goal-picker"><button className={!dark?'active':''} onClick={()=>void setDark(false)}><Sun size={17}/> Sáng</button><button className={dark?'active':''} onClick={()=>void setDark(true)}><Moon size={17}/> Tối</button></div></div>
    </div>
    <div className="card setting-card full"><div className="setting-head"><div className="setting-icon"><Download size={23}/></div><div><h3>Sao lưu và khôi phục</h3><p>Xuất/nhập JSON gồm tiến độ học, điểm kiểm tra và cài đặt. Không cần mạng.</p></div></div><div className="setting-actions"><button className="btn btn-primary" onClick={()=>void copyBackup()}><Download size={16}/> Xuất JSON để sao chép</button><button className="btn btn-light" onClick={()=>setShowBackup(v=>!v)}>{showBackup?'Ẩn ô nhập':'Nhập dữ liệu sao lưu'}</button></div>
      {showBackup&&<div className="backup-panel"><label htmlFor="backup">Dán hoặc sao chép nội dung JSON vào ô này</label><textarea id="backup" rows={7} value={backupText} onChange={e=>setBackupText(e.target.value)} placeholder="{ ... dữ liệu sao lưu ... }"/><button className="btn btn-primary" onClick={()=>void doImport()}>Khôi phục / Gộp dữ liệu <Check size={16}/></button><p className="subtle">Nhập sẽ gộp bảng từ vựng và thêm lượt ôn, bài kiểm tra. Hãy giữ bản sao dự phòng trước khi nhập.</p></div>}
    </div>
    <div className="card setting-card full"><div className="setting-head"><div className="setting-icon"><Info size={23}/></div><div><h3>Thông tin và nguồn tài liệu</h3><p>Phiên bản 0.2.0 · {storageMode==='sqlite'?'Tauri + SQLite':'React web preview (localStorage)'} · chạy offline</p></div></div>
      <div className="about-grid"><div><span>Gói nội dung</span><strong>{content.manifest.corpus==='full'?'OpenJLPT đầy đủ':'Starter offline'}</strong></div><div><span>Từ vựng</span><strong>{content.vocab.length}</strong></div><div><span>Ngữ pháp</span><strong>{content.grammar.length}</strong></div><div><span>Kanji</span><strong>{content.kanji.length}</strong></div></div>
      <p className="settings-license"><b>Đã có nghĩa tiếng Việt cho {content.vocab.filter(v=>v.meaning_vi?.trim()).length}/{content.vocab.length} từ.</b> Những từ còn thiếu được đánh dấu trong giao diện. Có thể dùng <code>npm run sync:vi</code> để thử bổ sung từ điển Nhật–Việt CC BY-SA.</p><p className="settings-license">Dữ liệu chuyển thể từ <a href="https://github.com/evanclan/OpenJLPT" target="_blank" rel="noreferrer">OpenJLPT</a> được chia sẻ theo <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a>. Dữ liệu JMdict có điều kiện ghi công EDRDG, ví dụ Tatoeba cần ghi công theo ID. Xem DATA-LICENSE.md. Các bản danh sách theo cấp độ chỉ là tham khảo, không phải danh sách JLPT chính thức.</p>
      <p className="subtle">Giọng đọc dựa trên giọng tiếng Nhật cài sẵn trên Windows; không gửi văn bản lên máy chủ từ ứng dụng.</p>
    </div>
  </>;
}
function PageIntro({label,title,description,icon:Icon}:{label:string;title:string;description:string;icon:LucideIcon}){
  return <div className="page-intro"><div><span className="eyebrow">{label}</span><h1>{title}</h1><p>{description}</p></div><div className="intro-icon"><Icon size={30}/></div></div>;
}
function Empty({title,description}:{title:string;description:string}){return <div className="empty"><Search size={28}/><h3>{title}</h3><p>{description}</p></div>}
function Modal({onClose,children}:{onClose:()=>void;children:ReactNode}){
  useEffect(()=>{const handler=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler)},[onClose]);
  return <div className="modal-overlay" onMouseDown={onClose}><div className="modal-card" role="dialog" aria-modal="true" onMouseDown={e=>e.stopPropagation()}><button className="modal-close icon-button" title="Đóng" onClick={onClose}><X size={21}/></button>{children}</div></div>;
}
