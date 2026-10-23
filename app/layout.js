import './globals.css';

export const metadata = {
  title: 'AWS DVA-C02 — Giáo trình ôn luyện Developer Associate',
  description:
    '50 bài ôn thi AWS DVA-C02: khái niệm cốt lõi, cơ chế, tình huống Anh–Việt, điểm dễ nhầm và tài liệu thực hành.',
};

export const viewport = {
  themeColor: '#ece3d4',
  width: 'device-width',
  initialScale: 1,
};

// Áp theme + cỡ chữ đã lưu TRƯỚC khi paint, tránh nhấp nháy.
const boot = `(function(){try{
  var d=document.documentElement, s=localStorage;
  d.dataset.theme = s.getItem('dva.theme') || 'paper';
  var fs=s.getItem('dva.size'); if(fs) d.style.setProperty('--reading-size', fs+'px');
  var lh=s.getItem('dva.lead'); if(lh) d.style.setProperty('--reading-leading', lh);
  var w=s.getItem('dva.width'); if(w) d.style.setProperty('--reading-width', w);
  var ff=s.getItem('dva.font'); if(ff) d.style.setProperty('--reading-font', ff);
}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="vi" data-theme="paper" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/base16/gruvbox-dark-medium.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
