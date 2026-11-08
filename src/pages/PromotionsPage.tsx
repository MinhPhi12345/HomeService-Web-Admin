import { useEffect, useMemo, useState } from 'react';
import { BadgePercent, CirclePause, CirclePlay, CircleStop, Gift, Pencil, Plus, Save, Ticket, Wallet } from 'lucide-react';
import type {
  GiftRule,
  PromotionSummary,
  SaveVoucherRequest,
  ServiceCategoryResponse,
  VoucherAdmin,
  VoucherStatus,
} from '../types';
import { VoucherAudience, VoucherDiscountType, VoucherSource } from '../types';
import {
  changeVoucherStatus,
  createVoucher,
  getGiftRules,
  getPromotionSummary,
  getVouchers,
  saveGiftRule,
  updateVoucher,
} from '../services/rewardService';
import { getServiceCategories } from '../services/serviceCatalogService';
import { useToast } from '../components/common/useToast';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Badge, { type BadgeVariant } from '../components/common/Badge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import TableSkeleton from '../components/common/TableSkeleton';
import { formatDateTime, formatVnd } from '../utils/formatters';
import { getErrorMessage } from '../utils/errorHandler';

const STATUS_META: Record<VoucherStatus, { label: string; variant: BadgeVariant }> = {
  Active: { label: 'Đang chạy', variant: 'success' },
  Scheduled: { label: 'Sắp diễn ra', variant: 'sky' },
  Paused: { label: 'Tạm dừng', variant: 'warning' },
  SoldOut: { label: 'Hết lượt', variant: 'peach' },
  Ended: { label: 'Đã kết thúc', variant: 'neutral' },
};

function discountText(type: number, value: number, max?: number | null) {
  return type === VoucherDiscountType.Percent
    ? `Giảm ${value}%${max ? `, tối đa ${formatVnd(max)}` : ''}`
    : `Giảm ${formatVnd(value)}`;
}

/** ISO UTC → giá trị cho ô datetime-local (giờ máy người dùng). */
function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface VoucherForm {
  code: string;
  name: string;
  description: string;
  discountType: number;
  discountValue: string;
  maxDiscount: string;
  minOrderValue: string;
  serviceCategoryIds: number[];
  startsAt: string;
  endsAt: string;
  totalLimit: string;
  perCustomerLimit: string;
  audience: number;
  isPublic: boolean;
}

function emptyForm(): VoucherForm {
  const now = new Date();
  const end = new Date(now.getTime() + 30 * 86400_000);
  return {
    code: '',
    name: '',
    description: '',
    discountType: VoucherDiscountType.Percent,
    discountValue: '10',
    maxDiscount: '30000',
    minOrderValue: '100000',
    serviceCategoryIds: [],
    startsAt: toLocalInput(now.toISOString()),
    endsAt: toLocalInput(end.toISOString()),
    totalLimit: '100',
    perCustomerLimit: '1',
    audience: VoucherAudience.AllCustomers,
    isPublic: true,
  };
}

const digits = (v: string) => v.replace(/\D/g, '');

