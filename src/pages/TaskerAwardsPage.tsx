import { useEffect, useMemo, useState } from 'react';
import {
  Award,
  CalendarCheck,
  CheckCircle2,
  Download,
  Gift,
  Loader2,
  Mail,
  Medal,
  PackageCheck,
  Pencil,
  RefreshCw,
  RotateCcw,
  Star,
  Trophy,
  UserX,
} from 'lucide-react';
import type { TaskerAward, TaskerAwardMonth } from '../types';
import { TaskerAwardStatus } from '../types';
import {
  approveAwardMonth,
  computeAwardMonth,
  excludeAward,
  exportAwardMonth,
  getAwardMonth,
  markGiftDelivered,
  restoreAward,
  sendGiftEmail,
  updateAwardReward,
} from '../services/rewardService';
import { useToast } from '../components/common/useToast';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import TableSkeleton from '../components/common/TableSkeleton';
import { formatDate, formatDateTime, formatVnd, getImageUrl } from '../utils/formatters';
import { getErrorMessage } from '../utils/errorHandler';
import { exportToExcel } from '../utils/excelExport';

/** Tháng trước theo giờ Việt Nam, dạng "2026-10" cho ô chọn tháng. */
function previousMonthValue(): string {
  const vn = new Date(Date.now() + 7 * 3600_000);
  const y = vn.getUTCFullYear();
  const m = vn.getUTCMonth(); // 0-based → tháng trước
  return m === 0 ? `${y - 1}-12` : `${y}-${String(m).padStart(2, '0')}`;
}

function currentMonthValue(): string {
  const vn = new Date(Date.now() + 7 * 3600_000);
  return `${vn.getUTCFullYear()}-${String(vn.getUTCMonth() + 1).padStart(2, '0')}`;
}

const pct = (v: number) => `${Math.round(v * 1000) / 10}%`;
const ratePct = (v?: number | null) => (v == null ? '—' : `${Math.round(v * 10000) / 100}%`);

function RankBadge({ rank, excluded }: { rank: number; excluded: boolean }) {
  if (excluded) return <span className="award-rank award-rank--out">—</span>;
  const cls = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : 'plain';
  return (
    <span className={`award-rank award-rank--${cls}`} title={`Hạng ${rank}`}>
      {rank <= 3 ? <Medal size={15} /> : null}
      {rank}
    </span>
  );
}

function RewardCell({ a, defaultRate }: { a: TaskerAward; defaultRate: number }) {
  if (a.status === TaskerAwardStatus.Excluded) return <em className="text-muted">Không nhận thưởng</em>;
  const parts: React.ReactNode[] = [];
  if (a.bonusAmount > 0) parts.push(<span key="b" className="award-chip award-chip--money">{formatVnd(a.bonusAmount)}</span>);
  if (a.preferentialRate != null)
    parts.push(
      <span key="r" className="award-chip award-chip--rate" title={`Mức chung ${ratePct(defaultRate)}`}>
        Chiết khấu {ratePct(a.preferentialRate)}
      </span>,
    );
  if (a.hasGift)
    parts.push(
      <span key="g" className="award-chip award-chip--gift">
        <Gift size={12} /> {a.giftDescription}
      </span>,
    );
  parts.push(
    <span key="h" className="award-chip award-chip--badge">
      <Award size={12} /> Huy hiệu
    </span>,
  );
  return <div className="award-chips">{parts}</div>;
}

