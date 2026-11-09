"use strict";
/* ============================================================
   我的記帳本 app.js
   區塊：
   1. 設定          2. 資料讀取與儲存   3. 工具
   4. 計算（餘額、信用卡、固定支出、分配）
   5. 畫面（首頁、明細、帳戶、規劃、報表）
   6. 彈出表單      7. 動作（繳費、匯出、備份…）
   8. 事件處理      9. 啟動
   ============================================================ */

// ========== 1. 設定 ==========
const KEYS = {
  accounts: "bookkeeping-accounts",
  tx: "bookkeeping-transactions",
  recurring: "bookkeeping-recurring",
  wishlist: "bookkeeping-wishlist",
  plan: "bookkeeping-allocation",
  checks: "bookkeeping-checks",
  stocks: "bookkeeping-stocks",
  settings: "bookkeeping-settings"
};

const CATEGORIES = {
  expense: ["餐飲", "交通", "購物", "居住", "娛樂", "醫療", "學習", "手續費", "其他"],
  income: ["薪資", "獎金", "投資", "其他收入"]
};

// 圖表用的顏色（漫畫風的平塗色）
const CAT_COLORS = {
  "餐飲": "#ffcf3f", "交通": "#5b8def", "購物": "#ff7a59", "居住": "#9b7bd8",
  "娛樂": "#ff9ec4", "醫療": "#4cbf8f", "學習": "#8fb339", "手續費": "#e0b04a", "其他": "#b9b2a3",
  "薪資": "#ffcf3f", "獎金": "#5b8def", "投資": "#4cbf8f", "其他收入": "#b9b2a3"
};

// 每個分類對應的怪物／寶物
const CAT_ICONS = {
  "餐飲": "slime", "交通": "bat", "購物": "mimic", "居住": "golem",
  "娛樂": "ghost", "醫療": "potion", "學習": "book", "手續費": "coins", "其他": "eye",
  "薪資": "coins", "獎金": "gem", "投資": "sprout", "其他收入": "bag"
};
const MONSTER_NAMES = {
  "餐飲": "史萊姆", "交通": "蝙蝠", "購物": "寶箱怪", "居住": "石頭人",
  "娛樂": "幽靈", "醫療": "藥水怪", "學習": "魔法書", "其他": "眼球怪"
};

const ACCOUNT_COLORS = ["#ffcf3f", "#5b8def", "#ff7a59", "#4cbf8f", "#9b7bd8", "#ff9ec4", "#8fb339", "#b9b2a3"];

// ---------- 手繪風圖示（全部原創） ----------
// class：f = 白色填色、k = 黑色填色、n = 不描邊、w = 白色描邊
const ICONS = {
  sword: `<path class="f" d="M41 7 L41 15 L21 35 L13 27 L33 7 Z"/><path d="M37 11 L19 29"/><path d="M8 24 L24 40" stroke-width="4"/><path d="M15 33 L8 40"/><circle class="k" cx="7" cy="41" r="2.5"/>`,
  chest: `<path class="f" d="M8 20 Q8 9 24 9 Q40 9 40 20 V40 H8 Z"/><path d="M8 20 H40 M8 27 H40"/><rect class="k" x="21" y="23" width="6" height="8" rx="1.5"/>`,
  portal: `<circle class="f" cx="24" cy="24" r="17"/><path d="M14 20 H33 M28 15 L33 20 L28 25"/><path d="M34 29 H15 M20 24 L15 29 L20 34"/>`,
  slime: `<path class="f" d="M7 39 Q6 15 24 11 Q42 15 41 39 Q36 36 32 39 Q28 36 24 39 Q20 36 16 39 Q12 36 7 39 Z"/><circle class="k" cx="18" cy="25" r="2.6"/><circle class="k" cx="30" cy="25" r="2.6"/><path d="M20 31 Q24 34 28 31"/><path d="M14 18 Q16 15 19 15"/>`,
  bat: `<path class="f" d="M16 26 L3 17 L7 27 L2 32 L12 31 L17 35 Z"/><path class="f" d="M32 26 L45 17 L41 27 L46 32 L36 31 L31 35 Z"/><path class="f" d="M19 20 L18 11 L23 17 Z"/><path class="f" d="M29 20 L30 11 L25 17 Z"/><path class="f" d="M24 17 C18 17 15 23 15 28 C15 34 19 38 24 38 C29 38 33 34 33 28 C33 23 30 17 24 17 Z"/><circle class="k" cx="20.5" cy="26" r="2"/><circle class="k" cx="27.5" cy="26" r="2"/><path d="M21 32 L22.5 34.5 L24 32 L25.5 34.5 L27 32"/>`,
  mimic: `<path class="f" d="M8 22 L12 9 H36 L40 22 Z"/><path class="f" d="M8 22 H40 V39 H8 Z"/><path class="f" d="M9 22 L12 28 L15 22 L18 28 L21 22 L24 28 L27 22 L30 28 L33 22 L36 28 L39 22"/><circle class="k" cx="19" cy="15.5" r="2.2"/><circle class="k" cx="29" cy="15.5" r="2.2"/><rect class="k" x="21" y="31" width="6" height="5" rx="1"/>`,
  golem: `<path class="f" d="M12 12 L20 8 H30 L37 12 L39 36 L33 41 H15 L9 36 Z"/><path d="M12 22 L17 22 M32 32 L37 31 M22 8 L24 13"/><rect class="k" x="16" y="20" width="6" height="5" rx="1"/><rect class="k" x="27" y="20" width="6" height="5" rx="1"/><path d="M18 32 H30"/>`,
  ghost: `<path class="f" d="M11 41 V22 Q11 7 24 7 Q37 7 37 22 V41 L33 37 L29 41 L24 37 L19 41 L15 37 Z"/><ellipse class="k" cx="19" cy="21" rx="2.3" ry="3.2"/><ellipse class="k" cx="29" cy="21" rx="2.3" ry="3.2"/><ellipse cx="24" cy="29" rx="2.5" ry="3"/>`,
  potion: `<rect class="k" x="19" y="4" width="10" height="5" rx="1.5"/><path class="f" d="M20 9 H28 V16 Q38 20 38 30 Q38 42 24 42 Q10 42 10 30 Q10 20 20 16 Z"/><path d="M11 27 Q17 24 24 27 Q31 30 37 27"/><circle class="k" cx="19" cy="33" r="2"/><circle class="k" cx="29" cy="33" r="2"/><path d="M22 37 Q24 38.5 26 37"/>`,
  book: `<path class="f" d="M5 12 Q15 7 24 13 Q33 7 43 12 V37 Q33 32 24 38 Q15 32 5 37 Z"/><path d="M24 13 V38"/><circle class="k" cx="14" cy="20" r="2.4"/><circle class="k" cx="34" cy="20" r="2.4"/><path d="M10 28 L13 31 L16 28 L19 31 M29 31 L32 28 L35 31 L38 28"/>`,
  eye: `<path d="M9 24 H4 M44 24 H39 M24 9 V4 M13 13 L10 10 M35 13 L38 10"/><circle class="f" cx="24" cy="24" r="15"/><circle class="k" cx="24" cy="24" r="6.5"/><circle class="f n" cx="26.5" cy="21.5" r="2"/>`,
  coins: `<path class="f" d="M10 32 V38 A14 5 0 0 0 38 38 V32 Z"/><ellipse class="f" cx="24" cy="32" rx="14" ry="5"/><path class="f" d="M10 22 V28 A14 5 0 0 0 38 28 V22 Z"/><ellipse class="f" cx="24" cy="22" rx="14" ry="5"/><path class="f" d="M10 12 V18 A14 5 0 0 0 38 18 V12 Z"/><ellipse class="f" cx="24" cy="12" rx="14" ry="5"/>`,
  gem: `<path class="f" d="M11 18 L18 8 H30 L37 18 L24 41 Z"/><path d="M11 18 H37 M18 8 L22 18 L24 41 M30 8 L26 18 L24 41"/>`,
  sprout: `<path class="f" d="M13 29 H35 L32 42 H16 Z"/><path d="M24 29 V17"/><path class="f" d="M24 22 Q13 23 11 12 Q22 11 24 21 Z"/><path class="f" d="M24 18 Q27 7 38 8 Q38 18 25 20 Z"/>`,
  bag: `<path class="f" d="M18 14 Q13 10 17 6 H31 Q35 10 30 14 Q41 21 39 33 Q37 42 24 42 Q11 42 9 33 Q7 21 18 14 Z"/><path d="M17 14 H31"/><path class="k n" d="M24 21 L26 26 L31 26 L27 29.5 L28.5 35 L24 31.5 L19.5 35 L21 29.5 L17 26 L22 26 Z"/>`,
  shield: `<path class="f" d="M24 5 L40 11 V23 Q40 36 24 43 Q8 36 8 23 V11 Z"/><path d="M24 5 V43 M8 21 H40"/>`,
  boss: `<path class="k" d="M11 19 L13 7 L19 13 L24 5 L29 13 L35 7 L37 19 Z"/><path class="f" d="M10 19 H38 V33 Q38 42 24 42 Q10 42 10 33 Z"/><path d="M15 25 L21 27.5 M33 25 L27 27.5"/><circle class="k" cx="18.5" cy="31" r="1.8"/><circle class="k" cx="29.5" cy="31" r="1.8"/><path class="f" d="M18 36 H30 L28 39 L26 36.5 L24 39 L22 36.5 L20 39 Z"/>`,
  castle: `<path d="M24 19 V5"/><path class="k" d="M24 5 L32 8 L24 11 Z"/><path class="f" d="M8 41 V19 H13 V13 H19 V19 H29 V13 H35 V19 H40 V41 Z"/><path class="k" d="M20 41 V33 Q24 28 28 33 V41 Z"/>`,
  scroll: `<rect class="f" x="11" y="9" width="26" height="32" rx="3"/><path class="f" d="M8 7 H40 Q43 7 43 10.5 Q43 14 40 14 H8 Q5 14 5 10.5 Q5 7 8 7 Z"/><path d="M17 21 H31 M17 27 H31 M17 33 H26"/>`,
  map: `<path class="f" d="M5 12 L17 8 L31 12 L43 8 V36 L31 40 L17 36 L5 40 Z"/><path d="M17 8 V36 M31 12 V40"/><path d="M21 21 L27 27 M27 21 L21 27" stroke-width="3"/>`,
  chart: `<rect class="f" x="5" y="8" width="38" height="32" rx="4"/><path d="M11 33 L19 24 L25 28 L36 15"/><path d="M29 15 H36 V22"/><circle class="k n" cx="19" cy="24" r="2.3"/><circle class="k n" cx="25" cy="28" r="2.3"/>`,
  orb: `<path class="f" d="M13 35 H35 L38 43 H10 Z"/><circle class="f" cx="24" cy="19" r="14"/><path d="M16 15 Q18 9 24 8"/><path class="k n" d="M28 17 L29.6 21.4 L34 23 L29.6 24.6 L28 29 L26.4 24.6 L22 23 L26.4 21.4 Z"/>`
};

// ---------- 收支分類（可以自訂，存在 appSettings.categories，會跟著雲端同步） ----------
const ICON_LABELS = {
  slime: "史萊姆", bat: "蝙蝠", mimic: "寶箱怪", golem: "石頭人", ghost: "幽靈", potion: "藥水怪",
  book: "魔法書", eye: "眼球怪", boss: "魔王", coins: "金幣", gem: "寶石", sprout: "魔法嫩芽",
  bag: "錢袋", chest: "寶箱", shield: "盾牌", scroll: "卷軸", map: "地圖", orb: "水晶球"
};
const CAT_ICON_CHOICES = Object.keys(ICON_LABELS);

function defaultCats(type) {
  return CATEGORIES[type].map(n => ({ name: n, icon: CAT_ICONS[n] || "eye", color: CAT_COLORS[n] || "#b9b2a3" }));
}
function catList(type) {
  const c = appSettings.categories && appSettings.categories[type];
  return c && c.length ? c : defaultCats(type);
}
// 找分類的圖示和顏色；分類被刪掉的舊紀錄，用內建或預設樣式
function catInfo(name) {
  for (const type of ["expense", "income"]) {
    const found = catList(type).find(c => c.name === name);
    if (found) return found;
  }
  return { name, icon: CAT_ICONS[name] || "eye", color: CAT_COLORS[name] || "#b9b2a3" };
}

function icon(name, cls = "") {
  return `<svg class="ic ${cls}" viewBox="0 0 48 48" aria-hidden="true">${ICONS[name] || ICONS.eye}</svg>`;
}

// 四角星星裝飾
function star(cx, cy, r) {
  const k = r * 0.16;
  return `<path class="k n" d="M${cx} ${cy - r} Q${cx + k} ${cy - k} ${cx + r} ${cy} Q${cx + k} ${cy + k} ${cx} ${cy + r} Q${cx - k} ${cy + k} ${cx - r} ${cy} Q${cx - k} ${cy - k} ${cx} ${cy - r} Z"/>`;
}

// 首頁的勇者（原創角色：圓頭盔小勇者，拿金幣盾牌和劍）
function heroSvg() {
  return `<svg class="hero-art" viewBox="0 0 200 170" role="img" aria-label="記帳勇者">
    ${star(34, 42, 13)}${star(54, 66, 6)}${star(170, 128, 12)}${star(186, 108, 6)}
    <ellipse class="k n shadow" cx="100" cy="160" rx="44" ry="5"/>
    <rect class="f" x="84" y="126" width="11" height="24"/><rect class="f" x="105" y="126" width="11" height="24"/>
    <rect class="k" x="79" y="147" width="18" height="11" rx="4"/><rect class="k" x="103" y="147" width="18" height="11" rx="4"/>
    <path class="k" d="M73 94 Q100 82 127 94 L132 132 H68 Z"/>
    <path class="w" d="M71 117 H129"/><rect class="f" x="94" y="111" width="12" height="12" rx="2.5"/>
    <path d="M128 102 L146 92" stroke-width="9"/><path class="w" d="M128 102 L146 92" stroke-width="3"/>
    <path class="f" d="M148 82 L171 30 L178 33 L157 87 Z"/><path d="M162 60 L171 39"/>
    <path d="M139 80 L162 92" stroke-width="5"/><circle class="f" cx="148" cy="91" r="7"/><circle class="k" cx="140" cy="100" r="3.5"/>
    <circle class="f" cx="100" cy="68" r="27"/>
    <path class="f" d="M71 66 Q71 34 100 34 Q129 34 129 66 Z"/><path d="M100 34 V66"/>
    <circle class="k n" cx="84" cy="58" r="2.2"/><circle class="k n" cx="116" cy="58" r="2.2"/>
    <path class="k" d="M100 34 Q104 15 124 13 Q113 22 109 35 Z"/>
    <circle class="k n" cx="91" cy="77" r="3.4"/><circle class="k n" cx="109" cy="77" r="3.4"/>
    <path d="M91 85 Q100 92 109 85"/>
    <circle class="f" cx="66" cy="112" r="23"/><circle cx="66" cy="112" r="15"/>${star(66, 112, 9)}
  </svg>`;
}

// 等級：每記一筆 +10 經驗，存錢筒買到 +50
const RANKS = [[1, "見習冒險者"], [3, "木劍劍士"], [5, "銅盾戰士"], [8, "銀甲騎士"], [12, "金冠勇者"], [16, "傳說理財王"]];
function expNeeded(level) { return 25 * level * (level - 1); }  // 升到這一級需要的總經驗
function heroStats() {
  const exp = transactions.length * 10 + wishlist.filter(w => w.bought).length * 50 + checks.length * 20;
  let level = 1;
  while (exp >= expNeeded(level + 1)) level++;
  let rank = RANKS[0][1];
  for (const [lv, name] of RANKS) if (level >= lv) rank = name;
  return { exp, level, rank, from: expNeeded(level), to: expNeeded(level + 1) };
}
const WEEKDAYS = "日一二三四五六";
const TITLES = { home: "我的記帳本", records: "明細", accounts: "帳戶", plan: "規劃", stocks: "股票", reports: "報表" };

// ========== 2. 資料讀取與儲存 ==========
// 若瀏覽器不允許 localStorage，改存在記憶體（重新整理後會消失）
const memory = {};

function load(key, fallback) {
  let text = null;
  try { text = localStorage.getItem(key); } catch (e) { text = memory[key] || null; }
  if (!text) return fallback;
  try { return JSON.parse(text); } catch (e) { return fallback; }
}

function save(key, value) {
  const text = JSON.stringify(value);
  memory[key] = text;
  try { localStorage.setItem(key, text); } catch (e) { /* 只存在記憶體 */ }
}

let accounts = load(KEYS.accounts, [
  { id: 1, kind: "bank", bank: "國泰世華", purpose: "生活費", balance: 15000 },
  { id: 2, kind: "bank", bank: "中華郵政", purpose: "儲蓄", balance: 50000 }
]).map((a, i) => Object.assign(
  { kind: "bank", purpose: "", balance: 0, color: ACCOUNT_COLORS[i % ACCOUNT_COLORS.length] }, a
));
let transactions = load(KEYS.tx, []);
let recurring = load(KEYS.recurring, []);
let wishlist = load(KEYS.wishlist, []);
let plan = load(KEYS.plan, []);
let checks = load(KEYS.checks, []);   // 資金確認紀錄
let stocks = load(KEYS.stocks, []);   // 股票
// App 設定：資金確認日、交割帳戶、手續費折扣（會跟著雲端同步）
const DEFAULT_SETTINGS = { checkDays: [5, 17], stockAccountId: null, feeDiscount: 1 };
let appSettings = Object.assign({}, DEFAULT_SETTINGS, load(KEYS.settings, {}));

function persist() {
  save(KEYS.accounts, accounts);
  save(KEYS.tx, transactions);
  save(KEYS.recurring, recurring);
  save(KEYS.wishlist, wishlist);
  save(KEYS.plan, plan);
  save(KEYS.checks, checks);
  save(KEYS.stocks, stocks);
  save(KEYS.settings, appSettings);
  markDirty();      // 記下哪些資料要上傳到雲端
  scheduleSync();   // 資料有變動 → 稍後自動同步到 Google 試算表
}

// 畫面狀態（不需要保存）
const ui = {
  tab: "home",
  weekOffset: 0,               // 0 = 本週，-1 = 上週
  month: todayStr().slice(0, 7),       // 明細的月份
  reportMonth: todayStr().slice(0, 7), // 報表的月份
  filterType: "all",
  filterAccount: "all",
  stockReorder: false
};

// ========== 3. 工具 ==========
function $(id) { return document.getElementById(id); }
function pad(n) { return String(n).padStart(2, "0"); }
function toStr(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function todayStr() { return toStr(new Date()); }
function parseDate(s) { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); }
function clampDay(y, m, day) { return Math.min(day, new Date(y, m + 1, 0).getDate()); }
function daysBetween(a, b) { return Math.round((parseDate(b) - parseDate(a)) / 86400000); }

function addMonth(ym, n) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}
function ymLabel(ym) { const [y, m] = ym.split("-").map(Number); return `${y} 年 ${m} 月`; }
function md(s) { const d = parseDate(s); return `${d.getMonth() + 1}/${d.getDate()}`; }
function mdw(s) { const d = parseDate(s); return `${d.getMonth() + 1}/${d.getDate()}（${WEEKDAYS[d.getDay()]}）`; }

function money(n) {
  const v = Math.round(n);
  return (v < 0 ? "−" : "") + "NT$ " + Math.abs(v).toLocaleString("zh-TW");
}

// 把使用者輸入的文字轉成安全的 HTML
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function uid() { return Date.now() * 1000 + Math.floor(Math.random() * 1000); }

function findAccount(id) { return accounts.find(a => a.id === id); }
function accountName(id) { const a = findAccount(id); return a ? a.bank : "（已刪除）"; }
function banks() { return accounts.filter(a => a.kind !== "card"); }
function cards() { return accounts.filter(a => a.kind === "card"); }
function sumBy(list, type) { return list.filter(t => t.type === type).reduce((s, t) => s + t.amount, 0); }

function sortedTx(list) {
  return [...list].sort((a, b) => a.date !== b.date ? b.date.localeCompare(a.date) : b.id - a.id);
}

let toastTimer;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 2400);
}

// ========== 4. 計算 ==========

// 一筆紀錄讓某個帳戶增加或減少多少
function effectOn(account, t) {
  let v = 0;
  if (t.type === "income" && t.accountId === account.id) v += t.amount;
  if (t.type === "expense" && t.accountId === account.id) v -= t.amount;
  if (t.type === "transfer") {
    if (t.accountId === account.id) v -= t.amount;
    if (t.toAccountId === account.id) v += t.amount;
  }
  if (t.type === "trade" && t.accountId === account.id) v += t.side === "buy" ? -t.amount : t.amount;   // 買股票扣款、賣股票入帳
  return v;
}

// 帳戶餘額 = 初始餘額 + 所有紀錄的影響（upTo：只算到某一天）
// 信用卡從 0 開始，刷卡變負數（欠款），繳費後回到 0
function balanceOf(account, upTo) {
  let b = account.kind === "card" ? 0 : (Number(account.balance) || 0);
  for (const t of transactions) {
    if (upTo && t.date > upTo) continue;
    b += effectOn(account, t);
  }
  return b;
}

