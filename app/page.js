import { getAllChapterMeta } from '@/lib/content';
import Home from '@/components/Home';

export default function Page() {
  const meta = getAllChapterMeta();
  const totalWords = meta.reduce((s, m) => s + m.words, 0);
  return <Home meta={meta} totalWords={totalWords} />;
}
