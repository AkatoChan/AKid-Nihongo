import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock3, FileText, RefreshCw, RotateCcw, Shuffle, Target, Trophy, X, XCircle } from 'lucide-react';
import type { PastPaper, Question } from '../lib/types';

type Session = {
  paperId: string;
  questionIds: string[];
  answers: Record<string, number>;
  index: number;
  startedAt: number;
  submittedAt?: number;
  retry: boolean;
};
type ReviewFilter = 'all' | 'wrong' | 'skipped' | 'correct';

const letters = ['A', 'B', 'C', 'D'];
const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
};
const sectionLabels: Record<string, string> = {
  vocabulary: '文字・語彙 · Từ vựng',
  language: '文法・読解 · Ngữ pháp & đọc hiểu',
  listening: '聴解 · Nghe hiểu',
};
const countBy = (items: Question[], section: string) => items.filter(q => q.section === section).length;

export default function PastPapers({
  papers, onSave, notify
}: {
  papers: PastPaper[];
  onSave: (mode: string, score: number, total: number, duration: number) => Promise<void>;
  notify: (message: string) => void;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [clock, setClock] = useState(Date.now());
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('all');
  const [showOnlyUnanswered, setShowOnlyUnanswered] = useState(false);
  const paper = papers.find(p => p.id === session?.paperId);
  const questions = useMemo(() => {
    if (!session || !paper) return [];
    const indexed = new Map(paper.questions.map(q => [q.id, q]));
    return session.questionIds.map(id => indexed.get(id)).filter((q): q is Question => !!q);
  }, [paper, session?.questionIds]);
  const done = !!session?.submittedAt;
  const elapsed = session ? Math.max(0, Math.floor(((session.submittedAt ?? clock) - session.startedAt) / 1000)) : 0;
  const answered = questions.filter(q => session?.answers[q.id] !== undefined).length;
  const correct = questions.filter(q => session?.answers[q.id] === q.answer).length;
  const wrong = questions.filter(q => session?.answers[q.id] !== undefined && session.answers[q.id] !== q.answer).length;
  const skipped = questions.length - answered;

  useEffect(() => {
    if (!session || session.submittedAt) return;
    setClock(Date.now());
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [session?.startedAt, session?.submittedAt]);

  const start = (selected: PastPaper, ids?: string[], retry = false) => {
    if (!selected.questions.length) return;
    setSession({
      paperId: selected.id,
      questionIds: ids ?? selected.questions.map(q => q.id),
      answers: {},
      index: 0,
      startedAt: Date.now(),
      retry,
    });
    setClock(Date.now());
    setReviewFilter('all');
    setShowOnlyUnanswered(false);
  };
  const startRandom = () => {
    const available = papers.filter(p => p.questions.length > 0);
    if (!available.length) return;
    start(available[Math.floor(Math.random() * available.length)]);
  };
  const chooseAnswer = (option: number) => {
    if (!session || done || !questions[session.index]) return;
    setSession({
      ...session,
      answers: { ...session.answers, [questions[session.index].id]: option }
    });
  };
  const submit = () => {
    if (!session || !paper || done) return;
    if (skipped > 0 && !window.confirm('Bạn còn ' + skipped + ' câu chưa trả lời. Vẫn nộp bài?')) return;
    const finished = { ...session, submittedAt: Date.now() };
    setSession(finished);
    const score = questions.filter(q => session.answers[q.id] === q.answer).length;
    const duration = Math.floor((finished.submittedAt - session.startedAt) / 1000);
    void onSave(session.retry ? 'past-retry:' + paper.id : 'past:' + paper.id, score, questions.length, duration)
      .catch(() => notify('Chưa lưu được kết quả vào lịch sử; bạn vẫn có thể xem lời giải ở màn hình này.'));
  };
  const retryWrong = () => {
    if (!paper || !session) return;
    const ids = questions.filter(q => session.answers[q.id] !== q.answer).map(q => q.id);
    if (ids.length) start(paper, ids, true);
  };
  const goHome = () => {
    if (session && !done && answered > 0 && !window.confirm('Thoát bài? Các đáp án chưa nộp sẽ không được lưu.')) return;
    setSession(null);
  };

  if (!session || !paper) {
    return <section className="past-page">
      <div className="past-hero">
        <div className="past-hero-title"><span className="past-eyebrow">JLPT N4 · 過去問</span><h1>Giải đề theo năm</h1>
          <p>Chọn tài liệu theo kỳ hoặc để ứng dụng chọn ngẫu nhiên một đề. Sau khi nộp, bạn có thể xem đáp án, phân tích lỗi và làm lại câu sai.</p>
        </div>
        <button className="btn btn-primary past-random" type="button" disabled={!papers.some(p => p.questions.length)} onClick={startRandom}><Shuffle size={18}/> Chọn đề ngẫu nhiên</button>
      </div>
      <div className="past-warning"><FileText size={19}/><p><b>Lưu ý về nguồn:</b> Các bộ đề bên dưới là bản trích từ tài liệu Word được chia sẻ, chưa được xác thực là đề JLPT chính thức. Có câu bị lỗi hoặc thiếu khi xuất văn bản nên đã được loại khỏi kho. Chưa có phần nghe và không quy đổi sang điểm JLPT chuẩn.</p></div>
      {!papers.length ? <div className="past-empty">Chưa có đề theo năm. Hãy thêm file dữ liệu vào kho offline.</div> :
        <div className="past-paper-grid">{[...papers].sort((a, b) => b.year - a.year || Number(b.session) - Number(a.session)).map(p =>
          <article className="past-paper-card" key={p.id}>
            <div className="past-paper-head"><div className="past-paper-year">{p.year}</div><span className="past-status">{p.status === 'partial' ? 'Bản trích · chưa đầy đủ' : 'Đủ các phần'}</span></div>
            <h2>{p.title}</h2>
            <div className="past-counts"><span><BookOpen size={15}/>{countBy(p.questions, 'vocabulary')} từ vựng</span><span><FileText size={15}/>{p.questions.filter(q => q.type === 'grammar').length} ngữ pháp</span><span><Target size={15}/>{p.questions.filter(q => q.type === 'reading').length} đọc hiểu</span></div>
            <p>{p.sourceNote}</p>
            <div className="past-paper-foot"><span>{p.questions.length} câu · Không giới hạn giờ</span><button className="btn btn-primary" type="button" onClick={() => start(p)}>Giải đề <ChevronRight size={17}/></button></div>
          </article>
        )}</div>}
    </section>;
  }

  const q = questions[session.index];
  if (!q) return <div className="past-empty"><button className="btn btn-light" onClick={goHome}>Trở lại danh sách</button></div>;
  const available = questions.map((item, i) => ({ item, i }))
    .filter(({ item }) => !showOnlyUnanswered || session.answers[item.id] === undefined);
  const reviewed = questions.filter(item => reviewFilter === 'all' ||
    reviewFilter === 'correct' && session.answers[item.id] === item.answer ||
    reviewFilter === 'skipped' && session.answers[item.id] === undefined ||
    reviewFilter === 'wrong' && session.answers[item.id] !== undefined && session.answers[item.id] !== item.answer);

  if (done) {
    return <section className="past-page">
      <div className="past-result-hero">
        <div className="past-result-icon"><Trophy size={32}/></div>
        <div><span className="past-eyebrow">ĐÃ NỘP BÀI · 答え合わせ</span><h1>{session.retry ? 'Kết quả ôn lại câu sai' : 'Kết quả giải đề'}</h1><p>{paper.title} · {formatDuration(elapsed)}</p></div>
        <div className="past-result-score"><strong>{correct}/{questions.length}</strong><span>{Math.round(correct / questions.length * 100)}% đúng</span></div>
      </div>
      <div className="past-stats">
        <div><CheckCircle2 size={18}/><strong>{correct}</strong><span>Đúng</span></div>
        <div><XCircle size={18}/><strong>{wrong}</strong><span>Sai</span></div>
        <div><FileText size={18}/><strong>{skipped}</strong><span>Bỏ trống</span></div>
        <div><Clock3 size={18}/><strong>{formatDuration(elapsed)}</strong><span>Thời gian</span></div>
      </div>
      <div className="past-review-toolbar">
        <div><h2>Chữa bài chi tiết</h2><p>Đối chiếu đáp án bạn chọn, đáp án đúng và giải thích tiếng Việt.</p></div>
        <div className="past-filters">
          {([['all','Tất cả'],['wrong','Câu sai'],['skipped','Bỏ trống'],['correct','Câu đúng']] as const).map(([value,label]) =>
            <button key={value} type="button" className={reviewFilter === value ? 'active' : ''} onClick={() => setReviewFilter(value)}>{label}</button>)}
        </div>
      </div>
      <div className="past-review-list">{reviewed.length ? reviewed.map((item) => {
        const idx = questions.indexOf(item);
        const selected = session.answers[item.id];
        const right = selected === item.answer;
        return <details className={'past-review-item ' + (right ? 'is-correct' : 'is-wrong')} key={item.id} open={!right || undefined}>
          <summary><span className="past-review-mark">{right ? <Check size={17}/> : <X size={17}/>}</span><div><b>Câu {idx + 1}. {item.prompt}</b><small>{item.task ?? sectionLabels[item.section ?? '']}</small></div><ChevronRight className="past-disclosure" size={19}/></summary>
          <div className="past-review-body">
            {item.type === 'reading' && item.sub && <div className="past-reading-passage">{item.sub}</div>}
            <div className="past-review-answers">{item.options.map((option, i) => <div key={i} className={'past-option ' + (i === item.answer ? 'is-correct' : selected === i ? 'is-wrong' : '')}><span>{letters[i]}</span><p>{option}</p>{i === item.answer ? <em>Đáp án đúng</em> : selected === i ? <em>Bạn đã chọn</em> : null}</div>)}</div>
            <div className="past-why"><strong>Giải thích</strong><p>{item.explanation}</p><small>Bạn chọn: {selected === undefined ? 'Bỏ trống' : letters[selected] + ' · ' + item.options[selected]} · Đáp án: {letters[item.answer]} · {item.options[item.answer]}</small></div>
          </div>
        </details>;
      }) : <p className="past-empty">Không có câu hỏi nào trong bộ lọc này.</p>}</div>
      <div className="past-result-actions"><button className="btn btn-light" onClick={goHome}><ChevronLeft size={17}/> Chọn đề khác</button>
        <button className="btn btn-light" onClick={() => start(paper)}><RefreshCw size={17}/> Làm lại toàn bộ</button>
        <button className="btn btn-primary" disabled={correct === questions.length} onClick={retryWrong}><RotateCcw size={17}/> Làm lại {questions.length - correct} câu sai/bỏ trống</button>
      </div>
      <p className="past-disclaimer">Điểm trên chỉ là tỷ lệ câu trả lời đúng trong bản trích một phần, không phải kết quả thi JLPT.</p>
    </section>;
  }

  return <section className="past-page">
    <div className="past-solving-top"><div><span className="past-eyebrow">ĐANG GIẢI ĐỀ · {session.retry ? 'ÔN CÂU SAI' : 'THEO NĂM'}</span><h1>{paper.title}</h1><p>{answered}/{questions.length} câu đã trả lời</p></div>
      <div className="past-solving-clock"><Clock3 size={18}/>{formatDuration(elapsed)}</div>
    </div>
    <div className="past-progress"><span style={{ width: (answered / questions.length * 100) + '%' }}/></div>
    <div className="past-work-layout">
      <div className="past-work-main">
        <div className="past-question-panel">
          <div className="past-question-meta"><span>CÂU {session.index + 1}/{questions.length}</span><span>{sectionLabels[q.section ?? ''] ?? 'JLPT N4'} · {q.task ?? ''}</span></div>
          {q.type === 'reading' && q.sub && <div className="past-reading-passage">{q.sub}</div>}
          <h2>{q.prompt}</h2>
          <div className="past-options">{q.options.map((option, i) =>
            <button type="button" key={i} className={session.answers[q.id] === i ? 'selected' : ''} aria-pressed={session.answers[q.id] === i} onClick={() => chooseAnswer(i)}><span>{letters[i]}</span><p>{option}</p>{session.answers[q.id] === i && <Check size={18}/>}</button>)}</div>
        </div>
        <div className="past-work-actions">
          <button type="button" className="btn btn-light" disabled={session.index === 0} onClick={() => setSession({ ...session, index: session.index - 1 })}><ChevronLeft size={17}/> Trước</button>
          <button type="button" className="btn btn-light" onClick={goHome}>Thoát</button>
          {session.index + 1 < questions.length ?
            <button className="btn btn-primary" onClick={() => setSession({ ...session, index: session.index + 1 })}>Câu tiếp <ChevronRight size={17}/></button> :
            <button className="btn btn-primary" onClick={submit}>Nộp bài <Check size={17}/></button>}
        </div>
      </div>
      <aside className="past-work-sidebar">
        <div className="past-sidebar-header"><h3>Phiếu trả lời</h3><span>{answered}/{questions.length}</span></div>
        <label className="past-unanswered-toggle"><input type="checkbox" checked={showOnlyUnanswered} onChange={e => setShowOnlyUnanswered(e.target.checked)}/> Chỉ xem câu chưa làm</label>
        <div className="past-number-grid">{available.map(({item,i}) =>
          <button type="button" key={item.id} className={(i === session.index ? 'active ' : '') + (session.answers[item.id] !== undefined ? 'answered' : '')} onClick={() => setSession({ ...session, index: i })}>{i + 1}</button>)}</div>
        <button type="button" className="btn btn-primary past-submit" onClick={submit}>Nộp bài & xem lời giải <Check size={17}/></button>
        <p>Chưa có giới hạn giờ vì các bản trích chưa gồm đủ phần nghe. Bạn có thể chuyển câu bất kỳ trước khi nộp.</p>
      </aside>
    </div>
  </section>;
}
