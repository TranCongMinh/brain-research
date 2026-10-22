# BrokerConnect — UI Prototype

**Generated:** 2026-10-05
**Style:** Modern SaaS (daisyUI "light" theme)
**Tech:** HTML + Tailwind CSS (Play CDN) + daisyUI v4 (CDN) + vanilla JS
**Spec:** `../docs/superpowers/specs/2026-10-05-broker-connect-platform-design.md`

Interactive click-through mock of the co-broke platform for rental-housing and
vehicle brokers. No backend — all state lives in `localStorage` (seeded with
sample brokers/listings/deals on first load), so actions like sending a
co-broke request, accepting it, closing a deal, and rating a partner actually
change what you see as you click through.

## Pages

| Page | File | Screenshot |
|------|------|-----------|
| Đăng ký / Onboarding | index.html | screenshots/index.png |
| Bảng tin nhóm (Feed) | feed.html | screenshots/feed.png |
| Chi tiết tin đăng | listing-detail.html | screenshots/listing-detail.png |
| Đăng tin mới | create-listing.html | screenshots/create-listing.png |
| Deal của tôi | my-deals.html | screenshots/my-deals.png |
| Chi tiết Deal | deal-detail.html | screenshots/deal-detail.png |
| Hồ sơ | profile.html | screenshots/profile.png |

## How to View

Open `index.html` directly in a browser, or serve the folder:

```bash
npx serve . -p 3000
```

Then visit http://localhost:3000. You're logged in as **Nguyễn A** (seed user
`u1`). Sidebar has a "↺ Reset dữ liệu demo" link to wipe localStorage and
start over with fresh seed data at any time.

## Try the interactive flow

1. On the feed, open any listing and click **"Gửi yêu cầu đồng môi giới"** —
   fills in client notes, submits, redirects to **Deal của tôi**.
2. On **Deal của tôi**, open the deal titled *Căn hộ studio Mỹ Đình* (you're
   the listing owner there) and click **Chấp nhận** — contact info reveals,
   status moves to "Đang xử lý".
3. Mark the deal **✓ Thành công**, then submit a star rating — it's saved and
   shown on return visits.
4. Visit **Hồ sơ** to see your listings, deal history, and ratings received.

## Design System

- Font: Inter
- Colors: daisyUI "light" theme, primary = indigo
- Layout: daisyUI `drawer` (sidebar + topbar) on authenticated pages
- Data layer: `js/data.js` — seed data + localStorage read/write helpers,
  shared by every page via `<script src="js/data.js">`

## Known limits (intentional — this is a mock)

- Single fixed user session (Nguyễn A); no real login/logout.
- No real OTP/CCCD verification — onboarding steps advance on click.
- No server, no persistence beyond this browser's localStorage.