// 信用卡最近一次結帳日
function lastStatementDate(card) {
  const now = new Date();
  let y = now.getFullYear(), m = now.getMonth();
  if (now.getDate() < clampDay(y, m, card.statementDay)) {
    m--;
    if (m < 0) { m = 11; y--; }
  }
  return toStr(new Date(y, m, clampDay(y, m, card.statementDay)));
}

// 信用卡狀態：欠款、未出帳、本期應繳、繳款截止日
function cardInfo(card) {
  const owed = Math.max(0, -balanceOf(card));
  const last = lastStatementDate(card);
  let unbilled = 0;
  for (const t of transactions) {
    if (t.type === "expense" && t.accountId === card.id && t.date > last) unbilled += t.amount;
  }
  unbilled = Math.min(unbilled, owed);
  const billed = owed - unbilled;

  const ls = parseDate(last);
  let y = ls.getFullYear(), m = ls.getMonth();
  if (card.dueDay <= card.statementDay) {
    m++;
    if (m > 11) { m = 0; y++; }
  }
  const due = toStr(new Date(y, m, clampDay(y, m, card.dueDay)));
  return { owed, unbilled, billed, last, due };
}

function linkedCards(bank) { return cards().filter(c => c.payAccountId === bank.id); }

// 可用餘額 = 帳戶餘額 − 綁定這個帳戶的信用卡待繳金額
function availableOf(bank) {
  let b = balanceOf(bank);
  for (const c of linkedCards(bank)) b -= cardInfo(c).owed;
  return b;
}

// 每週範圍：星期日開始
function weekRange(offset) {
  const t = new Date();
  const s = new Date(t.getFullYear(), t.getMonth(), t.getDate() - t.getDay() + offset * 7);
  const e = new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6);
  return { start: toStr(s), end: toStr(e) };
}

// 固定支出這個月的狀態：done 已處理 / due 已到期 / soon 7 天內 / later
function recurringStatus(r) {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  const dueDate = new Date(y, m, clampDay(y, m, r.day));
  const [hh, mm] = (r.time || "09:00").split(":").map(Number);
  dueDate.setHours(hh || 0, mm || 0, 0, 0);
  const key = `${y}-${pad(m + 1)}`;
  const dueStr = toStr(dueDate);
  if (r.lastHandled === key) return { state: "done", dueDate, dueStr, key };
  if (now >= dueDate) return { state: "due", dueDate, dueStr, key };
  const days = daysBetween(todayStr(), dueStr);
  const label = days === 0 ? `今天 ${r.time}` : `${days} 天後`;
  return { state: days <= 7 ? "soon" : "later", dueDate, dueStr, key, days, label };
}

// 資金分配：固定金額先分，百分比以剩下的金額計算
function computeAllocation(amount) {
  const rows = [];
  for (const p of plan.filter(p => p.mode === "fixed")) {
    rows.push({ accountId: p.accountId, amount: p.value, label: "固定" });
  }
  const fixedSum = rows.reduce((s, r) => s + r.amount, 0);
  const rest = Math.max(0, amount - fixedSum);
  for (const p of plan.filter(p => p.mode === "percent")) {
    rows.push({ accountId: p.accountId, amount: Math.floor(rest * p.value / 100), label: p.value + "%" });
  }
  const total = rows.reduce((s, r) => s + r.amount, 0);
  return { rows, total, left: amount - total };
}

function allocatedThisMonth() {
  const ym = todayStr().slice(0, 7);
  return transactions.some(t => t.type === "transfer" && t.alloc && t.date.startsWith(ym));
}

// ========== 5. 畫面 ==========
function render() {
  $("page-title").textContent = TITLES[ui.tab];
  const views = { home: viewHome, records: viewRecords, accounts: viewAccounts, plan: viewPlan, stocks: viewStocks, reports: viewReports };
  $("view").innerHTML = views[ui.tab]();
  document.querySelectorAll(".tabbar button").forEach(b => {
    const on = b.dataset.tab === ui.tab;
    b.classList.toggle("active", on);
    if (on) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
  });
}

// 一筆紀錄的樣子
function txRow(t) {
  if (t.type === "trade") {
    const buy = t.side === "buy";
    const st = stocks.find(x => x.id === t.stockId);
    return `<button class="row" data-action="edit-tx" data-id="${t.id}">
      <span class="badge" style="background:${(st && st.color) || STOCK_COLORS[0]}">${icon("chart")}</span>
      <span class="row-main"><b>${buy ? "買進" : "賣出"} ${esc(t.code)} ${esc(t.name || "")}</b>
        <small>${sharesText(t.shares)} @ ${priceText(t.price)}${t.time ? " · " + esc(t.time) : ""} · ${t.accountId ? esc(accountName(t.accountId)) : "未連動帳戶"}${t.note ? " · " + esc(t.note) : ""}</small></span>
      <span class="amt num transfer">${buy ? "−" : "+"}${money(t.amount)}</span>
    </button>`;
  }
  const isIn = t.type === "income";
  const isTr = t.type === "transfer";
  const title = isTr ? (t.alloc ? "資金分配" : "轉帳") : t.category;
  const feeTx = isTr ? transactions.find(x => x.feeOf === t.id) : null;
  const detail = isTr ? `${accountName(t.accountId)} → ${accountName(t.toAccountId)}${feeTx ? `（手續費 ${money(feeTx.amount)}）` : ""}` : accountName(t.accountId);
  const iconName = isTr ? "portal" : catInfo(t.category).icon;
  const color = isTr ? "#ffffff" : catInfo(t.category).color;
  const cls = isIn ? "income" : isTr ? "transfer" : "expense";
  const sign = isIn ? "+" : isTr ? "" : "−";
  const note = t.note && !(isTr && t.alloc && t.note === "資金分配") ? " · " + esc(t.note) : "";
  return `<button class="row" data-action="edit-tx" data-id="${t.id}">
    <span class="badge" style="background:${color}">${icon(iconName)}</span>
    <span class="row-main"><b>${esc(title)}</b><small>${esc(detail)}${note}</small></span>
    <span class="amt num ${cls}">${sign}${money(t.amount)}</span>
  </button>`;
}

function trio(inc, out) {
  return `<div class="trio">
    <div><small>收入</small><b class="num income">${money(inc)}</b></div>
    <div><small>支出</small><b class="num expense">${money(out)}</b></div>
    <div><small>結餘</small><b class="num">${money(inc - out)}</b></div>
  </div>`;
}

function monthNav(ym, key) {
  return `<div class="month-nav">
    <button class="icon-btn" data-action="month-prev" data-key="${key}" aria-label="上個月">‹</button>
    <b>${ymLabel(ym)}</b>
    <button class="icon-btn" data-action="month-next" data-key="${key}" aria-label="下個月">›</button>
  </div>`;
}

// ---- 5-1 首頁 ----
function viewHome() {
  const net = accounts.reduce((s, a) => s + balanceOf(a), 0);
  const bankTotal = banks().reduce((s, a) => s + balanceOf(a), 0);
  const cardOwed = cards().reduce((s, c) => s + cardInfo(c).owed, 0);

  const s = heroStats();
  const pct = Math.min(100, (s.exp - s.from) / (s.to - s.from) * 100);

  let h = `<section class="hero">
    ${heroSvg()}
    <p class="hero-rank">${s.rank}</p>
    <p class="hero-lv">Lv. ${s.level} <small>(${s.exp} exp)</small></p>
    <div class="exp-bar" role="progressbar" aria-valuemin="${s.from}" aria-valuemax="${s.to}" aria-valuenow="${s.exp}" aria-label="經驗值"><i style="width:${pct}%"></i></div>
    <div class="exp-ends"><span>${s.from} exp</span><span>${s.to} exp</span></div>
    <div class="hero-money">
      <span class="label">淨資產</span>
      <b class="hero-amt num">${money(net)}</b>
      <span class="hero-sub">銀行存款 ${money(bankTotal)} · 信用卡待繳 ${money(cardOwed)}</span>
      ${stockValue() > 0 ? `<span class="hero-sub">股票市值 ${money(stockValue())}（另計，不含在淨資產）</span>` : ""}
    </div>
    <p class="hero-tip">每記一筆帳 +10 exp，資金確認 +20 exp，存錢筒買到 +50 exp</p>
  </section>`;

  h += viewReminders();
  h += viewWeek();

  const recent = sortedTx(transactions).slice(0, 5);
  h += `<section>
    <div class="sec-head"><h2>最近紀錄</h2>${transactions.length ? `<button class="link" data-action="tab" data-tab="records">查看全部</button>` : ""}</div>
    ${recent.length ? `<div class="list">${recent.map(txRow).join("")}</div>`
      : `<div class="empty">${icon("slime","empty-ic")}<span>還沒有紀錄。按右下角「記一筆」開始你的冒險。</span></div>`}
  </section>`;
  return h;
}

function reminderItems() {
  const items = [];
  const cp = checkPeriod();
  if (accounts.length && !checkDone(cp)) items.push({ kind: "check", period: cp });
  for (const a of stockAlerts()) items.push({ kind: "stock", st: a.st, q: a.q, side: a.kind, price: a.price });
  for (const r of recurring) {
    const s = recurringStatus(r);
    if (s.state === "due" || s.state === "soon") items.push({ kind: "rec", r, s });
  }
  for (const c of cards()) {
    const info = cardInfo(c);
    if (info.billed > 0) {
      const days = daysBetween(todayStr(), info.due);
      if (days <= 10) items.push({ kind: "card", c, info, days });
    }
  }
  return items;
}

function viewReminders() {
  const items = reminderItems();
  if (!items.length) return "";
  const rows = items.map(it => {
    if (it.kind === "stock") {
      return `<div class="row remind is-due">
        <span class="row-main">
          <b>${esc(it.st.code)} ${esc(it.st.name)} <span class="pill ${it.side === "buy" ? "pill-done" : "pill-due"}">${it.side === "buy" ? "到買入價了" : "到賣出價了"}</span></b>
          <small>現價 ${priceText(it.q.price)}，${it.side === "buy" ? "買入價 " + priceText(it.price) + " 以下" : "賣出價 " + priceText(it.price) + " 以上"}</small>
        </span>
        <span class="row-actions"><button class="btn-sm primary" data-action="tab" data-tab="stocks">查看</button></span>
      </div>`;
    }
    if (it.kind === "check") {
      const days = daysBetween(it.period, todayStr());
      return `<div class="row remind is-due">
        <span class="row-main">
          <b>資金確認 ${md(it.period)} <span class="pill pill-due">${days === 0 ? "今天" : "待確認"}</span></b>
          <small>對照銀行 App，確認各帳戶的實際餘額</small>
        </span>
        <span class="row-actions"><button class="btn-sm primary" data-action="start-check">開始確認</button></span>
      </div>`;
    }
    if (it.kind === "rec") {
      const due = it.s.state === "due";
      return `<button class="row remind ${due ? "is-due" : ""}" data-action="open-recurring" data-id="${it.r.id}">
        <span class="row-main">
          <b>${esc(it.r.name)} <span class="pill ${due ? "pill-due" : "pill-soon"}">${due ? "已到期" : it.s.label}</span></b>
          <small>${money(it.r.amount)} · 每月 ${it.r.day} 號 ${esc(it.r.time)} · ${esc(accountName(it.r.accountId))}</small>
        </span>
        <span class="btn-sm ${due ? "primary" : ""}">${due ? "確認繳費" : "查看"} ›</span>
      </button>`;
    }
    const urgent = it.days <= 3;
    const label = it.days < 0 ? "已逾期" : it.days === 0 ? "今天截止" : `${it.days} 天後截止`;
    return `<div class="row remind ${urgent ? "is-due" : ""}">
      <span class="row-main">
        <b>${esc(it.c.bank)} 本期帳單 <span class="pill ${urgent ? "pill-due" : "pill-soon"}">${label}</span></b>
        <small>應繳 ${money(it.info.billed)} · 截止 ${md(it.info.due)} · 由 ${esc(accountName(it.c.payAccountId))} 扣款</small>
      </span>
      <span class="row-actions"><button class="btn-sm primary" data-action="pay-card" data-id="${it.c.id}">繳費</button></span>
    </div>`;
  }).join("");
  return `<section><h2>提醒</h2><div class="list">${rows}</div></section>`;
}

function viewWeek() {
  const { start, end } = weekRange(ui.weekOffset);
  const list = transactions.filter(t => t.date >= start && t.date <= end);
  const label = ui.weekOffset === 0 ? "本週" : ui.weekOffset === -1 ? "上週" : "那一週";

  const rows = accounts.map(a => {
    const change = list.reduce((s, t) => s + effectOn(a, t), 0);
    const cls = change > 0 ? "income" : change < 0 ? "expense" : "muted";
    const text = change === 0 ? "—" : (change > 0 ? "+" : "") + money(change);
    return `<div class="wk-row">
      <span class="dot" style="background:${a.color}"></span>
      <span class="wk-name">${esc(a.bank)}</span>
      <span class="num ${cls}">${text}</span>
      <span class="num">${money(balanceOf(a, end))}</span>
    </div>`;
  }).join("");

  return `<section class="card">
    <div class="sec-head">
      <h2>${label}戰報<small>${md(start)}（日）– ${md(end)}（六）</small></h2>
      <span class="nav">
        <button class="icon-btn" data-action="week-prev" aria-label="上一週">‹</button>
        <button class="icon-btn" data-action="week-next" aria-label="下一週" ${ui.weekOffset >= 0 ? "disabled" : ""}>›</button>
      </span>
    </div>
    ${trio(sumBy(list, "income"), sumBy(list, "expense"))}
    <p class="small muted">打倒 ${list.filter(t => t.type === "expense").length} 隻怪物（支出），撿到 ${list.filter(t => t.type === "income").length} 個寶箱（收入）</p>
    ${accounts.length ? `<div class="wk-table">
      <div class="wk-row wk-head"><span></span><span>帳戶</span><span>本週變動</span><span>週末餘額</span></div>
      ${rows}
    </div>` : ""}
  </section>`;
}

// ---- 5-2 明細 ----
function viewRecords() {
  const accFilter = ui.filterAccount === "all" ? null : Number(ui.filterAccount);
  const list = sortedTx(transactions.filter(t =>
    t.date.slice(0, 7) === ui.month &&
    (ui.filterType === "all" || t.type === ui.filterType) &&
    (accFilter === null || t.accountId === accFilter || t.toAccountId === accFilter)
  ));

  const typeOptions = [["all", "全部類型"], ["expense", "支出"], ["income", "收入"], ["transfer", "轉帳"], ["trade", "股票買賣"]]
    .map(([v, l]) => `<option value="${v}" ${ui.filterType === v ? "selected" : ""}>${l}</option>`).join("");
  const accOptions = accounts
    .map(a => `<option value="${a.id}" ${String(ui.filterAccount) === String(a.id) ? "selected" : ""}>${esc(a.bank)}</option>`).join("");

  let h = monthNav(ui.month, "month");
  h += `<div class="filters">
    <select id="flt-type" aria-label="類型">${typeOptions}</select>
    <select id="flt-acc" aria-label="帳戶"><option value="all">全部帳戶</option>${accOptions}</select>
  </div>`;
  h += `<div class="card">${trio(sumBy(list, "income"), sumBy(list, "expense"))}</div>`;

  if (!list.length) return h + `<div class="empty">這個月沒有符合的紀錄。</div>`;

  const groups = {};
  for (const t of list) (groups[t.date] = groups[t.date] || []).push(t);
  for (const d of Object.keys(groups)) {
    const out = sumBy(groups[d], "expense");
    h += `<section>
      <div class="day-head"><span>${mdw(d)}${d === todayStr() ? " · 今天" : ""}</span><span class="num">${out ? "支出 " + money(out) : ""}</span></div>
      <div class="list">${groups[d].map(txRow).join("")}</div>
    </section>`;
  }
  return h;
}

// ---- 5-3 帳戶 ----
function viewAccounts() {
  // 資金確認
  let h = viewChecks();
  // 銀行帳戶
  const bs = banks();
  h += `<section>
    <div class="sec-head"><h2>銀行帳戶</h2><button class="link" data-action="add-account">＋ 新增帳戶</button></div>`;
  h += bs.length ? `<div class="list">${bs.map(a => {
    const hasCard = linkedCards(a).length > 0;
    return `<button class="row" data-action="edit-account" data-id="${a.id}">
      <span class="badge" style="background:${a.color}">${icon("chest")}</span>
      <span class="row-main"><b>${esc(a.bank)}</b><small><span class="tag">${esc(a.purpose || "未設定用途")}</span></small></span>
      <span class="row-end"><b class="num">${money(balanceOf(a))}</b>${hasCard ? `<small class="muted num">可用 ${money(availableOf(a))}</small>` : ""}</span>
    </button>`;
  }).join("")}</div>` : `<div class="empty">還沒有銀行帳戶。</div>`;
  h += `</section>`;

  // 信用卡
  const cs = cards();
  h += `<section>
    <div class="sec-head"><h2>信用卡</h2><button class="link" data-action="add-card">＋ 新增信用卡</button></div>`;
  h += cs.length ? `<div class="stack">${cs.map(c => {
    const i = cardInfo(c);
    const used = c.limit > 0 ? Math.min(1, i.owed / c.limit) : 0;
    return `<div class="card card-cc">
      <button class="cc-top" data-action="edit-account" data-id="${c.id}">
        <span class="badge" style="background:${c.color}">${icon("shield")}</span>
        <span class="row-main"><b>${esc(c.bank)}</b><small>結帳日 ${c.statementDay} 號 · 繳款日 ${c.dueDay} 號 · 由 ${esc(accountName(c.payAccountId))} 扣款</small></span>
      </button>
      <div class="trio">
        <div><small>未出帳</small><b class="num">${money(i.unbilled)}</b></div>
        <div><small>本期應繳</small><b class="num ${i.billed > 0 ? "expense" : ""}">${money(i.billed)}</b></div>
        <div><small>繳款截止</small><b class="num">${i.billed > 0 ? md(i.due) : "—"}</b></div>
      </div>
      ${c.limit > 0 ? `<div class="meter"><i style="width:${used * 100}%"></i></div>
        <small class="muted">額度 ${money(c.limit)} · 已使用 ${Math.round(used * 100)}%</small>` : ""}
      ${i.billed > 0 ? `<button class="btn-sm primary" data-action="pay-card" data-id="${c.id}">繳本期帳單</button>` : ""}
    </div>`;
  }).join("")}</div>` : `<div class="empty">還沒有信用卡。刷卡消費會先記在卡上，繳費時再從銀行帳戶扣款。</div>`;
  h += `</section>`;

  // 資金分配
  h += `<section>
    <div class="sec-head"><h2>每月資金分配</h2><button class="link" data-action="edit-plan">${plan.length ? "編輯方案" : "＋ 設定方案"}</button></div>`;
  if (!plan.length) {
    h += `<div class="empty">設定好方案後，每次收到薪水就能一鍵分到各帳戶。</div>`;
  } else {
    h += `<div class="card">
      ${plan.map(p => `<div class="kv">
        <span><span class="dot" style="background:${findAccount(p.accountId)?.color || "#999"}"></span>${esc(accountName(p.accountId))}</span>
        <b class="num">${p.mode === "percent" ? `剩餘的 ${p.value}%` : money(p.value)}</b>
      </div>`).join("")}
      <p class="small muted">${allocatedThisMonth() ? "本月已經分配過了。" : "本月還沒有分配。"}</p>
      <button class="btn-primary" data-action="allocate">立即分配</button>
    </div>`;
  }
  h += `</section>`;
  return h;
}

