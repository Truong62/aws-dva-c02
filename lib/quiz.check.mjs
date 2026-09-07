// Self-check cho lib/quiz.mjs — chạy: npm run check
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  withShuffledAnswers, isCorrect, pickQuestions, createSession,
  toggleAnswer, scoreSession, wrongQuestions, formatClock, DEFAULT_PREFS,
} from './quiz.mjs';

const base = { id: 1, q: '<p>q</p>', o: ['a', 'b', 'c', 'd'], c: [1, 3], e: '<p>e</p>' };
const correctTexts = base.c.map((i) => base.o[i]);

for (let n = 0; n < 500; n++) {
  const s = withShuffledAnswers(base);
  assert.equal(new Set(s.o).size, 4, 'giữ đủ 4 đáp án');
  assert.deepEqual([...s.c].sort((a, b) => a - b), s.c, 'chỉ số đáp án đúng đã sắp xếp');
  assert.equal(s.c.length, 2, 'giữ đúng số đáp án đúng');
  for (const i of s.c) assert.ok(correctTexts.includes(s.o[i]), 'chỉ số đúng trỏ đúng nội dung sau khi trộn');
}

assert.ok(isCorrect([3, 1], [1, 3]), 'không phụ thuộc thứ tự chọn');
assert.ok(!isCorrect([1], [1, 3]), 'chọn thiếu là sai');
assert.ok(!isCorrect([0, 1], [1, 3]), 'chọn dư là sai');
assert.ok(!isCorrect([], [1]), 'bỏ trống là sai');

const sections = [{ name: 'S1', questions: [base, { ...base, id: 2 }] }, { name: 'S2', questions: [{ ...base, id: 3 }] }];
const prefs = { ...DEFAULT_PREFS, section: 0, shuffleQuestions: false, shuffleAnswers: false };
assert.deepEqual(pickQuestions(sections, prefs).map((q) => q.id), [1, 2], 'lấy trọn đề đã chọn');
assert.deepEqual(pickQuestions(sections, { ...prefs, section: 1 }).map((q) => q.id), [3], 'đổi đề thì đổi bộ câu');
assert.deepEqual(pickQuestions(sections, { ...prefs, section: null }), [], 'chưa chọn đề thì không có câu nào');
assert.deepEqual(pickQuestions(sections, { ...prefs, section: 9 }), [], 'đề không tồn tại thì không có câu nào');
assert.equal(pickQuestions(sections, prefs)[0].section, 'S1', 'gắn tên đề vào câu hỏi');

let session = createSession(pickQuestions(sections, prefs), prefs, 'practice');
assert.equal(session.limit, 0, 'không bật đếm ngược thì không có giới hạn');
assert.equal(createSession(session.questions, { ...prefs, timed: true }, 'practice').limit, 2 * 2 * 60, 'mặc định 2 phút/câu');
assert.equal(createSession(session.questions, { ...prefs, timed: true, minutes: 130 }, 'exam').limit, 130 * 60, 'tôn trọng số phút đặt tay');

session = toggleAnswer(session, 1);
assert.deepEqual(session.answers[0], [1], 'chọn đáp án đầu');
assert.equal(session.revealed[0], false, 'câu nhiều đáp án chưa đủ thì chưa mở đáp án');
session = toggleAnswer(session, 3);
assert.deepEqual(session.answers[0], [1, 3], 'chọn thêm đáp án thứ hai');
assert.equal(session.revealed[0], true, 'chế độ luyện tập mở đáp án khi chọn đủ');
session = toggleAnswer(session, 0);
assert.deepEqual(session.answers[0], [1, 3], 'đã mở đáp án thì không sửa được nữa');

assert.deepEqual(scoreSession(session), { correct: 1, total: 2, percent: 50 }, 'chấm điểm');
assert.deepEqual(wrongQuestions(session).map((q) => q.id), [2], 'lọc câu sai');

const single = createSession([{ ...base, c: [2] }], prefs, 'practice');
assert.equal(toggleAnswer(single, 0).revealed[0], true, 'câu một đáp án mở ngay khi chọn');
assert.equal(toggleAnswer(createSession([{ ...base, c: [2] }], prefs, 'exam'), 0).revealed[0], false, 'chế độ thi không mở đáp án');

assert.equal(formatClock(0), '00:00');
assert.equal(formatClock(61), '01:01');
assert.equal(formatClock(-5), '00:00', 'không hiện thời gian âm');

const data = JSON.parse(readFileSync(new URL('../public/quiz-questions.json', import.meta.url)));
const all = data.sections.flatMap((s) => s.questions);
assert.equal(data.sections.length, 22, 'đủ 22 đề');
assert.equal(all.length, 510, 'đủ 510 câu');
for (const s of data.sections) {
  assert.ok(s.group && s.name, `đề ${s.name} thiếu tên hoặc nhóm`);
  assert.ok(s.mode === 'practice' || s.mode === 'exam', `đề ${s.name} có mode lạ: ${s.mode}`);
}
assert.equal(data.sections.filter((s) => s.mode === 'exam').length, 6, '6 đề thi thử');
assert.equal(data.sections.filter((s) => s.mode === 'practice').length, 16, '16 quiz luyện tập');
for (const q of all) {
  assert.ok(q.c.length > 0, `câu ${q.id} thiếu đáp án đúng`);
  assert.ok(q.c.every((i) => i >= 0 && i < q.o.length), `câu ${q.id} có chỉ số đáp án ngoài phạm vi`);
  assert.ok(q.e && q.q && q.o.length >= 2, `câu ${q.id} thiếu nội dung`);
}

console.log('quiz check: OK');