export default function PromotionsPage() {
  const toast = useToast();
  const [tab, setTab] = useState<'vouchers' | 'gifts'>('vouchers');
  const [vouchers, setVouchers] = useState<VoucherAdmin[]>([]);
  const [summary, setSummary] = useState<PromotionSummary | null>(null);
  const [rules, setRules] = useState<GiftRule[]>([]);
  const [services, setServices] = useState<ServiceCategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [editing, setEditing] = useState<VoucherAdmin | 'new' | null>(null);
  const [form, setForm] = useState<VoucherForm>(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusAction, setStatusAction] = useState<{ v: VoucherAdmin; action: 'pause' | 'resume' | 'end' } | null>(null);
  const [ruleDrafts, setRuleDrafts] = useState<Record<number, GiftRule>>({});
  const [savingRule, setSavingRule] = useState<number | null>(null);

  useEffect(() => {
    let ignore = false;
    Promise.all([getVouchers(), getPromotionSummary(), getGiftRules(), getServiceCategories()])
      .then(([v, s, r, svc]) => {
        if (ignore) return;
        setVouchers(v);
        setSummary(s);
        setRules(r);
        setRuleDrafts(Object.fromEntries(r.map((x) => [x.kind, { ...x }])));
        setServices(svc);
        setError(null);
      })
      .catch((err) => !ignore && setError(getErrorMessage(err)))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [reload]);

  const refresh = () => setReload((x) => x + 1);
  const serviceName = useMemo(() => Object.fromEntries(services.map((s) => [s.id, s.name])), [services]);

  const openNew = () => {
    setForm(emptyForm());
    setFormError(null);
    setEditing('new');
  };

  const openEdit = (v: VoucherAdmin) => {
    setForm({
      code: v.code,
      name: v.name,
      description: v.description ?? '',
      discountType: v.discountType,
      discountValue: String(v.discountValue),
      maxDiscount: v.maxDiscount != null ? String(v.maxDiscount) : '',
      minOrderValue: String(v.minOrderValue),
      serviceCategoryIds: v.serviceCategoryIds,
      startsAt: toLocalInput(v.startsAt),
      endsAt: toLocalInput(v.endsAt),
      totalLimit: v.totalLimit != null ? String(v.totalLimit) : '',
      perCustomerLimit: String(v.perCustomerLimit),
      audience: v.audience,
      isPublic: v.isPublic,
    });
    setFormError(null);
    setEditing(v);
  };

  const submit = async () => {
    const f = form;
    const code = f.code.trim().toUpperCase();
    if (!/^[A-Z0-9-]{3,30}$/.test(code)) return setFormError('Mã chỉ gồm chữ không dấu, số, gạch ngang (3–30 ký tự).');
    if (f.name.trim().length < 3) return setFormError('Tên chương trình từ 3 đến 100 ký tự.');
    const value = Number(f.discountValue || 0);
    if (value <= 0) return setFormError('Giá trị giảm không hợp lệ.');
    if (f.discountType === VoucherDiscountType.Percent && value > 100) return setFormError('Giảm theo % chỉ từ 1 đến 100.');
    if (f.discountType === VoucherDiscountType.Percent && !Number(f.maxDiscount))
      return setFormError('Vui lòng nhập mức giảm tối đa cho mã giảm theo %.');
    if (!f.startsAt || !f.endsAt || new Date(f.endsAt) <= new Date(f.startsAt))
      return setFormError('Thời gian kết thúc phải sau thời gian bắt đầu.');
    const body: SaveVoucherRequest = {
      code,
      name: f.name.trim(),
      description: f.description.trim() || null,
      discountType: f.discountType as SaveVoucherRequest['discountType'],
      discountValue: value,
      maxDiscount: f.discountType === VoucherDiscountType.Percent ? Number(f.maxDiscount) : null,
      minOrderValue: Number(f.minOrderValue || 0),
      serviceCategoryIds: f.serviceCategoryIds,
      startsAt: new Date(f.startsAt).toISOString(),
      endsAt: new Date(f.endsAt).toISOString(),
      totalLimit: f.totalLimit ? Number(f.totalLimit) : null,
      perCustomerLimit: Math.max(1, Number(f.perCustomerLimit || 1)),
      audience: f.audience as SaveVoucherRequest['audience'],
      isPublic: f.isPublic,
    };
    setSaving(true);
    try {
      if (editing === 'new') await createVoucher(body);
      else if (editing) await updateVoucher(editing.id, body);
      toast.success(editing === 'new' ? `Đã tạo mã ${code}.` : `Đã cập nhật mã ${code}.`);
      setEditing(null);
      refresh();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const doStatus = async () => {
    if (!statusAction) return;
    setSaving(true);
    try {
      await changeVoucherStatus(statusAction.v.id, statusAction.action);
      toast.success(
        statusAction.action === 'pause'
          ? `Đã tạm dừng mã ${statusAction.v.code}.`
          : statusAction.action === 'resume'
            ? `Mã ${statusAction.v.code} đã chạy lại.`
            : `Đã kết thúc chương trình ${statusAction.v.code}.`,
      );
      setStatusAction(null);
      refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const saveRule = async (kind: number) => {
    const r = ruleDrafts[kind];
    if (!r) return;
    if (r.discountValue <= 0) return toast.error('Giá trị giảm không hợp lệ.');
    if (r.discountType === VoucherDiscountType.Percent && (r.discountValue > 100 || !r.maxDiscount))
      return toast.error('Quà giảm theo % cần giá trị 1–100 và mức giảm tối đa.');
    if (kind === VoucherSource.Loyalty && r.everyBookings < 1) return toast.error('Số đơn để nhận quà từ 1 đến 100.');
    setSavingRule(kind);
    try {
      const saved = await saveGiftRule(r.kind, {
        isEnabled: r.isEnabled,
        discountType: r.discountType,
        discountValue: r.discountValue,
        maxDiscount: r.discountType === VoucherDiscountType.Percent ? r.maxDiscount : null,
        minOrderValue: r.minOrderValue,
        validDays: r.validDays,
        everyBookings: r.everyBookings,
      });
      setRules((prev) => prev.map((x) => (x.kind === saved.kind ? saved : x)));
      setRuleDrafts((prev) => ({ ...prev, [saved.kind]: { ...saved } }));
      toast.success(`Đã lưu cài đặt ${saved.name.toLowerCase()}.`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingRule(null);
    }
  };

  const setRule = (kind: number, patch: Partial<GiftRule>) =>
    setRuleDrafts((prev) => ({ ...prev, [kind]: { ...prev[kind], ...patch } }));

  const giftHint: Record<number, string> = {
    [VoucherSource.Welcome]: 'Tặng khi khách hàng xác thực email lần đầu (mỗi khách 1 lần).',
    [VoucherSource.Loyalty]: 'Tặng sau mỗi N đơn hoàn tất của khách hàng.',
    [VoucherSource.Apology]: 'Tặng khi Tasker không đến, hoặc khiếu nại của khách được chấp nhận.',
  };

  return (
    <div className="admin-page">
      {summary && (
        <div className="revenue-stats-grid promo-stats">
          {[
            { title: 'Chương trình đang chạy', value: `${summary.activeCampaigns}/${summary.totalCampaigns}`, icon: <Ticket size={20} />, variant: 'primary' },
            { title: 'Lượt dùng mã (đơn hoàn tất)', value: summary.campaignUses.toLocaleString('vi-VN'), icon: <BadgePercent size={20} />, variant: 'info' },
            { title: 'Chi phí mã giảm giá', value: formatVnd(summary.campaignDiscount), icon: <Wallet size={20} />, variant: 'peach' },
            { title: 'Chi phí quà tặng', value: formatVnd(summary.giftDiscount), icon: <Gift size={20} />, variant: 'lilac' },
          ].map((c) => (
            <div key={c.title} className={`revenue-stat-card card card-${c.variant}`}>
              <div className="stat-card-header">
                <span className="stat-card-title">{c.title}</span>
                <span className={`stat-card-icon icon-${c.variant}`}>{c.icon}</span>
              </div>
              <div className="stat-card-value">{c.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="list-toolbar">
        <div className="role-tab-group">
          <button type="button" className={`role-tab-btn ${tab === 'vouchers' ? 'active' : ''}`} onClick={() => setTab('vouchers')}>
            <Ticket size={15} /> Mã giảm giá
          </button>
          <button type="button" className={`role-tab-btn ${tab === 'gifts' ? 'active' : ''}`} onClick={() => setTab('gifts')}>
            <Gift size={15} /> Quà tặng tự động
          </button>
        </div>
        {tab === 'vouchers' && (
          <div className="toolbar-actions">
            <Button icon={<Plus size={16} />} onClick={openNew}>Tạo mã giảm giá</Button>
          </div>
        )}
      </div>

      {error && !loading ? (
        <ErrorState message={error} onRetry={() => { setLoading(true); refresh(); }} />
      ) : loading ? (
        <div className="card"><TableSkeleton rows={4} columns={6} /></div>
      ) : tab === 'vouchers' ? (
        vouchers.length === 0 ? (
          <div className="card">
            <EmptyState title="Chưa có chương trình khuyến mãi" description='Bấm "Tạo mã giảm giá" để tạo chương trình đầu tiên.' />
          </div>
        ) : (
          <div className="card">
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th style={{ minWidth: 200 }}>Chương trình</th>
                    <th style={{ minWidth: 200 }}>Ưu đãi & điều kiện</th>
                    <th>Thời gian</th>
                    <th style={{ textAlign: 'center' }}>Lượt dùng</th>
                    <th style={{ textAlign: 'right' }}>Đã giảm</th>
                    <th>Trạng thái</th>
                    <th style={{ textAlign: 'center' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {vouchers.map((v) => {
                    const meta = STATUS_META[v.status];
                    const ended = v.status === 'Ended';
                    return (
                      <tr key={v.id}>
                        <td><span className="promo-code">{v.code}</span></td>
                        <td>
                          <div className="font-medium">{v.name}</div>
                          {v.description && <div className="cell-sub">{v.description}</div>}
                          <div className="cell-sub">
                            {v.isPublic ? 'Hiện trong "Ưu đãi của tôi"' : 'Mã ẩn – chỉ ai biết mã mới dùng'}
                          </div>
                        </td>
                        <td>
                          <div className="font-medium">{discountText(v.discountType, v.discountValue, v.maxDiscount)}</div>
                          <div className="cell-sub">Đơn từ {formatVnd(v.minOrderValue)} · chỉ đơn trả trước</div>
                          <div className="cell-sub">
                            {v.serviceNames.length > 0 ? v.serviceNames.join(', ') : 'Mọi dịch vụ'}
                            {v.audience === VoucherAudience.NewCustomers ? ' · Khách mới' : ''}
                          </div>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <div className="cell-sub">Từ {formatDateTime(v.startsAt)}</div>
                          <div className="cell-sub">Đến {formatDateTime(v.endsAt)}</div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div className="font-medium">{v.usedCount}{v.totalLimit != null ? `/${v.totalLimit}` : ''}</div>
                          <div className="cell-sub">{v.completedCount} hoàn tất · {v.perCustomerLimit} lượt/khách</div>
                        </td>
                        <td style={{ textAlign: 'right' }}>{formatVnd(v.totalDiscount)}</td>
                        <td><Badge variant={meta.variant}>{meta.label}</Badge></td>
                        <td>
                          <div className="action-row action-row--stack">
                            {!ended && (
                              <button type="button" className="btn-action-pill btn-view" onClick={() => openEdit(v)}>
                                <Pencil size={14} /> Sửa
                              </button>
                            )}
                            {!ended &&
                              (v.isActive ? (
                                <button type="button" className="btn-action-pill btn-lock" onClick={() => setStatusAction({ v, action: 'pause' })}>
                                  <CirclePause size={14} /> Tạm dừng
                                </button>
                              ) : (
                                <button type="button" className="btn-action-pill btn-unlock" onClick={() => setStatusAction({ v, action: 'resume' })}>
                                  <CirclePlay size={14} /> Tiếp tục
                                </button>
                              ))}
                            {!ended && (
                              <button type="button" className="btn-action-pill btn-lock" onClick={() => setStatusAction({ v, action: 'end' })}>
                                <CircleStop size={14} /> Kết thúc
                              </button>
                            )}
                            {ended && <span className="cell-sub">—</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="gift-rule-grid">
          {rules.map((rule) => {
            const d = ruleDrafts[rule.kind] ?? rule;
            const stat = summary?.gifts.find((g) => g.kind === rule.kind);
            return (
              <div key={rule.kind} className={`card gift-rule-card ${d.isEnabled ? '' : 'gift-rule-card--off'}`}>
                <div className="gift-rule-head">
                  <span className="gift-rule-icon"><Gift size={18} /></span>
                  <div>
                    <h3>{rule.name}</h3>
                    <p className="cell-sub">{giftHint[rule.kind]}</p>
                  </div>
                  <label className="gift-switch">
                    <input type="checkbox" checked={d.isEnabled} onChange={(e) => setRule(rule.kind, { isEnabled: e.target.checked })} />
                    <span>{d.isEnabled ? 'Đang bật' : 'Đã tắt'}</span>
                  </label>
                </div>
                <div className="gift-rule-fields">
                  <div className="form-group">
                    <label className="form-label">Loại giảm</label>
                    <select className="form-input" value={d.discountType}
                      onChange={(e) => setRule(rule.kind, { discountType: Number(e.target.value) as GiftRule['discountType'] })}>
                      <option value={VoucherDiscountType.Percent}>Theo %</option>
                      <option value={VoucherDiscountType.FixedAmount}>Số tiền cố định</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{d.discountType === VoucherDiscountType.Percent ? 'Giảm (%)' : 'Giảm (đ)'}</label>
                    <input className="form-input" inputMode="numeric" value={d.discountValue}
                      onChange={(e) => setRule(rule.kind, { discountValue: Number(digits(e.target.value)) })} />
                  </div>
                  {d.discountType === VoucherDiscountType.Percent && (
                    <div className="form-group">
                      <label className="form-label">Giảm tối đa (đ)</label>
                      <input className="form-input" inputMode="numeric" value={d.maxDiscount ?? ''}
                        onChange={(e) => setRule(rule.kind, { maxDiscount: Number(digits(e.target.value)) || null })} />
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">Đơn tối thiểu (đ)</label>
                    <input className="form-input" inputMode="numeric" value={d.minOrderValue}
                      onChange={(e) => setRule(rule.kind, { minOrderValue: Number(digits(e.target.value)) })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hạn dùng (ngày)</label>
                    <input className="form-input" inputMode="numeric" value={d.validDays}
                      onChange={(e) => setRule(rule.kind, { validDays: Number(digits(e.target.value)) })} />
                  </div>
                  {rule.kind === VoucherSource.Loyalty && (
                    <div className="form-group">
                      <label className="form-label">Tặng sau mỗi (đơn)</label>
                      <input className="form-input" inputMode="numeric" value={d.everyBookings}
                        onChange={(e) => setRule(rule.kind, { everyBookings: Number(digits(e.target.value)) })} />
                    </div>
                  )}
                </div>
                <div className="gift-rule-foot">
                  <div className="cell-sub">
                    Đã tặng <b>{stat?.granted ?? 0}</b> · đã dùng <b>{stat?.used ?? 0}</b> · chi phí <b>{formatVnd(stat?.totalDiscount ?? 0)}</b>
                    {rule.updatedAt && <> · cập nhật {formatDateTime(rule.updatedAt)}</>}
                  </div>
                  <Button size="sm" icon={<Save size={14} />} loading={savingRule === rule.kind} onClick={() => saveRule(rule.kind)}>
                    Lưu
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="admin-notice-box">
        <span>
          ⓘ Mã giảm giá chỉ áp dụng cho đơn thanh toán trước (ví điện tử, thẻ), mỗi đơn 1 mã và khách luôn trả tối thiểu 10.000 đ.
          Tasker vẫn được tính thu nhập theo giá gốc – phần giảm do nền tảng chịu và hiện ở mục "Chi phí khuyến mãi" của Báo cáo
          doanh thu. Đơn bị hủy miễn phí hoặc hết hạn thanh toán sẽ được trả lại lượt dùng mã. Quà tặng là mã riêng cho từng khách,
          dùng 1 lần, khách xem trong "Ưu đãi của tôi" và nhận thông báo khi được tặng.
        </span>
      </div>

      <ConfirmDialog
        isOpen={Boolean(statusAction)}
        title={
          statusAction?.action === 'pause' ? 'Tạm dừng chương trình' : statusAction?.action === 'resume' ? 'Tiếp tục chương trình' : 'Kết thúc chương trình'
        }
        message={
          statusAction?.action === 'end'
            ? `Kết thúc ngay mã ${statusAction?.v.code}? Khách không dùng được mã nữa và không thể mở lại.`
            : statusAction?.action === 'pause'
              ? `Tạm dừng mã ${statusAction?.v.code}? Khách tạm thời không dùng được mã cho đơn mới.`
              : `Cho mã ${statusAction?.v.code} chạy lại?`
        }
        confirmText="Xác nhận"
        confirmVariant={statusAction?.action === 'resume' ? 'primary' : 'danger'}
        isLoading={saving}
        onConfirm={doStatus}
        onCancel={() => setStatusAction(null)}
      />

      <Modal
        isOpen={Boolean(editing)}
        onClose={() => !saving && setEditing(null)}
        title={editing === 'new' ? 'Tạo mã giảm giá' : `Sửa mã ${editing ? (editing as VoucherAdmin).code : ''}`}
        maxWidth={680}
        footer={
          <div className="confirm-dialog-actions">
            <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>Hủy</Button>
            <Button onClick={submit} loading={saving}>{editing === 'new' ? 'Tạo mã' : 'Lưu thay đổi'}</Button>
          </div>
        }
      >
        <div className="promo-form">
          <div className="form-group">
            <label className="form-label" htmlFor="pm-code">Mã <span className="required-star">*</span></label>
            <input id="pm-code" className="form-input promo-code-input" maxLength={30} placeholder="VD: CHAOTHANG11" value={form.code}
              disabled={editing !== 'new' && editing !== null && (editing as VoucherAdmin).usedCount > 0}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '') })} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="pm-name">Tên chương trình <span className="required-star">*</span></label>
            <input id="pm-name" className="form-input" maxLength={100} placeholder="VD: Chào tháng 11" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group promo-span-2">
            <label className="form-label" htmlFor="pm-desc">Mô tả (hiện cho khách)</label>
            <input id="pm-desc" className="form-input" maxLength={300} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Loại giảm</label>
            <select className="form-input" value={form.discountType} onChange={(e) => setForm({ ...form, discountType: Number(e.target.value) })}>
              <option value={VoucherDiscountType.Percent}>Theo %</option>
              <option value={VoucherDiscountType.FixedAmount}>Số tiền cố định</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{form.discountType === VoucherDiscountType.Percent ? 'Giảm (%)' : 'Giảm (đ)'}</label>
            <input className="form-input" inputMode="numeric" value={form.discountValue}
              onChange={(e) => setForm({ ...form, discountValue: digits(e.target.value) })} />
          </div>
          {form.discountType === VoucherDiscountType.Percent && (
            <div className="form-group">
              <label className="form-label">Giảm tối đa (đ)</label>
              <input className="form-input" inputMode="numeric" value={form.maxDiscount}
                onChange={(e) => setForm({ ...form, maxDiscount: digits(e.target.value) })} />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Đơn tối thiểu (đ)</label>
            <input className="form-input" inputMode="numeric" value={form.minOrderValue}
              onChange={(e) => setForm({ ...form, minOrderValue: digits(e.target.value) })} />
          </div>
          <div className="form-group">
            <label className="form-label">Bắt đầu</label>
            <input type="datetime-local" className="form-input" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Kết thúc</label>
            <input type="datetime-local" className="form-input" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Tổng lượt dùng</label>
            <input className="form-input" inputMode="numeric" placeholder="Để trống = không giới hạn" value={form.totalLimit}
              onChange={(e) => setForm({ ...form, totalLimit: digits(e.target.value) })} />
          </div>
          <div className="form-group">
            <label className="form-label">Số lượt mỗi khách</label>
            <input className="form-input" inputMode="numeric" value={form.perCustomerLimit}
              onChange={(e) => setForm({ ...form, perCustomerLimit: digits(e.target.value) })} />
          </div>
          <div className="form-group">
            <label className="form-label">Đối tượng</label>
            <select className="form-input" value={form.audience} onChange={(e) => setForm({ ...form, audience: Number(e.target.value) })}>
              <option value={VoucherAudience.AllCustomers}>Mọi khách hàng</option>
              <option value={VoucherAudience.NewCustomers}>Khách chưa có đơn hoàn tất</option>
            </select>
          </div>
          <label className="award-check promo-span-2">
            <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} />
            Hiện trong mục "Ưu đãi của tôi" của khách (bỏ chọn = mã ẩn, chỉ ai biết mã mới dùng được)
          </label>
          <div className="form-group promo-span-2">
            <label className="form-label">Dịch vụ áp dụng (không chọn = mọi dịch vụ)</label>
            <div className="promo-services">
              {services.filter((s) => s.isActive || form.serviceCategoryIds.includes(s.id)).map((s) => {
                const on = form.serviceCategoryIds.includes(s.id);
                return (
                  <button key={s.id} type="button" className={`promo-service-chip ${on ? 'on' : ''}`}
                    onClick={() => setForm({
                      ...form,
                      serviceCategoryIds: on ? form.serviceCategoryIds.filter((x) => x !== s.id) : [...form.serviceCategoryIds, s.id],
                    })}>
                    {serviceName[s.id]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        {formError && <div className="form-error-box">{formError}</div>}
      </Modal>
    </div>
  );
}
