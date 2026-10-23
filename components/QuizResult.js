'use client';
import Link from 'next/link';
import { PASS_PERCENT, formatClock, isCorrect, scoreSession, wrongQuestions } from '@/lib/quiz.mjs';
import QuestionBlock from '@/components/QuestionBlock';
import { QuestionGrid } from '@/components/QuizRunner';

export default function QuizResult({ session, onRetryWrong, onRetryAll, onExit }) {
  const { correct, total, percent } = scoreSession(session);
  const passed = percent >= PASS_PERCENT;
  const wrong = wrongQuestions(session);

  const jump = (i) => document.getElementById(`qr-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="main">
      <div className="topbar">
        <button className="iconbtn ghost" onClick={onExit} aria-label="Về trang đề">✕</button>
        <div className="crumb"><b>Kết quả</b></div>
        <div className="spacer" />
        <Link className="iconbtn" href="/">Giáo trình</Link>
      </div>

      <div className="scroller">
        <div className="page quiz-page">
          <div className="ch-eyebrow">{passed ? 'Đạt mốc luyện tập' : 'Chưa đạt mốc luyện tập'}</div>
          <div className="quiz-score">
            <div className="qs-num" data-pass={passed}>{percent}<i>%</i></div>
            <div className="qs-info">
              <p>Mốc luyện tập của website: {PASS_PERCENT}%. Đây không phải phép quy đổi sang điểm AWS 720/1000.</p>
              <div className="qs-stats">
                <span><b>{correct}/{total}</b>câu đúng</span>
                <span><b>{wrong.length}</b>câu sai</span>
                <span><b>{formatClock(session.elapsed)}</b>thời gian</span>
              </div>
            </div>
          </div>

          <QuestionGrid session={session} onJump={jump} review />

          <div className="quiz-result-cta">
            {wrong.length > 0 && (
              <button type="button" className="btn-primary" onClick={onRetryWrong}>▸ Làm lại {wrong.length} câu sai</button>
            )}
            <button type="button" className="btn-ghost" onClick={onRetryAll}>Làm lại từ đầu</button>
          </div>

          <div className="quiz-review">
            {session.questions.map((question, i) => {
              const ok = isCorrect(session.answers[i], question.c);
              const skipped = session.answers[i].length === 0;
              return (
                <article className="quiz-review-item" id={`qr-${i}`} key={i}>
                  <div className="qri-head">
                    <span className="qri-num">Câu {i + 1}</span>
                    <span className={`quiz-pill ${ok ? 'pass' : 'fail'}`}>{ok ? 'Đúng' : skipped ? 'Bỏ trống' : 'Sai'}</span>
                  </div>
                  <QuestionBlock question={question} answer={session.answers[i]} revealed />
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