// ---- 5-4 規劃（固定支出＋存錢筒） ----
function viewPlan() {
  let h = `<section>
    <div class="sec-head"><h2>每月固定支出 <small>每月王關</small></h2><button class="link" data-action="add-recurring">＋ 新增</button></div>`;
  if (!recurring.length) {
    h += `<div class="empty">例如房租、電話費、保險。到了繳款時間會提醒你，確認後才記帳。</div>`;
  } else {
    const rows = [...recurring].sort((a, b) => a.day - b.day).map(r => {
      const s = recurringStatus(r);
      const pill = s.state === "done" ? `<span class="pill pill-done">本月已處理</span>`
        : s.state === "due" ? `<span class="pill pill-due">已到期</span>`
        : s.state === "soon" ? `<span class="pill pill-soon">${s.label}</span>`
        : `<span class="pill">${md(s.dueStr)}</span>`;
      return `<button class="row" data-action="open-recurring" data-id="${r.id}">
        <span class="badge" style="background:${catInfo(r.category).color}">${icon("boss")}</span>
        <span class="row-main"><b>${esc(r.name)} ${pill}</b><small>每月 ${r.day} 號 ${esc(r.time)} · ${esc(accountName(r.accountId))} · ${esc(r.category)}</small></span>
        <span class="amt num expense">${money(r.amount)}</span>
      </button>`;
    }).join("");
    h += `<div class="list">${rows}</div>
      <p class="small muted">每月固定支出合計 ${money(recurring.reduce((s, r) => s + r.amount, 0))}</p>`;
  }
  h += notifyHint() + `</section>`;

  // 存錢筒
  const active = wishlist.filter(w => !w.bought);
  const done = wishlist.filter(w => w.bought);
  h += `<section>
    <div class="sec-head"><h2>存錢筒 <small>寶箱收集</small></h2><button class="link" data-action="add-wish">＋ 新增</button></div>`;
  if (!active.length) {
    h += `<div class="empty">把想買的東西加進來，一點一點存到目標金額。</div>`;
  } else {
    h += `<div class="wish-grid">${active.map(w => {
      const p = w.target > 0 ? Math.min(1, w.saved / w.target) : 0;
      const ready = w.saved >= w.target;
      return `<div class="card wish ${ready ? "is-ready" : ""}">
        ${w.photo ? `<button class="wish-photo-btn" data-action="edit-wish" data-id="${w.id}" aria-label="編輯 ${esc(w.name)}"><img class="wish-photo" src="${w.photo}" alt="${esc(w.name)}"></button>` : ""}
        <button class="wish-top" data-action="edit-wish" data-id="${w.id}">${w.photo ? "" : `<span class="wish-icon">${icon("chest")}</span>`}<span><b>${esc(w.name)}</b><small>存在 ${esc(accountName(w.accountId))}</small></span></button>
        ${w.link ? `<a class="wish-link" href="${esc(w.link)}" target="_blank" rel="noopener">查看商品 ↗</a>` : ""}
        <div class="wish-amt"><b class="num">${money(w.saved)}</b><small class="muted num">/ ${money(w.target)}</small></div>
        <div class="meter"><i style="width:${p * 100}%"></i></div>
        <div class="wish-foot">
          ${ready ? `<span class="pill pill-done">可以買了！</span><button class="btn-sm primary" data-action="buy-wish" data-id="${w.id}">買下</button>`
            : `<small class="muted num">還差 ${money(w.target - w.saved)}</small><button class="btn-sm" data-action="deposit-wish" data-id="${w.id}">存入</button>`}
        </div>
      </div>`;
    }).join("")}</div>`;
  }
  if (done.length) {
    h += `<details class="done-list"><summary>已經買到（${done.length}）</summary>
      ${done.map(w => `<div class="kv"><span>${esc(w.name)}</span><span class="num muted">${money(w.target)}</span></div>`).join("")}
    </details>`;
  }
  h += `</section>`;
  return h;
}

function notifyHint() {
  let perm = "unsupported";
  try { if ("Notification" in window) perm = Notification.permission; } catch (e) { /* 不支援 */ }
  if (perm === "granted") return `<p class="small muted">已開啟通知：App 開著時，繳款時間到會跳出通知。</p>`;
  if (perm === "unsupported" || perm === "denied") return `<p class="small muted">到期的項目會顯示在首頁的「提醒」。</p>`;
  return `<button class="btn-secondary" data-action="enable-notify">開啟到期通知</button>
    <p class="small muted">App 開著時，時間到會跳出通知；沒開著時，下次打開會在首頁提醒。</p>`;
}

// ---- 5-5 報表 ----
function viewReports() {
  const ym = ui.reportMonth;
  const list = transactions.filter(t => t.date.startsWith(ym));
  const expenses = list.filter(t => t.type === "expense");
  const out = sumBy(list, "expense");

  // 分類
  const byCat = {};
  for (const t of expenses) byCat[t.category] = (byCat[t.category] || 0) + t.amount;
  const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);

  // 用途：信用卡消費算在扣款帳戶的用途
  const byPurpose = {};
  for (const t of expenses) {
    let a = findAccount(t.accountId);
    if (a && a.kind === "card") a = findAccount(a.payAccountId) || a;
    const k = a ? (a.purpose || a.bank) : "其他";
    byPurpose[k] = (byPurpose[k] || 0) + t.amount;
  }
  const purposes = Object.entries(byPurpose).sort((a, b) => b[1] - a[1]);

  let h = monthNav(ym, "report");

  h += `<section class="card"><h2>支出分類</h2>`;
  h += cats.length ? `<div class="donut-wrap">${donut(cats, out)}<div class="legend">
      ${cats.map(([c, v]) => `<div class="kv"><span><span class="dot" style="background:${catInfo(c).color}"></span>${esc(c)}</span>
        <span class="num">${money(v)} <small class="muted">${Math.round(v / out * 100)}%</small></span></div>`).join("")}
    </div></div>` : `<div class="empty">這個月沒有支出。</div>`;
  h += `</section>`;

  h += `<section class="card"><h2>資金用途</h2>`;
  h += purposes.length ? purposes.map(([k, v]) => `<div class="hbar">
      <div class="kv"><span>${esc(k)}</span><span class="num">${money(v)}</span></div>
      <div class="meter"><i style="width:${v / purposes[0][1] * 100}%"></i></div>
    </div>`).join("") + `<p class="small muted">依付款帳戶的用途統計，信用卡消費算在扣款帳戶。</p>`
    : `<div class="empty">這個月沒有支出。</div>`;
  h += `</section>`;

  h += `<section class="card"><h2>近 6 個月收支</h2>${trendChart(ym)}</section>`;

  h += `<section class="card"><h2>各帳戶餘額</h2>
    ${accounts.length ? accounts.map(a => {
      const b = balanceOf(a);
      return `<div class="kv"><span><span class="dot" style="background:${a.color}"></span>${esc(a.bank)}${a.kind === "card" ? ` <small class="muted">信用卡</small>` : ""}</span>
        <b class="num ${b < 0 ? "expense" : ""}">${money(b)}</b></div>`;
    }).join("") : `<div class="empty">還沒有帳戶。</div>`}
  </section>`;

  h += syncCard();
  h += `<section class="card">${syncGuide(!syncEnabled())}</section>`;

  h += `<section class="card"><h2>資料管理</h2>
    <p class="small muted">資料存在這個瀏覽器裡。要換到手機或其他電腦時，先在這裡備份，再到新裝置還原。</p>
    <div class="btn-grid">
      <button class="btn-secondary" data-action="export-csv">匯出 CSV</button>
      <button class="btn-secondary" data-action="backup">備份資料</button>
      <button class="btn-secondary" data-action="restore">還原備份</button>
      <button class="btn-secondary" data-action="manage-cats">分類管理</button>
      <button class="btn-danger" data-action="clear-all">清除全部資料</button>
    </div>
    <div class="report-box">
      <b>錯誤問題回報</b>
      <p class="small muted">遇到問題或想要新功能，寫下來送出，會寄給記帳本作者。</p>
      <button class="btn-secondary" data-action="report-bug">回報問題</button>
    </div>
    <input type="file" id="restore-file" accept=".json,application/json" hidden>
  </section>`;
  return h;
}

function donut(cats, total) {
  const r = 52, C = 2 * Math.PI * r;
  let offset = 0;
  const segs = cats.map(([c, v]) => {
    const len = v / total * C;
    const s = `<circle r="${r}" cx="70" cy="70" fill="none" stroke="${catInfo(c).color}" stroke-width="22"
      stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-offset}" transform="rotate(-90 70 70)"><title>${esc(c)} ${money(v)}</title></circle>`;
    offset += len;
    return s;
  }).join("");
  return `<svg class="donut" viewBox="0 0 140 140" role="img" aria-label="支出分類圓餅圖">${segs}
    <circle class="donut-ring" cx="70" cy="70" r="63"/><circle class="donut-ring" cx="70" cy="70" r="41"/>
    <text x="70" y="66" text-anchor="middle" class="d-label">總支出</text>
    <text x="70" y="84" text-anchor="middle" class="d-total">${Math.round(total).toLocaleString("zh-TW")}</text>
  </svg>`;
}

function niceMax(v) {
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}

function shortNum(v) {
  if (v >= 10000) return (v / 10000).toLocaleString("zh-TW", { maximumFractionDigits: 1 }) + "萬";
  return Math.round(v).toLocaleString("zh-TW");
}

function trendChart(ym) {
  const months = [];
  for (let i = 5; i >= 0; i--) months.push(addMonth(ym, -i));
  const data = months.map(m => {
    const l = transactions.filter(t => t.date.startsWith(m));
    return { m, inc: sumBy(l, "income"), out: sumBy(l, "expense") };
  });
  const top = niceMax(Math.max(1, ...data.map(d => Math.max(d.inc, d.out))));
  const W = 320, H = 180, left = 44, right = 8, topPad = 10, bottom = 24;
  const plotH = H - topPad - bottom, gw = (W - left - right) / 6, bw = Math.min(14, gw / 3);

  let g = "";
  for (const f of [0, 0.5, 1]) {
    const y = topPad + plotH * (1 - f);
    g += `<line x1="${left}" x2="${W - right}" y1="${y}" y2="${y}" class="grid${f === 0 ? " base" : ""}"/>
      <text x="${left - 6}" y="${y + 4}" text-anchor="end" class="axis">${shortNum(top * f)}</text>`;
  }
  data.forEach((d, i) => {
    const cx = left + gw * i + gw / 2;
    const hi = d.inc / top * plotH, ho = d.out / top * plotH;
    g += `<rect x="${cx - bw - 1}" y="${topPad + plotH - hi}" width="${bw}" height="${hi}" rx="3" class="bar-in"><title>${Number(d.m.slice(5))}月收入 ${money(d.inc)}</title></rect>`;
    g += `<rect x="${cx + 1}" y="${topPad + plotH - ho}" width="${bw}" height="${ho}" rx="3" class="bar-out"><title>${Number(d.m.slice(5))}月支出 ${money(d.out)}</title></rect>`;
    g += `<text x="${cx}" y="${H - 6}" text-anchor="middle" class="axis${d.m === ym ? " axis-on" : ""}">${Number(d.m.slice(5))}月</text>`;
  });
  return `<div class="chart-legend"><span><i class="sw sw-in"></i>收入</span><span><i class="sw sw-out"></i>支出</span></div>
    <svg class="trend" viewBox="0 0 ${W} ${H}" role="img" aria-label="近六個月收支長條圖">${g}</svg>`;
}

// ========== 6. 彈出表單 ==========
let onDismiss = null;

function openSheet(title, html) {
  onDismiss = null;
  $("sheet-title").textContent = title;
  $("sheet-body").innerHTML = html;
  $("sheet-layer").hidden = false;
  document.body.classList.add("lock");
}

function closeSheet() {
  onDismiss = null;
  $("sheet-layer").hidden = true;
  $("sheet-body").innerHTML = "";
  document.body.classList.remove("lock");
}

function dismissSheet() {
  const fn = onDismiss;
  closeSheet();
  if (fn) fn();
}

// 頁面內的確認視窗（取代瀏覽器的 confirm）
function askConfirm(message, okText = "確定", danger = false) {
  return new Promise(resolve => {
    openSheet("請確認", `<p class="confirm-msg">${esc(message)}</p>
      <div class="form-actions">
        <button type="button" class="btn-secondary" id="c-no">取消</button>
        <button type="button" class="${danger ? "btn-danger solid" : "btn-primary"}" id="c-yes">${esc(okText)}</button>
      </div>`);
    onDismiss = () => resolve(false);
    $("c-no").onclick = () => { closeSheet(); resolve(false); };
    $("c-yes").onclick = () => { closeSheet(); resolve(true); };
  });
}

// 表單小工具
function field(label, inner) { return `<label class="field"><span>${label}</span>${inner}</label>`; }

function accountSelect(id, list, selected) {
  return `<select id="${id}">${list.map(a => {
    const note = a.kind === "card" ? "（信用卡）" : a.purpose ? `（${esc(a.purpose)}）` : "";
    return `<option value="${a.id}" ${a.id === selected ? "selected" : ""}>${esc(a.bank)}${note}</option>`;
  }).join("")}</select>`;
}

function catSelect(type, selected) {
  const list = catList(type).slice();
  if (selected && !list.some(c => c.name === selected)) list.push(catInfo(selected));   // 已刪除的分類，舊紀錄仍保留
  return `<select id="f-cat">${list.map(c =>
    `<option value="${esc(c.name)}" ${c.name === selected ? "selected" : ""}>${esc(c.name)}・${ICON_LABELS[c.icon] || ""}</option>`).join("")}</select>`;
}

function formActions(withDelete, saveText = "儲存") {
  return `<p class="form-err" id="f-err" role="alert"></p>
    <div class="form-actions">
      ${withDelete ? `<button type="button" class="btn-danger" id="f-del">刪除</button>` : ""}
      <button type="button" class="btn-secondary" data-action="close-sheet">取消</button>
      <button type="button" class="btn-primary" data-save>${saveText}</button>
    </div>`;
}

// 綁定「儲存」：按按鈕或在輸入框按 Enter 都會儲存
// （不用表單的 submit，因為某些預覽環境會擋住表單送出）
function bindSave(formId, handler) {
  const form = $(formId);
  form.querySelector("[data-save]").addEventListener("click", handler);
  form.addEventListener("keydown", e => {
    if (e.key === "Enter" && e.target.tagName === "INPUT") {
      e.preventDefault();
      handler();
    }
  });
  form.addEventListener("submit", e => e.preventDefault());
}

function showErr(msg) { const e = $("f-err"); if (e) e.textContent = msg; }

// 刪除要按兩次：第一次變成「確定刪除？」
function armDelete(btn, fn) {
  btn.onclick = () => {
    if (btn.dataset.armed) { fn(); return; }
    btn.dataset.armed = "1";
    btn.textContent = "確定刪除？";
    btn.classList.add("solid");
    setTimeout(() => {
      if (btn.isConnected) { delete btn.dataset.armed; btn.textContent = "刪除"; btn.classList.remove("solid"); }
    }, 4000);
  };
}

function afterChange(msg) {
  persist();
  closeSheet();
  render();
  if (msg) toast(msg);
}

// ---- 6-1 記一筆（支出／收入／轉帳） ----
function openTxForm(tx, preset = {}) {
  if (!banks().length) {
    toast("請先新增一個銀行帳戶");
    ui.tab = "accounts";
    render();
    return;
  }
  const t = tx || Object.assign({
    type: "expense", amount: "", accountId: banks()[0].id, toAccountId: null,
    category: null, date: todayStr(), note: ""
  }, preset);
  let type = t.type;

  openSheet(tx ? "編輯紀錄" : "記一筆", `<form id="tx-form" novalidate>
    <div class="seg" role="group" aria-label="類型">
      ${[["expense", "支出"], ["income", "收入"], ["transfer", "轉帳"]].map(([v, l]) =>
        `<button type="button" data-type="${v}" aria-pressed="${v === type}">${l}</button>`).join("")}
    </div>
    <div class="amount-input"><span>NT$</span>
      <input id="f-amount" type="number" inputmode="decimal" min="1" step="any" value="${t.amount}" placeholder="0" aria-label="金額">
    </div>
    <div id="tx-dynamic"></div>
    <div class="form-row">
      ${field("日期", `<input id="f-date" type="date" value="${t.date}">`)}
      ${field("備註", `<input id="f-note" value="${esc(t.note)}" placeholder="例如：午餐" maxlength="60">`)}
    </div>
    ${formActions(!!tx)}
  </form>`);

  // 依類型切換欄位
  function drawFields(keepAccount) {
    const acc = keepAccount && $("f-acc") ? Number($("f-acc").value) : t.accountId;
    const cat = t.type === type ? t.category : null;
    let html;
    const manage = `<button type="button" class="link small-link" id="f-manage-cats">＋ 新增或管理分類</button>`;
    if (type === "expense") {
      html = `<div class="form-row">${field("分類", catSelect("expense", cat))}${field("付款方式", accountSelect("f-acc", [...banks(), ...cards()], acc))}</div>${manage}`;
    } else if (type === "income") {
      html = `<div class="form-row">${field("分類", catSelect("income", cat))}${field("入帳帳戶", accountSelect("f-acc", banks(), acc))}</div>${manage}`;
    } else {
      const feeTx = tx ? transactions.find(x => x.feeOf === tx.id) : null;
      html = `<div class="form-row">${field("轉出帳戶", accountSelect("f-acc", banks(), acc))}${field("轉入帳戶", accountSelect("f-to", [...banks(), ...cards()], t.toAccountId))}</div>
        ${field("轉帳手續費（沒有就留空）", `<input id="f-fee" type="number" inputmode="numeric" min="0" step="any" value="${feeTx ? feeTx.amount : ""}" placeholder="例如跨行轉帳 15 元">`)}
        <p class="small muted">手續費會從轉出帳戶扣除，記成一筆「手續費」支出。繳信用卡費：轉入帳戶選信用卡。轉帳本身不算收入或支出。</p>`;
    }
    $("tx-dynamic").innerHTML = html;
    const mc = $("f-manage-cats");
    if (mc) mc.onclick = () => {
      // 先記住已經填的內容，管理完分類後回到這裡
      const keep = { type, amount: $("f-amount").value, accountId: Number($("f-acc").value), date: $("f-date").value, note: $("f-note").value };
      openCatManager(type, newCat => {
        if (tx) openTxForm(tx);
        else openTxForm(null, Object.assign(keep, newCat ? { category: newCat } : {}));
      });
    };
  }
  drawFields(false);

  document.querySelectorAll("#tx-form .seg button").forEach(b => {
    b.onclick = () => {
      type = b.dataset.type;
      document.querySelectorAll("#tx-form .seg button").forEach(x => x.setAttribute("aria-pressed", x === b));
      drawFields(true);
    };
  });

  if (tx) {
    armDelete($("f-del"), () => {
      transactions = transactions.filter(x => x.id !== tx.id && x.feeOf !== tx.id);   // 連同手續費一起刪
      afterChange("已刪除");
    });
  }

  bindSave("tx-form", async () => {
    const amount = Math.round(Number($("f-amount").value) * 100) / 100;
    if (!(amount > 0)) return showErr("請輸入大於 0 的金額。");
    const date = $("f-date").value;
    if (!date) return showErr("請選擇日期。");

    const data = { id: tx ? tx.id : uid(), type, amount, accountId: Number($("f-acc").value), date, note: $("f-note").value.trim() };
    let fee = 0;
    if (type === "transfer") {
      data.toAccountId = Number($("f-to").value);
      if (data.toAccountId === data.accountId) return showErr("轉出和轉入不能是同一個帳戶。");
      if (tx && tx.alloc) data.alloc = true;
      fee = Math.round((Number($("f-fee").value) || 0) * 100) / 100;
      if (fee < 0) return showErr("手續費不能是負的。");
    } else {
      data.category = $("f-cat").value;
    }

    if (tx) transactions[transactions.findIndex(x => x.id === tx.id)] = data;
    else transactions.push(data);

    // 轉帳手續費：另外記一筆支出，和這筆轉帳綁在一起
    const oldFee = transactions.find(x => x.feeOf === data.id);
    if (fee > 0) {
      const feeData = {
        id: oldFee ? oldFee.id : uid() + 1, type: "expense", amount: fee, accountId: data.accountId,
        category: "手續費", date, note: "轉帳手續費" + (data.note ? `（${data.note}）` : ""), feeOf: data.id
      };
      if (oldFee) transactions[transactions.indexOf(oldFee)] = feeData;
      else transactions.push(feeData);
    } else if (oldFee) {
      transactions = transactions.filter(x => x !== oldFee);
    }
    afterChange(tx ? "已更新" : "已記下");

    // 新的收入：詢問要不要做資金分配
    if (!tx && type === "income" && plan.length) {
      const ok = await askConfirm(`收到 ${money(amount)}，要依照分配方案分到各帳戶嗎？`, "去分配");
      if (ok) openAllocate(data.accountId, amount);
    }
  });
}

