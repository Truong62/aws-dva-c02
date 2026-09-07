'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import hljs from 'highlight.js/lib/common';
import { CHAPTERS, pad, partOf } from '@/lib/data';
import { useReadSet, usePrefs } from '@/components/useReaderPrefs';
import Sidebar from '@/components/Sidebar';
import AaPanel from '@/components/AaPanel';

export default function Reader({ chapter, html, outline }) {
  const router = useRouter();
  const { readSet, toggle } = useReadSet();
  const { prefs, apply } = usePrefs();
  const [showAa, setShowAa] = useState(false);
  const [progress, setProgress] = useState(0);
  const bodyRef = useRef(null);

  const idx = CHAPTERS.findIndex((c) => c.num === chapter.num);
  const prev = CHAPTERS[idx - 1];
  const next = CHAPTERS[idx + 1];
  const part = partOf(chapter.num);
  const isRead = readSet.has(chapter.num);

  // Nhớ chương đang đọc để "Đọc tiếp" trên trang bìa.
  useEffect(() => {
    localStorage.setItem('dva.last', String(chapter.num));
  }, [chapter.num]);

  // Trang trí nội dung sau khi gắn HTML: highlight code, exam tip, gập đáp án, bọc bảng.
  useEffect(() => {
    const root = bodyRef.current;
    if (!root) return;

    root.querySelectorAll('blockquote').forEach((bq) => {
      const t = bq.textContent || '';
      if (t.includes('💡')) bq.classList.add('tip');
      else if (t.includes('Trọng tâm')) bq.classList.add('focus');
    });

    root.querySelectorAll('table').forEach((tb) => {
      if (tb.parentElement?.classList.contains('tablewrap')) return;
      const wrap = document.createElement('div');
      wrap.className = 'tablewrap';
      tb.parentNode.insertBefore(wrap, tb);
      wrap.appendChild(tb);
    });

    root.querySelectorAll('h3').forEach((h3) => {
      if (!/^Đáp án/i.test((h3.textContent || '').trim())) return;
      if (h3.dataset.done) return;
      h3.dataset.done = '1';
      const details = document.createElement('details');
      details.className = 'answers';
      const summary = document.createElement('summary');
      summary.textContent = 'Xem đáp án & giải thích';
      details.appendChild(summary);
      let node = h3.nextSibling;
      while (node && !(node.nodeType === 1 && /^H[12]$/.test(node.tagName))) {
        const after = node.nextSibling;
        details.appendChild(node);
        node = after;
      }
      h3.replaceWith(details);
    });

    const LANG_LABEL = {
      bash: 'Shell', sh: 'Shell', shell: 'Shell', zsh: 'Shell',
      js: 'JavaScript', javascript: 'JavaScript', ts: 'TypeScript', typescript: 'TypeScript',
      json: 'JSON', yaml: 'YAML', yml: 'YAML', go: 'Go', python: 'Python', py: 'Python',
      sql: 'SQL', xml: 'XML', html: 'HTML', dockerfile: 'Dockerfile', ini: 'Config', text: 'Text',
    };

    root.querySelectorAll('pre').forEach((pre) => {
      if (pre.dataset.wrapped) return;
      pre.dataset.wrapped = '1';
      const code = pre.querySelector('code');
      if (code) { try { hljs.highlightElement(code); } catch {} }

      const m = (code?.className || '').match(/language-([\w-]+)/);
      const lang = m ? (LANG_LABEL[m[1].toLowerCase()] || m[1]) : 'Code';

      const fig = document.createElement('figure');
      fig.className = 'codeblock';
      const head = document.createElement('figcaption');
      head.className = 'cb-head';
      head.innerHTML = `<span class="cb-dots"><i></i><i></i><i></i></span><span class="cb-lang">${lang}</span>`;

      const copy = document.createElement('button');
      copy.type = 'button';
      copy.className = 'cb-copy';
      copy.textContent = 'Copy';
      copy.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(code?.innerText || pre.innerText);
          copy.textContent = '✓ Đã chép';
          copy.classList.add('ok');
          setTimeout(() => { copy.textContent = 'Copy'; copy.classList.remove('ok'); }, 1600);
        } catch {}
      });
      head.appendChild(copy);

      pre.parentNode.insertBefore(fig, pre);
      fig.appendChild(head);
      fig.appendChild(pre);
    });
  }, [html]);

  // Thanh tiến độ đọc.
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? (el.scrollTop / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [chapter.num]);

  // Phím tắt: ←/→ chuyển chương, / để tìm, Esc đóng.
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.matches('input, textarea')) {
        if (e.key === 'Escape') e.target.blur();
        return;
      }
      if (e.key === 'ArrowRight' && next) router.push(`/chuong/${next.num}`);
      else if (e.key === 'ArrowLeft' && prev) router.push(`/chuong/${prev.num}`);
      else if (e.key === '/') { e.preventDefault(); document.getElementById('railSearch')?.focus(); }
      else if (e.key === 'Escape') setShowAa(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next, router]);

  const closeNav = () => document.body.classList.remove('nav-open');

  return (
    <div className="shell">
      <div className="progress-rail"><div className="progress-fill" style={{ width: progress + '%' }} /></div>
      <Sidebar current={chapter.num} readSet={readSet} onNavigate={closeNav} />
      <div className="scrim" onClick={closeNav} />

      <div className="main">
        <header className="topbar">
          <button className="iconbtn" id="menuBtn" onClick={() => document.body.classList.add('nav-open')} aria-label="Mục lục">☰</button>
          <span className="crumb">{part?.name} · <b>Chương {pad(chapter.num)}</b></span>
          <span className="spacer" />
          <button className="iconbtn" onClick={() => setShowAa((v) => !v)} aria-label="Tuỳ chỉnh chữ" style={{ fontFamily: 'var(--display)' }}>Aa</button>
          <button className="iconbtn ghost" onClick={() => window.print()} aria-label="In / PDF">⎙</button>
        </header>

        {showAa && (
          <>
            <div className="aa-scrim" onClick={() => setShowAa(false)} />
            <AaPanel prefs={prefs} apply={apply} outline={outline} onClose={() => setShowAa(false)} onJump={() => setShowAa(false)} />
          </>
        )}

        <main className="scroller">
          <article className="page">
            <div className="ch-eyebrow">{part?.name} — {part?.full}</div>
            <div className="ch-meta">
              <span>⏱ ~{chapter.minutes} phút đọc</span>
              <span>✍ {chapter.words.toLocaleString('vi-VN')} từ</span>
              <span>📑 Chương {chapter.num}/50</span>
            </div>

            <div
              ref={bodyRef}
              className={`prose${prefs.justify ? ' justify' : ''}`}
              dangerouslySetInnerHTML={{ __html: html }}
            />

            <div className="ch-foot">
              <button className={`mark-read${isRead ? ' on' : ''}`} onClick={() => toggle(chapter.num)}>
                {isRead ? '✓ Đã học xong chương này' : 'Đánh dấu đã học xong'}
              </button>
              <div className="pager">
                {prev ? (
                  <Link className="prev" href={`/chuong/${prev.num}`}>
                    <span className="dir">← Chương trước</span>
                    <span className="ttl">{pad(prev.num)}. {prev.title}</span>
                  </Link>
                ) : <span style={{ flex: 1 }} />}
                {next ? (
                  <Link className="next" href={`/chuong/${next.num}`}>
                    <span className="dir">Chương sau →</span>
                    <span className="ttl">{pad(next.num)}. {next.title}</span>
                  </Link>
                ) : <span style={{ flex: 1 }} />}
              </div>
            </div>
          </article>
        </main>
      </div>
    </div>
  );
}
