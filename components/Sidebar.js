'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { PARTS, CHAPTERS, pad } from '@/lib/data';

export default function Sidebar({ current, readSet, onNavigate }) {
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();

  const grouped = useMemo(
    () =>
      PARTS.map((p) => ({
        part: p,
        items: CHAPTERS.filter((c) => c.num >= p.from && c.num <= p.to),
      })),
    []
  );

  const readPct = Math.round((readSet.size / CHAPTERS.length) * 100);

  return (
    <aside className="rail">
      <div className="rail-head">
        <Link href="/" className="rail-brand" onClick={onNavigate}>
          <b>DVA<i>·C02</i></b>
          <span>Developer<br />Associate</span>
        </Link>
        <input
          className="rail-search"
          type="search"
          placeholder="Tìm chương…  ( / )"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          id="railSearch"
        />
        <div className="rail-progress">
          <div className="bar"><i style={{ width: readPct + '%' }} /></div>
          <b>{readSet.size}/50</b>
        </div>
      </div>

      <nav className="toc">
        {grouped.map(({ part, items }) => {
          const visible = items.filter(
            (c) => !query || (`${c.num} ${c.title}`).toLowerCase().includes(query)
          );
          if (query && visible.length === 0) return null;
          return (
            <div key={part.name}>
              <div className="toc-part">
                <span className="pn">{part.name}</span>
                <span className="pt">{part.full}</span>
              </div>
              {items.map((c) => {
                const hidden = query && !visible.includes(c);
                const cls = [
                  'toc-link',
                  c.num === current ? 'active' : '',
                  readSet.has(c.num) ? 'read' : '',
                  hidden ? 'hide' : '',
                ].join(' ');
                return (
                  <Link key={c.num} href={`/chuong/${c.num}`} className={cls} onClick={onNavigate}>
                    <span className="tn">{pad(c.num)}</span>
                    <span>{c.title}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