// ---- 6-1b 分類管理 ----
// back：管理完要回到哪裡（例如回到記一筆），會收到剛新增的分類名稱
function openCatManager(type = "expense", back = null) {
  let picked = { icon: "slime", color: ACCOUNT_COLORS[0] };
  let lastAdded = null;

  function draw() {
    const list = catList(type);
    $("sheet-body").innerHTML = `<div class="stack" id="cat-form">
      <div class="seg seg-2" role="group" aria-label="支出或收入">
        <button type="button" data-ctype="expense" aria-pressed="${type === "expense"}">支出分類</button>
        <button type="button" data-ctype="income" aria-pressed="${type === "income"}">收入分類</button>
      </div>
      <div class="list list-inset">
        ${list.map(c => `<div class="row">
          <span class="badge" style="background:${c.color}">${icon(c.icon)}</span>
          <span class="row-main"><b>${esc(c.name)}</b><small>${ICON_LABELS[c.icon] || ""}</small></span>
          <button type="button" class="btn-sm cat-del" data-name="${esc(c.name)}" ${list.length <= 1 ? "disabled" : ""}>刪除</button>
        </div>`).join("")}
      </div>
      <p class="small muted">刪除分類不會改到舊紀錄，舊紀錄會保留原本的分類名稱。</p>
      <div class="card inset">
        <b>新增${type === "expense" ? "支出" : "收入"}分類</b>
        ${field("分類名稱", `<input id="c-name" maxlength="10" placeholder="${type === "expense" ? "例如：寵物、住宿" : "例如：兼職、退款"}" autocomplete="off">`)}
        <div class="field"><span>圖示</span><div class="icon-grid">
          ${CAT_ICON_CHOICES.map(k => `<button type="button" class="icon-pick" data-icon="${k}" aria-pressed="${k === picked.icon}" aria-label="${ICON_LABELS[k]}" title="${ICON_LABELS[k]}">${icon(k)}</button>`).join("")}
        </div></div>
        <div class="field"><span>顏色</span><div class="swatches">
          ${ACCOUNT_COLORS.map(c => `<button type="button" class="swatch" data-color="${c}" style="background:${c}" aria-pressed="${c === picked.color}" aria-label="選擇顏色"></button>`).join("")}
        </div></div>
        <p class="form-err" id="f-err" role="alert"></p>
        <button type="button" class="btn-primary" id="c-add">新增分類</button>
      </div>
      <button type="button" class="btn-secondary" id="c-done">${back ? "完成，回到記帳" : "完成"}</button>
    </div>`;

    document.querySelectorAll("#cat-form [data-ctype]").forEach(b => {
      b.onclick = () => { type = b.dataset.ctype; draw(); };
    });
    document.querySelectorAll("#cat-form .icon-pick").forEach(b => {
      b.onclick = () => {
        picked.icon = b.dataset.icon;
        document.querySelectorAll("#cat-form .icon-pick").forEach(x => x.setAttribute("aria-pressed", x === b));
      };
    });
    document.querySelectorAll("#cat-form .swatch").forEach(b => {
      b.onclick = () => {
        picked.color = b.dataset.color;
        document.querySelectorAll("#cat-form .swatch").forEach(x => x.setAttribute("aria-pressed", x === b));
      };
    });
    document.querySelectorAll("#cat-form .cat-del").forEach(b => {
      b.onclick = () => {
        if (!b.dataset.armed) { b.dataset.armed = "1"; b.textContent = "確定刪除？"; b.classList.add("danger-sm"); return; }
        setCats(type, catList(type).filter(c => c.name !== b.dataset.name));
        toast(`已刪除分類「${b.dataset.name}」`);
        draw();
      };
    });
    const add = () => {
      const name = $("c-name").value.trim();
      if (!name) return showErr("請輸入分類名稱。");
      if (catList("expense").concat(catList("income")).some(c => c.name === name)) return showErr(`「${name}」已經有了。`);
      setCats(type, catList(type).concat([{ name, icon: picked.icon, color: picked.color }]));
      lastAdded = name;
      toast(`已新增分類「${name}」`);
      draw();
    };
    $("c-add").onclick = add;
    $("c-name").onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); add(); } };
    $("c-done").onclick = () => { if (back) back(lastAdded); else closeSheet(); };
  }

  openSheet("分類管理", "");
  draw();
}

function setCats(type, list) {
  const cats = Object.assign({ expense: catList("expense"), income: catList("income") }, appSettings.categories || {});
  cats[type] = list.map(c => ({ name: c.name, icon: c.icon, color: c.color }));
  appSettings.categories = cats;
  persist();
  render();
}

// ---- 6-2 銀行帳戶／信用卡 ----
function openAccountForm(acc, kind) {
  kind = acc ? acc.kind : kind;
  const isCard = kind === "card";
  if (isCard && !banks().length) return toast("請先新增一個銀行帳戶，作為信用卡的扣款帳戶");

  const a = acc || {
    bank: "", purpose: "", balance: 0, color: ACCOUNT_COLORS[accounts.length % ACCOUNT_COLORS.length],
    statementDay: 5, dueDay: 20, payAccountId: banks()[0] && banks()[0].id, limit: 0
  };
  let color = a.color;
  const title = acc ? (isCard ? "編輯信用卡" : "編輯帳戶") : (isCard ? "新增信用卡" : "新增帳戶");

  const cardFields = `
    <div class="form-row">
      ${field("結帳日（每月幾號）", `<input id="f-sday" type="number" min="1" max="31" value="${a.statementDay}">`)}
      ${field("繳款日（每月幾號）", `<input id="f-dday" type="number" min="1" max="31" value="${a.dueDay}">`)}
    </div>
    <div class="form-row">
      ${field("扣款帳戶", accountSelect("f-pay", banks(), a.payAccountId))}
      ${field("信用額度", `<input id="f-limit" type="number" min="0" value="${a.limit || ""}" placeholder="選填">`)}
    </div>`;
  const bankFields = `
    <div class="form-row">
      ${field("用途", `<input id="f-purpose" value="${esc(a.purpose)}" placeholder="例如：生活費" maxlength="20" list="purpose-list">
        <datalist id="purpose-list"><option>生活費</option><option>儲蓄</option><option>旅遊</option><option>投資</option><option>緊急預備金</option></datalist>`)}
      ${field("初始餘額", `<input id="f-balance" type="number" value="${a.balance}">`)}
    </div>
    <p class="small muted">初始餘額請填開始記帳那天，存摺上的金額。</p>`;

  openSheet(title, `<form id="acc-form" novalidate>
    ${field(isCard ? "卡片名稱" : "銀行名稱", `<input id="f-name" value="${esc(a.bank)}" placeholder="${isCard ? "例如：國泰 CUBE 卡" : "例如：國泰世華"}" maxlength="30">`)}
    ${isCard ? cardFields : bankFields}
    <div class="field"><span>顏色</span><div class="swatches">
      ${ACCOUNT_COLORS.map(c => `<button type="button" class="swatch" data-color="${c}" style="background:${c}" aria-pressed="${c === color}" aria-label="選擇顏色"></button>`).join("")}
    </div></div>
    ${formActions(!!acc)}
  </form>`);

  document.querySelectorAll("#acc-form .swatch").forEach(b => {
    b.onclick = () => {
      color = b.dataset.color;
      document.querySelectorAll("#acc-form .swatch").forEach(x => x.setAttribute("aria-pressed", x === b));
    };
  });

  if (acc) {
    armDelete($("f-del"), () => {
      const used = transactions.filter(t => t.accountId === acc.id || t.toAccountId === acc.id).length;
      if (used) return showErr(`這個帳戶還有 ${used} 筆紀錄，請先刪除或改到其他帳戶。`);
      if (cards().some(c => c.payAccountId === acc.id)) return showErr("有信用卡由這個帳戶扣款，請先修改信用卡的扣款帳戶。");
      if (recurring.some(r => r.accountId === acc.id)) return showErr("有固定支出使用這個帳戶，請先修改固定支出。");
      if (wishlist.some(w => !w.bought && w.accountId === acc.id)) return showErr("有存錢筒綁定這個帳戶，請先修改存錢筒。");
      accounts = accounts.filter(x => x.id !== acc.id);
      plan = plan.filter(p => p.accountId !== acc.id);
      if (appSettings.stockAccountId === acc.id) appSettings.stockAccountId = null;
      afterChange("已刪除");
    });
  }

  bindSave("acc-form", () => {
    const name = $("f-name").value.trim();
    if (!name) return showErr("請輸入名稱。");

    let extra;
    if (isCard) {
      const sd = Number($("f-sday").value), dd = Number($("f-dday").value);
      if (!(sd >= 1 && sd <= 31 && dd >= 1 && dd <= 31)) return showErr("結帳日和繳款日請填 1 到 31。");
      extra = { statementDay: sd, dueDay: dd, payAccountId: Number($("f-pay").value), limit: Number($("f-limit").value) || 0, purpose: "信用卡", balance: 0 };
    } else {
      extra = { purpose: $("f-purpose").value.trim(), balance: Number($("f-balance").value) || 0 };
    }

    if (acc) Object.assign(acc, { bank: name, color }, extra);
    else accounts.push(Object.assign({ id: uid(), kind, bank: name, color }, extra));
    afterChange(acc ? "已更新" : "已新增");
  });
}

// ---- 6-3 資金分配方案 ----
function openPlanForm() {
  const bs = banks();
  if (!bs.length) return toast("請先新增銀行帳戶");

  openSheet("資金分配方案", `<form id="plan-form" novalidate>
    <p class="small muted">設定收到薪水時，每個帳戶要分到多少。固定金額會先分，百分比以剩下的金額計算。沒有分出去的錢會留在原本的入帳帳戶。</p>
    ${bs.map(a => {
      const p = plan.find(x => x.accountId === a.id) || { mode: "none", value: "" };
      return `<div class="plan-row" data-id="${a.id}">
        <span class="plan-name"><span class="dot" style="background:${a.color}"></span>${esc(a.bank)} <small class="muted">${esc(a.purpose)}</small></span>
        <select class="p-mode" aria-label="${esc(a.bank)} 分配方式">
          <option value="none" ${p.mode === "none" ? "selected" : ""}>不分配</option>
          <option value="fixed" ${p.mode === "fixed" ? "selected" : ""}>固定金額</option>
          <option value="percent" ${p.mode === "percent" ? "selected" : ""}>百分比</option>
        </select>
        <input class="p-val" type="number" min="0" step="any" value="${p.value}" placeholder="0" aria-label="${esc(a.bank)} 數值">
      </div>`;
    }).join("")}
    ${formActions(false)}
  </form>`);

  bindSave("plan-form", () => {
    const next = [];
    let pct = 0;
    document.querySelectorAll("#plan-form .plan-row").forEach(row => {
      const mode = row.querySelector(".p-mode").value;
      const value = Number(row.querySelector(".p-val").value) || 0;
      if (mode !== "none" && value > 0) {
        next.push({ accountId: Number(row.dataset.id), mode, value });
        if (mode === "percent") pct += value;
      }
    });
    if (pct > 100) return showErr(`百分比加起來是 ${pct}%，不能超過 100%。`);
    plan = next;
    afterChange("已儲存分配方案");
  });
}

// ---- 6-4 執行資金分配 ----
function openAllocate(sourceId, amount) {
  if (!plan.length) return openPlanForm();
  const bs = banks();

  openSheet("資金分配", `<form id="alloc-form" novalidate>
    <div class="form-row">
      ${field("從哪個帳戶分出", accountSelect("f-src", bs, sourceId || bs[0].id))}
      ${field("要分配的金額", `<input id="f-total" type="number" min="1" value="${amount || ""}" placeholder="例如：48000">`)}
    </div>
    <div id="alloc-preview" class="card inset"></div>
    ${field("日期", `<input id="f-date" type="date" value="${todayStr()}">`)}
    ${formActions(false, "確認分配")}
  </form>`);

  function preview() {
    const amt = Number($("f-total").value) || 0;
    const src = Number($("f-src").value);
    const r = computeAllocation(amt);
    const stay = r.left + r.rows.filter(x => x.accountId === src).reduce((s, x) => s + x.amount, 0);
    $("alloc-preview").innerHTML = r.rows.map(x => `<div class="kv ${x.accountId === src ? "muted" : ""}">
        <span><span class="dot" style="background:${findAccount(x.accountId)?.color || "#999"}"></span>${esc(accountName(x.accountId))} <small class="muted">${x.label}</small></span>
        <b class="num">${x.accountId === src ? "留在原帳戶" : money(x.amount)}</b>
      </div>`).join("") +
      `<div class="kv total"><span>留在 ${esc(accountName(src))}</span><b class="num ${r.left < 0 ? "expense" : ""}">${money(stay)}</b></div>`;
  }
  preview();
  $("f-total").oninput = preview;
  $("f-src").onchange = preview;

  bindSave("alloc-form", () => {
    const amt = Number($("f-total").value);
    const src = Number($("f-src").value);
    if (!(amt > 0)) return showErr("請輸入要分配的金額。");
    const r = computeAllocation(amt);
    if (r.left < 0) return showErr("固定金額加起來超過分配金額，請調整金額或方案。");
    const date = $("f-date").value || todayStr();
    let n = 0;
    for (const x of r.rows) {
      if (x.accountId === src || x.amount <= 0) continue;
      transactions.push({ id: uid() + n, type: "transfer", amount: x.amount, accountId: src, toAccountId: x.accountId, date, note: "資金分配", alloc: true });
      n++;
    }
    afterChange(n ? `已分配到 ${n} 個帳戶` : "沒有需要轉出的金額");
  });
}

// ---- 6-5 固定支出 ----
function openRecurringForm(r) {
  if (!accounts.length) return toast("請先新增帳戶");
  const x = r || { name: "", amount: "", day: 5, time: "09:00", accountId: (banks()[0] || accounts[0]).id, category: "居住" };

  openSheet(r ? "編輯固定支出" : "新增固定支出", `<form id="rec-form" novalidate>
    <div class="form-row">
      ${field("名稱", `<input id="f-name" value="${esc(x.name)}" placeholder="例如：房租" maxlength="30">`)}
      ${field("金額", `<input id="f-amount" type="number" min="1" value="${x.amount}">`)}
    </div>
    <div class="form-row">
      ${field("每月幾號", `<input id="f-day" type="number" min="1" max="31" value="${x.day}">`)}
      ${field("提醒時間", `<input id="f-time" type="time" value="${x.time}">`)}
    </div>
    <div class="form-row">
      ${field("扣款帳戶", accountSelect("f-acc", [...banks(), ...cards()], x.accountId))}
      ${field("分類", catSelect("expense", x.category))}
    </div>
    <p class="small muted">時間到時會提醒你，按「確認記帳」後才會記成一筆支出。如果當月沒有那一天（例如 31 號），會在月底提醒。</p>
    ${formActions(!!r)}
  </form>`);

  if (r) {
    armDelete($("f-del"), () => {
      recurring = recurring.filter(y => y.id !== r.id);
      afterChange("已刪除");
    });
  }

  bindSave("rec-form", () => {
    const name = $("f-name").value.trim();
    const amount = Number($("f-amount").value);
    const day = Number($("f-day").value);
    const time = $("f-time").value || "09:00";
    if (!name) return showErr("請輸入名稱。");
    if (!(amount > 0)) return showErr("請輸入大於 0 的金額。");
    if (!(day >= 1 && day <= 31)) return showErr("每月幾號請填 1 到 31。");
    const data = { name, amount, day, time, accountId: Number($("f-acc").value), category: $("f-cat").value };
    if (r) Object.assign(r, data);
    else recurring.push(Object.assign({ id: uid(), lastHandled: null }, data));
    afterChange(r ? "已更新" : "已新增");
  });
}

