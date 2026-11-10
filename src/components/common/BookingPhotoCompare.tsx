import type { BookingItemDto, BookingPhotoDto } from '../../types';
import PhotoGallery from './PhotoGallery';

interface BookingPhotoCompareProps {
  items: BookingItemDto[];
  photos: BookingPhotoDto[];
}

/** SRS v1.8 – ảnh trước (lúc Bắt đầu) và sau (lúc Hoàn thành) đặt cạnh nhau, theo từng hạng mục nếu đơn có hạng mục. */
export default function BookingPhotoCompare({ items, photos }: BookingPhotoCompareProps) {
  const pick = (stage: 0 | 1, itemNo: number | null) =>
    photos.filter((p) => p.stage === stage && (itemNo === null ? true : p.itemNo === itemNo));
  const labels = (list: BookingPhotoDto[]) => list.map((p) => p.note ?? '');

  if (items.length === 0) {
    const before = pick(0, null);
    const after = pick(1, null);
    return (
      <div className="photo-compare">
        <div className="photo-compare-row">
          <div className="photo-compare-col">
            <span className="photo-compare-tag">Trước – lúc bắt đầu</span>
            <PhotoGallery urls={before.map((p) => p.url)} labels={labels(before)} emptyText="Chưa có ảnh" />
          </div>
          <div className="photo-compare-col">
            <span className="photo-compare-tag photo-compare-tag--after">Sau – lúc hoàn thành</span>
            <PhotoGallery urls={after.map((p) => p.url)} labels={labels(after)} emptyText="Chưa có ảnh" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="photo-compare">
      {items.map((it) => {
        const before = pick(0, it.itemNo);
        const after = pick(1, it.itemNo);
        return (
          <div key={it.itemNo} className="photo-compare-item">
            <div className="photo-compare-title">
              <span className="photo-compare-no">{it.itemNo}</span> {it.description}
            </div>
            <div className="photo-compare-row">
              <div className="photo-compare-col">
                <span className="photo-compare-tag">Trước</span>
                <PhotoGallery urls={before.map((p) => p.url)} labels={labels(before)} emptyText="Chưa có ảnh" />
              </div>
              <div className="photo-compare-col">
                <span className="photo-compare-tag photo-compare-tag--after">Sau</span>
                <PhotoGallery urls={after.map((p) => p.url)} labels={labels(after)} emptyText="Chưa có ảnh" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
