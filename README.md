# HomeService – Website Quản trị (Admin)

Website quản trị dùng để vận hành hệ thống **HomeService** — quản lý dịch vụ, người dùng, xét duyệt Tasker, xem báo cáo. Đề tài Công nghệ phần mềm Nâng cao, Nhóm 01.

- **Framework**: React 19 + TypeScript + Vite
- **Routing**: react-router-dom (có `RequireAuth` bảo vệ route sau khi đăng nhập)
- **HTTP client**: axios (`src/services/api.ts`)
- **Backend**: gọi chung API với `HomeService-Web-Customer` từ repo `HomeService-Backend`

## Cấu trúc thư mục

```
src/
├── pages/         # LoginPage, DashboardPage, ServiceCategoriesPage, UsersPage, TaskerVerificationPage
├── components/     # SideNav, RequireAuth
├── services/        # api.ts, authService, serviceCatalogService, userService, reportService
├── context/          # AuthContext
├── types/             # Kiểu dữ liệu khớp DTO backend
└── App.tsx            # Route + layout khung quản trị
```

## Các trang đã scaffold

| Trang | User Story |
|---|---|
| DashboardPage | US31 – Báo cáo doanh thu (tổng quan) |
| ServiceCategoriesPage | US07/US08/US09/US11 – CRUD danh mục & bảng giá dịch vụ |
| UsersPage | US30 – Quản lý danh sách KH/Tasker, khóa/mở khóa |
| TaskerVerificationPage | US04 – Xét duyệt hồ sơ Tasker |

Các chức năng còn lại (US06 phân quyền chi tiết, US27 xử lý khiếu nại, US32 báo cáo hiệu suất Tasker...) sẽ được nhóm bổ sung dần theo Sprint trong file Backlog — service tương ứng (`userService.ts`, `reportService.ts`) đã có sẵn hàm gọi API, chỉ cần thêm trang UI.

## Chạy dự án

```bash
npm install
cp .env.example .env
npm run dev
```

Mặc định chạy ở cổng khác với web-customer, ví dụ `http://localhost:5174` (Vite tự chọn cổng trống nếu 5173 đã dùng bởi web-customer).

Đăng nhập bằng tài khoản có `role = Admin` (tạo qua API `/api/auth/register` với `role: 2`, hoặc seed trực tiếp trong database).

## Build production

```bash
npm run build
```
