# Nghiên Cứu Chuyên Sâu: Các Công Cụ & Giải Pháp Kỹ Thuật Cào Dữ Liệu Google Maps Để Xây Dựng Kho Dữ Liệu Riêng (Private Dataset)

> **Mã chuyên đề:** LOKI-RESEARCH-2026-GMAP-DATASET  
> **Người thực hiện:** Loki Deep Research System  
> **Thời gian:** Tháng 10/2026  
> **Mục tiêu:** Đánh giá toàn diện các công cụ mã nguồn mở (Open-Source), dịch vụ Cloud/API, kiến trúc kỹ thuật vượt giới hạn 120 kết quả, giải pháp chống chặn (Anti-bot/Proxy), thiết kế cơ sở dữ liệu (PostgreSQL/PostGIS) và thẩm định pháp lý (Nghị định 13/2023/NĐ-CP).

---

## 1. Tóm Tắt Thực Thi & Khuyến Nghị Lựa Chọn (Executive Decision)

Để xây dựng một **tập dữ liệu riêng (Private Dataset)** từ Google Maps (bao gồm: Tên doanh nghiệp, Ngành nghề, Địa chỉ, Tọa độ GPS, Số điện thoại, Website, Email, Đánh giá, Giờ mở cửa), người phát triển không thể dùng Google Places API chính thức vì **Google cấm lưu trữ dữ liệu vĩnh viễn quá 30 ngày (ToS 3.2.3)** và chi phí rất đắt ($17 - $32/1.000 lượt gọi).

### Bảng Điều Hướng Giải Pháp Theo Nhu Cầu:

| Nhu Cầu Thực Tế | Giải Pháp Đề Xuất Tối Ưu | Chi Phí Ước Tính | Độ Khó Kỹ Thuật | Tốc Độ Cào Dữ Liệu |
| :--- | :--- | :--- | :--- | :--- |
| **Developer / Cào Số Lượng Lớn (>50.000 records)** | **`gosom/google-maps-scraper`** (Go + Playwright + Docker + Postgres) | Cực rẻ (~$10 - $20 tiền Proxy) | Trung bình - Cao | Rất nhanh (~120 - 200 URLs/phút/node) |
| **Marketer / Sales B2B (Cần bóc tách Email & MXH)** | **`omkarcloud/google-maps-scraper`** (Python + Botasaurus) | Miễn phí hoặc tiền Proxy | Trung bình (Python) | Trung bình (do cần crawl thêm Website) |
| **Doanh Nghiệp Không Có Dev / Cần Data Ngay** | **Apify** (`compass/crawler-google-places`) hoặc **Outscraper** | $2.00 - $4.00 / 1.000 records | Dễ (Web UI / No-code) | Rất nhanh (Cloud server xử lý) |
| **Nhu Cầu Nhỏ / Ad-hoc (<1.000 records)** | Chrome Extension: **Instant Data Scraper** | $0 (Hoàn toàn miễn phí) | Cực dễ (Click chuột) | Chậm (Phụ thuộc trình duyệt cá nhân) |

---

## 2. Phân Tích Kỹ Thuật Các Công Cụ Mã Nguồn Mở Hàng Đầu

### 2.1. `gosom/google-maps-scraper` (Go + Playwright) — Lựa Chọn Số 1 Cho Tự Triển Khai
- **GitHub:** `gosom/google-maps-scraper` (3.6k+ ⭐)
- **Công nghệ nền tảng:** Ngôn ngữ Golang, kết hợp Playwright (Headless Chromium) cho hiệu năng tối đa và tốn ít RAM hơn hẳn Python/Selenium.
- **Tính năng nổi bật:**
  1. **Kiến trúc Producer - Consumer phân tán:** Cho phép 1 máy đẩy hàng nghìn từ khóa vào PostgreSQL Queue, và nhiều Worker nodes cùng kéo về cào song song.
  2. **Tích hợp sẵn PostgreSQL:** Xuất trực tiếp dữ liệu vào database PostgreSQL mà không cần qua file trung gian.
  3. **Tích hợp Web UI & REST API:** Đi kèm giao diện web quản lý tác vụ trực quan chạy trên cổng 8080.
  4. **Hỗ trợ xoay Proxy:** Hỗ trợ SOCKS5, HTTP, HTTPS proxy tự động.

