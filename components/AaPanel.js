'use client';

const FONTS = [
  { key: 'serif', label: 'Sách', val: "'Literata', Georgia, serif" },
  { key: 'news', label: 'Báo', val: "'Newsreader', Georgia, serif" },
  { key: 'sans', label: 'Sans', val: "'IBM Plex Sans', system-ui, sans-serif" },
];
const WIDTHS = [
  { key: 'hep', label: 'Hẹp', val: '40rem' },
  { key: 'vua', label: 'Vừa', val: '46rem' },
  { key: 'rong', label: 'Rộng', val: '54rem' },
];
const THEMES = [
  { key: 'paper', label: 'Giấy' },
  { key: 'sepia', label: 'Sepia' },
  { key: 'night', label: 'Đêm' },
  { key: 'mono', label: 'Trắng đen' },
];

export default function AaPanel({ prefs, apply, outline, onJump, onClose }) {
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  return (
    <div className="aa-pop" role="dialog" aria-label="Tuỳ chỉnh hiển thị">
      <div className="aa-grip" onClick={onClose} />
      <div className="aa-titlebar">
        <span>Hiển thị</span>
        <button className="aa-close" onClick={onClose} aria-label="Đóng">✕</button>
      </div>
      <div className="aa-row">
        <div className="aa-label">Nền trang</div>
        <div className="aa-themes">
          {THEMES.map((t) => (
            <button
              key={t.key}
              className={`aa-theme t-${t.key}`}
              data-active={prefs.theme === t.key}
              onClick={() => apply({ theme: t.key })}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="aa-row">
        <div className="aa-label">Cỡ chữ — {prefs.size}px</div>
        <div className="aa-stepper">
          <button onClick={() => apply({ size: clamp(prefs.size - 1, 15, 26) })} aria-label="Nhỏ hơn">A−</button>
          <span className="val">{prefs.size}px</span>
          <button onClick={() => apply({ size: clamp(prefs.size + 1, 15, 26) })} aria-label="Lớn hơn" style={{ fontSize: 20 }}>A+</button>
        </div>
      </div>

      <div className="aa-row">
        <div className="aa-label">Giãn dòng</div>
        <div className="aa-stepper">
          <button onClick={() => apply({ lead: clamp(+(prefs.lead - 0.1).toFixed(2), 1.4, 2.2) })}>−</button>
          <span className="val">{prefs.lead.toFixed(1)}</span>
          <button onClick={() => apply({ lead: clamp(+(prefs.lead + 0.1).toFixed(2), 1.4, 2.2) })}>+</button>
        </div>
      </div>

      <div className="aa-row">
        <div className="aa-label">Phông chữ</div>
        <div className="aa-seg">
          {FONTS.map((f) => (
            <button key={f.key} data-active={prefs.font === f.val} onClick={() => apply({ font: f.val })}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="aa-row">
        <div className="aa-label">Khổ trang</div>
        <div className="aa-seg">
          {WIDTHS.map((w) => (
            <button key={w.key} data-active={prefs.width === w.val} onClick={() => apply({ width: w.val })}>
              {w.label}
            </button>
          ))}
        </div>
      </div>

      <div className="aa-row">
        <div className="aa-label">Canh chữ</div>
        <div className="aa-seg">
          <button data-active={!prefs.justify} onClick={() => apply({ justify: false })}>Canh trái</button>
          <button data-active={prefs.justify} onClick={() => apply({ justify: true })}>Canh đều</button>
        </div>
      </div>

      {outline && outline.length > 0 && (
        <div className="aa-row">
          <div className="aa-label">Mục trong chương</div>
          <div className="aa-outline">
            {outline.map((o) => (
              <a key={o.id} href={`#${o.id}`} onClick={() => onJump && onJump()}>{o.text}</a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
