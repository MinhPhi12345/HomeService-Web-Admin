import { useEffect, useState } from "react";
import { getUsers, setUserActiveStatus } from "../services/userService";
import type { AdminUser } from "../types";

// EP08 - US30: Quản lý danh sách khách hàng & Tasker (khóa/mở khóa tài khoản)
export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);

  async function load() {
    setUsers(await getUsers());
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleActive(u: AdminUser) {
    await setUserActiveStatus(u.id, !u.isActive);
    load();
  }

  return (
    <div>
      <h1>Quản lý người dùng</h1>
      <table>
        <thead>
          <tr>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Vai trò</th>
            <th>Trạng thái</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.fullName}</td>
              <td>{u.email}</td>
              <td>{["Khách hàng", "Tasker", "Admin"][u.role]}</td>
              <td>{u.isActive ? "Hoạt động" : "Đã khóa"}</td>
              <td>
                <button onClick={() => toggleActive(u)}>{u.isActive ? "Khóa" : "Mở khóa"}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