#### Cách chạy nhanh bằng Docker:
```bash
# 1. Chạy Web UI trực tiếp
mkdir -p gmapsdata
docker run -d --name gmap-scraper \
  -v $(pwd)/gmapsdata:/gmapsdata \
  -p 8080:8080 \
  gosom/google-maps-scraper -data-folder /gmapsdata

# 2. Hoặc cào trực tiếp qua file danh sách từ khóa (CLI)
touch results.csv
docker run --rm \
  -v $(pwd)/queries.txt:/example-queries \
  -v $(pwd)/results.csv:/results.csv \
  gosom/google-maps-scraper \
  -depth 1 \
  -input /example-queries \
  -results /results.csv \
  -exit-on-inactivity 3m
```

---

### 2.2. `omkarcloud/google-maps-scraper` (Python + Botasaurus) — Chuyên Dụng Bóc Tách Lead B2B & Email
- **GitHub:** `omkarcloud/google-maps-scraper` (2.6k+ ⭐)
- **Công nghệ nền tảng:** Python, xây dựng trên framework chuyên dụng chống anti-bot **Botasaurus**.
- **Tính năng vượt trội:**
  1. **Trích xuất hơn 50 trường thông tin chi tiết:** Bao gồm danh mục phụ, tiện ích địa điểm, bài review, ảnh đại diện, múi giờ.
  2. **Bộ bóc tách Email & Mạng xã hội tích hợp:** Khi cào được địa chỉ website của cửa hàng, bot sẽ tự động truy cập trang chủ, trang `Liên hệ` (Contact), trang `Về chúng tôi` (About) của website đó để quét Email, Facebook, Instagram, LinkedIn, TikTok, Twitter.
  3. **Tự động bypass Anti-Bot:** Botasaurus tích hợp sẵn kỹ thuật bypass Cloudflare Turnstile và fingerprint tracking của Google.

#### Cài đặt và sử dụng:
```bash
git clone https://github.com/omkarcloud/google-maps-scraper.git
cd google-maps-scraper
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Cấu hình từ khóa trong file input.json và chạy
python main.py
```

---

## 3. Các Giải Pháp Đám Mây (Cloud Managed APIs) — Tiết Kiệm Thời Gian Vận Hành

Nếu không muốn đau đầu duy trì hạ tầng server, xoay proxy và fix lỗi khi Google đổi HTML layout, các nền tảng sau là giải pháp tốt nhất:

### 3.1. Apify Google Maps Scraper (`compass/crawler-google-places`)
- **Đặc điểm:** Actor nổi tiếng nhất trên Apify Marketplace.
- **Cơ chế:** Tự động chia lưới địa lý (Grid Search) khi vùng quét quá lớn, tích hợp sẵn mạng Proxy dân cư (Residential Proxies) của Apify.
- **Giá cước:**
  - Miễn phí: $5 credit hàng tháng (~1.200 - 1.500 địa điểm).
  - Trả phí: ~$1.50 - $4.00 trên 1.000 địa điểm (tùy gói thuê bao). Bật crawl email tốn thêm khoảng $1.50/1k.
- **Đầu ra:** Xuất JSON, CSV, Excel, nạp trực tiếp qua Webhook vào PostgreSQL hoặc Google BigQuery.

### 3.2. Outscraper Google Maps Scraper
- **Đặc điểm:** Nền tảng chuyên nghiệp cho data analyst và growth hacker.
- **Cơ chế:** Không cần code. Có Dashboard trực quan, nhập từ khóa theo quốc gia, thành phố, zip code.
- **Giá cước:**
  - 500 địa điểm đầu tiên: Miễn phí.
  - Từ 501 - 100.000: ~$3.00 / 1.000 địa điểm thô.
  - Thêm Email/Phone Enrichment: ~$3.00/1k domain và $5.00/1k số điện thoại.
  - Gói đầy đủ Data + Email đã verify: ~$10 - $12 / 1.000 leads chuẩn.
- **Ưu điểm:** Tốc độ trả lời cực nhanh (xử lý bất đồng bộ qua cloud queue), không bao giờ bị dính CAPTCHA của Google.

---

## 4. Kỹ Thuật Cốt Lõi: Vượt Giới Hạn 120 Kết Quả & Chống Khóa IP

