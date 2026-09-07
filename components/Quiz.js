'use client';
import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_PREFS, QUIZ_KEYS, createSession, pickQuestions, scoreSession,
  sessionLabel, toggleAnswer, wrongQuestions,
} from '@/lib/quiz.mjs';
import QuizSetup from '@/components/QuizSetup';
import QuizRunner from '@/components/QuizRunner';
import QuizResult from '@/components/QuizResult';

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
};

export default function Quiz() {
  const [sections, setSections] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [ready, setReady] = useState(false);
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [history, setHistory] = useState([]);
  const [session, setSession] = useState(null);
  const [screen, setScreen] = useState('setup');
  const [navOpen, setNavOpen] = useState(false);
  const [ask, setAsk] = useState(null);

  useEffect(() => {
    fetch('/quiz-questions.json')
      .then((r) => r.json())
      .then((d) => setSections(d.sections))
      .catch(() => setLoadError(true));
  }, []);

  useEffect(() => {
    setPrefs({ ...DEFAULT_PREFS, ...read(QUIZ_KEYS.prefs, {}) });
    setHistory(read(QUIZ_KEYS.history, []));
    const saved = read(QUIZ_KEYS.session, null);
    if (saved && !saved.finished) setSession(saved);
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(QUIZ_KEYS.prefs, JSON.stringify(prefs));
  }, [prefs, ready]);

  useEffect(() => {
    if (!ready) return;
    if (session && !session.finished) localStorage.setItem(QUIZ_KEYS.session, JSON.stringify(session));
    else localStorage.removeItem(QUIZ_KEYS.session);
  }, [session, ready]);

  useEffect(() => {
    if (screen !== 'exam' || !session || session.finished) return undefined;
    const id = setInterval(() => setSession((s) => (s && !s.finished ? { ...s, elapsed: s.elapsed + 1 } : s)), 1000);
    return () => clearInterval(id);
  }, [screen, session?.finished]);

  const finish = useCallback(() => {
    if (!session || session.finished) return;
    const done = { ...session, finished: true, revealed: session.questions.map(() => true) };
    const { correct, total, percent } = scoreSession(done);
    const entry = {
      at: Date.now(), label: sessionLabel(done), mode: done.mode,
      correct, total, percent, seconds: Math.round(done.elapsed),
    };
    const nextHistory = [entry, ...history].slice(0, 50);
    setHistory(nextHistory);
    localStorage.setItem(QUIZ_KEYS.history, JSON.stringify(nextHistory));
    setSession(done);
    setNavOpen(false);
    setScreen('result');
    window.scrollTo(0, 0);
  }, [session, history]);

  useEffect(() => {
    if (screen === 'exam' && session?.limit && session.elapsed >= session.limit) finish();
  }, [screen, session?.elapsed, session?.limit, finish]);

  const begin = useCallback(
    (questions, mode) => {
      if (!questions.length) return;
      setSession(createSession(questions, prefs, mode));
      setScreen('exam');
      window.scrollTo(0, 0);
    },
    [prefs]
  );

  const go = useCallback((delta) => {
    setSession((s) => {
      const next = s.index + delta;
      return next < 0 || next >= s.questions.length ? s : { ...s, index: next };
    });
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (screen !== 'exam') return undefined;
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.target.matches('input,textarea')) return;
      if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
      else if (/^[1-9]$/.test(e.key)) setSession((s) => toggleAnswer(s, Number(e.key) - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [screen, go]);

  if (loadError) return <div className="quiz-loading">Không tải được bộ câu hỏi. Thử tải lại trang.</div>;
  if (!sections || !ready) return <div className="quiz-loading">Đang tải bộ đề…</div>;

  if (screen === 'exam' && session) {
    return (
      <>
        <QuizRunner
          session={session}
          navOpen={navOpen}
          setNavOpen={setNavOpen}
          onPick={(i) => setSession((s) => toggleAnswer(s, i))}
          onGo={go}
          onJump={(i) => { setNavOpen(false); setSession((s) => ({ ...s, index: i })); window.scrollTo(0, 0); }}
          onFlag={() => setSession((s) => ({ ...s, flags: s.flags.map((f, i) => (i === s.index ? !f : f)) }))}
          onReveal={() => setSession((s) => ({ ...s, revealed: s.revealed.map((r, i) => (i === s.index ? true : r)) }))}
          onEnd={() => setAsk({ text: 'Nộp bài và xem kết quả?', label: 'Nộp bài', run: finish })}
          onExit={() => setAsk({ text: 'Thoát bài? Tiến độ vẫn được lưu lại.', label: 'Thoát', run: () => setScreen('setup') })}
        />
        {ask && <Confirm ask={ask} onClose={() => setAsk(null)} />}
      </>
    );
  }

  if (screen === 'result' && session) {
    return (
      <QuizResult
        session={session}
        onRetryWrong={() => begin(wrongQuestions(session), session.mode)}
        onRetryAll={() => begin(pickQuestions(sections, prefs), session.mode)}
        onExit={() => { setSession(null); setScreen('setup'); window.scrollTo(0, 0); }}
      />
    );
  }

  return (
    <QuizSetup
      sections={sections}
      prefs={prefs}
      setPrefs={setPrefs}
      history={history}
      resume={session && !session.finished ? session : null}
      onStart={() => begin(pickQuestions(sections, prefs), sections[prefs.section]?.mode)}
      onResume={() => setScreen('exam')}
      onDiscard={() => setSession(null)}
      onClearHistory={() => { setHistory([]); localStorage.removeItem(QUIZ_KEYS.history); }}
    />
  );
}

function Confirm({ ask, onClose }) {
  return (
    <>
      <div className="aa-scrim" onClick={onClose} />
      <div className="aa-pop quiz-confirm" role="dialog" aria-label={ask.text}>
        <div className="aa-grip" onClick={onClose} />
        <p className="qc-text">{ask.text}</p>
        <div className="qc-actions">
          <button type="button" className="btn-primary" onClick={() => { onClose(); ask.run(); }}>{ask.label}</button>
          <button type="button" className="btn-ghost" onClick={onClose}>Huỷ</button>
        </div>
      </div>
    </>
  );
}
