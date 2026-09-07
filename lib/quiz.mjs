// Logic thuần cho bộ đề luyện tập — không đụng DOM, không side-effect.

export const PASS_PERCENT = 72;
export const LETTERS = 'ABCDEFGHIJ';
export const QUIZ_KEYS = { prefs: 'dva.quiz.prefs', session: 'dva.quiz.session', history: 'dva.quiz.history' };

export const DEFAULT_PREFS = {
  section: null,
  shuffleQuestions: true,
  shuffleAnswers: true,
  timed: false,
  minutes: 0,
};

export function shuffle(items) {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function withShuffledAnswers(question) {
  const order = shuffle(question.o.map((_, i) => i));
  return {
    ...question,
    o: order.map((i) => question.o[i]),
    c: question.c.map((i) => order.indexOf(i)).sort((a, b) => a - b),
  };
}

export function isCorrect(picked, correct) {
  return picked.length === correct.length && picked.every((i) => correct.includes(i));
}

export function pickQuestions(sections, prefs) {
  const section = sections[prefs.section];
  if (!section) return [];
  let questions = section.questions.map((q) => ({ ...q, section: section.name }));
  if (prefs.shuffleQuestions) questions = shuffle(questions);
  if (prefs.shuffleAnswers) questions = questions.map(withShuffledAnswers);
  return questions;
}

export function createSession(questions, prefs, mode) {
  const minutes = prefs.timed ? (prefs.minutes > 0 ? prefs.minutes : questions.length * 2) : 0;
  return {
    questions,
    mode,
    answers: questions.map(() => []),
    flags: questions.map(() => false),
    revealed: questions.map(() => false),
    index: 0,
    elapsed: 0,
    limit: minutes * 60,
    finished: false,
  };
}

export function toggleAnswer(session, optionIndex) {
  const { index } = session;
  const question = session.questions[index];
  if (session.revealed[index]) return session;

  const answers = session.answers.map((a) => a.slice());
  const revealed = session.revealed.slice();

  if (question.c.length > 1) {
    const at = answers[index].indexOf(optionIndex);
    if (at >= 0) answers[index].splice(at, 1);
    else answers[index].push(optionIndex);
    answers[index].sort((a, b) => a - b);
    if (session.mode === 'practice' && answers[index].length === question.c.length) revealed[index] = true;
  } else {
    answers[index] = [optionIndex];
    if (session.mode === 'practice') revealed[index] = true;
  }
  return { ...session, answers, revealed };
}

export function scoreSession(session) {
  const correct = session.questions.reduce(
    (total, question, i) => total + (isCorrect(session.answers[i], question.c) ? 1 : 0),
    0
  );
  const total = session.questions.length;
  return { correct, total, percent: total ? Math.round((correct / total) * 100) : 0 };
}

export function wrongQuestions(session) {
  return session.questions.filter((question, i) => !isCorrect(session.answers[i], question.c));
}

export function sessionLabel(session) {
  const names = [...new Set(session.questions.map((q) => q.section))];
  return names.length === 1 ? names[0] : `${names.length} phần · ${session.questions.length} câu`;
}

export function formatClock(seconds) {
  const s = Math.max(0, Math.round(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