### 4.1. Vấn Đề "Bức Tường 120 Kết Quả" (120 Results Hard Limit)
- **Cơ chế của Google Maps:** Khi tìm kiếm một ngành nghề trên bản đồ (ví dụ: "quán cafe ở TP.HCM"), Google Maps chỉ hiển thị tối đa **120 kết quả** (hoặc 60 kết quả trên Places API). Khi cuộn đến kết thúc, Google báo `"Bạn đã xem hết danh sách"` mặc dù thực tế TP.HCM có hơn 15.000 quán cafe!
- **Nguyên nhân:** Google cắt phân trang theo viewport (tọa độ khung nhìn hiện tại).

### 4.2. Giải Pháp Triệt Để: Thuật Toán Phân Vùng Lưới Đệ Quy (Quadtree Bounding Box Grid)
Để cào được 100% dữ liệu của một thành phố hay toàn quốc:
1. Xác định hộp giới hạn không gian (Bounding Box) của khu vực gồm 4 tọa độ: `[Min_Lat, Min_Lng, Max_Lat, Max_Lng]`.
2. Chia thành phố thành lưới ô vuông (ví dụ 10x10 ô).
3. Gửi query tìm kiếm vào từng tâm điểm của từng ô với zoom level thích hợp.
4. **Cơ chế Quadtree:**
   - Nếu ô đó trả về **dưới 100 kết quả**: Lưu toàn bộ, không cần đào sâu thêm (vùng ven, ngoại thành).
   - Nếu ô đó chạm mốc **>= 115 kết quả**: Thuật toán tự động bổ đôi ô vuông đó thành **4 ô nhỏ hơn (Quadtree)** và quét lại từng ô con (khu trung tâm, quận 1, quận 3).
5. Hợp nhất tất cả kết quả và khử trùng lặp (Deduplicate) dựa trên trường duy nhất: **`place_id`** của Google.

#### Mã Nguồn Tạo Lưới Tọa Độ Tự Động (Python):
```python
import math

def generate_bounding_box_grid(min_lat, min_lng, max_lat, max_lng, step_km=2.0):
    """
    Sinh lưới tọa độ tâm điểm dựa trên bước nhảy km (mặc định 2km/ô).
    1 độ vĩ tuyến ~ 111 km. 1 độ kinh tuyến ~ 111 * cos(lat) km.
    """
    grid = []
    lat_step = step_km / 111.0
    
    current_lat = min_lat
    while current_lat <= max_lat:
        lng_step = step_km / (111.0 * math.cos(math.radians(current_lat)))
        current_lng = min_lng
        while current_lng <= max_lng:
            grid.append({
                "center_lat": round(current_lat + lat_step/2, 6),
                "center_lng": round(current_lng + lng_step/2, 6),
                "zoom": 15
            })
            current_lng += lng_step
        current_lat += lat_step
    return grid

# Ví dụ tạo lưới bao phủ trung tâm Đà Nẵng
danang_grid = generate_bounding_box_grid(16.00, 108.15, 16.12, 108.26, step_km=1.5)
print(f"Tổng số ô quét cho Đà Nẵng: {len(danang_grid)} ô")
```

---

### 4.3. Giải Pháp Vượt Rào Cản Anti-Bot & Xoay Proxy
Google Maps là một trong những dịch vụ có hệ thống phát hiện bot tinh vi nhất của Google:
1. **Loại Proxy Bắt Buộc:**
   - ❌ **Datacenter Proxy (AWS, DigitalOcean, Hetzner, Vultr):** Bị Google phát hiện và chặn CAPTCHA ngay lập tức sau 10 - 20 request.
   - ✅ **Rotating Residential Proxy (Proxy dân cư xoay vòng):** Bắt buộc phải dùng (các nhà cung cấp như Smartproxy, Bright Data, IPRoyal, Webshare). IP xuất phát từ nhà mạng dân dụng (Viettel, VNPT, Comcast, AT&T) nên Google xem như người dùng thật.
2. **Che Dấu Vân Tay Trình Duyệt (Browser Fingerprint Masking):**
   - Ẩn cờ `navigator.webdriver = false`.
   - Giả lập WebGL Vendor và Renderer chuẩn card đồ họa người dùng thật (thay vì SwiftShader của Chrome Headless).
   - Random hóa User-Agent tương thích chính xác với phiên bản Chrome và TLS Client Hello fingerprint (JA3/JA4).
3. **Điều Tiết Tần Suất:** Thêm độ trễ ngẫu nhiên (random delay 1.5s - 3.5s) giữa các lần cuộn chuột để mô phỏng hành vi cuộn đọc của con người.

---