function StatusCell({ a }: { a: TaskerAward }) {
  if (a.status === TaskerAwardStatus.Excluded)
    return (
      <div>
        <Badge variant="neutral">Đã loại</Badge>
        {a.excludeReason && <div className="cell-sub award-reason">{a.excludeReason}</div>}
      </div>
    );
  if (a.status === TaskerAwardStatus.Proposed) return <Badge variant="warning">Chờ duyệt</Badge>;
  return (
    <div className="award-steps">
      <Badge variant="success">Đã duyệt</Badge>
      {a.bonusPaidAt && <span className="cell-sub">✓ Đã cộng tiền vào ví</span>}
      {a.preferentialTo && <span className="cell-sub">✓ Ưu đãi đến {formatDate(new Date(new Date(a.preferentialTo).getTime() - 60_000).toISOString())}</span>}
      {a.hasGift &&
        (a.giftDeliveredAt ? (
          <span className="cell-sub">✓ Đã nhận quà {formatDate(a.giftDeliveredAt)}</span>
        ) : a.giftEmailSentAt ? (
          <span className="cell-sub">✓ Đã gửi email mời nhận quà</span>
        ) : (
          <span className="cell-sub award-todo">Chưa gửi email mời nhận quà</span>
        ))}
    </div>
  );
}

interface RewardForm {
  bonus: string;
  rate: string; // "" = không có, ví dụ "10"
  hasGift: boolean;
  gift: string;
}

