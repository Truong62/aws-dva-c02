'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PARTS, CHAPTERS, pad } from '@/lib/data';
import { useReadSet } from '@/components/useReaderPrefs';

export default function Home({ meta, totalWords }) {
  const { readSet } = useReadSet();
  const [last, setLast] = useState(null);

  useEffect(() => {
    const v = Number(localStorage.getItem('dva.last'));
    if (v) setLast(v);
  }, []);

  const metaByNum = Object.fromEntries(meta.map((m) => [m.num, m]));
  const totalMin = Math.round(totalWords / 200);
  const resume = last && CHAPTERS.find((c) => c.num === last);

  return (
    <div className="cover">
      <div className="cover-badge">Ôn thi DVA-C02 · Hiểu cơ chế, giải tình huống</div>
      <h1>AWS Certified<br />Developer <span className="amp">—</span> Associate</h1>
      <p className="lead">
        50 bài ôn thi: khái niệm nền, luồng hoạt động, những điểm dễ nhầm và tình huống Anh–Việt.
        Mỗi bài có phần đọc thêm để tra cứu lý thuyết chuyên sâu và thực hành.
      </p>

      <div className="cover-stats">
        <div className="cover-stat"><b>50</b><span>bài ôn thi</span></div>
        <div className="cover-stat"><b>{(totalWords / 1000).toFixed(0)}k</b><span>từ phần ôn thi</span></div>
        <div className="cover-stat"><b>~{totalMin}</b><span>phút đọc phần chính</span></div>
        <div className="cover-stat"><b>{readSet.size}</b><span>đã học xong</span></div>
      </div>

      <div className="cover-cta">
        {resume ? (
          <Link className="btn-primary" href={`/chuong/${resume.num}`}>
            ▸ Đọc tiếp — Chương {pad(resume.num)}
          </Link>
        ) : (
          <Link className="btn-primary" href="/chuong/1">▸ Bắt đầu đọc</Link>
        )}
        <Link className="btn-ghost" href="/quiz">Luyện đề 510 câu →</Link>
        <Link className="btn-ghost" href="/chuong/49">Bộ đề mô phỏng →</Link>
      </div>

      <p className="lead">
        Học từ nền tảng: <Link href="/chuong/2/">IAM</Link> → <Link href="/chuong/28/">Lambda</Link> →{' '}
        <Link href="/chuong/34/">API Gateway</Link> → <Link href="/chuong/36/">SAM</Link>.
        {' '}Xem <Link href="/chuong/1/">lộ trình và phạm vi kỳ thi</Link> trước khi luyện đề.
      </p>

      <div className="shelf">
        {PARTS.map((p) => {
          const items = CHAPTERS.filter((c) => c.num >= p.from && c.num <= p.to);
          return (
            <section key={p.name}>
              <div className="shelf-part">
                <span className="pn">{p.name}</span>
                <span className="pt">{p.full}</span>
                <span className="pr">Ch. {p.from}–{p.to}</span>
              </div>
              <div className="cards">
                {items.map((c) => {
                  const m = metaByNum[c.num];
                  return (
                    <Link key={c.num} href={`/chuong/${c.num}`} className={`card${readSet.has(c.num) ? ' read' : ''}`}>
                      <div className="cn">Chương {pad(c.num)}</div>
                      <div className="ct">{c.title}</div>
                      <div className="cmeta">
                        <span>⏱ ~{m?.minutes ?? 0}′</span>
                        <span>✍ {((m?.words ?? 0) / 1000).toFixed(1)}k từ</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