## 5. Thiết Kế Cơ Sở Dữ Liệu Riêng (PostgreSQL + PostGIS Architecture)

Để lưu trữ hàng trăm nghìn địa điểm với khả năng tìm kiếm theo bán kính (Location-based query) và khử trùng lặp dữ liệu:

```sql
-- Kích hoạt extension PostGIS để xử lý tọa độ không gian
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Bảng lưu trữ địa điểm cốt lõi (Core Places)
CREATE TABLE places (
    place_id VARCHAR(120) PRIMARY KEY, -- Khóa chính chống trùng lặp từ Google
    cid VARCHAR(64),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    sub_categories TEXT[],
    address TEXT,
    city VARCHAR(100),
    state_province VARCHAR(100),
    country_code VARCHAR(10) DEFAULT 'VN',
    postal_code VARCHAR(20),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326), -- Tọa độ không gian PostGIS chuẩn WGS84
    phone VARCHAR(50),
    website TEXT,
    emails TEXT[],
    social_profiles JSONB DEFAULT '{}'::jsonb, -- Facebook, Instagram, LinkedIn...
    rating NUMERIC(2, 1),
    reviews_count INTEGER DEFAULT 0,
    price_level VARCHAR(10),
    opening_hours JSONB,
    is_claimed BOOLEAN DEFAULT FALSE,
    raw_data JSONB, -- Lưu payload JSON gốc đề phòng cần trích xuất thêm
    scraped_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tạo Index không gian (Spatial Index) và Index tìm kiếm danh mục/tên
CREATE INDEX idx_places_geom ON places USING GIST (geom);
CREATE INDEX idx_places_category ON places (category);
CREATE INDEX idx_places_city ON places (city);
CREATE INDEX idx_places_phone ON places (phone);

-- 2. Trigger tự động tính trường geom khi có lat/lng
CREATE OR REPLACE FUNCTION update_places_geom()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_places_geom_update
BEFORE INSERT OR UPDATE ON places
FOR EACH ROW
EXECUTE FUNCTION update_places_geom();

-- 3. Ví dụ câu lệnh nạp dữ liệu chống trùng lặp (Upsert)
INSERT INTO places (place_id, title, category, address, latitude, longitude, phone, website, rating, reviews_count)
VALUES ('ChIJxxxxxxx', 'The Coffee House', 'Cafe', '123 Nguyễn Văn Linh, Đà Nẵng', 16.0612, 108.2185, '02871087088', 'https://thecoffeehouse.com', 4.5, 420)
ON CONFLICT (place_id) 
DO UPDATE SET
    title = EXCLUDED.title,
    rating = EXCLUDED.rating,
    reviews_count = EXCLUDED.reviews_count,
    phone = COALESCE(EXCLUDED.phone, places.phone),
    website = COALESCE(EXCLUDED.website, places.website),
    updated_at = NOW();

-- 4. Câu lệnh truy vấn tìm tất cả quán cafe trong bán kính 3km từ Cầu Rồng Đà Nẵng
SELECT place_id, title, address, phone, rating,
       ROUND((ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint(108.2274, 16.0614), 4326)::geography))::numeric, 0) AS distance_meters
FROM places
WHERE category ILIKE '%cafe%'
  AND ST_DWithin(geom::geography, ST_SetSRID(ST_MakePoint(108.2274, 16.0614), 4326)::geography, 3000)
ORDER BY distance_meters ASC;
```

---

## 6. So Sánh Chi Phí Thực Tế Giữa Các Phương Án (Chi Phí Cho 100.000 Địa Điểm)

| Hạng Mục So Sánh | Tự Dựng `gosom/gmaps-scraper` + Docker | Dùng Cloud Apify Scraper | Dùng Outscraper API | Dùng Google Places API Chính Thức |
| :--- | :--- | :--- | :--- | :--- |
| **Bản Quyền Phần Mềm** | **$0** (Open-source MIT) | $49/tháng (Gói Personal) | $0 (Pay-as-you-go) | $0 |
| **Chi Phí Proxy / Yêu Cầu** | ~$15 - $25 (Proxy dân cư 5 - 10 GB) | Đã bao gồm trong chi phí token | Đã bao gồm trong API | Không cần proxy |
| **Tổng Chi Phí Cho 100k Records** | **~$20 - $35** | **~$150 - $250** | **~$250 - $300** | **~$3.000 - $4.000+** |
| **Quyền Sở Hữu Dữ Liệu** | **Sở hữu vĩnh viễn** | **Sở hữu vĩnh viễn** | **Sở hữu vĩnh viễn** | **Cấm lưu trữ quá 30 ngày (Vi phạm ToS)** |
| **Thời Gian Triển Khai** | 1 - 2 giờ cấu hình VPS/Docker | 10 phút tạo tài khoản và chạy | 5 phút nhập từ khóa trên Web | 30 phút đăng ký Cloud Console |
| **Rủi Ro Hạ Tầng** | Cần theo dõi fix lỗi nếu Google đổi DOM | 0 (Vendor tự bảo trì code) | 0 (Vendor tự bảo trì code) | 0 (API chính thức) |

