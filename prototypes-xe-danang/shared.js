// shared.js — mock data layer for XeDaNang prototype (no backend, localStorage only)

const DISTRICTS = ["Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn", "Liên Chiểu", "Cẩm Lệ"];
const CAR_TYPES = ["Sedan", "SUV", "Hatchback", "Bán tải"];
const CURRENT_USER_ID = 1; // demo: luôn đăng nhập là Nguyễn Văn A khi đóng vai owner
const COMMISSION_RATE = 0.1;

const SEED_USERS = [
  { id: 1, name: "Nguyễn Văn A", phone: "0905 123 456", joinedYear: 2025, verified: true },
  { id: 2, name: "Trần Thị Bình", phone: "0912 234 567", joinedYear: 2025, verified: true },
  { id: 3, name: "Lê Hoàng Garage", phone: "0987 345 678", joinedYear: 2024, verified: true },
  { id: 4, name: "Trần Thị B", phone: "0901 111 222", joinedYear: 2026, verified: true },
  { id: 5, name: "Lê Văn C", phone: "0902 222 333", joinedYear: 2026, verified: true },
  { id: 6, name: "Phạm Thị D", phone: "0903 333 444", joinedYear: 2026, verified: false },
];

const SEED_CARS = [
  { id: 1, ownerId: 1, title: "Toyota Vios 2021", type: "Sedan", seats: 5, transmission: "Số tự động", fuel: "Xăng", district: "Hải Châu", pricePerDay: 450000, desc: "Xe gia đình, sạch sẽ, bảo dưỡng định kỳ đầy đủ. Giao xe tận nơi trong nội thành.", blockedDates: [], status: "active" },
  { id: 2, ownerId: 1, title: "Honda City 2020", type: "Sedan", seats: 5, transmission: "Số tự động", fuel: "Xăng", district: "Thanh Khê", pricePerDay: 420000, desc: "Xe đời mới, tiết kiệm xăng, phù hợp đi phố và đi tỉnh ngắn ngày.", blockedDates: [], status: "active" },
  { id: 3, ownerId: 2, title: "Mazda CX-5 2022", type: "SUV", seats: 5, transmission: "Số tự động", fuel: "Xăng", district: "Sơn Trà", pricePerDay: 750000, desc: "SUV gầm cao, rộng rãi, thích hợp đi biển, đi nhóm đông người.", blockedDates: [], status: "active" },
  { id: 4, ownerId: 2, title: "Kia Morning 2019", type: "Hatchback", seats: 4, transmission: "Số sàn", fuel: "Xăng", district: "Ngũ Hành Sơn", pricePerDay: 350000, desc: "Xe nhỏ gọn, dễ lái trong phố, giá thuê tiết kiệm.", blockedDates: [], status: "active" },
  { id: 5, ownerId: 3, title: "Ford Ranger 2021", type: "Bán tải", seats: 5, transmission: "Số tự động", fuel: "Dầu", district: "Liên Chiểu", pricePerDay: 650000, desc: "Bán tải khỏe, chở hàng/đi offroad tốt, từ garage uy tín.", blockedDates: [], status: "active" },
  { id: 6, ownerId: 3, title: "Hyundai Accent 2023", type: "Sedan", seats: 5, transmission: "Số tự động", fuel: "Xăng", district: "Cẩm Lệ", pricePerDay: 480000, desc: "Xe mới 2023, nội thất còn như mới, có camera hành trình.", blockedDates: [], status: "active" },
];

const SEED_BOOKINGS = [
  { id: 1, carId: 1, renterId: 4, startDate: "2026-10-12", endDate: "2026-10-14", status: "pending", createdAt: "2026-10-05" },
  { id: 2, carId: 2, renterId: 5, startDate: "2026-10-15", endDate: "2026-10-16", status: "pending", createdAt: "2026-10-05" },
  { id: 3, carId: 1, renterId: 6, startDate: "2026-10-20", endDate: "2026-10-21", status: "confirmed", createdAt: "2026-10-03" },
  { id: 4, carId: 2, renterId: 4, startDate: "2026-09-28", endDate: "2026-09-30", status: "completed", createdAt: "2026-09-25" },
  { id: 5, carId: 1, renterId: 5, startDate: "2026-09-18", endDate: "2026-09-19", status: "cancelled", createdAt: "2026-09-15" },
];

