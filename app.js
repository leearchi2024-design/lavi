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
  plan: "bookkeeping-allocation"
};

const CATEGORIES = {
  expense: ["餐飲", "交通", "購物", "居住", "娛樂", "醫療", "學習", "其他"],
  income: ["薪資", "獎金", "投資", "其他收入"]
};

// 圖表用的顏色（漫畫風的平塗色）
const CAT_COLORS = {
  "餐飲": "#ffcf3f", "交通": "#5b8def", "購物": "#ff7a59", "居住": "#9b7bd8",
  "娛樂": "#ff9ec4", "醫療": "#4cbf8f", "學習": "#8fb339", "其他": "#b9b2a3",
  "薪資": "#ffcf3f", "獎金": "#5b8def", "投資": "#4cbf8f", "其他收入": "#b9b2a3"
};

// 每個分類對應的怪物／寶物
const CAT_ICONS = {
  "餐飲": "slime", "交通": "bat", "購物": "mimic", "居住": "golem",
  "娛樂": "ghost", "醫療": "potion", "學習": "book", "其他": "eye",
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
  orb: `<path class="f" d="M13 35 H35 L38 43 H10 Z"/><circle class="f" cx="24" cy="19" r="14"/><path d="M16 15 Q18 9 24 8"/><path class="k n" d="M28 17 L29.6 21.4 L34 23 L29.6 24.6 L28 29 L26.4 24.6 L22 23 L26.4 21.4 Z"/>`
};

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
  const exp = transactions.length * 10 + wishlist.filter(w => w.bought).length * 50;
  let level = 1;
  while (exp >= expNeeded(level + 1)) level++;
  let rank = RANKS[0][1];
  for (const [lv, name] of RANKS) if (level >= lv) rank = name;
  return { exp, level, rank, from: expNeeded(level), to: expNeeded(level + 1) };
}
const WEEKDAYS = "日一二三四五六";
const TITLES = { home: "我的記帳本", records: "明細", accounts: "帳戶", plan: "規劃", reports: "報表" };

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

function persist() {
  save(KEYS.accounts, accounts);
  save(KEYS.tx, transactions);
  save(KEYS.recurring, recurring);
  save(KEYS.wishlist, wishlist);
  save(KEYS.plan, plan);
}

// 畫面狀態（不需要保存）
const ui = {
  tab: "home",
  weekOffset: 0,               // 0 = 本週，-1 = 上週
  month: todayStr().slice(0, 7),       // 明細的月份
  reportMonth: todayStr().slice(0, 7), // 報表的月份
  filterType: "all",
  filterAccount: "all"
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
  const views = { home: viewHome, records: viewRecords, accounts: viewAccounts, plan: viewPlan, reports: viewReports };
  $("view").innerHTML = views[ui.tab]();
  document.querySelectorAll(".tabbar button").forEach(b => {
    const on = b.dataset.tab === ui.tab;
    b.classList.toggle("active", on);
    if (on) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
  });
}

