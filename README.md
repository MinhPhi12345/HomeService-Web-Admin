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

## Các trang & chức năng

| Trang | Chức năng | User Story |
|---|---|---|
| Dashboard | 4 thẻ số liệu (doanh thu, hoa hồng, đơn hoàn thành, tiền tạm giữ), biểu đồ doanh thu theo ngày, trạng thái đơn, top Tasker, việc cần xử lý; lọc 7/30/90 ngày | US31, US32 |
| Dịch vụ & bảng giá | CRUD, tìm kiếm, phân trang, STT, lọc trạng thái (màu) & đơn vị tính, xóa có xác nhận + khôi phục, xuất Excel | US07–US11 |
| Người dùng | Lọc theo vai trò, tìm kiếm, khóa / mở khóa có xác nhận, xuất Excel | US06, US30 |
| Duyệt Tasker | Xem hồ sơ + ảnh CCCD, duyệt / từ chối có xác nhận, xuất Excel | US04 |
| Khiếu nại | Danh sách Chờ xử lý / Đã xử lý, hồ sơ ảnh minh chứng – check-in/out – phản hồi Tasker, phân xử (bác / hoàn một phần / hoàn toàn bộ / làm lại), xuất Excel | US28, US29, US36 |
| Đánh giá bị báo cáo | Lọc theo số sao, giữ lại hoặc xóa đánh giá (có xác nhận), xuất Excel | US27 |
| Báo cáo doanh thu | 8 chỉ số, biểu đồ cột theo ngày/tháng/năm, nhấn cột xem giao dịch, xuất Excel 4 sheet (tổng hợp, theo kỳ, toàn bộ giao dịch, trạng thái đơn) | US31 |
| Nhật ký kiểm toán | Lọc theo hành động / mã đơn / ngày, phân trang server, xuất Excel toàn bộ | NFR-16 |
| Trung tâm báo cáo | 4 báo cáo: doanh thu (Bar), trạng thái đơn (Pie), hiệu suất Tasker (Bar), người dùng theo vai trò (Pie); nhấn biểu đồ xem chi tiết từ API; in báo cáo & in phiếu chi tiết; xuất Excel | US31, US32 |

Số trên Sidebar / chuông thông báo (hồ sơ chờ duyệt, khiếu nại chờ xử lý, đánh giá bị báo cáo) lấy trực tiếp từ API và tự làm mới mỗi phút.
Admin đăng nhập ở Web Customer được chuyển thẳng sang đây (phiên đi qua `#auth=` trên URL, xem `src/utils/handoff.ts`).

API Backend cần có: `GET /api/auditlogs`, `GET /api/reports/bookings`, `GET /api/reports/revenue/transactions` (nhánh Backend cập nhật cùng đợt này).

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
