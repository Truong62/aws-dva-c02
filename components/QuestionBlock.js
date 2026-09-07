'use client';
import { useEffect, useRef } from 'react';
import hljs from 'highlight.js/lib/common';
import { LETTERS } from '@/lib/quiz.mjs';

const guessLanguage = (text) => {
  const body = text.trim();
  if (/^[{[]/.test(body) || /^\s*"[^"]+"\s*:/m.test(body)) return 'json';
  if (/^\s*(#|\$|aws\s|curl\s)/m.test(body) && !/^\s*[\w.-]+:\s/m.test(body)) return 'bash';
  if (/^\s*[\w.-]+:\s*($|\S)/m.test(body)) return 'yaml';
  return null;
};

export default function QuestionBlock({ question, answer, revealed, onPick }) {
  const root = useRef(null);
  const multi = question.c.length > 1;

  useEffect(() => {
    root.current?.querySelectorAll('pre code:not(.hljs)').forEach((code) => {
      const lang = guessLanguage(code.textContent || '');
      if (lang) code.classList.add(`language-${lang}`);
      try { hljs.highlightElement(code); } catch {}
    });
  });

  return (
    <div className="q-block" ref={root}>
      <div className="q-meta">
        <span className="q-sec">{question.section}</span>
        {multi && <span className="q-multi">Chọn {question.c.length} đáp án</span>}
      </div>
      <div className="q-text prose" dangerouslySetInnerHTML={{ __html: question.q }} />
      <div className="q-opts">
        {question.o.map((html, i) => {
          const picked = answer.includes(i);
          const right = question.c.includes(i);
          const state = !revealed ? (picked ? 'picked' : '') : right ? 'right' : picked ? 'wrong' : '';
          return (
            <button
              key={i}
              type="button"
              className={`q-opt ${state}`}
              aria-pressed={picked}
              onClick={() => onPick && onPick(i)}
            >
              <span className="q-mark">{revealed && right ? '✓' : revealed && picked ? '✕' : LETTERS[i]}</span>
              <span className="q-body" dangerouslySetInnerHTML={{ __html: html }} />
            </button>
          );
        })}
      </div>
      {revealed && (
        <div className="q-expl">
          <div className="q-expl-head">Giải thích</div>
          <div className="prose" dangerouslySetInnerHTML={{ __html: question.e }} />
        </div>
      )}
    </div>
  );
}
