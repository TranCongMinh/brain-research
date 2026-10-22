# XeDaNang — UI Prototype

**Generated:** 2026-10-05
**Style:** Modern SaaS (daisyUI light theme)
**Tech:** HTML + Tailwind CSS + daisyUI (CDN only, no build step)

Mock UI cho ý tưởng nền tảng thuê xe trung gian tại Đà Nẵng (spec:
`../docs/superpowers/specs/2026-10-05-car-rental-marketplace-design.md`).
Tất cả tương tác (filter, đặt xe, accept/reject booking, đăng tin, đánh
giá, đăng nhập OTP) hoạt động thật bằng JavaScript + `localStorage` —
**chưa có backend/server thật**, dữ liệu chỉ lưu trong trình duyệt của bạn.

## Pages

| Page | File | Mô tả |
|------|------|-------|
| Tìm & danh sách xe | `index.html` | Filter theo ngày/khu vực/loại xe, lưới car card |
| Chi tiết xe + gửi booking | `detail.html?id=1` | Xem chi tiết, tính tạm tính, gửi yêu cầu đặt xe |
| Owner — Đăng tin xe | `owner-listing.html` | Form đăng xe (upload ảnh thật qua FileReader), danh sách tin đã đăng |
| Owner — Quản lý booking | `owner-bookings.html` | Tabs theo trạng thái, accept/reject, đánh dấu hoàn tất, banner hoa hồng, viết đánh giá |
| Hồ sơ (Rating & Review) | `profile.html?id=1` | Rating trung bình tính động từ review, danh sách xe/đánh giá |

## How to View

```bash
npx serve . -p 3456
```

Rồi mở `http://localhost:3456`. (Mở trực tiếp file `.html` cũng chạy được,
nhưng nên dùng server để `localStorage` hoạt động ổn định nhất trên mọi
trình duyệt.)

## Demo flow gợi ý

1. Mở `index.html` → lọc theo khu vực/loại xe → bấm "Xem chi tiết" một xe.
2. Ở trang chi tiết, đổi ngày nhận/trả (giá tạm tính tự cập nhật) → bấm
   "Gửi yêu cầu đặt xe".
3. Mở `owner-bookings.html` → tab "Chờ xác nhận" → Chấp nhận/Từ chối một
   booking → chuyển sang tab "Đã xác nhận" → "Đánh dấu hoàn tất chuyến" →
   banner hoa hồng cập nhật → "Viết đánh giá" cho người thuê.
4. Mở `owner-listing.html` → thử upload ảnh (preview thật) + điền form →
   "Đăng tin" → xe mới xuất hiện ngay trong danh sách "Tin đăng của bạn"
   và trên `index.html`.
5. Bấm "Đăng nhập" ở navbar bất kỳ trang nào → xem luồng OTP demo (mã:
   `1234`).

## Design System

- Font: Inter
- Theme: daisyUI "light"
- Accent: daisyUI default primary (blue/indigo)
- Data: mock trong `shared.js`, seed vào `localStorage` lần đầu mở trang

## Known limitations (vì là mock, chưa có backend)

- Dữ liệu không đồng bộ giữa các trình duyệt/thiết bị khác nhau.
- Không có xác thực OTP thật, không gửi SMS thật.
- Thanh toán/chuyển khoản chỉ là placeholder text, không tích hợp cổng
  thanh toán nào.
