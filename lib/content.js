import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';
import { CHAPTERS, pad } from './data.js';

marked.setOptions({ gfm: true, breaks: false });

const CHAPTERS_DIR = path.join(process.cwd(), 'chapters');

function slugify(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function readRaw(ch, directory = '') {
  const file = path.join(CHAPTERS_DIR, directory, `ch${pad(ch.num)}-${ch.slug}.md`);
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return null;
  }
}

function wordCount(raw) {
  return raw?.trim() ? raw.trim().split(/\s+/).length : 0;
}

function render(raw, prefix) {
  const seen = new Map();
  const outline = marked.lexer(raw)
    .filter((token) => token.type === 'heading' && token.depth === 2)
    .map((token) => {
      const text = token.text.replace(/[*_`]/g, '');
      const base = `${prefix}${slugify(text)}`;
      const count = (seen.get(base) || 0) + 1;
      seen.set(base, count);
      return { text, id: count === 1 ? base : `${base}-${count}` };
    });
  let i = 0;
  const html = marked.parse(raw).replace(/<h2(\s[^>]*)?>/g, () => `<h2 id="${outline[i++].id}">`);
  return { html, outline };
}

export function getAllChapterMeta() {
  return CHAPTERS.map((ch) => {
    const raw = readRaw(ch, 'essentials') ?? readRaw(ch);
    const words = wordCount(raw);
    return {
      ...ch,
      words,
      minutes: Math.max(1, Math.round(words / 200)),
      available: !!raw,
    };
  });
}

export function getChapter(num) {
  const ch = CHAPTERS.find((c) => c.num === num);
  if (!ch) return null;
  const reference = readRaw(ch);
  const essentials = readRaw(ch, 'essentials');
  const raw = essentials ?? reference;
  const words = wordCount(raw);

  let html = '';
  let outline = [];
  if (raw) {
    ({ html, outline } = render(raw, essentials ? 'on-thi-' : ''));
    if (essentials && reference) {
      const detail = render(reference.replace(/^# .+\r?\n/, ''), '');
      html += `<h2 id="doc-them">Đọc thêm</h2><details class="answers reference"><summary>Lý thuyết chuyên sâu, lab và bài tập gốc</summary><p>Phần này giữ nội dung tham khảo của giáo trình. Các điểm đã xác minh được hiệu chỉnh; phần ôn thi phía trên là lộ trình học chính. Câu hỏi cũ cần đối chiếu tài liệu AWS khi có khác biệt về giới hạn dịch vụ.</p>${detail.html}</details>`;
      outline.push({ text: 'Đọc thêm', id: 'doc-them' });
    }
  }

  return {
    num: ch.num,
    slug: ch.slug,
    title: ch.title,
    words,
    referenceWords: wordCount(reference),
    minutes: Math.max(1, Math.round(words / 200)),
    available: !!raw,
    html,
    outline,
  };
}
