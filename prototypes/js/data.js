/* BrokerConnect — mock data layer (localStorage only, no backend) */

const SEED = {
  brokers: [
    { id: 'u1', name: 'Nguyễn A', phone: '0901234567', verified: true, rating: 4.8, dealsCount: 23, joinedAt: '2026-01-10', groups: ['hn-thue', 'hcm-xe'] },
    { id: 'u2', name: 'Trần B', phone: '0987654321', verified: true, rating: 4.5, dealsCount: 15, joinedAt: '2025-11-02', groups: ['hn-thue'] },
    { id: 'u3', name: 'Lê C', phone: '0912345678', verified: true, rating: 4.2, dealsCount: 9, joinedAt: '2025-09-20', groups: ['hcm-xe', 'hn-thue'] },
    { id: 'u4', name: 'Phạm D', phone: '0933221144', verified: false, rating: 0, dealsCount: 0, joinedAt: '2026-03-01', groups: ['hcm-xe'] }
  ],
  groups: [
    { id: 'hn-thue', name: 'Nhà thuê Hà Nội', category: 'thue', province: 'Hà Nội' },
    { id: 'hn-xe', name: 'Xe Hà Nội', category: 'xe', province: 'Hà Nội' },
    { id: 'hcm-thue', name: 'Nhà thuê TP.HCM', category: 'thue', province: 'TP.HCM' },
    { id: 'hcm-xe', name: 'Xe TP.HCM', category: 'xe', province: 'TP.HCM' }
  ],
  listings: [
    { id: 'l1', type: 'thue', title: 'Chung cư 2PN Cầu Giấy', ownerId: 'u2', groupId: 'hn-thue', price: 8000000, priceUnit: 'tháng', area: 65, rooms: 2, commissionPct: 50, desc: 'Căn góc, đầy đủ nội thất, gần Vincom Cầu Giấy, hợp đồng dài hạn.', createdAt: '2026-09-28' },
    { id: 'l2', type: 'xe', title: 'Honda City 2022', ownerId: 'u3', groupId: 'hcm-xe', price: 600000, priceUnit: 'ngày', plate: '51K-123.45', commissionPct: 20, desc: 'Xe mới 90%, bảo hiểm đầy đủ, giao nhận tại quận 1.', createdAt: '2026-09-30' },
    { id: 'l3', type: 'thue', title: 'Căn hộ studio Mỹ Đình', ownerId: 'u1', groupId: 'hn-thue', price: 5500000, priceUnit: 'tháng', area: 35, rooms: 1, commissionPct: 40, desc: 'Studio mới xây, full nội thất, an ninh 24/7.', createdAt: '2026-10-01' },
    { id: 'l4', type: 'xe', title: 'Mazda CX5 2021', ownerId: 'u2', groupId: 'hcm-xe', price: 900000, priceUnit: 'ngày', plate: '59A-678.90', commissionPct: 30, desc: 'SUV 7 chỗ, phù hợp đi tỉnh, có tài xế tùy chọn.', createdAt: '2026-10-02' },
    { id: 'l5', type: 'thue', title: 'Nhà nguyên căn Tây Hồ', ownerId: 'u3', groupId: 'hn-thue', price: 15000000, priceUnit: 'tháng', area: 120, rooms: 4, commissionPct: 50, desc: 'Nhà 4 tầng, sân vườn, phù hợp gia đình hoặc văn phòng.', createdAt: '2026-10-03' }
  ],
  deals: [
    { id: 'd1', listingId: 'l1', requesterId: 'u1', ownerId: 'u2', splitRequester: 50, splitOwner: 50, note: 'Khách cần gấp, chuyển công tác ra Hà Nội đầu tháng sau.', status: 'pending', createdAt: '2026-10-03', rating: {} },
    { id: 'd2', listingId: 'l3', requesterId: 'u3', ownerId: 'u1', splitRequester: 60, splitOwner: 40, note: 'Khách là sinh viên năm cuối, đã xem ảnh và ưng.', status: 'pending', createdAt: '2026-10-01', rating: {} },
    { id: 'd3', listingId: 'l2', requesterId: 'u1', ownerId: 'u3', splitRequester: 50, splitOwner: 50, note: 'Khách thuê xe đi công tác Đà Lạt 3 ngày.', status: 'closed_won', createdAt: '2026-09-15', rating: { byRequester: { stars: 5, comment: 'Chốt nhanh, chủ xe hợp tác tốt.' } } },
    { id: 'd4', listingId: 'l4', requesterId: 'u2', ownerId: 'u1', splitRequester: 50, splitOwner: 50, note: 'Khách báo đã cọc nhưng chủ xe nói chưa nhận được.', status: 'disputed', createdAt: '2026-09-20', rating: {} },
    { id: 'd5', listingId: 'l5', requesterId: 'u1', ownerId: 'u3', splitRequester: 50, splitOwner: 50, note: 'Gia đình 4 người cần nhà nguyên căn, đã xem ảnh và rất ưng.', status: 'accepted', createdAt: '2026-10-02', rating: {} }
  ],
  currentUserId: 'u1'
};