// ---- 6-6 存錢筒 ----
// 照片壓縮：縮小成適合手機看的大小，存成文字一起同步
// （雲端每筆資料有大小上限，所以壓到大約 38,000 字元以內）
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("讀不到這張照片"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("這個檔案不是照片，或格式不支援"));
      img.onload = () => {
        let size = 520, quality = 0.75, out = "";
        for (let i = 0; i < 8; i++) {
          const scale = Math.min(1, size / Math.max(img.width, img.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          out = canvas.toDataURL("image/jpeg", quality);
          if (out.length <= 38000) return resolve(out);
          size = Math.round(size * 0.8);
          quality = Math.max(0.4, quality - 0.08);
        }
        resolve(out);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function normalizeLink(v) {
  v = v.trim();
  if (!v) return "";
  return /^https?:\/\//i.test(v) ? v : "https://" + v;
}

function openWishForm(w) {
  if (!banks().length) return toast("請先新增銀行帳戶");
  const x = w || { name: "", target: "", saved: 0, accountId: banks()[0].id, photo: "", link: "" };
  let photo = x.photo || "";

  openSheet(w ? "編輯存錢筒" : "新增想買的東西", `<form id="wish-form" novalidate>
    <div class="field"><span>照片</span>
      <div class="photo-box">
        <img id="w-preview" class="photo-preview" alt="商品照片" ${photo ? `src="${photo}"` : "hidden"}>
        <div class="photo-actions">
          <label class="btn-sm photo-pick">${photo ? "換一張" : "選擇照片"}<input id="f-photo" type="file" accept="image/*" hidden></label>
          <button type="button" class="btn-sm" id="w-remove" ${photo ? "" : "hidden"}>移除照片</button>
          <small class="muted" id="w-photo-msg">${photo ? "" : "可以拍照或從相簿選"}</small>
        </div>
      </div>
    </div>
    ${field("想買什麼", `<input id="f-name" value="${esc(x.name)}" placeholder="例如：新耳機" maxlength="30">`)}
    ${field("商品連結（選填）", `<input id="f-link" type="url" inputmode="url" value="${esc(x.link || "")}" placeholder="貼上購物網站的網址" autocomplete="off" spellcheck="false">`)}
    <div class="form-row">
      ${field("目標金額", `<input id="f-target" type="number" min="1" value="${x.target}">`)}
      ${field("已經存了", `<input id="f-saved" type="number" min="0" value="${x.saved}">`)}
    </div>
    ${field("錢存在哪個帳戶", accountSelect("f-acc", banks(), x.accountId))}
    ${formActions(!!w)}
  </form>`);

  const showPhoto = () => {
    $("w-preview").hidden = !photo;
    if (photo) $("w-preview").src = photo;
    $("w-remove").hidden = !photo;
    document.querySelector("#wish-form .photo-pick").firstChild.textContent = photo ? "換一張" : "選擇照片";
  };
  $("f-photo").onchange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    $("w-photo-msg").textContent = "處理中…";
    try {
      photo = await compressImage(file);
      $("w-photo-msg").textContent = "";
      showErr("");
    } catch (err) {
      $("w-photo-msg").textContent = "";
      showErr(err.message);
    }
    showPhoto();
    e.target.value = "";
  };
  $("w-remove").onclick = () => { photo = ""; showPhoto(); $("w-photo-msg").textContent = "可以拍照或從相簿選"; };

  if (w) {
    armDelete($("f-del"), () => {
      wishlist = wishlist.filter(y => y.id !== w.id);
      afterChange("已刪除");
    });
  }

  bindSave("wish-form", () => {
    const name = $("f-name").value.trim();
    const target = Number($("f-target").value);
    const saved = Number($("f-saved").value) || 0;
    if (!name) return showErr("請輸入品名。");
    if (!(target > 0)) return showErr("請輸入目標金額。");
    const link = normalizeLink($("f-link").value);
    if (link && !/^https?:\/\/[^\s.]+\.[^\s]+$/i.test(link)) return showErr("商品連結看起來不是網址，請貼上完整的網址。");
    const data = { name, target, saved, accountId: Number($("f-acc").value), photo, link };
    if (w) Object.assign(w, data);
    else wishlist.push(Object.assign({ id: uid(), bought: false }, data));
    afterChange(w ? "已更新" : "已新增");
  });
}

function openDeposit(w) {
  openSheet(`存入：${w.name}`, `<form id="dep-form" novalidate>
    <p class="small muted">目前 ${money(w.saved)}，還差 ${money(Math.max(0, w.target - w.saved))}。</p>
    <div class="amount-input"><span>NT$</span><input id="f-amount" type="number" inputmode="decimal" min="1" placeholder="0" aria-label="存入金額"></div>
    ${formActions(false, "存入")}
  </form>`);
  bindSave("dep-form", () => {
    const amt = Number($("f-amount").value);
    if (!(amt > 0)) return showErr("請輸入大於 0 的金額。");
    w.saved += amt;
    afterChange(w.saved >= w.target ? `${w.name} 存滿了，可以買了！` : `已存入 ${money(amt)}`);
  });
}

// ========== 7. 動作 ==========
// 固定支出詳細頁：看本月狀態、確認有沒有繳費、選擇繳費帳戶
function openRecurringPay(r) {
  if (!r) return;
  const s = recurringStatus(r);
  const [yy, mm] = s.key.split("-").map(Number);
  const monthText = `${yy} 年 ${mm} 月`;
  const paidTx = r.lastHandled === s.key && r.lastTxId ? transactions.find(t => t.id === r.lastTxId) : null;
  const statusPill = s.state === "done" ? `<span class="pill pill-done">${paidTx ? "已繳費" : "已略過"}</span>`
    : s.state === "due" ? `<span class="pill pill-due">已到期</span>`
    : `<span class="pill pill-soon">${s.label || md(s.dueStr)}</span>`;
  const head = `<div class="card inset">
      <div class="kv"><b>${monthText}</b>${statusPill}</div>
      <div class="kv"><span class="muted">繳費期限</span><span>${mdw(s.dueStr)} ${esc(r.time)}</span></div>
      <div class="kv"><span class="muted">每月金額</span><b class="num">${money(r.amount)}</b></div>
      <div class="kv"><span class="muted">預設扣款帳戶</span><span>${esc(accountName(r.accountId))}</span></div>
      <div class="kv"><span class="muted">分類</span><span>${esc(r.category)}</span></div>
    </div>`;

  if (s.state === "done") {
    openSheet(r.name, `<div class="stack">
      ${head}
      <p class="small">${paidTx
        ? `本月已繳費：${mdw(paidTx.date)} 從 ${esc(accountName(paidTx.accountId))} 付了 ${money(paidTx.amount)}。`
        : "本月已經略過，沒有記帳。"}</p>
      <p class="small muted">記錯了的話，可以撤銷，撤銷後會回到「待繳」狀態${paidTx ? "，並刪除那筆繳費紀錄" : ""}。</p>
      <div class="form-actions">
        <button type="button" class="btn-secondary" id="r-edit">編輯設定</button>
        <button type="button" class="btn-danger" id="r-undo">撤銷</button>
      </div>
      <button type="button" class="btn-primary" data-action="close-sheet">關閉</button>
    </div>`);
    $("r-undo").onclick = () => {
      if (paidTx) transactions = transactions.filter(t => t.id !== paidTx.id);
      r.lastHandled = null;
      r.lastTxId = null;
      afterChange(paidTx ? "已撤銷這次繳費，並刪除那筆紀錄" : "已撤銷略過");
    };
    $("r-edit").onclick = () => openRecurringForm(r);
    return;
  }

  openSheet(r.name, `<form id="pay-form" novalidate>
    ${head}
    <p class="small"><b>這個月繳了嗎？</b>確認已經繳費後，按「已繳費」會記成一筆支出。</p>
    <div class="form-row">
      ${field("這次繳費金額", `<input id="f-amount" type="number" inputmode="decimal" min="1" step="any" value="${r.amount}">`)}
      ${field("繳費日期", `<input id="f-date" type="date" value="${todayStr()}">`)}
    </div>
    ${field("用哪個帳戶繳", accountSelect("f-acc", [...banks(), ...cards()], r.accountId))}
    <label class="check-opt"><input type="checkbox" id="f-remember"> 以後都用這個帳戶繳</label>
    ${formActions(false, "已繳費")}
    <div class="form-actions">
      <button type="button" class="btn-secondary" id="r-skip">本月不用繳（略過）</button>
      <button type="button" class="btn-secondary" id="r-edit">編輯設定</button>
    </div>
  </form>`);

  // 選的帳戶和預設不同時，才需要「以後都用這個帳戶」
  const remember = $("f-remember").closest("label");
  const syncRemember = () => { remember.hidden = Number($("f-acc").value) === r.accountId; };
  $("f-acc").onchange = syncRemember;
  syncRemember();

  $("r-skip").onclick = () => {
    r.lastHandled = s.key;
    r.lastTxId = null;
    afterChange(`${monthText}的${r.name}已略過`);
  };
  $("r-edit").onclick = () => openRecurringForm(r);

  bindSave("pay-form", () => {
    const amount = Math.round(Number($("f-amount").value) * 100) / 100;
    if (!(amount > 0)) return showErr("請輸入大於 0 的金額。");
    const date = $("f-date").value;
    if (!date) return showErr("請選擇繳費日期。");
    const accountId = Number($("f-acc").value);
    const tx = { id: uid(), type: "expense", amount, accountId, category: r.category, date, note: r.name };
    transactions.push(tx);
    r.lastHandled = s.key;
    r.lastTxId = tx.id;
    if ($("f-remember").checked && !remember.hidden) r.accountId = accountId;
    afterChange(`已記下 ${r.name} ${money(amount)}（${accountName(accountId)}）`);
  });
}

function payCard(id) {
  const c = findAccount(id);
  if (!c) return;
  const info = cardInfo(c);
  openTxForm(null, { type: "transfer", accountId: c.payAccountId, toAccountId: c.id, amount: info.billed, note: `${c.bank} 繳費` });
}

async function buyWish(id) {
  const w = wishlist.find(x => x.id === id);
  if (!w) return;
  const ok = await askConfirm(`買下「${w.name}」？會從 ${accountName(w.accountId)} 記一筆 ${money(w.target)} 的購物支出。`, "買下");
  if (!ok) return;
  transactions.push({ id: uid(), type: "expense", amount: w.target, accountId: w.accountId, category: "購物", date: todayStr(), note: w.name });
  w.bought = true;
  w.boughtDate = todayStr();
  persist();
  render();
  toast("恭喜買到了！");
}

function download(filename, text, type) {
  try {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast(`已下載 ${filename}`);
  } catch (e) {
    toast("這裡無法下載檔案，請在 VS Code 的 Live Server 中使用");
  }
}

function exportCsv() {
  if (!transactions.length) return toast("還沒有紀錄可以匯出");
  const typeName = { expense: "支出", income: "收入", transfer: "轉帳", trade: "股票" };
  const head = ["日期", "類型", "分類", "金額", "帳戶", "轉入帳戶", "備註"];
  const rows = sortedTx(transactions).reverse().map(t => [
    t.date, t.type === "trade" ? (t.side === "buy" ? "股票買進" : "股票賣出") : typeName[t.type],
    t.type === "trade" ? `${t.code} ${t.name || ""}` : (t.category || ""), t.amount,
    t.accountId ? accountName(t.accountId) : "", t.toAccountId ? accountName(t.toAccountId) : "",
    t.type === "trade" ? `${t.shares} 股 @ ${t.price}${t.note ? "，" + t.note : ""}` : (t.note || "")
  ]);
  const csv = [head, ...rows].map(r => r.map(v => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(",")).join("\r\n");
  // 開頭加 BOM，Excel 打開中文才不會亂碼
  download(`記帳紀錄-${todayStr()}.csv`, "﻿" + csv, "text/csv");
}

function backup() {
  const data = { app: "bookkeeping", version: 2, exportedAt: new Date().toISOString(), accounts, transactions, recurring, wishlist, plan, checks, stocks, settings: appSettings };
  download(`記帳備份-${todayStr()}.json`, JSON.stringify(data, null, 2), "application/json");
}

function restoreFrom(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    let d;
    try {
      d = JSON.parse(reader.result);
      if (!Array.isArray(d.accounts) || !Array.isArray(d.transactions)) throw new Error("格式錯誤");
    } catch (e) {
      return toast("這不是有效的備份檔");
    }
    const ok = await askConfirm(`備份裡有 ${d.accounts.length} 個帳戶、${d.transactions.length} 筆紀錄。還原後會取代目前所有資料，確定嗎？`, "還原", true);
    if (!ok) return;
    accounts = d.accounts;
    transactions = d.transactions;
    recurring = d.recurring || [];
    wishlist = d.wishlist || [];
    plan = d.plan || [];
    checks = d.checks || [];
    stocks = d.stocks || [];
    appSettings = Object.assign({}, DEFAULT_SETTINGS, d.settings || {});
    persist();
    render();
    toast("已還原備份");
  };
  reader.readAsText(file);
}

async function clearAll() {
  const sheetNote = syncEnabled() && dataBase !== null ? "已連結雲端同步，手機和電腦上的資料會一起刪除。" : "";
  const ok = await askConfirm(`這會刪除所有帳戶、紀錄、固定支出、存錢筒、資金確認和股票，而且無法復原。${sheetNote}建議先備份。確定要清除嗎？`, "全部清除", true);
  if (!ok) return;
  accounts = [];
  transactions = [];
  recurring = [];
  wishlist = [];
  plan = [];
  checks = [];
  stocks = [];
  appSettings = Object.assign({}, DEFAULT_SETTINGS);
  persist();
  render();
  toast("已清除全部資料");
}

function enableNotify() {
  try {
    Notification.requestPermission().then(() => render());
  } catch (e) {
    toast("這個瀏覽器無法開啟通知");
  }
}

// 繳款提醒：App 開著時，每 30 秒檢查一次
const notified = new Set();

function checkReminders(isStartup) {
  let newDue = 0;
  for (const r of recurring) {
    const s = recurringStatus(r);
    const key = r.id + "-" + s.key;
    if (s.state === "due" && !notified.has(key)) {
      notified.add(key);
      newDue++;
      if (!isStartup) {
        try {
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(`${r.name} 到期了`, { body: `${money(r.amount)}，由 ${accountName(r.accountId)} 扣款。打開 App 確認記帳。` });
          }
        } catch (e) { /* 不支援通知 */ }
      }
    }
  }
  if (newDue) {
    if ($("sheet-layer").hidden) render();
    toast(isStartup ? `有 ${newDue} 筆固定支出到期，請到首頁確認` : "有固定支出到期了");
  }
}

// ========== 7-1. 資金確認（每月自訂日期對帳） ==========
function checkDays() {
  const days = (appSettings.checkDays || []).map(Number).filter(d => d >= 1 && d <= 31);
  return days.length ? [...new Set(days)].sort((a, b) => a - b) : [5, 17];
}

// 某個月的確認日（沒有 31 號的月份算月底）
function checkDatesIn(y, m) {
  const last = new Date(y, m + 1, 0).getDate();
  return [...new Set(checkDays().map(d => Math.min(d, last)))].map(d => toStr(new Date(y, m, d)));
}

// 目前這一期的確認日：今天以前最近的一個確認日
function checkPeriod(dateStr = todayStr()) {
  const d = parseDate(dateStr);
  const past = checkDatesIn(d.getFullYear(), d.getMonth()).filter(x => x <= dateStr);
  if (past.length) return past[past.length - 1];
  const pm = new Date(d.getFullYear(), d.getMonth() - 1, 1);   // 上個月
  const prev = checkDatesIn(pm.getFullYear(), pm.getMonth());
  return prev[prev.length - 1];
}

// 下一次確認日
function nextCheckDate(dateStr = todayStr()) {
  const d = parseDate(dateStr);
  const next = checkDatesIn(d.getFullYear(), d.getMonth()).filter(x => x > dateStr);
  if (next.length) return next[0];
  const nm = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  return checkDatesIn(nm.getFullYear(), nm.getMonth())[0];
}

function checkDaysText() { return "每月 " + checkDays().join("、") + " 號"; }

function openCheckDays() {
  let picked = new Set(checkDays());
  openSheet("資金確認日期", `<form id="days-form" novalidate>
    <p class="small muted">選擇每個月要對帳的日子，可以選好幾天。選 29、30、31 號的話，沒有那一天的月份會在月底提醒。</p>
    <div class="day-grid">
      ${Array.from({ length: 31 }, (_, i) => i + 1).map(d => `<button type="button" class="day-btn" data-day="${d}" aria-pressed="${picked.has(d)}">${d}</button>`).join("")}
    </div>
    <p class="small" id="days-summary"></p>
    ${formActions(false)}
  </form>`);
  const summary = () => {
    const list = [...picked].sort((a, b) => a - b);
    $("days-summary").textContent = list.length ? `每月 ${list.join("、")} 號，一個月確認 ${list.length} 次` : "至少要選一天";
  };
  document.querySelectorAll("#days-form .day-btn").forEach(b => {
    b.onclick = () => {
      const d = Number(b.dataset.day);
      if (picked.has(d)) picked.delete(d); else picked.add(d);
      b.setAttribute("aria-pressed", picked.has(d));
      summary();
    };
  });
  summary();
  bindSave("days-form", () => {
    if (!picked.size) return showErr("至少要選一天。");
    appSettings.checkDays = [...picked].sort((a, b) => a - b);
    afterChange(`資金確認改成${checkDaysText()}`);
  });
}

function checkDone(period) { return checks.some(c => c.period === period); }

// 記帳本上的金額：銀行帳戶 = 餘額；信用卡 = 待繳金額
function bookValue(a) { return a.kind === "card" ? cardInfo(a).owed : balanceOf(a); }

function checkSummary(c) {
  const diffs = c.items.filter(i => i.diff !== 0);
  const total = diffs.reduce((s, i) => s + Math.abs(i.diff), 0);
  if (!diffs.length) return { pill: `<span class="pill pill-done">全部相符</span>`, text: "全部相符" };
  return {
    pill: `<span class="pill ${c.adjusted ? "pill-soon" : "pill-due"}">${diffs.length} 個帳戶有差額</span>`,
    text: `差額合計 ${money(total)}${c.adjusted ? "，已補調整紀錄" : "，未調整"}`
  };
}

function viewChecks() {
  const cp = checkPeriod();
  const done = checks.find(c => c.period === cp);
  const history = [...checks].sort((a, b) => b.date !== a.date ? b.date.localeCompare(a.date) : b.id - a.id).slice(0, 6);

  let h = `<section>
    <div class="sec-head"><h2>資金確認 <small>${checkDaysText()}</small></h2><button class="link" data-action="check-days">設定日期</button></div>
    <div class="card">`;
  if (!accounts.length) {
    h += `<p class="small muted">新增帳戶後，每月 5 號和 17 號會提醒你對照銀行 App，確認各帳戶的實際餘額。</p>`;
  } else if (done) {
    const s = checkSummary(done);
    h += `<div class="kv"><b>${md(cp)} 這一期</b>${s.pill}</div>
      <p class="small muted">${md(done.date)} 已確認 · ${s.text}。下一次是 ${md(nextCheckDate())}。</p>
      <button class="btn-secondary" data-action="start-check">再確認一次</button>`;
  } else {
    h += `<div class="kv"><b>${md(cp)} 這一期</b><span class="pill pill-due">待確認</span></div>
      <p class="small muted">打開各銀行 App 或存摺，輸入實際餘額，記帳本會幫你找出差額。</p>
      <button class="btn-primary" data-action="start-check">開始確認</button>`;
  }
  h += `</div>`;
  if (history.length) {
    h += `<div class="list">${history.map(c => {
      const s = checkSummary(c);
      return `<button class="row" data-action="view-check" data-id="${c.id}">
        <span class="badge" style="background:#ffffff">${icon("scroll")}</span>
        <span class="row-main"><b>${md(c.period)} 期 ${s.pill}</b><small>${md(c.date)} 確認 · ${s.text}</small></span>
      </button>`;
    }).join("")}</div>`;
  }
  return h + `</section>`;
}

function openCheckForm() {
  if (!accounts.length) return toast("請先新增帳戶");
  const period = checkPeriod();
  const list = [...banks(), ...cards()];

  openSheet(`資金確認 ${md(period)}`, `<form id="check-form" novalidate>
    <p class="small muted">對照各銀行 App 或存摺，輸入現在的實際金額。已經先填入記帳本的金額，一樣的就不用改。</p>
    <div class="check-list">
      ${list.map(a => {
        const book = bookValue(a);
        return `<div class="check-row" data-id="${a.id}" data-book="${book}">
          <span class="check-name"><span class="dot" style="background:${a.color}"></span><b>${esc(a.bank)}</b>
            <small class="muted">${a.kind === "card" ? "信用卡待繳" : "記帳本"} ${money(book)}</small></span>
          <input class="c-actual" type="number" inputmode="decimal" step="any" value="${book}" aria-label="${esc(a.bank)} 實際金額">
          <small class="c-diff muted">相符</small>
        </div>`;
      }).join("")}
    </div>
    <div class="kv total"><span>差額合計</span><b class="num" id="c-total">NT$ 0</b></div>
    <label class="check-opt"><input type="checkbox" id="c-adjust" checked> 有差額的帳戶，自動補一筆「對帳調整」紀錄，讓記帳本和實際金額一致</label>
    ${formActions(false, "完成確認")}
  </form>`);

  function update() {
    let total = 0;
    document.querySelectorAll("#check-form .check-row").forEach(row => {
      const book = Number(row.dataset.book);
      const actual = Number(row.querySelector(".c-actual").value);
      const diff = Math.round((actual - book) * 100) / 100;
      const el = row.querySelector(".c-diff");
      if (row.querySelector(".c-actual").value === "" || isNaN(actual)) {
        el.textContent = "請輸入金額"; el.className = "c-diff expense";
      } else if (diff === 0) {
        el.textContent = "相符"; el.className = "c-diff muted";
      } else {
        el.textContent = `差 ${diff > 0 ? "+" : ""}${money(diff)}`; el.className = "c-diff expense";
        total += Math.abs(diff);
      }
    });
    $("c-total").textContent = money(total);
  }
  document.querySelectorAll("#check-form .c-actual").forEach(inp => { inp.oninput = update; });
  update();

  bindSave("check-form", () => {
    const rows = [...document.querySelectorAll("#check-form .check-row")];
    if (rows.some(r => r.querySelector(".c-actual").value === "")) return showErr("每個帳戶都要填實際金額。");
    const adjust = $("c-adjust").checked;
    const today = todayStr();
    const items = rows.map(r => {
      const a = findAccount(Number(r.dataset.id));
      const book = Number(r.dataset.book);
      const actual = Number(r.querySelector(".c-actual").value);
      return { accountId: a.id, name: a.bank, kind: a.kind, book, actual, diff: Math.round((actual - book) * 100) / 100 };
    });

    let n = 0;
    if (adjust) {
      for (const it of items) {
        if (it.diff === 0) continue;
        // 銀行：實際比較多 → 收入；比較少 → 支出
        // 信用卡：實際欠比較多 → 支出；欠比較少 → 收入
        const moreMoney = it.kind === "card" ? it.diff < 0 : it.diff > 0;
        transactions.push({
          id: uid() + n, type: moreMoney ? "income" : "expense", amount: Math.abs(it.diff),
          accountId: it.accountId, category: moreMoney ? "其他收入" : "其他",
          date: today, note: `對帳調整（${md(period)} 資金確認）`, adjust: true
        });
        n++;
      }
    }
    checks.push({ id: uid(), period, date: today, items, adjusted: adjust && n > 0 });
    afterChange(n ? `資金確認完成，補了 ${n} 筆調整紀錄 +20 exp` : "資金確認完成 +20 exp");
  });
}

function openCheckDetail(c) {
  const s = checkSummary(c);
  openSheet(`資金確認 ${md(c.period)}`, `<div class="stack">
    <p class="small muted">${c.date.replaceAll("-", "/")} 確認 · ${s.text}</p>
    <div class="card inset">
      ${c.items.map(i => `<div class="kv">
        <span>${esc(i.name)}${i.kind === "card" ? ` <small class="muted">待繳</small>` : ""}</span>
        <span class="num">${money(i.actual)} ${i.diff === 0 ? `<small class="muted">相符</small>` : `<small class="expense">${i.diff > 0 ? "+" : ""}${money(i.diff)}</small>`}</span>
      </div>`).join("")}
    </div>
    <p class="small muted">刪除這次確認不會刪除當時補的調整紀錄，調整紀錄可以到「明細」個別刪除。</p>
    <div class="form-actions">
      <button type="button" class="btn-danger" id="f-del">刪除</button>
      <button type="button" class="btn-primary" data-action="close-sheet">關閉</button>
    </div>
  </div>`);
  armDelete($("f-del"), () => {
    checks = checks.filter(x => x.id !== c.id);
    afterChange("已刪除這次確認");
  });
}

// ========== 7-0. 公用服務（作者架設，所有人共用：查股價、問題回報） ==========
// 網址寫在 GitHub 上的 config.json；這個服務碰不到任何人的記帳資料
const serviceState = { url: "", loaded: false };
function serviceUrl() { return serviceState.url; }

function loadServiceConfig() {
  return fetch("config.json", { cache: "no-store" })
    .then(r => (r.ok ? r.json() : {}))
    .catch(() => ({}))
    .then(cfg => {
      const url = String(cfg.publicServiceUrl || "").trim();
      serviceState.url = /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(url) ? url : "";
      serviceState.loaded = true;
    });
}

async function postToService(payload) {
  let res;
  try {
    res = await fetch(serviceState.url, { method: "POST", body: JSON.stringify(payload) });
  } catch (e) {
    throw new Error("連不到公用服務，請檢查網路");
  }
  let data;
  try { data = await res.json(); } catch (e) { throw new Error("公用服務沒有正確回應，請稍後再試"); }
  if (!data.ok) throw new Error(data.error || "公用服務發生錯誤");
  return data;
}

// 查股價：有設定自己的同步就用自己的，沒有就用公用服務
function canQuote() { return syncEnabled() || !!serviceUrl(); }
async function quotesFrom(codes) {
  if (syncEnabled()) {
    try {
      return (await postToSheet({ action: "quotes", codes }, 4)).quotes || {};
    } catch (e) {
      if (!serviceUrl()) throw e;   // 自己的同步程式查不到時，改用公用服務
    }
  }
  return (await postToService({ action: "quotes", codes })).quotes || {};
}

// ========== 7-3. 股票 ==========
// 股價透過 Google 試算表的同步程式查詢（瀏覽器不能直接向證交所查）
// quotes 只存在這台裝置；股票清單（stocks）會跟著雲端同步
let quotes = load("bookkeeping-quotes", {});
const quoteState = { busy: false, error: "", at: load("bookkeeping-quotes-at", 0) };
const STOCK_ALERT_KEY = "bookkeeping-stock-alerted";
const STOCK_COLORS = ["#ffcf3f", "#ff7a59", "#ff9ec4", "#9b7bd8", "#5b8def", "#4cbf8f", "#fffdf6"];
const STOCK_COLOR_NAMES = ["黃色（預設）", "橘紅", "粉紅", "紫色", "藍色", "綠色", "白色"];

function priceText(n) {
  return Number(n).toLocaleString("zh-TW", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function sharesText(n) {
  const lots = n / 1000;
  if (n >= 1000 && Number.isInteger(lots)) return `${lots.toLocaleString("zh-TW")} 張`;
  return `${Number(n).toLocaleString("zh-TW")} 股`;
}

// 台股交易時間：週一到週五 9:00–13:30（多留 5 分鐘收盤）
function marketOpen() {
  const now = new Date();
  const day = now.getDay();
  const hm = now.getHours() * 60 + now.getMinutes();
  return day >= 1 && day <= 5 && hm >= 9 * 60 && hm <= 13 * 60 + 35;
}


// 台股習慣：漲是紅色、跌是綠色
function changeText(q) {
  if (!q || !q.prev) return { cls: "muted", text: "—" };
  const d = q.price - q.prev;
  const pct = d / q.prev * 100;
  if (Math.abs(d) < 1e-9) return { cls: "muted", text: "平盤" };
  return {
    cls: d > 0 ? "up" : "down",
    text: `${d > 0 ? "▲" : "▼"} ${priceText(Math.abs(d))}（${d > 0 ? "+" : "−"}${Math.abs(pct).toFixed(2)}%）`
  };
}

async function fetchQuotes(force) {
  if (!stocks.length || quoteState.busy) return;
  if (!canQuote()) {
    if (!serviceState.loaded) return;   // 設定檔還在讀取，等一下會再查
    quoteState.error = "目前無法查詢股價：公用服務還沒設定，也還沒設定雲端同步。";
    if (ui.tab === "stocks") render();
    return;
  }
  if (!force && Date.now() - quoteState.at < (marketOpen() ? 25000 : 10 * 60000)) return;

  quoteState.busy = true;
  if (ui.tab === "stocks") render();
  const codes = [...new Set(stocks.map(s => s.code))];
  try {
    const res = { quotes: await quotesFrom(codes) };
    Object.assign(quotes, res.quotes || {});
    save("bookkeeping-quotes", quotes);
    quoteState.at = Date.now();
    save("bookkeeping-quotes-at", quoteState.at);
    const missing = codes.filter(c => !(res.quotes || {})[c]);
    quoteState.error = missing.length ? `查不到 ${missing.join("、")} 的股價，請確認股票代號。` : "";
    notifyTargets();
  } catch (e) {
    quoteState.error = e.message;
  }
  quoteState.busy = false;
  if (ui.tab === "stocks" || ui.tab === "home") render();
}

// 到目標價時提醒（同一檔股票一天只提醒一次）
function notifyTargets() {
  const alerted = load(STOCK_ALERT_KEY, {});
  const today = todayStr();
  const keyOf = a => `${a.st.code}:${a.kind}:${a.price}`;
  const fresh = stockAlerts().filter(a => alerted[keyOf(a)] !== today);
  if (!fresh.length) return;
  for (const a of fresh) alerted[keyOf(a)] = today;
  save(STOCK_ALERT_KEY, alerted);
  const line = a => `${a.st.code} ${a.st.name} ${a.kind === "buy" ? "到買入價" : "到賣出價"}`;
  toast(fresh.map(line).join("、"));
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("股票到價提醒", { body: fresh.map(a => `${line(a)}：現價 ${priceText(a.q.price)}，設定 ${priceText(a.price)}`).join("\n") });
    }
  } catch (e) { /* 不支援通知 */ }
}

// ---------- 持股計算：期初持股 + 每一筆買賣紀錄 ----------
// 買賣紀錄存在記帳紀錄裡（type: "trade"），所以會影響帳戶餘額、出現在明細
// 買進 amount = 實付（成交金額 + 手續費）；賣出 amount = 實收（成交金額 − 手續費 − 交易稅）
function tradesOf(st) {
  return transactions
    .filter(t => t.type === "trade" && t.stockId === st.id)
    .sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")) || a.id - b.id);
}

// 平均成本法：賣出時用當時的平均成本計算已實現損益
function position(st, excludeId) {
  let shares = Number(st.shares) || 0;
  let cost = shares * (Number(st.cost) || 0);
  let realized = 0;
  for (const t of tradesOf(st)) {
    if (t.id === excludeId) continue;
    if (t.side === "buy") {
      shares += t.shares;
      cost += t.amount;
    } else {
      const avg = shares > 0 ? cost / shares : 0;
      const out = Math.min(t.shares, shares);
      cost -= avg * out;
      shares -= out;
      realized += t.amount - avg * out;
    }
  }
  if (shares <= 0) { shares = 0; cost = 0; }
  return { shares, cost, avg: shares ? cost / shares : 0, realized };
}

// 台股手續費 0.1425%（可打折，整張最低 20 元、零股最低 1 元）；交易稅：股票 0.3%、ETF 0.1%
function tradeFee(gross, shares) {
  if (!(gross > 0)) return 0;
  const rate = 0.001425 * (Number(appSettings.feeDiscount) || 1);
  return Math.max(shares >= 1000 ? 20 : 1, Math.floor(gross * rate));
}
function tradeTax(gross, code) {
  if (!(gross > 0)) return 0;
  return Math.floor(gross * (/^00/.test(code) ? 0.001 : 0.003));
}

function sortedStocks() {
  return [...stocks].sort((a, b) => (a.order ?? 1e9) - (b.order ?? 1e9) || a.code.localeCompare(b.code));
}

function moveStock(id, dir) {
  const list = sortedStocks();
  list.forEach((s, i) => { s.order = i; });
  const i = list.findIndex(s => s.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i].order, list[j].order] = [list[j].order, list[i].order];
  persist();
  render();
}

