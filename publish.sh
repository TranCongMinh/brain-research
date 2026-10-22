#!/usr/bin/env bash
set -e

# ==============================================================================
# Brain Research & Artifacts Hub — Auto Sync & Publish to GitHub Pages
# ==============================================================================

SRC_DIR="/Users/mac/Desktop/Brain"
WEB_DIR="/Users/mac/Desktop/brain-research-web"

echo "🔄 [1/4] Đồng bộ các báo cáo mới từ Desktop/Brain..."

# Sync research folder if Desktop/Brain exists
if [ -d "$SRC_DIR/research" ]; then
  rsync -av --exclude=".*" "$SRC_DIR/research/" "$WEB_DIR/research/"
fi

# Sync mock-ui and prototypes if updated
if [ -d "$SRC_DIR/mock-ui" ]; then
  rsync -av --exclude=".*" "$SRC_DIR/mock-ui/" "$WEB_DIR/mock-ui/"
fi
if [ -d "$SRC_DIR/prototypes-xe-danang" ]; then
  rsync -av --exclude=".*" "$SRC_DIR/prototypes-xe-danang/" "$WEB_DIR/prototypes-xe-danang/"
fi
if [ -d "$SRC_DIR/prototypes" ]; then
  rsync -av --exclude=".*" "$SRC_DIR/prototypes/" "$WEB_DIR/prototypes/"
fi

echo "⚙️  [2/4] Chuẩn hóa đường dẫn tương đối (Relative URLs)..."
python3 - << 'EOF'
import os
import re
import json

base_dir = "/Users/mac/Desktop/brain-research-web"

# Scan research directories for index.html
topics = []
research_dir = os.path.join(base_dir, "research")
for item in sorted(os.listdir(research_dir)):
    topic_path = os.path.join(research_dir, item)
    if os.path.isdir(topic_path) and os.path.exists(os.path.join(topic_path, "index.html")):
        # Read title from index.html
        with open(os.path.join(topic_path, "index.html"), "r", encoding="utf-8") as f:
            html = f.read()
        
        # Extract title
        m_title = re.search(r'<title>(.*?)</title>', html, re.IGNORECASE)
        title = m_title.group(1).strip() if m_title else item
        
        # Determine category & tags
        cat = "Deep Research"
        tags = ["Research"]
        if "vinfast" in item or "xe" in item:
            tags.extend(["Xe Điện", "Đà Nẵng"])
        elif "territory" in item or "cx5" in item:
            tags.extend(["Ô Tô", "So Sánh"])
        elif "cv" in item:
            tags.extend(["CV Review", "Career"])
        
        # Fix back button in topic index.html
        html = re.sub(r'href="[^"]*artifacts-dashboard\.html"', 'href="../../index.html"', html)
        html = re.sub(
            r'function copyCurrentPath\(\)\s*\{.*?\}',
            '''function copyCurrentPath() {
      navigator.clipboard.writeText(window.location.href).then(() => {
        showToast('Đã copy link bài viết: ' + window.location.href);
      }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = window.location.href;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('Đã copy link bài viết!');
      });
    }''',
            html,
            flags=re.DOTALL
        )
        with open(os.path.join(topic_path, "index.html"), "w", encoding="utf-8") as f:
            f.write(html)
        
        size_kb = round(os.path.getsize(os.path.join(topic_path, "index.html")) / 1024, 1)
        mtime = os.path.getmtime(os.path.join(topic_path, "index.html"))
        import datetime
        mtime_str = datetime.datetime.fromtimestamp(mtime).strftime("%Y-%m-%d %H:%M")
        
        # Extract summary or create clean summary
        summary = f"Báo cáo nghiên cứu trực quan về chủ đề {title}."
        m_summary = re.search(r'<p class="text-sm sm:text-base text-slate-300[^>]*>(.*?)</p>', html, re.DOTALL)
        if m_summary:
            clean_s = re.sub(r'<[^>]+>', '', m_summary.group(1)).strip().replace("\n", " ")
            if len(clean_s) > 10:
                summary = clean_s[:300] + "..." if len(clean_s) > 300 else clean_s

        topics.append({
            "id": item.replace("-", "_") + "_html",
            "title": title,
            "filename": "index.html",
            "path": f"research/{item}/index.html",
            "category": cat,
            "tags": tags,
            "summary": summary,
            "mtime": mtime_str,
            "size_kb": size_kb,
            "is_html": True
        })

# Load existing catalog to preserve prototypes
cat_file = os.path.join(base_dir, "research/artifacts_catalog.json")
existing = []
if os.path.exists(cat_file):
    with open(cat_file, "r", encoding="utf-8") as f:
        existing = json.load(f)

# Keep prototypes and mock-ui
prototypes = [x for x in existing if x.get("category") == "Prototypes & UI"]

# Normalize prototype paths to relative for GitHub Pages
for p in prototypes:
    raw_path = p.get("path", "")
    if "/mock-ui/" in raw_path:
        p["path"] = "mock-ui/" + os.path.basename(raw_path)
    elif "/prototypes-xe-danang/" in raw_path:
        p["path"] = "prototypes-xe-danang/" + os.path.basename(raw_path)
    elif "/prototypes/" in raw_path or "interview_copilot" in raw_path:
        p["path"] = "prototypes/" + os.path.basename(raw_path)

# Combine topics + prototypes
final_catalog = topics + prototypes

# Save catalog
with open(cat_file, "w", encoding="utf-8") as f:
    json.dump(final_catalog, f, ensure_ascii=False, indent=2)

# Update index.html CATALOG definition
with open(os.path.join(base_dir, "index.html"), "r", encoding="utf-8") as f:
    dash = f.read()

pattern = r"const CATALOG\s*=\s*\[.*?\];"
catalog_json_str = json.dumps(final_catalog, ensure_ascii=False)
dash = re.sub(pattern, f"const CATALOG = {catalog_json_str};", dash, flags=re.DOTALL)

with open(os.path.join(base_dir, "index.html"), "w", encoding="utf-8") as f:
    f.write(dash)
with open(os.path.join(base_dir, "artifacts-dashboard.html"), "w", encoding="utf-8") as f:
    f.write(dash)

print(f"Catalog regenerated with {len(final_catalog)} HTML items!")
EOF

echo "📦 [3/4] Commit mã nguồn vào Git..."
cd "$WEB_DIR"
git add .
if git diff --staged --quiet; then
  echo "ℹ️  Không có thay đổi mới cần commit."
else
  git commit -m "feat(publish): update research reports & clean relative urls ($(date '+%Y-%m-%d %H:%M:%S'))"
fi

echo "🚀 [4/4] Push lên GitHub Pages..."
git push origin main

echo ""
echo "=========================================================================="
echo "✅ XUẤT BẢN THÀNH CÔNG LÊN GITHUB PAGES!"
echo "🌐 URL: https://trancongminh.github.io/brain-research/"
echo "=========================================================================="
