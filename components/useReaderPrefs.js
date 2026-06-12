'use client';
import { useCallback, useEffect, useState } from 'react';

// Đọc/ghi tập chương đã học trong localStorage.
export function useReadSet() {
  const [readSet, setReadSet] = useState(() => new Set());
  useEffect(() => {
    try {
      setReadSet(new Set(JSON.parse(localStorage.getItem('dva.read') || '[]')));
    } catch {}
  }, []);
  const toggle = useCallback((num) => {
    setReadSet((prev) => {
      const next = new Set(prev);
      next.has(num) ? next.delete(num) : next.add(num);
      localStorage.setItem('dva.read', JSON.stringify([...next]));
      return next;
    });
  }, []);
  return { readSet, toggle };
}

// Preferences trình đọc (theme/cỡ chữ/giãn dòng/khổ/phông/canh đều).
const DEFAULTS = {
  theme: 'paper',
  size: 19,
  lead: 1.82,
  width: '46rem',
  font: "'Literata', Georgia, serif",
  justify: false,
};

export function usePrefs() {
  const [prefs, setPrefs] = useState(DEFAULTS);

  useEffect(() => {
    const s = localStorage;
    setPrefs({
      theme: s.getItem('dva.theme') || DEFAULTS.theme,
      size: Number(s.getItem('dva.size')) || DEFAULTS.size,
      lead: Number(s.getItem('dva.lead')) || DEFAULTS.lead,
      width: s.getItem('dva.width') || DEFAULTS.width,
      font: s.getItem('dva.font') || DEFAULTS.font,
      justify: s.getItem('dva.justify') === '1',
    });
  }, []);

  const apply = useCallback((patch) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      const d = document.documentElement;
      d.dataset.theme = next.theme;
      d.style.setProperty('--reading-size', next.size + 'px');
      d.style.setProperty('--reading-leading', String(next.lead));
      d.style.setProperty('--reading-width', next.width);
      d.style.setProperty('--reading-font', next.font);
      const s = localStorage;
      s.setItem('dva.theme', next.theme);
      s.setItem('dva.size', String(next.size));
      s.setItem('dva.lead', String(next.lead));
      s.setItem('dva.width', next.width);
      s.setItem('dva.font', next.font);
      s.setItem('dva.justify', next.justify ? '1' : '0');
      return next;
    });
  }, []);

  return { prefs, apply };
}
