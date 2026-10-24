# BÁO CÁO NGHIÊN CỨU & HƯỚNG DẪN TÁC CHIẾN: CHUYỂN ĐỔI TỪ BACKEND DEVELOPER SANG DEVOPS ENGINEER (HỆ THỐNG IPELLIO)
> **Chủ đề:** Làm chủ toàn diện hạ tầng AWS Lightsail, Docker Compose, Caddy Ingress, RDS PostgreSQL 16, Celery Worker, ECS Fargate & Safe CI/CD Rollback  
> **Topic Slug:** `ipellio-devops-mastery`  
> **Tác giả:** Loki Deep Research & Visualizer  
> **Ngày hoàn thành:** 24/10/2026  
> **Bản tương tác HTML:** [Xem Giao Diện Trực Quan](index.html)

---

## 🎯 1. KẾT LUẬN CỐT LÕI (EXECUTIVE SUMMARY)

1. **Triết lý Tối ưu Chi phí:**
   - Sử dụng **AWS Lightsail** (Singapore cho Dev, Sydney cho Prod) để chạy toàn bộ Stateless Containers với chi phí cố định chỉ **$20 - $40/tháng** (so với $300 - $600/tháng của AWS EKS/ECS).
   - Tách biệt hoàn toàn Stateless Compute (Containers) khỏi Stateful Data (RDS PostgreSQL, S3, Redis) và Batch Workloads (ECS Fargate Spot).
2. **Tối ưu Hóa Tốc độ & CI/CD:**
   - Ứng dụng `dorny/paths-filter` để bỏ qua các ứng dụng không bị sửa đổi trong monorepo.
   - Kích hoạt Docker BuildKit Cache Mounts (`pip-cache`, `pnpm-store`), rút ngắn thời gian build từ 7 phút xuống còn ~1.5 phút.
   - Triển khai cơ chế **Safe Rollback**: Ghi nhớ pre-pull Image SHA và chạy smoke test 10 lần retry. Nếu thất bại, tự động revert về image cũ trong < 30 giây mà không cần can thiệp thủ công.
3. **An Toàn Bảo Mật & Ổn Định:**
   - 100% bí mật (secrets) được kéo động từ **AWS SSM Parameter Store** thông qua script `env-pull.sh`. Tuyệt đối không commit plaintext secrets vào repo.
   - Caddy làm Ingress duy nhất mở port 80/443; các container nội bộ kết nối qua Docker bridge network, cô lập hoàn toàn khỏi Internet.
   - Redis được thiết lập cờ `maxmemory 256mb` và `volatile-lru` để chống sập OOM khi cache đầy.

---

## 🏛️ 2. VÒNG ĐỜI GIAO TIẾP ĐA TẦNG (MULTI-LAYER LIFECYCLE)

1. **Client -> Cloudflare Edge:**
   - Wildcard SSL Termination, DDoS Shield L3/L4, Web Application Firewall (WAF).
   - Chế độ SSL: `Full (Strict)`.
2. **Cloudflare -> Caddy Ingress (Lightsail :443):**
   - Đọc Host Header định tuyến nội bộ: `api.ipellio.com` -> `api-gateway:8000`, `workspace.ipellio.com` -> `workspace:3000`.
   - Bổ sung header định danh: `X-Real-IP`, `X-Forwarded-For`.
3. **Caddy -> FastAPI Core Gateway:**
   - Uvicorn ASGI xử lý REST request, validate Pydantic.
   - Tra cứu cache tại `redis://redis:6379/1`.
   - Lấy kết nối từ `asyncpg pool` query AWS RDS PostgreSQL 16 (Private Subnet).
4. **FastAPI -> Celery Worker & Beat:**
   - Đẩy background task vào `redis://redis:6379/0`.
   - Celery worker lắng nghe queues: `sync`, `workspace_abn` với cờ `--max-tasks-per-child=50` để dọn dẹp RAM triệt để.
5. **ECS Fargate Batch Sync (17:00 UTC):**
   - Tác vụ nặng cần 8GB RAM được tách ra khỏi Lightsail.
   - Chạy trên `FARGATE_SPOT` (tiết kiệm 70% chi phí), lấy Postgres Advisory Lock `pg_try_advisory_lock` để chống chạy trùng lặp.
   - Hoàn thành xong tự động hủy container.

---

## 🚨 3. RUNBOOK ỨNG CỨU SỰ CỐ KHẨN CẤP (GOTCHAS & MITIGATION)

| Sự cố | Triệu chứng | Nguyên nhân cốt lõi | Lệnh ứng cứu nhanh |
| :--- | :--- | :--- | :--- |
| **OOMKilled** | Exit Code 137 | Container vượt RAM trần, thiếu Swapfile | `sudo fallocate -l 2G /swapfile && sudo swapon /swapfile` |
| **502 Bad Gateway** | Caddy màn hình trắng 502 | Backend container chết hoặc chưa boot xong | `docker compose logs -n 100 api-gateway` & `curl -I localhost:8000/api/health` |
| **Alembic Lock** | Migration treo cứng, web chậm | Dính `AccessExclusiveLock` do query khác đang chạy | Query `pg_stat_activity` tìm pid và chạy `SELECT pg_terminate_backend(pid)` |
| **Redis OOM** | Lỗi OOM command not allowed | Redis đầy bộ nhớ, chưa bật eviction | `docker compose exec redis redis-cli CONFIG SET maxmemory-policy volatile-lru` |
| **Lightsail 100% CPU** | Web chậm, SSH timeout | Kẹt task hoặc loop | `docker stats --no-stream` tìm container ngốn CPU và `docker compose restart <service>` |

---

## 🛠️ 4. CHEATSHEET LỆNH VẬN HÀNH

- **Kiểm tra trạng thái:** `docker compose ps`
- **Theo dõi tài nguyên:** `docker stats --no-stream`
- **Xem log real-time:** `docker compose logs -f --tail=100 api-gateway`
- **Kiểm tra cú pháp Caddy:** `docker compose exec caddy caddy validate --config /etc/caddy/Caddyfile`
- **Reload Caddy mượt mà:** `docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile`
- **Dọn rác Docker đĩa cứng:** `docker image prune -af --filter "until=72h"`
- **Kéo biến môi trường từ SSM:** `bash scripts/env-pull.sh`
