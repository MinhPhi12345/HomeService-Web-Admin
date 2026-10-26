import { useEffect, useState } from 'react';
import { getPendingTaskerVerifications, setTaskerVerification } from '../services/userService';
import type { PendingTaskerItem } from '../types';
import EmptyState from '../components/common/EmptyState';
import { useToast } from '../components/common/useToast';

// EP01 - US04: Xác thực hồ sơ Tasker
export default function TaskerVerificationPage() {
  const [items, setItems] = useState<PendingTaskerItem[]>([]);
  const toast = useToast();

  useEffect(() => {
    let ignore = false;
    getPendingTaskerVerifications()
      .then((data) => {
        if (!ignore) setItems(data);
      })
      .catch(() => {});

    return () => {
      ignore = true;
    };
  }, []);

  async function handleDecision(id: number, approve: boolean) {
    try {
      await setTaskerVerification(id, approve);
      toast.success(approve ? 'Đã duyệt hồ sơ Tasker.' : 'Đã từ chối hồ sơ Tasker.');
      const updated = await getPendingTaskerVerifications();
      setItems(updated);
    } catch {
      toast.error('Thao tác xét duyệt thất bại.');
    }
  }

  return (
    <div className="admin-page">
      <div className="card">
        {items.length === 0 ? (
          <EmptyState title="Không có hồ sơ nào đang chờ duyệt." />
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>CCCD</th>
                  <th>Kỹ năng</th>
                  <th>Khu vực</th>
                  <th style={{ textAlign: 'center' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr key={t.id}>
                    <td className="font-medium">{t.fullName}</td>
                    <td>{t.idCardNumber}</td>
                    <td>{t.skills ?? '—'}</td>
                    <td>{t.workingArea ?? '—'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="table-actions" style={{ justifyContent: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleDecision(t.id, true)}
                        >
                          Duyệt
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm text-danger"
                          onClick={() => handleDecision(t.id, false)}
                        >
                          Từ chối
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
