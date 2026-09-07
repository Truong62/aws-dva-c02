'use client';
import { useState } from 'react';
import Link from 'next/link';
import { PASS_PERCENT, formatClock } from '@/lib/quiz.mjs';

const STEPS = ['Chọn đề', 'Vào làm bài'];
const MODE_NOTE = {
  practice: 'Luyện tập — hiện đáp án và giải thích ngay khi chọn xong mỗi câu.',
  exam: `Thi thử — giấu đáp án tới lúc nộp bài, cần ${PASS_PERCENT}% để đạt.`,
};

const examLabel = (name) =>
  name.includes(':')
    ? { tag: name.split(':')[0], title: name.replace(/^[^:]*:\s*/, '') }
    : { tag: 'Đề thi thử', title: name };

export default function QuizSetup({ sections, prefs, setPrefs, history, resume, onStart, onResume, onDiscard, onClearHistory }) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);

  const goto = (next) => { setDir(next >= step ? 1 : -1); setStep(next); };
  const patch = (next) => setPrefs({ ...prefs, ...next });

  const section = sections[prefs.section] ?? null;
  const total = sections.reduce((n, s) => n + s.questions.length, 0);
  const groups = sections.reduce((acc, s, i) => {
    const bucket = acc.find((g) => g.name === s.group);
    if (bucket) bucket.items.push({ s, i });
    else acc.push({ name: s.group, mode: s.mode, items: [{ s, i }] });
    return acc;
  }, []);

  const best = {};
  for (const h of history) best[h.label] = Math.max(best[h.label] ?? 0, h.percent);

  const choose = (i) => {
    const picked = sections[i];
    patch({
      section: i,
      timed: picked.mode === 'exam',
      minutes: picked.mode === 'exam' ? 130 : 0,
    });
    goto(1);
  };

  return (
    <div className="cover quiz-cover">
      <div className="cover-badge">Bộ đề luyện tập · {total} câu có giải thích</div>
      <h1>Luyện đề <span className="amp">—</span> DVA-C02</h1>
      <p className="lead">
        Chọn đề rồi vào làm bài. Mọi thứ chạy ngay trên máy bạn — không cần đăng nhập,
        tiến độ tự lưu lại trong trình duyệt.
      </p>

      {resume && (
        <div className="quiz-resume">
          <div>
            <div className="qr-title">Còn một bài đang làm dở</div>
            <div className="qr-sub">
              {resume.questions[0]?.section} · câu {resume.index + 1}/{resume.questions.length} · đã làm {formatClock(resume.elapsed)}
            </div>
          </div>
          <div className="qr-actions">
            <button type="button" className="btn-primary" onClick={onResume}>Làm tiếp</button>
            <button type="button" className="btn-ghost" onClick={onDiscard}>Bỏ bài</button>
          </div>
        </div>
      )}

      <div className="wiz">
        <div className="wiz-steps">
          {STEPS.map((stepName, i) => (
            <button
              key={stepName}
              type="button"
              className="wiz-step"
              data-active={step === i}
              disabled={i > 0 && !section}
              onClick={() => goto(i)}
            >
              <i>{i + 1}</i>
              <span>
                {stepName}
                <b>{i === 0 ? (section ? examLabel(section.name).title : '—') : section ? `${section.questions.length} câu` : '—'}</b>
              </span>
            </button>
          ))}
        </div>

        <div className="wiz-panel" key={step} data-dir={dir}>
          {step === 0 && groups.map((group) => (
            <div className="wiz-group" key={group.name}>
              <div className="shelf-part">
                <span className="pt">{group.name}</span>
                <span className="pr">{group.items.length} đề · {group.items.reduce((n, x) => n + x.s.questions.length, 0)} câu</span>
              </div>
              <p className="wiz-groupnote">{MODE_NOTE[group.mode]}</p>
              <div className="cards">
                {group.items.map(({ s, i }) => (
                  <button
                    key={s.name}
                    type="button"
                    className={`card quiz-sec${prefs.section === i ? ' on' : ''}`}
                    onClick={() => choose(i)}
                  >
                    <div className="cn">{examLabel(s.name).tag}</div>
                    <div className="ct">{examLabel(s.name).title}</div>
                    <div className="cmeta">
                      <span>{s.questions.length} câu</span>
                      {best[s.name] !== undefined && <span>cao nhất {best[s.name]}%</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {step === 1 && section && (
            <>
              <div className="wiz-summary">
                <div className="ws-name">{section.name}</div>
                <div className="ws-meta">{section.questions.length} câu · {MODE_NOTE[section.mode]}</div>
              </div>
              <div className="quiz-opts">
                <Switch label="Trộn câu hỏi" on={prefs.shuffleQuestions} onClick={() => patch({ shuffleQuestions: !prefs.shuffleQuestions })} />
                <Switch label="Trộn đáp án" on={prefs.shuffleAnswers} onClick={() => patch({ shuffleAnswers: !prefs.shuffleAnswers })} />
                <Switch label="Đếm ngược thời gian" on={prefs.timed} onClick={() => patch({ timed: !prefs.timed })} />
                {prefs.timed && (
                  <label className="quiz-field">
                    <span>Thời gian (phút)<i>Để 0 để lấy 2 phút mỗi câu</i></span>
                    <input
                      type="number" min="0" max="300" value={prefs.minutes}
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) => patch({ minutes: Math.max(0, Number(e.target.value) || 0) })}
                    />
                  </label>
                )}
              </div>
              <button type="button" className="btn-primary wiz-go" onClick={onStart}>
                ▸ Bắt đầu — {section.questions.length} câu
              </button>
            </>
          )}
        </div>
      </div>

      <div className="quiz-block">
        <div className="shelf-part">
          <span className="pt">Lịch sử</span>
          {history.length > 0 && (
            <span className="quiz-quick"><button type="button" onClick={onClearHistory}>Xoá</button></span>
          )}
        </div>
        {history.length === 0 ? (
          <p className="quiz-empty">Chưa có lượt làm nào.</p>
        ) : (
          <div className="quiz-hist">
            {history.slice(0, 12).map((h) => (
              <div className="quiz-hist-row" key={h.at}>
                <span className={`quiz-pill ${h.percent >= PASS_PERCENT ? 'pass' : 'fail'}`}>{h.percent}%</span>
                <span className="qh-name">{h.label}</span>
                <span className="qh-meta">{h.correct}/{h.total} · {formatClock(h.seconds)} · {new Date(h.at).toLocaleDateString('vi-VN')}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="cover-cta quiz-start">
        <Link className="btn-ghost" href="/">← Về giáo trình</Link>
      </div>
    </div>
  );
}

function Switch({ label, on, onClick }) {
  return (
    <div className="quiz-field">
      <span>{label}</span>
      <button type="button" className="quiz-switch" data-on={on} onClick={onClick} aria-pressed={on} aria-label={label} />
    </div>
  );
}
