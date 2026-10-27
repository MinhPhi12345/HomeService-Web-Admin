import { useState } from 'react';
import { ImageOff, X } from 'lucide-react';
import { getImageUrl } from '../../utils/formatters';

interface PhotoGalleryProps {
  urls: (string | null | undefined)[];
  labels?: string[];
  emptyText?: string;
}

/** Ảnh minh chứng: thumbnail, bấm để phóng to (ảnh lưu trên server /uploads). */
export default function PhotoGallery({ urls, labels, emptyText = 'Không có ảnh' }: PhotoGalleryProps) {
  const [zoom, setZoom] = useState<string | null>(null);
  const items = urls.map((u, i) => ({ url: u ? getImageUrl(u) : '', label: labels?.[i] })).filter((x) => x.url);

  if (items.length === 0) {
    return (
      <div className="photo-empty">
        <ImageOff size={16} />
        <span>{emptyText}</span>
      </div>
    );
  }

  return (
    <>
      <div className="photo-grid">
        {items.map((it, i) => (
          <button key={`${it.url}-${i}`} type="button" className="photo-thumb" onClick={() => setZoom(it.url)}>
            <img src={it.url} alt={it.label ?? `Ảnh ${i + 1}`} loading="lazy" />
            {it.label && <span className="photo-label">{it.label}</span>}
          </button>
        ))}
      </div>
      {zoom && (
        <div className="photo-lightbox" onClick={() => setZoom(null)} role="dialog" aria-modal="true">
          <button type="button" className="photo-lightbox-close" aria-label="Đóng ảnh">
            <X size={20} />
          </button>
          <img src={zoom} alt="Ảnh phóng to" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}