const SEED_REVIEWS = [
  { id: 1, bookingId: 4, revieweeId: 1, direction: "renter_to_owner", rating: 5, comment: "Xe sạch, chủ nhiệt tình, nhận xe nhanh.", authorName: "Trần Thị B" },
  { id: 2, bookingId: null, revieweeId: 1, direction: "renter_to_owner", rating: 4, comment: "Giao xe trễ 15 phút nhưng xe ổn.", authorName: "Lê Văn C" },
  { id: 3, bookingId: null, revieweeId: 1, direction: "renter_to_owner", rating: 5, comment: "Chủ xe dễ chịu, giá hợp lý.", authorName: "Phạm Thị D" },
  { id: 4, bookingId: null, revieweeId: 2, direction: "renter_to_owner", rating: 5, comment: "Xe CX-5 rất mới, chủ dễ chịu.", authorName: "Hoàng Văn E" },
  { id: 5, bookingId: null, revieweeId: 2, direction: "renter_to_owner", rating: 4, comment: "Xe hơi bẩn lúc nhận nhưng ổn.", authorName: "Ngô Thị F" },
  { id: 6, bookingId: null, revieweeId: 3, direction: "renter_to_owner", rating: 4, comment: "Dịch vụ garage chuyên nghiệp, xe bán tải khỏe.", authorName: "Đỗ Văn G" },
  { id: 7, bookingId: null, revieweeId: 3, direction: "renter_to_owner", rating: 5, comment: "Nhận xe đúng giờ, giấy tờ đầy đủ.", authorName: "Vũ Thị H" },
  { id: 8, bookingId: 4, revieweeId: 4, direction: "owner_to_renter", rating: 5, comment: "Khách lịch sự, trả xe đúng giờ.", authorName: "Nguyễn Văn A" },
];

function initStorage() {
  if (!localStorage.getItem("xdn_cars")) localStorage.setItem("xdn_cars", JSON.stringify(SEED_CARS));
  if (!localStorage.getItem("xdn_bookings")) localStorage.setItem("xdn_bookings", JSON.stringify(SEED_BOOKINGS));
  if (!localStorage.getItem("xdn_reviews")) localStorage.setItem("xdn_reviews", JSON.stringify(SEED_REVIEWS));
}
initStorage();

function getCars() { return JSON.parse(localStorage.getItem("xdn_cars") || "[]"); }
function saveCars(cars) { localStorage.setItem("xdn_cars", JSON.stringify(cars)); }
function getBookings() { return JSON.parse(localStorage.getItem("xdn_bookings") || "[]"); }
function saveBookings(bookings) { localStorage.setItem("xdn_bookings", JSON.stringify(bookings)); }
function getReviews() { return JSON.parse(localStorage.getItem("xdn_reviews") || "[]"); }
function saveReviews(reviews) { localStorage.setItem("xdn_reviews", JSON.stringify(reviews)); }
function getUserById(id) { return SEED_USERS.find(u => u.id === Number(id)); }

function computeRating(userId) {
  const reviews = getReviews().filter(r => r.revieweeId === Number(userId));
  if (reviews.length === 0) return { avg: 0, count: 0 };
  const sum = reviews.reduce((a, r) => a + r.rating, 0);
  return { avg: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
}

function formatVND(n) { return n.toLocaleString("vi-VN") + "đ"; }

function daysBetween(start, end) {
  const d1 = new Date(start), d2 = new Date(end);
  const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
}

function starLabel(avg, count) {
  if (count === 0) return "Chưa có đánh giá";
  return "★ " + avg.toFixed(1) + " (" + count + ")";
}

function showToast(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast toast-top toast-end z-50";
    document.body.appendChild(container);
  }
  const alertClass = type === "success" ? "alert-success" : type === "error" ? "alert-error" : "alert-info";
  const el = document.createElement("div");
  el.className = "alert " + alertClass + " shadow-lg text-sm";
  el.innerHTML = "<span>" + message + "</span>";
  container.appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

// ---- Login modal (shared across pages, demo OTP flow) ----
function renderLoginModal() {
  const wrap = document.createElement("div");
  wrap.innerHTML = `
  <dialog id="login-modal" class="modal">
    <div class="modal-box max-w-sm">
      <h3 class="font-bold text-lg mb-1">Đăng nhập XeDaNang</h3>
      <p class="text-sm text-base-content/60 mb-4">Xác thực bằng số điện thoại (demo)</p>
      <div id="login-step-phone">
        <label class="label"><span class="label-text">Số điện thoại</span></label>
        <input id="login-phone" type="tel" placeholder="09xx xxx xxx" class="input input-bordered w-full mb-3" value="0905 123 456" />
        <button class="btn btn-primary btn-block" onclick="loginSendOtp()">Gửi mã OTP</button>
      </div>
      <div id="login-step-otp" class="hidden">
        <label class="label"><span class="label-text">Mã OTP (demo: 1234)</span></label>
        <input id="login-otp" type="text" maxlength="4" placeholder="1234" class="input input-bordered w-full mb-3" />
        <button class="btn btn-primary btn-block" onclick="loginVerifyOtp()">Xác nhận</button>
      </div>
      <div class="modal-action">
        <form method="dialog"><button class="btn btn-ghost btn-sm">Đóng</button></form>
      </div>
    </div>
  </dialog>`;
  document.body.appendChild(wrap);
}

function openLoginModal() { document.getElementById("login-modal").showModal(); }
function loginSendOtp() {
  document.getElementById("login-step-phone").classList.add("hidden");
  document.getElementById("login-step-otp").classList.remove("hidden");
  showToast("Đã gửi mã OTP (demo: 1234) tới số điện thoại", "info");
}
function loginVerifyOtp() {
  const code = document.getElementById("login-otp").value;
  document.getElementById("login-modal").close();
  if (code === "1234") {
    showToast("Đăng nhập thành công — Nguyễn Văn A");
  } else {
    showToast("Mã OTP không đúng (thử 1234)", "error");
  }
}
document.addEventListener("DOMContentLoaded", renderLoginModal);