---

## 7. Khung Pháp Lý & Khuyến Cáo Tuân Thủ (Legal & Compliance)

### 7.1. Cào Dữ Liệu Công Khai (Public Data Scraping) Có Bị Kiện Không?
- **Án Lệ Quốc Tế:**
  - Vụ kiện *hiQ Labs v. LinkedIn (Tòa Phúc thẩm Liên bang Hoa Kỳ - 2022)*: Phán quyết việc cào dữ liệu công khai trên Internet không cần đăng nhập không vi phạm Đạo luật Lừa đảo và Lạm dụng Máy tính (CFAA).
  - Vụ kiện *Meta v. Bright Data (2024)*: Tòa án liên bang khẳng định Bright Data không vi phạm hợp đồng khi thu thập dữ liệu công khai trên Facebook/Instagram mà không sử dụng tài khoản đăng nhập.
- **Quy định của Google:** Điều khoản Dịch vụ (ToS) của Google cấm hành vi tự động thu thập (automated querying). Biện pháp chế tài của Google là **kỹ thuật (Technical Countermeasures)**: Khóa IP tạm thời, chặn CAPTCHA, chứ chưa từng có tiền lệ kiện cá nhân/công ty nhỏ thu thập dữ liệu doanh nghiệp công khai.

### 7.2. Pháp Luật Việt Nam — Nghị Định 13/2023/NĐ-CP (Bảo Vệ Dữ Liệu Cá Nhân)
- **Dữ Liệu Doanh Nghiệp vs Dữ Liệu Cá Nhân:**
  - Tên cửa hàng, địa chỉ trụ sở, số điện thoại hotline, email công ty, tọa độ GPS được công bố công khai trên Google Maps nhằm mục đích quảng bá kinh doanh: **Không thuộc diện dữ liệu cá nhân nhạy cảm cần bảo vệ theo Nghị định 13.**
  - **Lưu ý đặc biệt:** Nếu trích xuất tên tài khoản của người viết đánh giá (Reviewer) kèm ảnh đại diện hoặc số điện thoại di động cá nhân của chủ hộ kinh doanh cá thể, **TUYỆT ĐỐI KHÔNG** đem bán lại tệp dữ liệu cá nhân này cho bên thứ ba (hành vi mua bán trái phép dữ liệu cá nhân có thể bị xử phạt hành chính lên tới 100 triệu đồng hoặc xử lý hình sự theo Điều 288 BLHS).

---

## 8. Quy Trình 5 Bước Triển Khai Xây Dựng Dataset Thực Chiến

1. **Bước 1 - Lập Kế Hoạch Phân Vùng:** Xác định tọa độ bounding box của tỉnh/thành phố và danh sách từ khóa ngành nghề (F&B, khách sạn, bán lẻ, gara, phòng khám...).
2. **Bước 2 - Chuẩn Bị Hạ Tầng:** Khởi chạy 1 VPS Ubuntu (4 Core, 8GB RAM), cài đặt Docker, PostgreSQL 16 và PostGIS.
3. **Bước 3 - Mua Proxy Dân Cư Xoay Vòng:** Đăng ký gói Residential Proxy (khoảng 3GB - 5GB để cào thử nghiệm) tại Webshare, Smartproxy hoặc IPRoyal.
4. **Bước 4 - Khởi Chạy Bộ Cào `gosom/google-maps-scraper`:** Nạp danh sách từ khóa + tọa độ vào PostgreSQL Queue, kích hoạt worker nodes cào song song.
5. **Bước 5 - Chuẩn Hóa & Làm Giàu Dữ Liệu:** Chạy script de-duplicate bằng `place_id`, parse số điện thoại chuẩn E.164 (+84...), và dùng script phụ crawl website để bổ sung email/mạng xã hội.