function stockAccount() {
  const a = findAccount(appSettings.stockAccountId);
  return a && a.kind !== "card" ? a : null;
}

// ---------- 股票分頁 ----------
function viewStocks() {
  const list = sortedStocks();
  let mv = 0, cost = 0, day = 0, realized = 0, totalCost = 0;
  const pos = {};
  for (const st of list) {
    const p = position(st);
    pos[st.id] = p;
    realized += p.realized;
    totalCost += p.cost;
    const q = quotes[st.code];
    if (!p.shares || !q) continue;
    mv += p.shares * q.price;
    cost += p.cost;
    if (q.prev) day += p.shares * (q.price - q.prev);
  }
  const pl = mv - cost;
  const plPct = cost > 0 ? pl / cost * 100 : 0;
  const signCls = v => v > 0 ? "up" : v < 0 ? "down" : "";
  const signed = v => (v > 0 ? "+" : "") + money(v);
  const src = [...new Set(list.map(st => quotes[st.code]?.source).filter(Boolean))].join("、");

  let h = viewStockAccount();

  h += `<section class="card">
    <div class="sec-head"><h2>我的持股</h2><button class="btn-sm" data-action="refresh-quotes" ${quoteState.busy ? "disabled" : ""}>${quoteState.busy ? "更新中…" : "更新股價"}</button></div>
    <div class="stock-total"><small>總市值</small><b class="num">${money(mv)}</b></div>
    <div class="duo">
      <div><small>總成本</small><b class="num">${money(totalCost)}</b></div>
      <div><small>未實現損益</small><b class="num ${signCls(pl)}">${signed(pl)}</b>${cost > 0 ? `<small class="num ${signCls(pl)}">${pl >= 0 ? "+" : "−"}${Math.abs(plPct).toFixed(2)}%</small>` : ""}</div>
      <div><small>今日漲跌</small><b class="num ${signCls(day)}">${signed(day)}</b></div>
      <div><small>已實現損益</small><b class="num ${signCls(realized)}">${signed(realized)}</b></div>
    </div>
    ${quoteState.error ? `<p class="small expense">${esc(quoteState.error)}</p>` : ""}
    <p class="small muted">${quoteState.at ? "股價更新 " + timeText(new Date(quoteState.at).toISOString()) : "還沒查詢過股價"}${src ? " · " + esc(src) : ""} · ${marketOpen() ? "交易時間每 30 秒自動更新" : "目前非交易時間"}</p>
    <p class="small muted">股票的成本和市值另外計算，不算進淨資產。買賣時的付款、入帳會反映在帳戶餘額。漲紅跌綠。</p>
  </section>`;

  h += `<section>
    <div class="sec-head"><h2>股票清單 <small>${list.length} 檔</small></h2>
      <span class="nav">
        ${list.length > 1 ? `<button class="link" data-action="stock-reorder">${ui.stockReorder ? "完成" : "調整順序"}</button>` : ""}
        <button class="link" data-action="add-stock">＋ 新增股票</button>
      </span>
    </div>`;
  if (!list.length) {
    h += `<div class="empty">${icon("chart", "empty-ic")}<span>輸入股票代號，例如 2330、0050，就能追蹤即時股價。新增後可以記錄每一筆買進、賣出。</span></div>`;
    return h + `</section>`;
  }

  // 調整順序模式：只顯示名稱和上下移動按鈕
  if (ui.stockReorder) {
    h += `<p class="small muted">用 ▲▼ 調整前後順序，把要注意的股票排在前面。</p>
      <div class="list">${list.map((st, i) => `<div class="row">
        <span class="code-badge num" style="background:${st.color || STOCK_COLORS[0]}">${esc(st.code)}</span>
        <span class="row-main"><b>${esc(stockName(st))}</b></span>
        <span class="row-actions">
          <button class="icon-btn" data-action="stock-up" data-id="${st.id}" aria-label="往前移" ${i === 0 ? "disabled" : ""}>▲</button>
          <button class="icon-btn" data-action="stock-down" data-id="${st.id}" aria-label="往後移" ${i === list.length - 1 ? "disabled" : ""}>▼</button>
        </span>
      </div>`).join("")}</div>`;
    return h + `</section>`;
  }

  h += `<div class="stack">${list.map(st => {
    const q = quotes[st.code];
    const p = pos[st.id];
    const ch = changeText(q);
    const alerts = alertsOf(st);
    const lines = alerts.map(a => {
      const hit = q && (a.side === "buy" ? q.price <= a.price : q.price >= a.price);
      if (hit) return `<p class="small"><span class="pill ${a.side === "buy" ? "pill-done" : "pill-due"}">${a.side === "buy" ? "到買入價了" : "到賣出價了"}</span> 現價已在 ${priceText(a.price)} ${a.side === "buy" ? "以下" : "以上"}</p>`;
      const gap = q ? Math.abs(a.price - q.price) / q.price * 100 : null;
      return `<p class="small muted">${a.side === "buy" ? "買入" : "賣出"}提醒 ${priceText(a.price)} ${a.side === "buy" ? "以下" : "以上"}${gap !== null ? ` · 還要${a.side === "buy" ? "跌" : "漲"} ${gap.toFixed(1)}%` : ""}</p>`;
    }).join("");
    const anyHit = alerts.some(a => q && (a.side === "buy" ? q.price <= a.price : q.price >= a.price));
    const value = q && p.shares ? p.shares * q.price : 0;
    const gain = q && p.shares ? value - p.cost : 0;
    const gainPct = p.cost > 0 && q ? gain / p.cost * 100 : 0;
    return `<div class="card stock-card ${anyHit ? "is-hit" : ""}">
      <button class="cc-top" data-action="edit-stock" data-id="${st.id}">
        <span class="code-badge num" style="background:${st.color || STOCK_COLORS[0]}">${esc(st.code)}</span>
        <span class="row-main"><b>${esc(stockName(st))}</b><small>${esc(q?.market || "台股")}${q?.time ? " · " + esc(q.time) : ""}${st.note ? " · " + esc(st.note) : ""}</small></span>
        <span class="row-end"><b class="num stock-price">${q ? priceText(q.price) : "—"}</b><small class="num ${ch.cls}">${ch.text}</small></span>
      </button>
      ${p.shares > 0 ? `<div class="trio">
        <div><small>持有（均價 ${priceText(Math.round(p.avg * 100) / 100)}）</small><b class="num">${sharesText(p.shares)}</b></div>
        <div><small>市值</small><b class="num">${q ? money(value) : "—"}</b></div>
        <div><small>未實現損益</small><b class="num ${signCls(gain)}">${q ? signed(gain) : "—"}</b>${q && p.cost > 0 ? `<small class="num ${signCls(gain)}">${gainPct >= 0 ? "+" : "−"}${Math.abs(gainPct).toFixed(2)}%</small>` : ""}</div>
      </div>` : ""}
      ${Math.round(p.realized) !== 0 ? `<p class="small muted">已實現損益 <b class="num ${signCls(p.realized)}">${signed(p.realized)}</b></p>` : ""}
      ${lines}
      <div class="stock-actions">
        <button class="btn-sm primary" data-action="trade-buy" data-id="${st.id}">＋ 買進</button>
        <button class="btn-sm" data-action="trade-sell" data-id="${st.id}" ${p.shares > 0 ? "" : "disabled"}>－ 賣出</button>
      </div>
    </div>`;
  }).join("")}</div>`;
  return h + `</section>`;
}

// 目前持股的總市值（給首頁參考用）
function stockValue() {
  return stocks.reduce((sum, st) => {
    const q = quotes[st.code];
    return q ? sum + position(st).shares * q.price : sum;
  }, 0);
}

function stockName(st) {
  const q = quotes[st.code];
  return st.name && st.name !== st.code ? st.name : (q?.name || st.code);
}

// ---------- 交割帳戶 ----------
function viewStockAccount() {
  const acc = stockAccount();
  if (!acc) {
    return `<section class="card">
      <div class="sec-head"><h2>交割帳戶</h2></div>
      <p class="small muted">選一個銀行帳戶當作股票的交割帳戶。買進時從這裡扣款、賣出時存回這裡，也能在這裡看剩餘資金和轉帳紀錄。</p>
      <button class="btn-primary" data-action="stock-account">${banks().length ? "選擇交割帳戶" : "先到「帳戶」新增銀行帳戶"}</button>
    </section>`;
  }
  const recent = sortedTx(transactions.filter(t => t.accountId === acc.id || t.toAccountId === acc.id)).slice(0, 4);
  const ym = todayStr().slice(0, 7);
  const monthIn = transactions.filter(t => t.date.startsWith(ym)).reduce((s, t) => s + Math.max(0, effectOn(acc, t)), 0);
  const monthOut = transactions.filter(t => t.date.startsWith(ym)).reduce((s, t) => s + Math.max(0, -effectOn(acc, t)), 0);
  return `<section class="card">
    <div class="sec-head"><h2>交割帳戶</h2><button class="link" data-action="stock-account">設定</button></div>
    <div class="kv"><span><span class="dot" style="background:${acc.color}"></span><b>${esc(acc.bank)}</b>${acc.purpose ? ` <span class="tag">${esc(acc.purpose)}</span>` : ""}</span></div>
    <div class="stock-total"><small>剩餘資金</small><b class="num ${balanceOf(acc) < 0 ? "expense" : ""}">${money(balanceOf(acc))}</b></div>
    <div class="duo">
      <div><small>本月存入</small><b class="num">${money(monthIn)}</b></div>
      <div><small>本月扣款</small><b class="num">${money(monthOut)}</b></div>
    </div>
    <div class="btn-grid">
      <button class="btn-secondary" data-action="stock-transfer-in">轉入資金</button>
      <button class="btn-secondary" data-action="stock-transfer-out">轉出資金</button>
    </div>
    ${recent.length ? `<div class="list list-inset">${recent.map(txRow).join("")}</div>
      <button class="link" data-action="stock-account-records">查看全部紀錄 ›</button>` : `<p class="small muted">這個帳戶還沒有紀錄。</p>`}
  </section>`;
}

function openStockAccountForm() {
  if (!banks().length) { ui.tab = "accounts"; render(); return toast("請先新增銀行帳戶"); }
  const cur = stockAccount();
  openSheet("交割帳戶設定", `<form id="sa-form" novalidate>
    ${field("交割帳戶（買賣股票用的銀行帳戶）", accountSelect("f-acc", banks(), cur ? cur.id : banks()[0].id))}
    ${field("券商手續費折扣（折）", `<input id="f-disc" type="number" inputmode="decimal" min="0.1" max="10" step="0.01" value="${Math.round((Number(appSettings.feeDiscount) || 1) * 1000) / 100}">`)}
    <p class="small muted">手續費是成交金額的 0.1425%。券商給 2.8 折就填 2.8，沒有折扣填 10。記錄買賣時會自動算好，也可以每筆自己修改。</p>
    ${formActions(false)}
  </form>`);
  bindSave("sa-form", () => {
    const disc = Number($("f-disc").value);
    if (!(disc > 0 && disc <= 10)) return showErr("折扣請填 0.1 到 10 之間，例如 2.8。");
    appSettings.stockAccountId = Number($("f-acc").value);
    appSettings.feeDiscount = Math.round(disc * 1000) / 10000;
    afterChange("已更新交割帳戶設定");
  });
}

function stockTransfer(dir) {
  const acc = stockAccount();
  if (!acc) return openStockAccountForm();
  const other = banks().find(b => b.id !== acc.id);
  if (dir === "in") openTxForm(null, { type: "transfer", accountId: other ? other.id : acc.id, toAccountId: acc.id, note: "轉入交割帳戶" });
  else openTxForm(null, { type: "transfer", accountId: acc.id, toAccountId: other ? other.id : null, note: "從交割帳戶轉出" });
}

// ---------- 到價提醒（每檔可以有好幾個） ----------
function alertsOf(st) {
  if (Array.isArray(st.alerts)) return st.alerts.filter(a => a.price > 0);
  const a = [];   // 舊版只有一個買入價、一個賣出價
  if (st.target > 0) a.push({ id: "b", side: "buy", price: st.target });
  if (st.sellTarget > 0) a.push({ id: "s", side: "sell", price: st.sellTarget });
  return a;
}

function stockAlerts() {
  const out = [];
  for (const st of sortedStocks()) {
    const q = quotes[st.code];
    if (!q) continue;
    for (const a of alertsOf(st)) {
      if (a.side === "buy" ? q.price <= a.price : q.price >= a.price) out.push({ st, q, kind: a.side, price: a.price });
    }
  }
  return out;
}

function alertRowHtml(a) {
  return `<div class="alert-row">
    <select class="al-side" aria-label="提醒種類">
      <option value="buy" ${a.side === "buy" ? "selected" : ""}>買入：跌到以下</option>
      <option value="sell" ${a.side === "sell" ? "selected" : ""}>賣出：漲到以上</option>
    </select>
    <input class="al-price" type="number" inputmode="decimal" min="0" step="any" value="${a.price || ""}" placeholder="價格" aria-label="提醒價格">
    <button type="button" class="icon-btn al-del" aria-label="刪除這個提醒">✕</button>
  </div>`;
}

