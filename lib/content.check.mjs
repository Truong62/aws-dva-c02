import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CHAPTERS, pad } from './data.js';
import { getAllChapterMeta, getChapter } from './content.js';

const meta = getAllChapterMeta();
assert.equal(meta.length, 50);
assert.equal(getChapter(999), null);
for (const ch of CHAPTERS) {
  const page = getChapter(ch.num);
  assert.ok(page.html.includes('id="doc-them"'), `Chương ${ch.num} chưa có phần đọc thêm`);
  assert.ok(page.html.includes('<details class="answers reference">'), 'Tham khảo đóng mặc định');
  assert.ok(page.html.indexOf('Khái niệm cần hiểu') < page.html.indexOf('id="doc-them"'));
  const ids = [...page.html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length, `Chương ${ch.num} trùng anchor`);
  for (const item of page.outline) assert.ok(ids.includes(item.id), `Mục lục thiếu anchor ${item.id}`);
  assert.equal(page.outline.at(-1).id, 'doc-them');
  assert.equal(page.words, meta.find((m) => m.num === ch.num).words);
  const raw = readFileSync(new URL(`../chapters/essentials/ch${pad(ch.num)}-${ch.slug}.md`, import.meta.url), 'utf8');
  assert.match(raw, /\*\*EN:\*\*/);
  assert.match(raw, /\*\*VI:\*\*/);
  assert.match(raw, /https:\/\/(docs\.aws\.amazon\.com|aws\.amazon\.com)\//);
  assert.equal((raw.match(/^# /gm) || []).length, 1);
  assert.ok(page.words < page.referenceWords, `Chương ${ch.num} phải gọn hơn bản tham khảo`);
}
console.log('content check: 50 chapters, bilingual scenarios, sources, closed references and anchors OK');
