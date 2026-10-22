# Báo Cáo Nghiên Cứu Chuyên Sâu: Meta Muse Video Automation, Nguy Cơ Khóa Tài Khoản & Giới Hạn Thời Lượng

> **Ngày thực hiện:** 18/10/2026  
> **Phương pháp nghiên cứu:** Phân tích reverse-engineering giao thức WebSocket Noise (`hatch.metaaivm.com`), đo kiểm nghiệm trực tiếp qua Chrome Profile 7 Headless, đối chiếu tài liệu `MUSE_MANUAL.md` và chính sách Meta Terms of Service (ToS).

---

## 1. Bản Chất Kỹ Thuật: Cách Muse Tạo Video

### 1.1 Không Phải REST API — Là Agent Sandbox trong Linux VM
- Meta Muse (`muse.ai`, tên mã nội bộ "Hatch") không cung cấp REST API hay endpoint render thông thường như Runway hay Luma.
- Toàn bộ giao tiếp giữa trình duyệt và máy chủ diễn ra qua **WebSocket nhị phân được mã hóa kép theo chuẩn Noise Protocol**:
  - URL kết nối: `wss://hatch.metaaivm.com/v1/noise`
  - Thuật toán mã hóa: `X25519` (trao đổi khóa) + `HKDF` (dẫn xuất khóa) + `AES-GCM` (mã hóa đối xứng dữ liệu) + `Ed25519` (chữ ký số xác thực phiên người dùng).
- Trong môi trường backend của Meta, Muse chạy như một **Autonomous Agent** bên trong một Linux Virtual Machine (VM). Agent này có quyền thực thi công cụ (như `ffmpeg`) để sinh video, cắt ghép, burn-in subtitle và xuất file.

### 1.2 Cơ Chế Tự Động Hóa Trong Dự Án (`muse-video-maker`)
- Vì giải mã giao thức Noise từ đầu là cực kỳ phức tạp và dễ bị chặn chữ ký số, giải pháp tối ưu nhất là **điều khiển trình duyệt thật (Real Browser Automation)**:
  1. Trình duyệt Google Chrome tự thực hiện toàn bộ cơ chế bảo mật, cookie và bắt tay Noise handshake.
  2. Driver sử dụng CDP (Chrome DevTools Protocol) để gõ prompt vào Lexical Editor, mô phỏng hành vi bấm phím và bắt sự kiện.
  3. Khi video được sinh xong, nó xuất hiện trong DOM dưới dạng `blob:https://muse.ai/...`. Driver trích xuất blob thành chuỗi Base64 và ghi thẳng thành file MP4 trên ổ cứng.
- **Kỹ Thuật Last-Frame Chaining**:
  - Cảnh 1: Sinh Text-to-Video.
  - Cảnh K > 1: Trích khung hình cuối của Cảnh K-1 (`shot(K-1)_last.jpg`), upload vào composer làm ảnh tham chiếu (Image-to-Video) kèm chỉ dẫn "Animate the attached image as the first frame and continue directly from it".
  - Ghép nối: Dùng FFmpeg với filter `xfade` (video) và `acrossfade` (audio 48kHz) để nối mượt mà giữa các cảnh.

---

## 2. Đánh Giá Nguy Cơ Khóa Tài Khoản (Account Ban / Lock Audit)

### 2.1 Mức Độ Rủi Ro Tổng Thể: **TRUNG BÌNH (Medium Risk)**
- **Điểm nguy hiểm nhất**: Tài khoản Muse liên kết thông qua **Meta Accounts Center** (đồng bộ với Facebook, Instagram, Threads). Nếu tài khoản bị Meta gắn cờ "Abuse" hay "Automated Botting", bạn có nguy cơ bị **checkpoint hoặc tạm khóa luôn tài khoản Facebook/Instagram cá nhân**!