// ---------- 新增／編輯股票 ----------
function openStockForm(st) {
  const x = st || { code: "", name: "", shares: "", cost: "", note: "", color: STOCK_COLORS[0] };
  let color = x.color || STOCK_COLORS[0];
  let notFound = "";   // 查不到的代號；按第二次儲存仍可加入
  const trades = st ? tradesOf(st).reverse() : [];
  const p = st ? position(st) : null;

  openSheet(st ? `${st.code} ${stockName(st)}` : "新增股票", `<form id="stock-form" novalidate>
    <div class="form-row">
      ${field("股票代號", `<input id="f-code" value="${esc(x.code)}" placeholder="例如 2330、0050" maxlength="6" autocomplete="off" spellcheck="false" ${trades.length ? "readonly" : ""}>`)}
      ${field("名稱", `<input id="f-name" value="${esc(x.name)}" placeholder="查詢後自動帶入" maxlength="20">`)}
    </div>
    <button type="button" class="btn-secondary" id="f-lookup">查詢股價</button>
    <p class="small muted" id="f-quote">${st && quotes[st.code] ? `現價 ${priceText(quotes[st.code].price)}` : "輸入代號後按「查詢股價」，確認是哪一檔。"}</p>

    <div class="field"><span>代號顏色（標記關注股）</span><div class="swatches">
      ${STOCK_COLORS.map((c, i) => `<button type="button" class="swatch" data-color="${c}" style="background:${c}" aria-pressed="${c === color}" aria-label="${STOCK_COLOR_NAMES[i]}"></button>`).join("")}
    </div></div>

    <div class="field"><span>到價提醒（可以設好幾個）</span>
      <div id="alert-list" class="alert-list">${alertsOf(x).map(alertRowHtml).join("")}</div>
      <button type="button" class="btn-sm" id="f-add-alert">＋ 新增提醒</button>
    </div>

    <details class="init-box" ${x.shares > 0 ? "open" : ""}>
      <summary>期初持股（開始記帳前就有的）</summary>
      <div class="form-row">
        ${field("股數（1 張 = 1000 股）", `<input id="f-shares" type="number" inputmode="numeric" min="0" step="1" value="${x.shares || ""}" placeholder="沒有就留空">`)}
        ${field("平均成本（每股）", `<input id="f-cost" type="number" inputmode="decimal" min="0" step="any" value="${x.cost || ""}" placeholder="例如 850">`)}
      </div>
      <p class="small muted">之後的買進、賣出請用股票卡片上的「買進」「賣出」記錄，會記下時間並連動帳戶。</p>
    </details>

    ${field("備註", `<input id="f-note" value="${esc(x.note)}" placeholder="例如：長期存股" maxlength="30">`)}

    ${st ? `<div class="field"><span>買賣紀錄${p ? ` · 目前持有 ${sharesText(p.shares)}` : ""}</span>
      ${trades.length ? `<div class="list list-inset">${trades.map(txRow).join("")}</div>` : `<p class="small muted">還沒有買賣紀錄。</p>`}
      <div class="btn-grid">
        <button type="button" class="btn-secondary" data-action="trade-buy" data-id="${st.id}">＋ 買進</button>
        <button type="button" class="btn-secondary" data-action="trade-sell" data-id="${st.id}" ${p && p.shares > 0 ? "" : "disabled"}>－ 賣出</button>
      </div>
    </div>` : ""}
    ${st && trades.length ? `<p class="small muted">刪除這檔股票會一起刪除 ${trades.length} 筆買賣紀錄，帳戶餘額也會跟著還原。</p>` : ""}
    ${formActions(!!st)}
  </form>`);

  document.querySelectorAll("#stock-form .swatch").forEach(b => {
    b.onclick = () => {
      color = b.dataset.color;
      document.querySelectorAll("#stock-form .swatch").forEach(y => y.setAttribute("aria-pressed", y === b));
    };
  });
  const bindAlertRows = () => document.querySelectorAll("#alert-list .al-del").forEach(b => { b.onclick = () => b.closest(".alert-row").remove(); });
  bindAlertRows();
  $("f-add-alert").onclick = () => {
    $("alert-list").insertAdjacentHTML("beforeend", alertRowHtml({ side: "buy", price: "" }));
    bindAlertRows();
    $("alert-list").lastElementChild.querySelector(".al-price").focus();
  };

  $("f-lookup").onclick = async () => {
    const code = $("f-code").value.trim().toUpperCase();
    if (!/^[0-9A-Z]{4,6}$/.test(code)) return showErr("股票代號是 4 到 6 碼的數字或英文，例如 2330、00878。");
    if (!canQuote()) return showErr("目前無法查詢股價，名稱可以先自己輸入。");
    showErr("");
    $("f-lookup").disabled = true;
    $("f-lookup").textContent = "查詢中…";
    try {
      const res = { quotes: await quotesFrom([code]) };
      const q = (res.quotes || {})[code];
      if (!q) {
        notFound = code;
        showErr(`查不到 ${code}，請確認代號是台股上市或上櫃的股票。`);
      } else {
        quotes[code] = q;
        save("bookkeeping-quotes", quotes);
        if (q.name) $("f-name").value = q.name;
        $("f-quote").textContent = `${q.name || code}（${q.market || "台股"}）現價 ${priceText(q.price)} · ${q.source}`;
      }
    } catch (e) {
      showErr(e.message);
    }
    $("f-lookup").disabled = false;
    $("f-lookup").textContent = "查詢股價";
  };

  if (st) {
    armDelete($("f-del"), () => {
      transactions = transactions.filter(t => !(t.type === "trade" && t.stockId === st.id));
      stocks = stocks.filter(y => y.id !== st.id);
      afterChange("已刪除");
    });
  }

  bindSave("stock-form", () => {
    const code = $("f-code").value.trim().toUpperCase();
    if (!/^[0-9A-Z]{4,6}$/.test(code)) return showErr("股票代號是 4 到 6 碼的數字或英文，例如 2330、00878。");
    if (stocks.some(y => y.code === code && (!st || y.id !== st.id))) return showErr(`${code} 已經在清單裡了，請直接點它來修改。`);
    if (notFound === code) {
      notFound = "";
      return showErr(`查不到 ${code} 的股價。確定代號沒錯的話，再按一次「儲存」仍會加入。`);
    }
    const shares = Number($("f-shares").value) || 0;
    const cost = Number($("f-cost").value) || 0;
    if (shares < 0 || cost < 0) return showErr("數字不能是負的。");
    if (shares > 0 && !cost) return showErr("有期初持股的話，請填平均成本，才能算損益。");

    const alerts = [];
    for (const row of document.querySelectorAll("#alert-list .alert-row")) {
      const price = Number(row.querySelector(".al-price").value);
      if (!row.querySelector(".al-price").value) continue;
      if (!(price > 0)) return showErr("提醒價格要大於 0。");
      alerts.push({ id: uid() + alerts.length, side: row.querySelector(".al-side").value, price });
    }

    const name = $("f-name").value.trim() || quotes[code]?.name || code;
    const data = { code, name, shares, cost, color, alerts, note: $("f-note").value.trim() };
    if (st) {
      Object.assign(st, data);
      delete st.target;
      delete st.sellTarget;
      for (const t of transactions) if (t.type === "trade" && t.stockId === st.id) t.name = name;
    } else {
      const maxOrder = stocks.reduce((m, y) => Math.max(m, y.order ?? -1), -1);
      stocks.push(Object.assign({ id: uid(), order: maxOrder + 1 }, data));
    }
    afterChange(st ? "已更新" : "已加入股票清單");
    fetchQuotes(true);
  });
}

// ---------- 記錄買進／賣出 ----------
function openTradeForm(st, tx, side) {
  if (!st) return;
  side = tx ? tx.side : (side || "buy");
  const q = quotes[st.code];
  const now = new Date();
  const defAcc = stockAccount() ? stockAccount().id : (banks()[0] ? banks()[0].id : "");
  const t = tx || {
    date: todayStr(), time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
    shares: "", price: q ? q.price : "", fee: "", tax: "", accountId: defAcc, note: ""
  };
  let feeTouched = !!tx, taxTouched = !!tx;
  const p = position(st, tx ? tx.id : undefined);

  openSheet(`${tx ? "編輯" : "記錄"}買賣：${st.code} ${stockName(st)}`, `<form id="trade-form" novalidate>
    <div class="seg seg-2" role="group" aria-label="買進或賣出">
      <button type="button" data-side="buy" aria-pressed="${side === "buy"}">買進</button>
      <button type="button" data-side="sell" aria-pressed="${side === "sell"}">賣出</button>
    </div>
    <p class="small muted">目前持有 ${sharesText(p.shares)}${p.shares ? `，均價 ${priceText(Math.round(p.avg * 100) / 100)}` : ""}${q ? ` · 現價 ${priceText(q.price)}` : ""}</p>
    <div class="form-row">
      ${field("成交日期", `<input id="f-date" type="date" value="${t.date}">`)}
      ${field("成交時間", `<input id="f-time" type="time" value="${t.time || ""}">`)}
    </div>
    <div class="form-row">
      ${field("股數（1 張 = 1000 股）", `<input id="f-shares" type="number" inputmode="numeric" min="1" step="1" value="${t.shares}" placeholder="例如 1000">`)}
      ${field("成交價（每股）", `<input id="f-price" type="number" inputmode="decimal" min="0" step="any" value="${t.price}">`)}
    </div>
    <div class="form-row">
      ${field("手續費", `<input id="f-fee" type="number" inputmode="numeric" min="0" step="1" value="${t.fee}">`)}
      <label class="field" id="tax-field"><span>交易稅</span><input id="f-tax" type="number" inputmode="numeric" min="0" step="1" value="${t.tax}"></label>
    </div>
    <label class="field"><span id="acc-label">${side === "buy" ? "從哪個帳戶付款" : "存入哪個帳戶"}</span>
      <select id="f-acc">
        ${banks().map(a => `<option value="${a.id}" ${a.id === t.accountId ? "selected" : ""}>${esc(a.bank)}${a.purpose ? `（${esc(a.purpose)}）` : ""}${stockAccount() && a.id === stockAccount().id ? "・交割帳戶" : ""}</option>`).join("")}
        <option value="" ${!t.accountId ? "selected" : ""}>不連動帳戶</option>
      </select>
    </label>
    ${field("備註", `<input id="f-note" value="${esc(t.note || "")}" placeholder="例如：定期定額" maxlength="30">`)}
    <div class="card inset">
      <div class="kv"><span class="muted">成交金額</span><span class="num" id="t-gross">NT$ 0</span></div>
      <div class="kv total"><span id="t-label"></span><b class="num" id="t-total">NT$ 0</b></div>
      <p class="small muted" id="t-after"></p>
    </div>
    ${formActions(!!tx)}
  </form>`);

  const num = id => Number($(id).value) || 0;
  function update() {
    const shares = num("f-shares"), price = num("f-price");
    const gross = Math.round(shares * price);
    if (!feeTouched) $("f-fee").value = gross ? tradeFee(gross, shares) : "";
    if (!taxTouched) $("f-tax").value = gross && side === "sell" ? tradeTax(gross, st.code) : "";
    $("tax-field").hidden = side === "buy";
    $("acc-label").textContent = side === "buy" ? "從哪個帳戶付款" : "存入哪個帳戶";
    const fee = num("f-fee"), tax = side === "sell" ? num("f-tax") : 0;
    const total = side === "buy" ? gross + fee : gross - fee - tax;
    $("t-gross").textContent = money(gross);
    $("t-label").textContent = side === "buy" ? "實付金額（含手續費）" : "實收金額（扣手續費和稅）";
    $("t-total").textContent = money(total);
    const acc = findAccount(Number($("f-acc").value));
    if (acc) {
      const base = balanceOf(acc) - (tx ? effectOn(acc, tx) : 0);
      const after = base + (side === "buy" ? -total : total);
      $("t-after").textContent = `${acc.bank} 餘額 ${money(base)} → ${money(after)}${after < 0 ? "（餘額不足）" : ""}`;
      $("t-after").className = "small " + (after < 0 ? "expense" : "muted");
    } else {
      $("t-after").textContent = "不連動帳戶：只記錄股票，不影響任何帳戶餘額。";
      $("t-after").className = "small muted";
    }
  }
  ["f-shares", "f-price", "f-acc"].forEach(id => { $(id).oninput = update; $(id).onchange = update; });
  $("f-fee").oninput = () => { feeTouched = true; update(); };
  $("f-tax").oninput = () => { taxTouched = true; update(); };
  document.querySelectorAll("#trade-form .seg button").forEach(b => {
    b.onclick = () => {
      side = b.dataset.side;
      document.querySelectorAll("#trade-form .seg button").forEach(y => y.setAttribute("aria-pressed", y === b));
      taxTouched = false;
      update();
    };
  });
  update();

  if (tx) {
    armDelete($("f-del"), () => {
      transactions = transactions.filter(y => y.id !== tx.id);
      afterChange("已刪除這筆買賣");
    });
  }

  bindSave("trade-form", () => {
    const shares = num("f-shares"), price = num("f-price");
    if (!(shares > 0) || !Number.isInteger(shares)) return showErr("股數請填正整數，例如 1000（1 張）或 50（零股）。");
    if (!(price > 0)) return showErr("請輸入成交價。");
    if (!$("f-date").value) return showErr("請選擇成交日期。");
    if (side === "sell" && shares > p.shares) return showErr(`目前只持有 ${sharesText(p.shares)}，不能賣出 ${sharesText(shares)}。`);
    const gross = Math.round(shares * price);
    const fee = num("f-fee"), tax = side === "sell" ? num("f-tax") : 0;
    const amount = side === "buy" ? gross + fee : gross - fee - tax;
    if (amount <= 0) return showErr("手續費和稅比成交金額還多，請檢查金額。");
    const accVal = $("f-acc").value;
    const data = {
      id: tx ? tx.id : uid(), type: "trade", side, stockId: st.id, code: st.code, name: stockName(st),
      shares, price, fee, tax, amount, accountId: accVal ? Number(accVal) : null,
      category: "股票", date: $("f-date").value, time: $("f-time").value, note: $("f-note").value.trim()
    };
    if (tx) transactions[transactions.findIndex(y => y.id === tx.id)] = data;
    else transactions.push(data);
    afterChange(`已記錄${side === "buy" ? "買進" : "賣出"} ${st.code} ${sharesText(shares)}`);
  });
}

// ========== 7-2. Google 試算表同步 ==========
// 做法：記住「試算表上已經有哪些紀錄、內容是什麼」，
// 每次資料變動後拿目前的紀錄來比對，只把不一樣的送出去。
// 沒網路或送失敗時，差異會留著，下次有網路再自動補送。
const SYNC_KEYS = { settings: "bookkeeping-sync-settings", state: "bookkeeping-sync-state", last: "bookkeeping-sync-last" };
let syncSettings = load(SYNC_KEYS.settings, { url: "", token: "" });
let syncState = load(SYNC_KEYS.state, {});   // { 紀錄 id: 送到試算表時的內容 }
const sync = { busy: false, again: false, error: "", lastOk: load(SYNC_KEYS.last, null) };
let syncTimer;

function syncEnabled() { return !!(syncSettings.url && syncSettings.token); }

// 一筆紀錄在試算表上的樣子
function sheetRow(t) {
  if (t.type === "trade") {
    return {
      date: t.date, type: t.side === "buy" ? "股票買進" : "股票賣出",
      category: `${t.code} ${t.name || ""}`.trim(), amount: t.amount,
      account: t.accountId ? accountName(t.accountId) : "", toAccount: "",
      note: `${t.shares} 股 @ ${t.price}` + (t.fee ? `，手續費 ${t.fee}` : "") + (t.tax ? `，交易稅 ${t.tax}` : "") + (t.time ? `，${t.time}` : "") + (t.note ? `，${t.note}` : "")
    };
  }
  const typeName = { expense: "支出", income: "收入", transfer: "轉帳" };
  return {
    date: t.date,
    type: typeName[t.type],
    category: t.category || (t.alloc ? "資金分配" : ""),
    amount: t.amount,
    account: accountName(t.accountId),
    toAccount: t.toAccountId ? accountName(t.toAccountId) : "",
    note: t.note || ""
  };
}

// 資金確認：每個帳戶一列
function checkRows() {
  const rows = [];
  for (const c of checks) {
    for (const i of c.items) {
      rows.push({
        id: `${c.id}-${i.accountId}`,
        row: {
          date: c.date, period: c.period, account: i.name + (i.kind === "card" ? "（信用卡待繳）" : ""),
          book: i.book, actual: i.actual, diff: i.diff,
          status: i.diff === 0 ? "相符" : c.adjusted ? "已補調整" : "未調整"
        }
      });
    }
  }
  return rows;
}

// 帳戶餘額總覽：每次有變動就整張重寫
function balanceRows() {
  const rows = accounts.map(a => {
    if (a.kind === "card") {
      const i = cardInfo(a);
      return { account: a.bank, kind: "信用卡", purpose: "由 " + accountName(a.payAccountId) + " 扣款", balance: balanceOf(a), available: "", unbilled: i.unbilled, billed: i.billed };
    }
    return { account: a.bank, kind: "銀行", purpose: a.purpose || "", balance: balanceOf(a), available: availableOf(a), unbilled: "", billed: "" };
  });
  rows.push({ account: "淨資產", kind: "", purpose: "", balance: accounts.reduce((s, a) => s + balanceOf(a), 0), available: "", unbilled: "", billed: "" });
  return rows;
}

// 找出還沒同步的變動
// syncState 的鑰匙：記帳紀錄用 id、資金確認用 "c:" 開頭、帳戶餘額用 "balances"
function pendingOps() {
  const ops = [];
  const current = {};
  for (const t of transactions) {
    const row = sheetRow(t);
    const fingerprint = JSON.stringify(row);
    current[t.id] = true;
    if (syncState[t.id] !== fingerprint) ops.push({ kind: "tx", key: String(t.id), op: "upsert", id: String(t.id), row, fingerprint });
  }
  for (const r of checkRows()) {
    const key = "c:" + r.id;
    const fingerprint = JSON.stringify(r.row);
    current[key] = true;
    if (syncState[key] !== fingerprint) ops.push({ kind: "check", key, op: "upsert", id: r.id, row: r.row, fingerprint });
  }
  for (const key of Object.keys(syncState)) {
    if (key === "balances" || current[key]) continue;
    if (key.startsWith("c:")) ops.push({ kind: "check", key, op: "delete", id: key.slice(2) });
    else ops.push({ kind: "tx", key, op: "delete", id: key });
  }
  if (accounts.length || syncState.balances) {
    const rows = balanceRows();
    const fingerprint = JSON.stringify(rows);
    if (syncState.balances !== fingerprint) ops.push({ kind: "balances", key: "balances", rows, fingerprint });
  }
  return ops;
}

function scheduleSync() {
  if (!syncEnabled()) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(flushSync, 1500);   // 等 1.5 秒，連續修改時合併成一次送出
}

// minVersion：這次需要的同步程式版本，試算表裡的程式太舊就提示更新
async function postToSheet(payload, minVersion = 1) {
  let res;
  try {
    res = await fetch(syncSettings.url, {
      method: "POST",
      body: JSON.stringify(Object.assign({ token: syncSettings.token }, payload))
    });
  } catch (e) {
    throw new Error("連不到試算表，請檢查網路或部署網址");
  }
  let data;
  try {
    data = await res.json();
  } catch (e) {
    throw new Error("試算表沒有正確回應，請確認網址是 /exec 結尾，而且存取權設成「所有人」");
  }
  if (!data.ok) throw new Error(data.error || "同步失敗");
  if ((data.version || 1) < minVersion) {
    throw new Error("試算表裡的同步程式是舊版，請照教學貼上新版程式碼，並用「管理部署作業」部署新版本");
  }
  return data;
}

// ---------- 雙向同步：手機和電腦共用同一份資料 ----------
// dataBase：上次和雲端一致時，每筆資料的內容（null 代表這台還沒和雲端連結）
// dirty：這台裝置改過、還沒上傳的資料 { 鑰匙: { u: 修改時間, fp: 內容（刪除為 null） } }
// serverRev：已經下載到雲端的第幾版
const DATA_KEYS = { base: "bookkeeping-sync-base", dirty: "bookkeeping-sync-dirty", rev: "bookkeeping-sync-rev" };
let dataBase = load(DATA_KEYS.base, null);
let dirty = load(DATA_KEYS.dirty, {});
let serverRev = load(DATA_KEYS.rev, 0);

const COLLECTIONS = ["acc", "tx", "rec", "wish", "chk", "stk"];
function collection(col) {
  return { acc: accounts, tx: transactions, rec: recurring, wish: wishlist, chk: checks, stk: stocks }[col];
}

// 這台裝置上的所有資料，每筆一把鑰匙，例如 "tx:1730..."
function localRecords() {
  const m = {};
  for (const col of COLLECTIONS) for (const r of collection(col)) m[col + ":" + r.id] = r;
  m["plan:all"] = { items: plan };
  m["set:all"] = appSettings;
  return m;
}

// 資料變動後，記下哪些還沒上傳
function markDirty() {
  if (!syncEnabled() || dataBase === null) return;
  const now = Date.now();
  const cur = localRecords();
  for (const k of Object.keys(cur)) {
    const fp = JSON.stringify(cur[k]);
    if (fp === dataBase[k]) { delete dirty[k]; continue; }
    if (!dirty[k] || dirty[k].fp !== fp) dirty[k] = { u: now, fp };
  }
  for (const k of Object.keys(dataBase)) {
    if (!(k in cur) && (!dirty[k] || dirty[k].fp !== null)) dirty[k] = { u: now, fp: null };
  }
  for (const k of Object.keys(dirty)) {
    if (!(k in cur) && !(k in dataBase)) delete dirty[k];   // 新增後又刪掉，雲端不用知道
  }
  save(DATA_KEYS.dirty, dirty);
}

// 把雲端的一筆資料放進這台裝置
function setLocalRecord(key, data) {
  const i = key.indexOf(":");
  const col = key.slice(0, i), id = key.slice(i + 1);
  if (col === "plan") { plan = data ? data.items : []; return; }
  if (col === "set") { appSettings = Object.assign({}, DEFAULT_SETTINGS, data || {}); return; }
  const arr = collection(col);
  if (!arr) return;
  const idx = arr.findIndex(r => String(r.id) === id);
  if (data === null) { if (idx >= 0) arr.splice(idx, 1); }
  else if (idx >= 0) arr[idx] = data;
  else arr.push(data);
}

function saveLocalOnly() {
  save(KEYS.accounts, accounts);
  save(KEYS.tx, transactions);
  save(KEYS.recurring, recurring);
  save(KEYS.wishlist, wishlist);
  save(KEYS.plan, plan);
  save(KEYS.checks, checks);
  save(KEYS.stocks, stocks);
  save(KEYS.settings, appSettings);
  save(DATA_KEYS.base, dataBase);
  save(DATA_KEYS.dirty, dirty);
  save(DATA_KEYS.rev, serverRev);
}

// 套用雲端回傳的變動；這台在那之後又改過的不覆蓋
function applyRemote(rows) {
  let touched = false;
  for (const row of rows) {
    const d = dirty[row.key];
    const fp = row.data === null ? null : JSON.stringify(row.data);
    if (fp === null) delete dataBase[row.key]; else dataBase[row.key] = fp;
    if (d && d.u > row.u) continue;   // 這台的修改比較新，等下次上傳
    setLocalRecord(row.key, row.data);
    delete dirty[row.key];
    touched = true;
  }
  return touched;
}

async function syncData() {
  const cur = localRecords();
  const changes = Object.keys(dirty).map(k => ({
    key: k, u: dirty[k].u, data: dirty[k].fp === null || !(k in cur) ? null : cur[k]
  }));
  let res = await postToSheet({ action: "sync", since: serverRev, changes }, 3);
  if (res.rev < serverRev) {   // 雲端資料被重設過，重新整份下載
    res = await postToSheet({ action: "sync", since: 0, changes: [] }, 3);
  }
  const touched = applyRemote(res.changes);
  serverRev = res.rev;
  saveLocalOnly();
  if (touched) { render(); checkReminders(true); }
}