// 一筆紀錄的樣子
function txRow(t) {
  const isIn = t.type === "income";
  const isTr = t.type === "transfer";
  const title = isTr ? (t.alloc ? "資金分配" : "轉帳") : t.category;
  const detail = isTr ? `${accountName(t.accountId)} → ${accountName(t.toAccountId)}` : accountName(t.accountId);
  const iconName = isTr ? "portal" : (CAT_ICONS[t.category] || "eye");
  const color = isTr ? "#ffffff" : (CAT_COLORS[t.category] || "#b9b2a3");
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
    </div>
    <p class="hero-tip">每記一筆帳 +10 exp，存錢筒買到 +50 exp</p>
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
    if (it.kind === "rec") {
      const due = it.s.state === "due";
      return `<div class="row remind ${due ? "is-due" : ""}">
        <span class="row-main">
          <b>${esc(it.r.name)} <span class="pill ${due ? "pill-due" : "pill-soon"}">${due ? "已到期" : it.s.label}</span></b>
          <small>${money(it.r.amount)} · 每月 ${it.r.day} 號 ${esc(it.r.time)} · ${esc(accountName(it.r.accountId))}</small>
        </span>
        ${due ? `<span class="row-actions">
          <button class="btn-sm" data-action="skip-recurring" data-id="${it.r.id}">略過</button>
          <button class="btn-sm primary" data-action="pay-recurring" data-id="${it.r.id}">確認記帳</button>
        </span>` : ""}
      </div>`;
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
  return `<section><h2>待繳提醒</h2><div class="list">${rows}</div></section>`;
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

  const typeOptions = [["all", "全部類型"], ["expense", "支出"], ["income", "收入"], ["transfer", "轉帳"]]
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
  // 銀行帳戶
  const bs = banks();
  let h = `<section>
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
      return `<button class="row" data-action="edit-recurring" data-id="${r.id}">
        <span class="badge" style="background:${CAT_COLORS[r.category] || "#b9b2a3"}">${icon("boss")}</span>
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
        <button class="wish-top" data-action="edit-wish" data-id="${w.id}"><span class="wish-icon">${icon("chest")}</span><span><b>${esc(w.name)}</b><small>存在 ${esc(accountName(w.accountId))}</small></span></button>
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
  if (perm === "unsupported" || perm === "denied") return `<p class="small muted">到期的項目會顯示在首頁的「待繳提醒」。</p>`;
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
      ${cats.map(([c, v]) => `<div class="kv"><span><span class="dot" style="background:${CAT_COLORS[c] || "#b9b2a3"}"></span>${esc(c)}</span>
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

  h += `<section class="card"><h2>資料管理</h2>
    <p class="small muted">資料存在這個瀏覽器裡。要換到手機或其他電腦時，先在這裡備份，再到新裝置還原。</p>
    <div class="btn-grid">
      <button class="btn-secondary" data-action="export-csv">匯出 CSV</button>
      <button class="btn-secondary" data-action="backup">備份資料</button>
      <button class="btn-secondary" data-action="restore">還原備份</button>
      <button class="btn-danger" data-action="clear-all">清除全部資料</button>
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
    const s = `<circle r="${r}" cx="70" cy="70" fill="none" stroke="${CAT_COLORS[c] || "#b9b2a3"}" stroke-width="22"
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
  return `<select id="f-cat">${CATEGORIES[type].map(c =>
    `<option value="${c}" ${c === selected ? "selected" : ""}>${c}${MONSTER_NAMES[c] ? "・" + MONSTER_NAMES[c] : ""}</option>`).join("")}</select>`;
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
    if (type === "expense") {
      html = `<div class="form-row">${field("分類", catSelect("expense", cat))}${field("付款方式", accountSelect("f-acc", [...banks(), ...cards()], acc))}</div>`;
    } else if (type === "income") {
      html = `<div class="form-row">${field("分類", catSelect("income", cat))}${field("入帳帳戶", accountSelect("f-acc", banks(), acc))}</div>`;
    } else {
      html = `<div class="form-row">${field("轉出帳戶", accountSelect("f-acc", banks(), acc))}${field("轉入帳戶", accountSelect("f-to", [...banks(), ...cards()], t.toAccountId))}</div>
        <p class="small muted">繳信用卡費：轉入帳戶選信用卡。轉帳不算收入或支出。</p>`;
    }
    $("tx-dynamic").innerHTML = html;
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
      transactions = transactions.filter(x => x.id !== tx.id);
      afterChange("已刪除");
    });
  }

  bindSave("tx-form", async () => {
    const amount = Math.round(Number($("f-amount").value) * 100) / 100;
    if (!(amount > 0)) return showErr("請輸入大於 0 的金額。");
    const date = $("f-date").value;
    if (!date) return showErr("請選擇日期。");

    const data = { id: tx ? tx.id : uid(), type, amount, accountId: Number($("f-acc").value), date, note: $("f-note").value.trim() };
    if (type === "transfer") {
      data.toAccountId = Number($("f-to").value);
      if (data.toAccountId === data.accountId) return showErr("轉出和轉入不能是同一個帳戶。");
      if (tx && tx.alloc) data.alloc = true;
    } else {
      data.category = $("f-cat").value;
    }

    if (tx) transactions[transactions.findIndex(x => x.id === tx.id)] = data;
    else transactions.push(data);
    afterChange(tx ? "已更新" : "已記下");

    // 新的收入：詢問要不要做資金分配
    if (!tx && type === "income" && plan.length) {
      const ok = await askConfirm(`收到 ${money(amount)}，要依照分配方案分到各帳戶嗎？`, "去分配");
      if (ok) openAllocate(data.accountId, amount);
    }
  });
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
function openWishForm(w) {
  if (!banks().length) return toast("請先新增銀行帳戶");
  const x = w || { name: "", target: "", saved: 0, accountId: banks()[0].id };

  openSheet(w ? "編輯存錢筒" : "新增想買的東西", `<form id="wish-form" novalidate>
    ${field("想買什麼", `<input id="f-name" value="${esc(x.name)}" placeholder="例如：新耳機" maxlength="30">`)}
    <div class="form-row">
      ${field("目標金額", `<input id="f-target" type="number" min="1" value="${x.target}">`)}
      ${field("已經存了", `<input id="f-saved" type="number" min="0" value="${x.saved}">`)}
    </div>
    ${field("錢存在哪個帳戶", accountSelect("f-acc", banks(), x.accountId))}
    ${formActions(!!w)}
  </form>`);

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
    const data = { name, target, saved, accountId: Number($("f-acc").value) };
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
function payRecurring(id) {
  const r = recurring.find(x => x.id === id);
  if (!r) return;
  const s = recurringStatus(r);
  transactions.push({ id: uid(), type: "expense", amount: r.amount, accountId: r.accountId, category: r.category, date: s.dueStr, note: r.name });
  r.lastHandled = s.key;
  persist();
  render();
  toast(`已記下 ${r.name} ${money(r.amount)}`);
}

function skipRecurring(id) {
  const r = recurring.find(x => x.id === id);
  if (!r) return;
  r.lastHandled = recurringStatus(r).key;
  persist();
  render();
  toast("本月已略過");
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
  const typeName = { expense: "支出", income: "收入", transfer: "轉帳" };
  const head = ["日期", "類型", "分類", "金額", "帳戶", "轉入帳戶", "備註"];
  const rows = sortedTx(transactions).reverse().map(t => [
    t.date, typeName[t.type], t.category || "", t.amount, accountName(t.accountId),
    t.toAccountId ? accountName(t.toAccountId) : "", t.note || ""
  ]);
  const csv = [head, ...rows].map(r => r.map(v => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(",")).join("\r\n");
  // 開頭加 BOM，Excel 打開中文才不會亂碼
  download(`記帳紀錄-${todayStr()}.csv`, "﻿" + csv, "text/csv");
}

function backup() {
  const data = { app: "bookkeeping", version: 1, exportedAt: new Date().toISOString(), accounts, transactions, recurring, wishlist, plan };
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
    persist();
    render();
    toast("已還原備份");
  };
  reader.readAsText(file);
}

async function clearAll() {
  const ok = await askConfirm("這會刪除所有帳戶、紀錄、固定支出和存錢筒，而且無法復原。建議先備份。確定要清除嗎？", "全部清除", true);
  if (!ok) return;
  accounts = [];
  transactions = [];
  recurring = [];
  wishlist = [];
  plan = [];
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

// ========== 8. 事件處理 ==========
document.addEventListener("click", e => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const action = el.dataset.action;
  const id = Number(el.dataset.id);

  switch (action) {
    case "tab": ui.tab = el.dataset.tab; window.scrollTo(0, 0); render(); break;
    case "close-sheet": dismissSheet(); break;

    case "add-tx": openTxForm(null); break;
    case "edit-tx": openTxForm(transactions.find(t => t.id === id)); break;

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
    case "pay-recurring": payRecurring(id); break;
    case "skip-recurring": skipRecurring(id); break;
    case "enable-notify": enableNotify(); break;

    case "add-wish": openWishForm(null); break;
    case "edit-wish": openWishForm(wishlist.find(w => w.id === id)); break;
    case "deposit-wish": openDeposit(wishlist.find(w => w.id === id)); break;
    case "buy-wish": buyWish(id); break;

    case "export-csv": exportCsv(); break;
    case "backup": backup(); break;
    case "restore": $("restore-file").click(); break;
    case "clear-all": clearAll(); break;
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

// 啟用離線功能（用網址打開時才會啟用，直接雙擊檔案打開不會）
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("sw.js").catch(() => { /* 不支援就略過 */ });
}
setInterval(() => checkReminders(false), 30000);
