'use client';
import { formatClock, isCorrect } from '@/lib/quiz.mjs';
import QuestionBlock from '@/components/QuestionBlock';

export default function QuizRunner({ session, onPick, onGo, onJump, onFlag, onReveal, onEnd, onExit, navOpen, setNavOpen }) {
  const question = session.questions[session.index];
  const answered = session.answers.filter((a) => a.length).length;
  const remaining = session.limit ? session.limit - session.elapsed : session.elapsed;
  const last = session.index === session.questions.length - 1;

  return (
    <div className="main">
      <div className="topbar">
        <button className="iconbtn ghost" onClick={onExit} aria-label="Thoát bài">✕</button>
        <div className="crumb">
          <b>Câu {session.index + 1}/{session.questions.length}</b> · {answered} đã trả lời
        </div>
        <div className="spacer" />
        <span className={`quiz-timer${session.limit && remaining <= 60 ? ' warn' : ''}`}>{formatClock(remaining)}</span>
        <button className="iconbtn" onClick={onEnd}>Nộp bài</button>
      </div>

      <div className="scroller">
        <div className="page quiz-page">
          <QuestionBlock
            question={question}
            answer={session.answers[session.index]}
            revealed={session.revealed[session.index]}
            onPick={onPick}
          />
          <div className="q-tools">
            <button type="button" className="q-tool" data-active={session.flags[session.index]} onClick={onFlag}>
              ⚑ Đánh dấu
            </button>
            {!session.revealed[session.index] && (
              <button type="button" className="q-tool" onClick={onReveal}>👁 Xem đáp án</button>
            )}
          </div>
        </div>
      </div>

      <div className="quiz-bar">
        <button type="button" className="btn-ghost" onClick={() => onGo(-1)} disabled={session.index === 0}>‹ Trước</button>
        <button type="button" className="btn-ghost quiz-nav-btn" onClick={() => setNavOpen(true)} aria-label="Danh sách câu">☰</button>
        <button type="button" className="btn-primary" onClick={() => (last ? onEnd() : onGo(1))}>
          {last ? 'Nộp bài' : 'Tiếp ›'}
        </button>
      </div>

      {navOpen && (
        <>
          <div className="aa-scrim" onClick={() => setNavOpen(false)} />
          <div className="aa-pop quiz-navpop" role="dialog" aria-label="Danh sách câu">
            <div className="aa-grip" onClick={() => setNavOpen(false)} />
            <div className="aa-titlebar">
              <span>Danh sách câu</span>
              <button className="aa-close" onClick={() => setNavOpen(false)} aria-label="Đóng">✕</button>
            </div>
            <QuestionGrid session={session} onJump={onJump} review={false} />
          </div>
        </>
      )}
    </div>
  );
}

export function QuestionGrid({ session, onJump, review }) {
  return (
    <div className="quiz-grid">
      {session.questions.map((question, i) => {
        const done = session.answers[i].length > 0;
        const state = review ? (isCorrect(session.answers[i], question.c) ? 'right' : 'wrong') : done ? 'done' : '';
        return (
          <button
            key={i}
            type="button"
            className={`quiz-cell ${state}${session.flags[i] ? ' flagged' : ''}${i === session.index && !review ? ' current' : ''}`}
            onClick={() => onJump(i)}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}