// 第一次連結：雲端沒資料就上傳這台的；雲端已有資料就等你決定要不要下載
async function initData() {
  const res = await postToSheet({ action: "sync", since: 0, changes: [] }, 3);
  const live = res.changes.filter(c => c.data !== null && !c.key.startsWith("plan:") && !c.key.startsWith("set:"));
  if (!live.length) {
    dataBase = {};
    dirty = {};
    serverRev = res.rev;
    saveLocalOnly();
    markDirty();
    await syncData();
    return;
  }
  sync.remote = res;   // 先記著，等使用者按「下載雲端資料」
}

async function downloadRemote() {
  if (!sync.remote) return;
  const res = sync.remote;
  const nAcc = res.changes.filter(c => c.data && c.key.startsWith("acc:")).length;
  const nTx = res.changes.filter(c => c.data && c.key.startsWith("tx:")).length;
  const ok = await askConfirm(`雲端有 ${nAcc} 個帳戶、${nTx} 筆紀錄。下載後，這台裝置目前的資料會被雲端的資料取代。確定要下載嗎？`, "下載雲端資料", true);
  if (!ok) return;
  accounts = []; transactions = []; recurring = []; wishlist = []; checks = []; plan = []; stocks = []; appSettings = Object.assign({}, DEFAULT_SETTINGS);
  dataBase = {};
  dirty = {};
  applyRemote(res.changes);
  serverRev = res.rev;
  sync.remote = null;
  saveLocalOnly();
  resetSyncState();
  render();
  toast("已下載雲端資料，之後兩邊會自動同步");
  flushSync();
}

// 把記帳紀錄、帳戶餘額、資金確認送到試算表的分頁（給你看的表格）
async function pushViews() {
  const ops = pendingOps();
  for (let i = 0; i < ops.length; i += 200) {
    const batch = ops.slice(i, i + 200);
    const pick = kind => batch.filter(o => o.kind === kind).map(o => ({ op: o.op, id: o.id, row: o.row }));
    const bal = batch.find(o => o.kind === "balances");
    const payload = { ops: pick("tx"), checkOps: pick("check") };
    if (bal) payload.balances = bal.rows;
    await postToSheet(payload, payload.checkOps.length || bal ? 2 : 1);
    for (const o of batch) {
      if (o.op === "delete") delete syncState[o.key];
      else syncState[o.key] = o.fingerprint;
    }
    save(SYNC_KEYS.state, syncState);
  }
}

async function flushSync() {
  if (!syncEnabled()) return;
  if (sync.busy) { sync.again = true; return; }
  if (navigator.onLine === false) {
    sync.error = "目前沒有網路，有網路時會自動補送";
    refreshSyncCard();
    return;
  }
  sync.busy = true;
  refreshSyncCard();
  try {
    if (dataBase === null) await initData();
    else await syncData();
    if (dataBase !== null) await pushViews();   // 還沒決定要不要下載雲端資料前，不更新表格
    sync.error = "";
    sync.lastOk = new Date().toISOString();
    save(SYNC_KEYS.last, sync.lastOk);
  } catch (e) {
    sync.error = e.message;
  }
  sync.busy = false;
  refreshSyncCard();
  if (sync.again) { sync.again = false; flushSync(); }
}

function timeText(iso) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function syncCard() {
  if (!syncEnabled()) {
    return `<section class="card" id="sync-card">
      <div class="sec-head"><h2>雲端同步</h2><span class="pill">未啟用</span></div>
      <p class="small muted">連結你的 Google 試算表後，手機和電腦會共用同一份記帳本，兩邊都能記帳。試算表裡也會整理出記帳紀錄、帳戶餘額和資金確認。</p>
      <button class="btn-primary" data-action="sync-settings">設定同步</button>
    </section>`;
  }
  if (sync.remote) {
    return `<section class="card" id="sync-card">
      <div class="sec-head"><h2>雲端同步</h2><span class="pill pill-soon">等你決定</span></div>
      <p class="small">雲端已經有另一台裝置的記帳資料。要把這台裝置換成雲端的資料，和其他裝置共用嗎？</p>
      <p class="small muted">下載後，這台目前的資料會被取代。不想取代的話，可以先「備份資料」。</p>
      <div class="btn-grid">
        <button class="btn-primary" data-action="sync-download">下載雲端資料</button>
        <button class="btn-secondary" data-action="sync-settings">同步設定</button>
      </div>
    </section>`;
  }
  const pending = Object.keys(dirty).length;
  const pill = sync.busy ? `<span class="pill pill-soon">同步中…</span>`
    : sync.error ? `<span class="pill pill-due">沒有同步</span>`
    : pending ? `<span class="pill pill-soon">${pending} 筆待上傳</span>`
    : `<span class="pill pill-done">已同步</span>`;
  return `<section class="card" id="sync-card">
    <div class="sec-head"><h2>雲端同步</h2>${pill}</div>
    ${sync.error ? `<p class="small expense">${esc(sync.error)}</p>` : ""}
    <p class="small muted">${sync.lastOk ? "上次同步 " + timeText(sync.lastOk) : "還沒有同步過"}${pending ? ` · ${pending} 筆待上傳` : ""}</p>
    <p class="small muted">手機和電腦共用同一份資料。打開 App 或切回 App 時會自動更新。</p>
    <div class="btn-grid">
      <button class="btn-secondary" data-action="sync-now" ${sync.busy ? "disabled" : ""}>立即同步</button>
      <button class="btn-secondary" data-action="sync-settings">同步設定</button>
    </div>
  </section>`;
}

// ---------- 同步說明（怎麼連結、怎麼運作） ----------
function syncGuide(open, sfx = "") {
  return `<details class="guide" id="sync-guide${sfx}" ${open ? "open" : ""}>
    <summary>怎麼連結 Google 試算表？同步怎麼運作？</summary>
    <b class="guide-title">第一次連結（第一台裝置）</b>
    <ol class="guide-steps">
      <li>到 <b>sheets.google.com</b> 建立一個空白試算表，取名例如「記帳本」。</li>
      <li>點上方選單「<b>擴充功能 → Apps Script</b>」，刪掉編輯區原本的程式碼。</li>
      <li>按下面的「複製同步程式碼」，貼進編輯區。找到 <code>const TOKEN = "請改成你的同步密碼";</code>，把雙引號裡改成你自己設定的密碼（英文和數字），按儲存。</li>
      <li>點右上角「<b>部署 → 新增部署作業</b>」，齒輪選「網頁應用程式」，執行身分選「我」、存取權選「<b>所有人</b>」，按部署。</li>
      <li>授權時出現「Google 尚未驗證這個應用程式」是正常的，按「進階 → 前往（不安全）→ 允許」。</li>
      <li>複製「網頁應用程式網址」（開頭 https://script.google.com/macros/s/，結尾 /exec），回到這裡按「設定同步」，貼上網址和密碼，按「測試並儲存」。</li>
    </ol>
    <div class="copy-row">
      <button type="button" class="btn-sm primary" data-action="copy-sync-code" data-sfx="${sfx}">複製同步程式碼</button>
      <small class="muted" id="copy-msg${sfx}"></small>
    </div>
    <textarea id="sync-code${sfx}" class="code-box" readonly hidden aria-label="同步程式碼"></textarea>
    <b class="guide-title">第二台裝置（例如電腦）</b>
    <p class="small">打開同一個 App 網址，按「設定同步」，填<b>一樣的網址和密碼</b>，再按「下載雲端資料」。之後兩邊就會共用同一份資料。</p>
    <b class="guide-title">同步怎麼運作</b>
    <ul class="guide-list">
      <li>記帳、修改、刪除後，幾秒內自動上傳到你的試算表。</li>
      <li>打開 App、從背景切回 App，以及開著時每分鐘，會自動下載另一台的變動。想馬上看到可以按「立即同步」。</li>
      <li>兩台同時改了同一筆，以最後修改的那一次為準。</li>
      <li>沒有網路時記的帳會先存在這台，有網路後自動補傳。</li>
      <li>試算表會整理出「記帳紀錄」「帳戶餘額」「資金確認」分頁給你看。隱藏的「App資料」分頁是兩台共用的資料庫，請不要修改。</li>
      <li>資料存在你自己的 Google 雲端硬碟，只有你看得到。網址和密碼不要分享給別人。</li>
    </ul>
  </details>`;
}

let syncCodeText = "";
function prefetchSyncCode() {
  if (syncCodeText) return Promise.resolve(syncCodeText);
  return fetch("sync-script.txt", { cache: "no-store" })
    .then(r => { if (!r.ok) throw new Error(); return r.text(); })
    .then(t => { syncCodeText = t; return t; });
}
// 打開說明時先把程式碼抓下來，按複製時才能直接放進剪貼簿
document.addEventListener("toggle", e => { if (String(e.target.id).startsWith("sync-guide") && e.target.open) prefetchSyncCode().catch(() => {}); }, true);

function showCodeBox(sfx, text, msg) {
  const box = $("sync-code" + sfx);
  if (!box) return;
  box.value = text;
  box.hidden = false;
  box.focus();
  box.select();
  $("copy-msg" + sfx).textContent = msg;
}

function copySyncCode(sfx = "") {
  const msgEl = $("copy-msg" + sfx);
  const manual = "請長按下面的程式碼，全選後複製";
  if (syncCodeText) {
    try {
      navigator.clipboard.writeText(syncCodeText).then(
        () => { msgEl.textContent = "已複製，可以貼到 Apps Script 了"; },
        () => showCodeBox(sfx, syncCodeText, manual));
    } catch (e) {
      showCodeBox(sfx, syncCodeText, manual);
    }
    return;
  }
  msgEl.textContent = "讀取中…";
  prefetchSyncCode()
    .then(t => showCodeBox(sfx, t, manual))
    .catch(() => { msgEl.textContent = "讀不到程式碼，請確認 GitHub 上有 sync-script.txt"; });
}

// ---------- 錯誤問題回報 ----------
const REPORT_CATEGORIES = ["記帳", "帳戶", "資金確認", "固定支出", "股票系統", "存錢筒", "轉帳功能", "報表", "雲端同步", "其他"];
function openReportForm() {
  if (!serviceUrl() && !syncEnabled()) {
    openSheet("錯誤問題回報", `<div class="stack">
      <p class="small">目前還不能送出回報：記帳本作者還沒設定公用服務。</p>
      <button type="button" class="btn-primary" data-action="close-sheet">知道了</button>
    </div>`);
    return;
  }
  let savedName = "";
  try { savedName = localStorage.getItem("bookkeeping-reporter") || ""; } catch (e) { /* 沒有也沒關係 */ }
  openSheet("錯誤問題回報", `<form id="report-form" novalidate>
    ${field("跟哪個功能有關", `<select id="r-cat">${REPORT_CATEGORIES.map(c => `<option>${c}</option>`).join("")}</select>`)}
    ${field("發生什麼問題，或希望怎麼改", `<textarea id="r-msg" rows="5" maxlength="2000" placeholder="例如：轉帳的時候想要可以扣手續費"></textarea>`)}
    ${field("你的名字（選填，讓作者知道是誰回報的）", `<input id="r-name" maxlength="30" value="${esc(savedName)}" autocomplete="name">`)}
    <p class="small muted">送出後會寄給記帳本作者。不會附上你的記帳資料。</p>
    ${formActions(false, "送出回報")}
  </form>`);
  bindSave("report-form", async () => {
    const message = $("r-msg").value.trim();
    if (!message) return showErr("請寫下問題內容。");
    const btn = $("report-form").querySelector("[data-save]");
    btn.disabled = true;
    btn.textContent = "送出中…";
    try {
      const name = $("r-name").value.trim();
      try { localStorage.setItem("bookkeeping-reporter", name); } catch (e) { /* 沒有也沒關係 */ }
      const payload = { action: "report", category: $("r-cat").value, message, name };
      if (serviceUrl()) await postToService(payload);     // 寄給作者（公用服務）
      else await postToSheet(payload, 6);                  // 沒有公用服務時，寄到自己的 Gmail
      closeSheet();
      toast("已送出，謝謝你的回報！");
    } catch (e) {
      btn.disabled = false;
      btn.textContent = "送出回報";
      showErr(e.message);
    }
  });
}

function refreshSyncCard() {
  const el = $("sync-card");
  if (el) el.outerHTML = syncCard();
}

function resetSyncState() {
  syncState = {};
  save(SYNC_KEYS.state, syncState);
}

function unlinkData() {
  dataBase = null;
  dirty = {};
  serverRev = 0;
  sync.remote = null;
  save(DATA_KEYS.base, null);
  save(DATA_KEYS.dirty, dirty);
  save(DATA_KEYS.rev, 0);
}

function openSyncSettings() {
  openSheet("雲端同步設定", `<form id="sync-form" novalidate>
    <p class="small muted">在試算表建立同步程式並部署後，把「網頁應用程式網址」和同步密碼貼在這裡。手機和電腦都要設定，填一樣的網址和密碼。</p>
    ${syncGuide(!syncEnabled(), "-sheet")}
    ${field("網頁應用程式網址", `<input id="f-url" value="${esc(syncSettings.url)}" placeholder="https://script.google.com/macros/s/…/exec" autocomplete="off" spellcheck="false">`)}
    ${field("同步密碼", `<input id="f-token" value="${esc(syncSettings.token)}" placeholder="和同步程式裡的 TOKEN 一樣" autocomplete="off" spellcheck="false">`)}
    ${syncEnabled() ? `<div class="btn-grid">
        <button type="button" class="btn-secondary" id="f-resync">全部重新同步</button>
        <button type="button" class="btn-danger" id="f-stop">停止同步</button>
      </div>
      <p class="small muted">試算表的表格資料不完整時，按「全部重新同步」，會重新下載雲端資料並重整表格，不會重複。</p>` : ""}
    ${formActions(false, "測試並儲存")}
  </form>`);

  bindSave("sync-form", async () => {
    const url = $("f-url").value.trim();
    const token = $("f-token").value.trim();
    if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(url)) {
      return showErr("網址格式不對。請貼上部署後拿到的網址，開頭是 https://script.google.com/macros/s/，結尾是 /exec。");
    }
    if (!token) return showErr("請輸入同步密碼。");

    const btn = $("sync-form").querySelector("[data-save]");
    btn.disabled = true;
    btn.textContent = "測試連線中…";
    showErr("");

    const old = syncSettings;
    syncSettings = { url, token };
    try {
      await postToSheet({ ops: [] }, 3);   // 只測試連線、密碼和程式版本，不送資料
    } catch (e) {
      syncSettings = old;
      btn.disabled = false;
      btn.textContent = "測試並儲存";
      return showErr(e.message);
    }
    if (old.url !== url) { resetSyncState(); unlinkData(); }   // 換了一張試算表 → 重新連結
    save(SYNC_KEYS.settings, syncSettings);
    sync.error = "";
    closeSheet();
    render();
    toast("連線成功，開始同步");
    await flushSync();
    if (sync.remote) downloadRemote();
  });

  if (syncEnabled()) {
    $("f-resync").onclick = () => {
      resetSyncState();
      if (dataBase !== null) { serverRev = 0; save(DATA_KEYS.rev, 0); }
      sync.error = "";
      closeSheet();
      render();
      toast("開始全部重新同步");
      flushSync();
    };
    $("f-stop").onclick = () => {
      syncSettings = { url: "", token: "" };
      save(SYNC_KEYS.settings, syncSettings);
      resetSyncState();
      unlinkData();
      sync.error = "";
      sync.lastOk = null;
      save(SYNC_KEYS.last, null);
      closeSheet();
      render();
      toast("已停止同步，這台的資料和試算表都會保留");
    };
  }
}

// ========== 8. 事件處理 ==========
document.addEventListener("click", e => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const action = el.dataset.action;
  const id = Number(el.dataset.id);

  switch (action) {
    case "tab": ui.tab = el.dataset.tab; window.scrollTo(0, 0); render(); if (ui.tab === "stocks") fetchQuotes(false); break;
    case "close-sheet": dismissSheet(); break;

    case "add-tx": openTxForm(null); break;
    case "edit-tx": {
      const t = transactions.find(x => x.id === id);
      if (t && t.type === "trade") openTradeForm(stocks.find(x => x.id === t.stockId), t);
      else if (t && t.feeOf && transactions.some(x => x.id === t.feeOf)) openTxForm(transactions.find(x => x.id === t.feeOf));   // 手續費 → 打開它的轉帳
      else openTxForm(t);
      break;
    }
    case "trade-buy": openTradeForm(stocks.find(x => x.id === id), null, "buy"); break;
    case "trade-sell": openTradeForm(stocks.find(x => x.id === id), null, "sell"); break;
    case "stock-reorder": ui.stockReorder = !ui.stockReorder; render(); break;
    case "stock-up": moveStock(id, -1); break;
    case "stock-down": moveStock(id, 1); break;
    case "stock-account": openStockAccountForm(); break;
    case "stock-transfer-in": stockTransfer("in"); break;
    case "stock-transfer-out": stockTransfer("out"); break;
    case "stock-account-records":
      ui.tab = "records"; ui.filterType = "all"; ui.filterAccount = String(appSettings.stockAccountId);
      window.scrollTo(0, 0); render();
      break;

    case "add-account": openAccountForm(null, "bank"); break;
    case "add-card": openAccountForm(null, "card"); break;
    case "edit-account": openAccountForm(findAccount(id)); break;
    case "edit-plan": openPlanForm(); break;
    case "allocate": openAllocate(null, ""); break;
    case "pay-card": payCard(id); break;

    case "week-prev": ui.weekOffset--; render(); break;
    case "week-next": if (ui.weekOffset < 0) { ui.weekOffset++; render(); } break;
    case "month-prev":
    case "month-next": {
      const key = el.dataset.key === "report" ? "reportMonth" : "month";
      ui[key] = addMonth(ui[key], action === "month-prev" ? -1 : 1);
      render();
      break;
    }

    case "add-recurring": openRecurringForm(null); break;
    case "edit-recurring": openRecurringForm(recurring.find(r => r.id === id)); break;
    case "open-recurring": openRecurringPay(recurring.find(r => r.id === id)); break;
    case "enable-notify": enableNotify(); break;

    case "add-wish": openWishForm(null); break;
    case "edit-wish": openWishForm(wishlist.find(w => w.id === id)); break;
    case "deposit-wish": openDeposit(wishlist.find(w => w.id === id)); break;
    case "buy-wish": buyWish(id); break;

    case "export-csv": exportCsv(); break;
    case "backup": backup(); break;
    case "restore": $("restore-file").click(); break;
    case "clear-all": clearAll(); break;
    case "manage-cats": openCatManager("expense"); break;
    case "report-bug": openReportForm(); break;
    case "copy-sync-code": copySyncCode(el.dataset.sfx || ""); break;

    case "start-check": openCheckForm(); break;
    case "check-days": openCheckDays(); break;
    case "view-check": openCheckDetail(checks.find(c => c.id === id)); break;

    case "add-stock": openStockForm(null); break;
    case "edit-stock": openStockForm(stocks.find(x => x.id === id)); break;
    case "refresh-quotes": fetchQuotes(true); break;

    case "sync-settings": openSyncSettings(); break;
    case "sync-now": sync.error = ""; flushSync(); break;
    case "sync-download": downloadRemote(); break;
  }
});

document.addEventListener("change", e => {
  if (e.target.id === "flt-type") { ui.filterType = e.target.value; render(); }
  else if (e.target.id === "flt-acc") { ui.filterAccount = e.target.value; render(); }
  else if (e.target.id === "restore-file") { restoreFrom(e.target.files[0]); }
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !$("sheet-layer").hidden) dismissSheet();
});

// ========== 9. 啟動 ==========
document.querySelectorAll("[data-icon]").forEach(el => { el.innerHTML = icon(el.dataset.icon); });
render();
checkReminders(true);

// 同步：打開 App 時、恢復網路時、以及每分鐘檢查一次有沒有沒送出去的紀錄
flushSync();
window.addEventListener("online", () => { sync.error = ""; flushSync(); });
document.addEventListener("visibilitychange", () => { if (!document.hidden) flushSync(); });   // 切回 App 時
setInterval(() => { if (syncEnabled() && !document.hidden) flushSync(); }, 60000);            // 開著時每分鐘

// 股價：打開 App 時查一次；之後在「股票」或「首頁」時自動更新（交易時間每 30 秒、其他時間每 10 分鐘）
loadServiceConfig().then(() => { quoteState.error = ""; fetchQuotes(false); });
setInterval(() => { if (!document.hidden && (ui.tab === "stocks" || ui.tab === "home")) fetchQuotes(false); }, 30000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) fetchQuotes(false); });

// 啟用離線功能（用網址打開時才會啟用，直接雙擊檔案打開不會）
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("sw.js").catch(() => { /* 不支援就略過 */ });
}
setInterval(() => checkReminders(false), 30000);