export default function TaskerAwardsPage() {
  const toast = useToast();
  const [monthValue, setMonthValue] = useState(previousMonthValue());
  const [data, setData] = useState<TaskerAwardMonth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);

  const [confirmApprove, setConfirmApprove] = useState(false);
  const [editing, setEditing] = useState<TaskerAward | null>(null);
  const [form, setForm] = useState<RewardForm>({ bonus: '0', rate: '', hasGift: false, gift: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [excluding, setExcluding] = useState<TaskerAward | null>(null);
  const [reason, setReason] = useState('');
  const [inviting, setInviting] = useState<TaskerAward | null>(null);
  const [invite, setInvite] = useState({ time: '', place: '', note: '' });
  const [delivering, setDelivering] = useState<TaskerAward | null>(null);

  const [year, month] = monthValue.split('-').map(Number);

  useEffect(() => {
    let ignore = false;
    getAwardMonth(year, month)
      .then((d) => {
        if (!ignore) {
          setData(d);
          setError(null);
        }
      })
      .catch((err) => !ignore && setError(getErrorMessage(err)))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [year, month, reload]);

  const refresh = () => setReload((x) => x + 1);
  const label = `${String(month).padStart(2, '0')}/${year}`;
  const approved = data?.state === 'Approved';
  const eligible = useMemo(() => (data?.items ?? []).filter((i) => i.status !== TaskerAwardStatus.Excluded), [data]);
  const totalBonus = eligible.reduce((s, i) => s + i.bonusAmount, 0);

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try {
      await fn();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const handleCompute = () =>
    run('compute', async () => {
      const d = await computeAwardMonth(year, month);
      setData(d);
      toast.success(
        d.items.length > 0
          ? `Đã chốt bảng xếp hạng tháng ${label}: ${d.items.length} Tasker đủ điều kiện.`
          : `Tháng ${label} chưa có Tasker nào đủ điều kiện xét thưởng.`,
      );
    });

  const handleApprove = () =>
    run('approve', async () => {
      const d = await approveAwardMonth(year, month);
      setData(d);
      setConfirmApprove(false);
      toast.success(`Đã duyệt và trao thưởng Tasker xuất sắc tháng ${label}. Các Tasker đã nhận thông báo.`);
    });

  const handleExport = () =>
    run('export', async () => {
      const d = await exportAwardMonth(year, month);
      await exportToExcel<TaskerAward>({
        fileNamePrefix: `tasker-xuat-sac-${year}-${String(month).padStart(2, '0')}`,
        sheetName: `Tasker xuất sắc ${label}`.replace('/', '-'),
        columns: [
          { header: 'Hạng', key: 'rank', width: 8, getValue: (a) => (a.status === TaskerAwardStatus.Excluded ? 'Loại' : a.rank) },
          { header: 'Họ tên', key: 'taskerName', width: 26 },
          { header: 'Email', key: 'email', width: 30, getValue: (a) => a.email ?? '' },
          { header: 'SĐT', key: 'phoneNumber', width: 14, getValue: (a) => a.phoneNumber ?? '' },
          { header: 'Khu vực', key: 'workingArea', width: 20, getValue: (a) => a.workingArea ?? '' },
          { header: 'Đơn hoàn tất', key: 'completedBookings', width: 12, format: 'number' },
          { header: 'Điểm TB', key: 'ratingAverage', width: 10, getValue: (a) => a.ratingAverage.toFixed(2) },
          { header: 'Số đánh giá', key: 'reviewCount', width: 12, format: 'number' },
          { header: 'Tỷ lệ nhận đơn', key: 'acceptanceRate', width: 14, getValue: (a) => pct(a.acceptanceRate) },
          { header: 'Tỷ lệ đúng giờ', key: 'onTimeRate', width: 14, getValue: (a) => pct(a.onTimeRate) },
          { header: 'Số khiếu nại', key: 'disputeCount', width: 12, format: 'number' },
          { header: 'Điểm tổng', key: 'score', width: 10, getValue: (a) => a.score.toFixed(2) },
          { header: 'Tiền thưởng', key: 'bonusAmount', width: 14, format: 'currency' },
          { header: 'Chiết khấu ưu đãi', key: 'preferentialRate', width: 16, getValue: (a) => ratePct(a.preferentialRate) },
          { header: 'Quà', key: 'giftDescription', width: 24, getValue: (a) => (a.hasGift ? a.giftDescription ?? '' : '') },
          {
            header: 'Trạng thái',
            key: 'status',
            width: 26,
            getValue: (a) =>
              a.status === TaskerAwardStatus.Excluded
                ? `Đã loại: ${a.excludeReason ?? ''}`
                : a.status === TaskerAwardStatus.Proposed
                  ? 'Chờ duyệt'
                  : a.giftDeliveredAt
                    ? 'Đã nhận quà'
                    : a.giftEmailSentAt
                      ? 'Đã gửi email'
                      : a.bonusPaidAt
                        ? 'Đã cộng tiền'
                        : 'Đã duyệt',
          },
        ],
        data: d.items,
      });
      toast.success(`Đã xuất ${d.items.length} Tasker ra Excel.`);
    });

  const openEdit = (a: TaskerAward) => {
    setForm({
      bonus: String(a.bonusAmount),
      rate: a.preferentialRate != null ? String(Math.round(a.preferentialRate * 10000) / 100) : '',
      hasGift: a.hasGift,
      gift: a.giftDescription ?? 'Quà tặng Tasker xuất sắc tháng',
    });
    setFormError(null);
    setEditing(a);
  };

  const saveEdit = () => {
    if (!editing || !data) return;
    const bonus = Number(form.bonus || 0);
    if (!Number.isInteger(bonus) || bonus < 0) return setFormError('Tiền thưởng phải là số nguyên không âm.');
    const ratePercent = form.rate.trim() === '' ? null : Number(form.rate);
    if (ratePercent != null && (Number.isNaN(ratePercent) || ratePercent <= 0 || ratePercent >= data.defaultCommissionRate * 100))
      return setFormError(`Chiết khấu ưu đãi phải lớn hơn 0% và nhỏ hơn mức chung ${ratePct(data.defaultCommissionRate)}.`);
    if (form.hasGift && !form.gift.trim()) return setFormError('Vui lòng nhập tên quà tặng.');
    void run('edit', async () => {
      await updateAwardReward(editing.id, {
        bonusAmount: bonus,
        preferentialRate: ratePercent == null ? null : ratePercent / 100,
        hasGift: form.hasGift,
        giftDescription: form.hasGift ? form.gift.trim() : null,
      });
      setEditing(null);
      toast.success(`Đã cập nhật phần thưởng của ${editing.taskerName}.`);
      refresh();
    });
  };

  const doExclude = () => {
    if (!excluding) return;
    if (reason.trim().length < 10) return setFormError('Lý do loại cần ít nhất 10 ký tự.');
    void run('exclude', async () => {
      await excludeAward(excluding.id, reason.trim());
      setExcluding(null);
      toast.success(`Đã loại ${excluding.taskerName}. Bảng xếp hạng đã được đánh lại hạng.`);
      refresh();
    });
  };

  const doInvite = () => {
    if (!inviting) return;
    if (invite.time.trim().length < 3) return setFormError('Vui lòng nhập thời gian nhận quà.');
    if (invite.place.trim().length < 5) return setFormError('Vui lòng nhập địa điểm nhận quà.');
    void run('invite', async () => {
      await sendGiftEmail(inviting.id, { time: invite.time.trim(), place: invite.place.trim(), note: invite.note.trim() || undefined });
      setInviting(null);
      toast.success(`Đã gửi email mời nhận quà tới ${inviting.email ?? inviting.taskerName}.`);
      refresh();
    });
  };

  const canCompute = !approved && (data?.monthEnded ?? false);
  const canApprove = data?.state === 'Proposed' && eligible.length > 0;

  return (
    <div className="admin-page">
      <div className="list-toolbar">
        <div className="award-month-picker">
          <CalendarCheck size={18} />
          <label htmlFor="award-month">Tháng xét thưởng</label>
          <input
            id="award-month"
            type="month"
            className="form-input"
            value={monthValue}
            max={currentMonthValue()}
            onChange={(e) => {
              if (!e.target.value) return;
              setLoading(true);
              setMonthValue(e.target.value);
            }}
          />
          {data && (
            <Badge variant={approved ? 'success' : data.state === 'Proposed' ? 'warning' : 'neutral'}>
              {approved ? 'Đã duyệt' : data.state === 'Proposed' ? 'Chờ duyệt' : 'Chưa chốt'}
            </Badge>
          )}
        </div>
        <div className="toolbar-actions">
          {canCompute && (
            <Button
              variant="outline"
              icon={<RefreshCw size={16} />}
              loading={busy === 'compute'}
              onClick={handleCompute}
            >
              {data?.state === 'Proposed' ? 'Tính lại' : 'Chốt bảng xếp hạng'}
            </Button>
          )}
          {canApprove && (
            <Button icon={<CheckCircle2 size={16} />} onClick={() => setConfirmApprove(true)}>
              Duyệt & trao thưởng
            </Button>
          )}
          <button
            type="button"
            className="btn-excel"
            onClick={handleExport}
            disabled={busy === 'export' || !data || data.items.length === 0}
          >
            {busy === 'export' ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            <span>{busy === 'export' ? 'Đang xuất...' : 'Xuất Excel'}</span>
          </button>
        </div>
      </div>

      {data && (data.computedAt || data.approvedAt) && (
        <div className="award-meta">
          {data.computedAt && <span>Chốt lúc {formatDateTime(data.computedAt)}</span>}
          {data.approvedAt && (
            <span>
              · Duyệt lúc {formatDateTime(data.approvedAt)}
              {data.approvedByName ? ` bởi ${data.approvedByName}` : ''}
            </span>
          )}
          {data.state === 'Proposed' && (
            <span>
              · Tổng thưởng dự kiến <b>{formatVnd(totalBonus)}</b> cho {eligible.length} Tasker
            </span>
          )}
        </div>
      )}

      {error && !loading ? (
        <ErrorState message={error} onRetry={() => { setLoading(true); refresh(); }} />
      ) : loading ? (
        <div className="card">
          <TableSkeleton rows={5} columns={6} />
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="card">
          <EmptyState
            title={
              data?.state === 'NotComputed'
                ? data.monthEnded
                  ? `Chưa chốt bảng xếp hạng tháng ${label}`
                  : `Tháng ${label} chưa kết thúc`
                : `Tháng ${label} không có Tasker đủ điều kiện`
            }
            description={
              data?.state === 'NotComputed' && data.monthEnded
                ? 'Hệ thống tự chốt vào đầu tháng sau. Bạn cũng có thể bấm "Chốt bảng xếp hạng" để chốt ngay.'
                : 'Điều kiện: tối thiểu 10 đơn hoàn tất và 5 đánh giá trong tháng, không có lần không đến, không thua khiếu nại.'
            }
          />
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="admin-table award-table">
              <thead>
                <tr>
                  <th style={{ width: 64, textAlign: 'center' }}>Hạng</th>
                  <th>Tasker</th>
                  <th style={{ textAlign: 'center' }}>Điểm</th>
                  <th style={{ minWidth: 220 }}>Chỉ số tháng</th>
                  <th style={{ minWidth: 200 }}>Phần thưởng</th>
                  <th style={{ minWidth: 170 }}>Trạng thái</th>
                  <th style={{ textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((a) => {
                  const excluded = a.status === TaskerAwardStatus.Excluded;
                  return (
                    <tr key={a.id} className={excluded ? 'award-row--out' : a.rank === 1 ? 'award-row--top' : ''}>
                      <td style={{ textAlign: 'center' }}>
                        <RankBadge rank={a.rank} excluded={excluded} />
                      </td>
                      <td>
                        <div className="award-person">
                          {a.avatarUrl ? (
                            <img src={getImageUrl(a.avatarUrl)} alt="" className="award-avatar" />
                          ) : (
                            <span className="award-avatar award-avatar--empty">{a.taskerName.trim().split(/\s+/).pop()?.charAt(0)}</span>
                          )}
                          <div>
                            <div className="font-medium">{a.taskerName}</div>
                            <div className="cell-sub">{a.workingArea ?? 'Chưa có khu vực'}</div>
                            <div className="cell-sub">{a.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="award-score">{a.score.toFixed(1)}</span>
                      </td>
                      <td>
                        <div className="award-metrics">
                          <span><b>{a.completedBookings}</b> đơn</span>
                          <span>
                            <Star size={12} fill="#FFB938" color="#FFB938" /> <b>{a.ratingAverage.toFixed(2)}</b> ({a.reviewCount})
                          </span>
                          <span>Nhận lời mời <b>{pct(a.acceptanceRate)}</b></span>
                          <span>Đúng giờ <b>{pct(a.onTimeRate)}</b></span>
                          <span>Khiếu nại <b>{a.disputeCount}</b></span>
                        </div>
                      </td>
                      <td>
                        <RewardCell a={a} defaultRate={data.defaultCommissionRate} />
                        {a.rewardCustomized && !approved && <div className="cell-sub">Đã chỉnh tay</div>}
                      </td>
                      <td>
                        <StatusCell a={a} />
                      </td>
                      <td>
                        <div className="action-row action-row--stack">
                          {!approved && !excluded && (
                            <>
                              <button type="button" className="btn-action-pill btn-view" onClick={() => openEdit(a)}>
                                <Pencil size={14} /> Chỉnh thưởng
                              </button>
                              <button
                                type="button"
                                className="btn-action-pill btn-lock"
                                onClick={() => {
                                  setReason('');
                                  setFormError(null);
                                  setExcluding(a);
                                }}
                              >
                                <UserX size={14} /> Loại
                              </button>
                            </>
                          )}
                          {!approved && excluded && (
                            <button
                              type="button"
                              className="btn-action-pill btn-unlock"
                              disabled={busy === `restore-${a.id}`}
                              onClick={() =>
                                run(`restore-${a.id}`, async () => {
                                  await restoreAward(a.id);
                                  toast.success(`Đã khôi phục ${a.taskerName} vào bảng xếp hạng.`);
                                  refresh();
                                })
                              }
                            >
                              <RotateCcw size={14} /> Khôi phục
                            </button>
                          )}
                          {approved && a.hasGift && !a.giftDeliveredAt && (
                            <>
                              <button
                                type="button"
                                className="btn-action-pill btn-view"
                                onClick={() => {
                                  setInvite({ time: '', place: '', note: '' });
                                  setFormError(null);
                                  setInviting(a);
                                }}
                              >
                                <Mail size={14} /> {a.giftEmailSentAt ? 'Gửi lại email' : 'Gửi email mời nhận quà'}
                              </button>
                              <button type="button" className="btn-action-pill btn-unlock" onClick={() => setDelivering(a)}>
                                <PackageCheck size={14} /> Đã trao quà
                              </button>
                            </>
                          )}
                          {approved && (!a.hasGift || a.giftDeliveredAt) && <span className="cell-sub">—</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="admin-notice-box">
        <span>
          <Trophy size={15} style={{ verticalAlign: '-2px' }} /> Điều kiện xét: tối thiểu 10 đơn hoàn tất và 5 đánh giá trong tháng
          (giờ Việt Nam), không có lần không đến, không thua khiếu nại. Điểm tổng (thang 100) = đánh giá 40% (trung bình có trọng số)
          + số đơn hoàn tất 25% + tỷ lệ nhận lời mời 15% + tỷ lệ đúng giờ 10% + không bị khiếu nại 10%. Thưởng mặc định: Top 1 nhận
          1.000.000 đ, chiết khấu 10% tháng sau và quà; Top 2–3 nhận 500.000 đ và chiết khấu 15%; Top 4–10 nhận huy hiệu. Loại một
          Tasker thì những người sau được đôn hạng. Khi duyệt, tiền thưởng được cộng vào ví, chiết khấu ưu đãi áp cho đơn nhận đến
          hết tháng sau, huy hiệu hiện trên hồ sơ và mọi thao tác được ghi vào Nhật ký kiểm toán.
        </span>
      </div>

      <ConfirmDialog
        isOpen={confirmApprove}
        title={`Duyệt Tasker xuất sắc tháng ${label}`}
        message={`Sau khi duyệt: ${eligible.length} Tasker nhận huy hiệu, tổng ${formatVnd(totalBonus)} tiền thưởng được cộng vào ví và chiết khấu ưu đãi được áp dụng. Mỗi tháng chỉ duyệt một lần và không thể hoàn tác.`}
        confirmText="Duyệt & trao thưởng"
        isLoading={busy === 'approve'}
        onConfirm={handleApprove}
        onCancel={() => setConfirmApprove(false)}
      />

      <ConfirmDialog
        isOpen={Boolean(delivering)}
        title="Xác nhận đã trao quà"
        message={`Xác nhận ${delivering?.taskerName} đã nhận "${delivering?.giftDescription}"?`}
        confirmText="Đã trao quà"
        isLoading={busy === 'deliver'}
        onConfirm={() =>
          delivering &&
          run('deliver', async () => {
            await markGiftDelivered(delivering.id);
            toast.success(`Đã ghi nhận ${delivering.taskerName} nhận quà.`);
            setDelivering(null);
            refresh();
          })
        }
        onCancel={() => setDelivering(null)}
      />

      <Modal
        isOpen={Boolean(editing)}
        onClose={() => busy !== 'edit' && setEditing(null)}
        title={`Phần thưởng của ${editing?.taskerName ?? ''} (hạng ${editing?.rank ?? ''})`}
        maxWidth={520}
        footer={
          <div className="confirm-dialog-actions">
            <Button variant="outline" onClick={() => setEditing(null)} disabled={busy === 'edit'}>Hủy</Button>
            <Button onClick={saveEdit} loading={busy === 'edit'}>Lưu phần thưởng</Button>
          </div>
        }
      >
        <div className="form-group">
          <label className="form-label" htmlFor="aw-bonus">Tiền thưởng vào ví (đ)</label>
          <input id="aw-bonus" className="form-input" inputMode="numeric" value={form.bonus}
            onChange={(e) => setForm({ ...form, bonus: e.target.value.replace(/\D/g, '') })} />
          <span className="cell-sub">Nhập 0 nếu không thưởng tiền. Hiện là {formatVnd(Number(form.bonus || 0))}.</span>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="aw-rate">Chiết khấu ưu đãi tháng sau (%)</label>
          <input id="aw-rate" className="form-input" inputMode="decimal" placeholder="Để trống nếu không ưu đãi" value={form.rate}
            onChange={(e) => setForm({ ...form, rate: e.target.value.replace(/[^\d.]/g, '') })} />
          <span className="cell-sub">Mức chung hiện tại {ratePct(data?.defaultCommissionRate)}; mức ưu đãi phải thấp hơn.</span>
        </div>
        <label className="award-check">
          <input type="checkbox" checked={form.hasGift} onChange={(e) => setForm({ ...form, hasGift: e.target.checked })} />
          Tặng quà hiện vật (mời đến công ty nhận)
        </label>
        {form.hasGift && (
          <div className="form-group">
            <label className="form-label" htmlFor="aw-gift">Tên quà</label>
            <input id="aw-gift" className="form-input" maxLength={200} value={form.gift}
              onChange={(e) => setForm({ ...form, gift: e.target.value })} />
          </div>
        )}
        {formError && <div className="form-error-box">{formError}</div>}
      </Modal>

      <Modal
        isOpen={Boolean(excluding)}
        onClose={() => busy !== 'exclude' && setExcluding(null)}
        title={`Loại ${excluding?.taskerName ?? ''} khỏi bảng xếp hạng`}
        maxWidth={520}
        footer={
          <div className="confirm-dialog-actions">
            <Button variant="outline" onClick={() => setExcluding(null)} disabled={busy === 'exclude'}>Hủy</Button>
            <Button variant="danger" onClick={doExclude} loading={busy === 'exclude'}>Loại khỏi danh sách</Button>
          </div>
        }
      >
        <div className="form-group">
          <label className="form-label" htmlFor="aw-reason">Lý do loại (10–500 ký tự)</label>
          <textarea id="aw-reason" className="form-input form-textarea" rows={4} maxLength={500} value={reason}
            placeholder="Ví dụ: đang có khiếu nại chưa xử lý xong, nghi gian lận đánh giá…"
            onChange={(e) => { setReason(e.target.value); setFormError(null); }} />
          <span className="cell-sub">{reason.trim().length}/500 ký tự. Những Tasker phía sau sẽ được đôn hạng.</span>
        </div>
        {formError && <div className="form-error-box">{formError}</div>}
      </Modal>

      <Modal
        isOpen={Boolean(inviting)}
        onClose={() => busy !== 'invite' && setInviting(null)}
        title="Gửi email mời nhận quà"
        maxWidth={560}
        footer={
          <div className="confirm-dialog-actions">
            <Button variant="outline" onClick={() => setInviting(null)} disabled={busy === 'invite'}>Hủy</Button>
            <Button icon={<Mail size={16} />} onClick={doInvite} loading={busy === 'invite'}>Gửi email</Button>
          </div>
        }
      >
        <p className="award-invite-to">
          Gửi tới <b>{inviting?.taskerName}</b> ({inviting?.email}) – quà: <b>{inviting?.giftDescription}</b>. Tasker cũng nhận thông báo trong ứng dụng.
        </p>
        <div className="form-group">
          <label className="form-label" htmlFor="aw-time">Thời gian nhận quà</label>
          <input id="aw-time" className="form-input" maxLength={200} placeholder="Ví dụ: 9:00 – 11:00, thứ Bảy 14/11/2026" value={invite.time}
            onChange={(e) => { setInvite({ ...invite, time: e.target.value }); setFormError(null); }} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="aw-place">Địa điểm</label>
          <input id="aw-place" className="form-input" maxLength={300} placeholder="Ví dụ: Văn phòng HomeService, 806 Lê Quang Đạo, TP. Hồ Chí Minh"
            value={invite.place} onChange={(e) => { setInvite({ ...invite, place: e.target.value }); setFormError(null); }} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="aw-note">Ghi chú (không bắt buộc)</label>
          <textarea id="aw-note" className="form-input form-textarea" rows={3} maxLength={500} value={invite.note}
            placeholder="Ví dụ: Gặp chị Trân ở quầy lễ tân, gọi 0909 000 001 khi đến"
            onChange={(e) => setInvite({ ...invite, note: e.target.value })} />
        </div>
        <span className="cell-sub">Email tự nhắc Tasker mang theo CCCD để đối chiếu khi nhận quà.</span>
        {formError && <div className="form-error-box">{formError}</div>}
      </Modal>
    </div>
  );
}