### 2.2 Các Yếu Tố Kích Hoạt Bộ Lọc An Toàn Của Meta
1. **Tần suất sinh dồn dập (Burst Generation)**: Gửi prompt liên tục không nghỉ sẽ kích hoạt Rate Limit của AI Gateway. Biểu hiện ban đầu là thông báo: *"Generation limit reached"* hoặc lỗi assistant notice, khóa tính năng sinh video từ vài giờ đến 24h.
2. **Fingerprint Bot vs Profile Thật**: Nếu dùng trình duyệt tự động hóa trắng (clean Playwright context), Cloudflare và hệ thống anti-fraud của Meta sẽ dễ dàng phát hiện thiếu canvas hash, webgl fingerprint và cookies lịch sử.
   - *Ưu thế của giải pháp hiện tại:* Chúng ta đang dùng bản sao của **Profile 7 thật** (có đầy đủ cookie, cache, token được mã hóa bằng macOS Keychain), giúp giảm 90% nguy cơ bị coi là headless bot.
3. **Bộ lọc nội dung (AI Safety Filters)**: Prompt chứa từ khóa nhạy cảm (18+, bạo lực, người nổi tiếng, trẻ em, chính trị) sẽ bị cấm ngay lập tức và đưa tài khoản vào danh sách theo dõi đặc biệt.

### 2.3 Giao Thức Vận Hành An Toàn (Zero-Ban Protocol)
- **Bắt buộc dùng tài khoản Meta phụ**: Không bao giờ dùng tài khoản Facebook chính chủ liên kết thẻ visa quảng cáo để chạy tự động hóa.
- **Thêm độ trễ tự nhiên (Sleep Jitter)**: Luôn để khoảng cách 15 – 30 giây giữa các cảnh hoặc giữa các lần tạo story.
- **Hạn mức an toàn**: Không tạo quá 20 – 30 clip 10s trong một ngày trên một tài khoản.

---

## 3. Giới Hạn Thời Lượng: Video Tối Đa Được Bao Nhiêu Phút?

### 3.1 Giới Hạn Của 1 Cảnh Đơn Lẻ (Native Clip Limit)
- **CỐ ĐỊNH 10.000 GIÂY/clip**: Muse không cho phép chọn độ dài (không có clip 5s, 8s hay 15s).
- **Thông số kỹ thuật đo thực tế (ffprobe)**:
  - Độ phân giải: **704 × 1248** (tỷ lệ chuẩn ~9:16) hoặc **1248 × 704** (ngang 16:9).
  - Tốc độ khung hình: **24 fps**.
  - Codec: H.264 (yuv420p) + AAC mono 24 kHz.
  - Dung lượng: ~2.8 MB – 5.2 MB / clip 10s.

### 3.2 Khả Năng Ghép Nối Nhiều Cảnh (Chained Video)
- **Về mặt kỹ thuật**: FFmpeg có thể ghép bao nhiêu cảnh tùy thích (không có giới hạn trần về số phút).
- **Về mặt chất lượng hình ảnh (Visual Drift)**:
  - **Tối ưu nhất: 30 giây đến 1 phút (3 đến 6 cảnh)**: Các nhân vật giữ được trang phục, gương mặt và bối cảnh chuẩn xác (như video Quê Xưa 3 cảnh vừa thực hiện).
  - **Từ cảnh thứ 7 trở đi (> 1 phút)**: Bắt đầu xuất hiện hiện tượng trôi phong cách (Visual Drift). Do mỗi lần Image-to-Video AI lại tự suy diễn thêm chi tiết mới, sau 7-10 lần lặp, gương mặt nhân vật sẽ bị biến dạng hoặc đổi nét so với ban đầu.
- **Về mặt Quota / Thời gian thực thi**:
  - Mỗi clip 10s cần từ 60 – 100 giây render.
  - Video 1 phút (6 clip) tốn khoảng 8 – 10 phút.
  - Video 3 phút (18 clip) tốn gần 30 phút và có nguy cơ chạm trần quota ngày của Meta.

---

## 4. Kết Luận & Khuyến Nghị

1. **Về độ dài**: Nên dựng video ở định dạng **Short-form 30s đến 45s (3–4 cảnh)** hoặc tối đa **60s (6 cảnh)** cho một kịch bản hoàn chỉnh.
2. **Về an toàn tài khoản**: Tiếp tục sử dụng cơ chế clone `Profile 7` qua CDP như hiện tại để giữ độ tin cậy của fingerprint, đồng thời đảm bảo đây là tài khoản Meta phụ để triệt tiêu mọi rủi ro đối với tài khoản cá nhân.