const DB_KEY = 'bc_db_v1';

function dbLoad() {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    localStorage.setItem(DB_KEY, JSON.stringify(SEED));
    return JSON.parse(JSON.stringify(SEED));
  }
  try { return JSON.parse(raw); } catch (e) {
    localStorage.setItem(DB_KEY, JSON.stringify(SEED));
    return JSON.parse(JSON.stringify(SEED));
  }
}

function dbSave(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function resetDemoData() {
  localStorage.removeItem(DB_KEY);
  location.reload();
}

const api = {
  currentUser() {
    const db = dbLoad();
    return db.brokers.find(b => b.id === db.currentUserId);
  },
  broker(id) {
    return dbLoad().brokers.find(b => b.id === id);
  },
  groups() {
    return dbLoad().groups;
  },
  group(id) {
    return dbLoad().groups.find(g => g.id === id);
  },
  myGroups() {
    const db = dbLoad();
    const me = db.brokers.find(b => b.id === db.currentUserId);
    return db.groups.filter(g => me.groups.includes(g.id));
  },
  listings(filter) {
    let items = dbLoad().listings;
    if (filter) {
      if (filter.groupId) items = items.filter(l => l.groupId === filter.groupId);
      if (filter.type) items = items.filter(l => l.type === filter.type);
    }
    return items.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  },
  listing(id) {
    return dbLoad().listings.find(l => l.id === id);
  },
  addListing(obj) {
    const db = dbLoad();
    const id = 'l' + (db.listings.length + 1) + '_' + Date.now().toString(36).slice(-4);
    const listing = Object.assign({ id, ownerId: db.currentUserId, createdAt: new Date().toISOString().slice(0, 10) }, obj);
    db.listings.unshift(listing);
    dbSave(db);
    return listing;
  },
  deals(filter) {
    const db = dbLoad();
    let items = db.deals.filter(d => d.requesterId === db.currentUserId || d.ownerId === db.currentUserId);
    if (filter && filter.status) items = items.filter(d => d.status === filter.status);
    return items.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  },
  deal(id) {
    return dbLoad().deals.find(d => d.id === id);
  },
  addDeal(obj) {
    const db = dbLoad();
    const id = 'd' + (db.deals.length + 1) + '_' + Date.now().toString(36).slice(-4);
    const deal = Object.assign({ id, status: 'pending', createdAt: new Date().toISOString().slice(0, 10), rating: {} }, obj);
    db.deals.unshift(deal);
    dbSave(db);
    return deal;
  },
  updateDeal(id, patch) {
    const db = dbLoad();
    const deal = db.deals.find(d => d.id === id);
    if (!deal) return null;
    Object.assign(deal, patch);
    dbSave(db);
    return deal;
  }
};

function qs(name) {
  return new URLSearchParams(location.search).get(name);
}

function showToast(message, type) {
  type = type || 'success';
  const wrap = document.createElement('div');
  wrap.className = 'toast toast-top toast-end z-50';
  wrap.innerHTML = '<div class="alert alert-' + type + ' shadow-lg"><span>' + message + '</span></div>';
  document.body.appendChild(wrap);
  setTimeout(() => wrap.remove(), 2600);
}

function statusBadge(status) {
  const map = {
    pending: ['badge-warning', '🟡 Chờ duyệt'],
    accepted: ['badge-info', '🔵 Đang xử lý'],
    closed_won: ['badge-success', '✅ Hoàn tất'],
    closed_lost: ['badge-ghost', '⚪ Không thành'],
    disputed: ['badge-error', '🔴 Tranh chấp']
  };
  const v = map[status] || ['badge-ghost', status];
  return '<span class="badge ' + v[0] + ' badge-sm">' + v[1] + '</span>';
}

function fmtVND(n) {
  return n.toLocaleString('vi-VN') + 'đ';
}

function renderMyGroupsMenu() {
  const el = document.getElementById('my-groups-menu');
  if (!el) return;
  const groups = api.myGroups();
  el.innerHTML = groups.map(g =>
    '<li><a href="feed.html?group=' + g.id + '">' + (g.category === 'thue' ? '🏠' : '🚗') + ' ' + g.name + '</a></li>'
  ).join('') + '<li><a class="text-base-content/50">+ Tham gia nhóm khác</a></li>';
}

function renderUserBadge() {
  const me = api.currentUser();
  const elInitial = document.getElementById('user-initial');
  if (elInitial) elInitial.textContent = me.name.charAt(0);
  const elName = document.getElementById('user-name-display');
  if (elName) elName.textContent = me.name;
}

document.addEventListener('DOMContentLoaded', () => {
  renderMyGroupsMenu();
  renderUserBadge();
  const resetLink = document.getElementById('reset-demo-data');
  if (resetLink) resetLink.addEventListener('click', (e) => { e.preventDefault(); resetDemoData(); });
});
