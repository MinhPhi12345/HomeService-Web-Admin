import { useEffect, useState } from "react";
import {
  createServiceCategory,
  deleteServiceCategory,
  getServiceCategories,
  updateServiceCategory,
} from "../services/serviceCatalogService";
import type { ServiceCategory } from "../types";

const emptyForm = { name: "", description: "", basePrice: 0, unit: "giờ", iconUrl: "" };

// EP02 - US07/US08/US09/US11: Thêm/sửa/xóa danh mục dịch vụ & bảng giá
export default function ServiceCategoriesPage() {
  const [items, setItems] = useState<ServiceCategory[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  async function load() {
    setItems(await getServiceCategories());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await updateServiceCategory(editingId, form);
    } else {
      await createServiceCategory(form);
    }
    setForm(emptyForm);
    setEditingId(null);
    load();
  }

  function handleEdit(item: ServiceCategory) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description ?? "",
      basePrice: item.basePrice,
      unit: item.unit,
      iconUrl: item.iconUrl ?? "",
    });
  }

  async function handleDelete(id: number) {
    await deleteServiceCategory(id);
    load();
  }

  return (
    <div>
      <h1>Quản lý dịch vụ</h1>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8, maxWidth: 400, marginBottom: 24 }}>
        <input
          placeholder="Tên dịch vụ"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Mô tả"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          type="number"
          placeholder="Giá (VND)"
          value={form.basePrice}
          onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
          required
        />
        <input placeholder="Đơn vị" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
        <button type="submit">{editingId ? "Cập nhật dịch vụ" : "Thêm dịch vụ"}</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Tên</th>
            <th>Giá</th>
            <th>Đơn vị</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.basePrice.toLocaleString("vi-VN")}đ</td>
              <td>{s.unit}</td>
              <td>
                <button onClick={() => handleEdit(s)}>Sửa</button>
                <button onClick={() => handleDelete(s.id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
