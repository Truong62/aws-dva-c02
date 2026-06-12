// Đọc & render markdown — chỉ chạy phía server (build time).
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

function readRaw(ch) {
  const file = path.join(CHAPTERS_DIR, `ch${pad(ch.num)}-${ch.slug}.md`);
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return null;
  }
}

export function getAllChapterMeta() {
  return CHAPTERS.map((ch) => {
    const raw = readRaw(ch);
    const words = raw ? raw.trim().split(/\s+/).length : 0;
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
  const raw = readRaw(ch);
  const words = raw ? raw.trim().split(/\s+/).length : 0;

  let html = '';
  let outline = [];
  if (raw) {
    // Outline = các heading cấp 2, lấy theo thứ tự tài liệu
    const tokens = marked.lexer(raw);
    outline = tokens
      .filter((t) => t.type === 'heading' && t.depth === 2)
      .map((t) => ({ text: t.text.replace(/[*_`]/g, ''), id: slugify(t.text) }));

    html = marked.parse(raw);
    // Gắn id cho <h2> theo đúng thứ tự outline để nhảy mục trong chương
    let i = 0;
    html = html.replace(/<h2(\s[^>]*)?>/g, () => {
      const id = outline[i]?.id || `sec-${i}`;
      i += 1;
      return `<h2 id="${id}">`;
    });
  }

  return {
    num: ch.num,
    slug: ch.slug,
    title: ch.title,
    words,
    minutes: Math.max(1, Math.round(words / 200)),
    available: !!raw,
    html,
    outline,
  };
}
