import { CHAPTERS } from '@/lib/data';
import { getChapter } from '@/lib/content';
import Reader from '@/components/Reader';

export function generateStaticParams() {
  return CHAPTERS.map((c) => ({ num: String(c.num) }));
}

export function generateMetadata({ params }) {
  const ch = CHAPTERS.find((c) => c.num === Number(params.num));
  return {
    title: ch ? `Ch.${ch.num} ${ch.title} — AWS DVA-C02` : 'AWS DVA-C02',
  };
}

export default function ChapterPage({ params }) {
  const data = getChapter(Number(params.num));
  if (!data) return null;
  const { html, outline, ...chapter } = data;
  return <Reader chapter={chapter} html={html} outline={outline} />;
}
