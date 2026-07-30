import { useState, useEffect } from "react";
import { Home, Building2, Baby, Car, Wallet, FileText, Target, PiggyBank, CreditCard, Receipt, Camera, Sparkles, Folder, Plus, Trash2, ChevronDown, ChevronRight, Download, AlertCircle, TrendingDown, TrendingUp, RefreshCw, Users, User, LogOut, Lock, Mail, CheckCircle } from "lucide-react";
import { AreaChart, Area, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://qjmunwkoaeckcctmadvq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqbXVud2tvYWVja2NjdG1hZHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMDk2NzcsImV4cCI6MjA5NjY4NTY3N30.WWlrj40__XP6caN-WGbwgyUJvikg5vmCLV8-W6LD8Ik";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const T776_LINES = [
  { code: "8521", label: "Advertising" },
  { code: "8690", label: "Insurance" },
  { code: "8710", label: "Interest & bank charges" },
  { code: "8810", label: "Office expenses" },
  { code: "8860", label: "Legal, accounting & professional fees" },
  { code: "8871", label: "Management & admin fees" },
  { code: "9060", label: "Salaries, wages & benefits" },
  { code: "9180", label: "Property taxes" },
  { code: "9200", label: "Travel" },
  { code: "9220", label: "Utilities" },
  { code: "9281", label: "Motor vehicle expenses" },
  { code: "9270", label: "Other expenses" },
];

const PERSONAL_KEY = "family-finance-tracker-v1";
const FAMILY_KEY = "family-finance-tracker-shared-v1";
const ONBOARD_KEY = "cabintree-onboarded-v1";
const uid = () => Math.random().toString(36).slice(2, 9);
const currentMonth = () => new Date().toISOString().slice(0, 7);

const emptyInvestments = () => ({
  rrsp: { room: 0, value: 0, contributions: [] },
  tfsa: { room: 0, value: 0, contributions: [] },
  resp: { value: 0, contributions: [] },
  fhsa: { room: 8000, value: 0, contributions: [] },
  nonreg: [],
});
const emptyProperty = () => ({
  id: uid(), name: "New property", address: "", ownershipPct: 100,
  purchasePrice: 0, purchaseDate: "", currentValue: 0, valueUpdated: "",
  mortgage: { balance: 0, rate: 0, payment: 0 },
  occupancy: "full", personalUsePct: 0, tenants: [], expenses: {}, repairs: [],
});
const emptyTaxPerson = () => ({ employment: 0, taxDeducted: 0, rental: 0, otherIncome: 0, rrsp: 0, otherDeductions: 0 });

// Multi-year, multi-province tax tables. Federal + BC/AB/ON verified for 2025 & 2026.
// Other provinces/territories use 2025 brackets (latest published) until 2026 provincial figures are available.
const PROV_NAMES = { BC: "British Columbia", AB: "Alberta", ON: "Ontario", SK: "Saskatchewan", MB: "Manitoba", NB: "New Brunswick", NS: "Nova Scotia", PE: "Prince Edward Island", NL: "Newfoundland & Labrador", NU: "Nunavut", YT: "Yukon", NT: "Northwest Territories", QC: "Quebec" };
// 2025 provincial bracket tables (CRA via Wealthsimple). BPAs approximate where noted.
const PROV_2025 = {
  BC: { brackets: [[49279, 0.0506], [98560, 0.077], [113158, 0.105], [137407, 0.1229], [186306, 0.147], [259829, 0.168], [Infinity, 0.205]], bpa: 12932, rate: 0.0506, lowInc: { r: 563, start: 25000, claw: 0.0356 } },
  AB: { brackets: [[60000, 0.08], [151234, 0.10], [181481, 0.12], [241974, 0.13], [362961, 0.14], [Infinity, 0.15]], bpa: 22323, rate: 0.08 },
  ON: { brackets: [[52886, 0.0505], [105775, 0.0915], [150000, 0.1116], [220000, 0.1216], [Infinity, 0.1316]], bpa: 12747, rate: 0.0505, surtax: { a: 5710, b: 7307 }, lowInc: { r: 294, start: 18569, claw: 0.0505 } },
  SK: { brackets: [[53463, 0.105], [152750, 0.125], [Infinity, 0.145]], bpa: 18991, rate: 0.105 },
  MB: { brackets: [[47564, 0.108], [101200, 0.1275], [Infinity, 0.174]], bpa: 15780, rate: 0.108 },
  NB: { brackets: [[51306, 0.094], [102614, 0.14], [190060, 0.16], [Infinity, 0.195]], bpa: 13396, rate: 0.094, lowInc: { r: 801, start: 21924, claw: 0.03 } },
  NS: { brackets: [[30507, 0.0879], [61015, 0.1495], [95883, 0.1667], [154650, 0.175], [Infinity, 0.21]], bpa: 11744, rate: 0.0879, lowInc: { r: 286, start: 14926, claw: 0.0505 } },
  PE: { brackets: [[33328, 0.095], [64656, 0.1347], [105000, 0.166], [140000, 0.1762], [Infinity, 0.19]], bpa: 14250, rate: 0.095, lowInc: { r: 350, start: 22193, claw: 0.05 } },
  NL: { brackets: [[44192, 0.087], [88382, 0.145], [157792, 0.158], [220910, 0.178], [282214, 0.198], [564429, 0.208], [1128858, 0.213], [Infinity, 0.218]], bpa: 11067, rate: 0.087, lowInc: { r: 989, start: 23735, claw: 0.16 } },
  NU: { brackets: [[54707, 0.04], [109413, 0.07], [177881, 0.09], [Infinity, 0.115]], bpa: 19274, rate: 0.04 },
  YT: { brackets: [[57375, 0.064], [114750, 0.09], [177882, 0.109], [500000, 0.128], [Infinity, 0.15]], bpa: 16129, rate: 0.064 },
  NT: { brackets: [[51964, 0.059], [103930, 0.086], [168967, 0.122], [Infinity, 0.1405]], bpa: 17842, rate: 0.059 },
  QC: { brackets: [[53255, 0.14], [106495, 0.19], [129590, 0.24], [Infinity, 0.2575]], bpa: 18571, rate: 0.14, quebec: true },
};
const TAX_YEARS = {
  2025: {
    fed: [[57375, 0.15], [114750, 0.205], [177882, 0.26], [253414, 0.29], [Infinity, 0.33]],
    fedBPA: 16129, fedRate: 0.15,
    cppRate: 0.0595, cppMax: 4034.10, cppExempt: 3500, cpp2Max: 396, eiRate: 0.0164, eiMax: 1077.48,
    prov: PROV_2025,
    approx: false,
  },
  2026: {
    fed: [[58523, 0.14], [117045, 0.205], [181440, 0.26], [258482, 0.29], [Infinity, 0.33]],
    fedBPA: 16452, fedRate: 0.14,
    cppRate: 0.0595, cppMax: 4230.45, cppExempt: 3500, cpp2Max: 416, eiRate: 0.0163, eiMax: 1123.07,
    prov: {
      BC: { brackets: [[50363, 0.056], [100728, 0.077], [115648, 0.105], [140430, 0.1229], [190405, 0.147], [265545, 0.168], [Infinity, 0.205]], bpa: 13216, rate: 0.056, lowInc: { r: 575, start: 25570, claw: 0.0356 } },
      AB: { brackets: [[61200, 0.08], [154259, 0.10], [185111, 0.12], [246813, 0.13], [370220, 0.14], [Infinity, 0.15]], bpa: 22769, rate: 0.08 },
      ON: { brackets: [[53891, 0.0505], [107785, 0.0915], [150000, 0.1116], [220000, 0.1216], [Infinity, 0.1316]], bpa: 12989, rate: 0.0505, surtax: { a: 5710, b: 7307 }, lowInc: { r: 300, start: 18930, claw: 0.0505 } },
      SK: { brackets: [[54532, 0.105], [155805, 0.125], [Infinity, 0.145]], bpa: 19491, rate: 0.105 },
      MB: { brackets: [[47000, 0.108], [100000, 0.1275], [Infinity, 0.174]], bpa: 15780, rate: 0.108 },
      NB: { brackets: [[52333, 0.094], [104666, 0.14], [193861, 0.16], [Infinity, 0.195]], bpa: 13853, rate: 0.094, lowInc: { r: 817, start: 22358, claw: 0.03 } },
      NS: { brackets: [[30995, 0.0879], [61991, 0.1495], [97417, 0.1667], [157124, 0.175], [Infinity, 0.21]], bpa: 11744, rate: 0.0879, lowInc: { r: 292, start: 15220, claw: 0.0505 } },
      PE: { brackets: [[33928, 0.095], [65820, 0.1347], [106890, 0.166], [142250, 0.1762], [Infinity, 0.19]], bpa: 14650, rate: 0.095, lowInc: { r: 350, start: 23000, claw: 0.05 } },
      NL: { brackets: [[44678, 0.087], [89354, 0.145], [159528, 0.158], [223340, 0.178], [285319, 0.198], [570638, 0.208], [1141275, 0.213], [Infinity, 0.218]], bpa: 11283, rate: 0.087, lowInc: { r: 1008, start: 24191, claw: 0.16 } },
      NU: { brackets: [[55801, 0.04], [111602, 0.07], [181439, 0.09], [Infinity, 0.115]], bpa: 19655, rate: 0.04 },
      YT: { brackets: [[58523, 0.064], [117045, 0.09], [181440, 0.109], [500000, 0.128], [Infinity, 0.15]], bpa: 16452, rate: 0.064 },
      NT: { brackets: [[53003, 0.059], [106009, 0.086], [172346, 0.122], [Infinity, 0.1405]], bpa: 18190, rate: 0.059 },
      QC: { brackets: [[54345, 0.14], [108680, 0.19], [132245, 0.24], [Infinity, 0.2575]], bpa: 18929, rate: 0.14, quebec: true },
    },
    approx: false,
  },
};
const taxTableFor = (year) => TAX_YEARS[year] || { ...TAX_YEARS[2026], approx: true };
const provFor = (t, code) => t.prov[code] || t.prov.BC;
// Provincial eligible-dividend tax credit rates (% of grossed-up amount). Published provincial figures.
const PROV_DIV_CR = { BC: 0.12, AB: 0.0812, ON: 0.10, SK: 0.11, MB: 0.08, NB: 0.14, NS: 0.0885, PE: 0.105, NL: 0.063, NU: 0.0551, YT: 0.1203, NT: 0.115, QC: 0.117 };
// Provincial NON-eligible dividend credit rates (% of grossed-up amount).
const PROV_DIV_CR_NE = { BC: 0.0196, AB: 0.0218, ON: 0.029863, SK: 0.018, MB: 0.007835, NB: 0.0275, NS: 0.0299, PE: 0.013, NL: 0.032, NU: 0.0261, YT: 0.0367, NT: 0.06, QC: 0.0342 };
const QC_FED_ABATEMENT = 0.165; // Quebec residents: basic federal tax reduced 16.5%
const RECEIPT_EXPIRY_DAYS = 90;
const CAT_TO_T776 = { "Utilities": "9220", "Home / Repairs": "8960", "Auto": "9281", "Insurance": "8690", "Advertising": "8521" };
const receiptLine = (cat) => CAT_TO_T776[cat] || "9270";
const PIE = ["#0d9488", "#0891b2", "#f59e0b", "#e11d48", "#8b5cf6", "#10b981", "#64748b", "#ec4899", "#f97316"];

function parseReceiptText(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  let amount = 0;
  const totalRe = /(?:total|grand total|amount due|balance due)[^\d$]*[$]?\s*([\d,]+\.?\d{0,2})/i;
  for (let i = lines.length - 1; i >= 0; i--) {
    const m = lines[i].match(totalRe);
    if (m) { amount = parseFloat(m[1].replace(/,/g, "")); break; }
  }
  if (!amount) {
    const all = [...text.matchAll(/\$?\s*([\d,]+\.\d{2})/g)].map((m) => parseFloat(m[1].replace(/,/g, "")));
    if (all.length) amount = Math.max(...all);
  }
  let date = "";
  for (const re of [/\b(\d{4}[-/]\d{1,2}[-/]\d{1,2})\b/, /\b(\d{1,2}[-/]\d{1,2}[-/]\d{4})\b/, /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s+\d{1,2},?\s+\d{4})\b/i]) {
    const m = text.match(re);
    if (m) { try { const d = new Date(m[1]); if (!isNaN(d.getTime())) { date = d.toISOString().slice(0, 10); break; } } catch {} }
  }
  const merchant = lines.find((l) => l.length > 2 && !/^\d/.test(l)) || lines[0] || "";
  return { amount, date, merchant };
}
function parsePayStubText(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  let gross = 0, taxWithheld = 0, payDate = "";
  for (const line of lines) {
    const m = line.match(/gross(?:\s+(?:pay|earnings|income))?[^\d$]*[$]?\s*([\d,]+\.?\d{0,2})/i);
    if (m) { gross = parseFloat(m[1].replace(/,/g, "")); break; }
  }
  for (const line of lines) {
    const m = line.match(/(?:income|federal|fed|provincial|prov)?\s*tax(?:\s+(?:deducted|withheld))?[^\d$]*[$]?\s*([\d,]+\.?\d{0,2})/i);
    if (m) { taxWithheld = parseFloat(m[1].replace(/,/g, "")); break; }
  }
  for (const re of [/(?:pay\s+date[^\d]*)(\d{4}[-/]\d{1,2}[-/]\d{1,2})/i, /\b(\d{4}[-/]\d{1,2}[-/]\d{1,2})\b/]) {
    const m = text.match(re);
    if (m) { try { const d = new Date(m[1]); if (!isNaN(d.getTime())) { payDate = d.toISOString().slice(0, 10); break; } } catch {} }
  }
  return { gross, taxWithheld, payDate };
}

const fmt = (n) => (Number(n) || 0).toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });
const fmt2 = (n) => (Number(n) || 0).toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 2 });
const num = (v) => (v === "" || v == null ? 0 : parseFloat(v) || 0);
const addMonths = (d, m) => { const x = new Date(d); x.setMonth(x.getMonth() + m); return x; };
const fmtMonthYear = (d) => d.toLocaleDateString("en-CA", { year: "numeric", month: "short" });

function amortize(balance, annualRate, payment) {
  let bal = num(balance);
  const r = num(annualRate) / 100 / 12;
  const pmt = num(payment);
  if (bal <= 0 || pmt <= 0) return null;
  if (r > 0 && pmt <= bal * r) return { neverPaysOff: true };
  let totalInterest = 0, months = 0;
  const series = [{ year: 0, balance: Math.round(bal) }];
  while (bal > 0 && months < 1200) {
    const interest = bal * r;
    let principal = pmt - interest;
    if (principal <= 0) break;
    bal -= principal;
    if (bal < 0) bal = 0;
    totalInterest += interest;
    months++;
    if (months % 12 === 0 || bal === 0) series.push({ year: +(months / 12).toFixed(1), balance: Math.max(0, Math.round(bal)) });
  }
  return { months, years: months / 12, totalInterest, series, payoffDate: addMonths(new Date(), months) };
}
function progressiveTax(income, brackets) {
  let tax = 0, prev = 0;
  for (const [limit, rate] of brackets) {
    if (income <= prev) break;
    tax += (Math.min(income, limit) - prev) * rate;
    prev = limit;
  }
  return tax;
}
const propEquity = (p) => num(p.currentValue) - num(p.mortgage.balance);
const propAnnualInterestEstimate = (p) => num(p.mortgage.balance) * (num(p.mortgage.rate) / 100);
const monthlyRent = (p) => (p.tenants || []).reduce((s, t) => s + num(t.rent), 0);
const repairsByYear = (p, year, kind) => (p.repairs || []).filter((r) => r.kind === kind && (!year || (r.date || "").slice(0, 4) === String(year)));
const billMonthly = (b) => (b.frequency === "annual" ? num(b.amount) / 12 : num(b.amount));
const contribInYear = (list, year) => (list || []).filter((c) => (c.date || "").slice(0, 4) === String(year)).reduce((s, c) => s + num(c.amount), 0);
function investTotal(inv) {
  if (!inv) return 0;
  return num(inv.rrsp?.value) + num(inv.tfsa?.value) + num(inv.resp?.value) + num(inv.fhsa?.value) + (inv.nonreg || []).reduce((s, n) => s + num(n.value), 0);
}
function computeTotals(data) {
  const props = data.properties || [];
  const investments = investTotal(data.investments);
  const propValue = props.reduce((s, p) => s + num(p.currentValue), 0);
  const accountsCash = (data.household.accounts || []).reduce((s, a) => s + num(a.balance), 0);
  const cash = num(data.household.cash) + accountsCash, other = num(data.household.otherAssets);
  const foreignAssets = (data.household.foreignAssets || []).reduce((s, a) => s + num(a.cad), 0);
  const assets = propValue + cash + other + investments + foreignAssets;
  const mortgage = props.reduce((s, p) => s + num(p.mortgage.balance), 0);
  const carLoans = (data.vehicles || []).reduce((s, v) => s + num(v.loanBalance), 0);
  const consumer = (data.debts || []).reduce((s, x) => s + num(x.balance), 0);
  const debt = mortgage + carLoans + consumer;
  return { assets, debt, netWorth: assets - debt, equity: props.reduce((s, p) => s + propEquity(p), 0), investments, savings: cash + investments, mortgage, carLoans, consumer };
}
function computeChildcare(data, year) {
  const childLimit = (c) => {
    if (c.disability) return 11000;
    const age = num(year) - num(c.birthYear);
    if (age < 7) return 8000;
    if (age <= 16) return 5000;
    return 0;
  };
  const totalPaid = (data.childcare || []).filter((e) => (e.date || "").slice(0, 4) === String(year)).reduce((s, e) => s + num(e.amount), 0);
  const limitByAge = (data.children || []).reduce((s, c) => s + childLimit(c), 0);
  const p1 = num(data.household.p1Income), p2 = num(data.household.p2Income);
  const lowerIsP1 = p1 <= p2;
  return { totalPaid, limitByAge, incomeLimit: (2 / 3) * Math.min(p1, p2), deduction: Math.min(totalPaid, limitByAge, (2 / 3) * Math.min(p1, p2)), lowerIsP1, lowerName: lowerIsP1 ? data.household.p1Name : data.household.p2Name, childLimit };
}

const DEFAULTS = () => ({
  household: { p1Name: "Me", p1Income: 0, p2Name: "Spouse/Partner", p2Income: 0, cash: 0, otherAssets: 0, province: "BC", foreignAssets: [], accounts: [] },
  properties: [], children: [], childcare: [], vehicles: [], bills: [], goals: [],
  investments: emptyInvestments(), debts: [], dependents: [], oneTime: [], incomeLog: [], payTemplates: [],
  receipts: [], receiptCategories: ["Groceries", "Home / Repairs", "Auto", "Medical", "Childcare", "Utilities", "Dining", "Phone/Internet", "Insurance", "Subscriptions", "Transportation", "Home", "Travel", "Gifts", "Other"],
  budget: { monthlyIncome: 0, envelopes: [] },
  taxEstimate: { p1: emptyTaxPerson(), p2: emptyTaxPerson() },
  snapshots: [], taxYear: new Date().getFullYear(),
});
function applyDefaults(p) {
  const base = DEFAULTS();
  return {
    ...base, ...p,
    household: { ...base.household, ...(p.household || {}) },
    investments: { ...emptyInvestments(), ...(p.investments || {}) },
    taxEstimate: { p1: { ...emptyTaxPerson(), ...(p.taxEstimate?.p1 || {}) }, p2: { ...emptyTaxPerson(), ...(p.taxEstimate?.p2 || {}) } },
    receiptCategories: Array.from(new Set([...(p.receiptCategories || base.receiptCategories), ...base.receiptCategories])),
  };
}

/* ---------- Brand logo (coin+pine glyph) ---------- */
function Logo({ size = 40, tone = "reversed" }) {
  // "reversed": white glyph on translucent-white square, for teal/dark backgrounds (default, used in the app header).
  // "brand": teal glyph on transparent, for light backgrounds (landing page, favicon).
  const bg = tone === "brand" ? "none" : "rgba(255,255,255,0.14)";
  const fg = tone === "brand" ? "#0d9488" : "#ffffff";
  return (
    <svg width={size} height={size} viewBox="0 0 240 240" aria-label="Cabintree">
      <rect x="0" y="0" width="240" height="240" rx="54" fill={bg} />
      <circle cx="120" cy="120" r="74" fill="none" stroke={fg} strokeWidth="6" />
      <circle cx="120" cy="120" r="62" fill="none" stroke={fg} strokeWidth="2" opacity="0.55" />
      <polygon points="92,150 148,150 120,116" fill={fg} />
      <polygon points="98,124 142,124 120,92" fill={fg} />
      <polygon points="104,100 136,100 120,70" fill={fg} />
      <rect x="115" y="150" width="10" height="16" rx="2" fill={fg} />
    </svg>
  );
}

/* ---------- Onboarding ---------- */
function Onboarding({ onFinish }) {
  const [step, setStep] = useState(0);
  const [s, setS] = useState({ p1Name: "", household: "solo", p2Name: "", province: "BC", hasRental: false, hasKid: false, childName: "", childBirthYear: "" });
  const set = (patch) => setS((x) => ({ ...x, ...patch }));
  const total = 5;

  const finish = () => onFinish({
    household: { p1Name: s.p1Name || "Me", p2Name: s.household === "couple" ? (s.p2Name || "Partner") : "Spouse/Partner", province: s.province },
    addProperty: s.hasRental,
    child: s.hasKid ? { name: s.childName, birthYear: s.childBirthYear } : null,
  });

  const Dot = ({ i }) => <span className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-white" : "w-1.5 bg-white/40"}`} />;
  const Btn = ({ onClick, children, primary }) => (
    <button onClick={onClick} className={`px-5 py-2.5 rounded-xl text-sm font-medium transition ${primary ? "bg-white text-teal-700 hover:bg-teal-50" : "text-teal-50 hover:text-white"}`}>{children}</button>
  );
  const Choice = ({ active, onClick, title, sub }) => (
    <button onClick={onClick} className={`w-full text-left px-4 py-3 rounded-xl border-2 transition ${active ? "border-white bg-white/15" : "border-white/25 hover:border-white/50"}`}>
      <div className="font-medium">{title}</div>{sub && <div className="text-xs text-teal-100 mt-0.5">{sub}</div>}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-700 to-emerald-700 text-white flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {step === 0 && (
            <div className="text-center">
              <div className="flex justify-center mb-4"><Logo size={72} /></div>
              <h1 className="text-3xl font-bold">Welcome to Cabintree</h1>
              <p className="text-teal-100 mt-3 leading-relaxed">The Canadian household budgeting app that also handles your rental properties and taxes. Let's set things up — takes about a minute, and you can change anything later.</p>
            </div>
          )}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-semibold mb-1">First, who's this for?</h2>
              <p className="text-teal-100 text-sm mb-5">This sets up your dashboard and tax estimates.</p>
              <div className="space-y-2">
                <Choice active={s.household === "solo"} onClick={() => set({ household: "solo" })} title="Just me" sub="A personal account" />
                <Choice active={s.household === "couple"} onClick={() => set({ household: "couple" })} title="Me and my partner" sub="A shared family account with split tax estimates" />
              </div>
              <div className="mt-4 space-y-2">
                <input value={s.p1Name} onChange={(e) => set({ p1Name: e.target.value })} placeholder="Your name" className="w-full px-3 py-2.5 rounded-xl bg-white/15 placeholder-teal-200 text-white outline-none border-2 border-white/25 focus:border-white" />
                {s.household === "couple" && <input value={s.p2Name} onChange={(e) => set({ p2Name: e.target.value })} placeholder="Partner's name" className="w-full px-3 py-2.5 rounded-xl bg-white/15 placeholder-teal-200 text-white outline-none border-2 border-white/25 focus:border-white" />}
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-semibold mb-1">Where do you live?</h2>
              <p className="text-teal-100 text-sm mb-5">Your province sets the right tax brackets for estimates.</p>
              <select value={s.province} onChange={(e) => set({ province: e.target.value })} className="w-full px-3 py-3 rounded-xl bg-white text-stone-800 outline-none text-base">
                {Object.entries(PROV_NAMES).map(([code, name]) => <option key={code} value={code}>{name}</option>)}
              </select>
            </div>
          )}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-semibold mb-1">What should we track?</h2>
              <p className="text-teal-100 text-sm mb-5">Tap any that apply — we'll set up the right sections.</p>
              <div className="space-y-2">
                <Choice active={s.hasRental} onClick={() => set({ hasRental: !s.hasRental })} title="🏠 Rental property" sub="T776 tax tracking, tenants, mortgage & equity" />
                <Choice active={s.hasKid} onClick={() => set({ hasKid: !s.hasKid })} title="👶 Childcare / kids" sub="Childcare deduction & education savings" />
              </div>
              {s.hasKid && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <input value={s.childName} onChange={(e) => set({ childName: e.target.value })} placeholder="Child's name" className="px-3 py-2.5 rounded-xl bg-white/15 placeholder-teal-200 text-white outline-none border-2 border-white/25 focus:border-white" />
                  <input value={s.childBirthYear} onChange={(e) => set({ childBirthYear: e.target.value })} placeholder="Birth year" className="px-3 py-2.5 rounded-xl bg-white/15 placeholder-teal-200 text-white outline-none border-2 border-white/25 focus:border-white" />
                </div>
              )}
            </div>
          )}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-semibold mb-3">You're all set, {s.p1Name || "friend"}! 🎉</h2>
              <p className="text-teal-100 text-sm mb-4 leading-relaxed">Here's how to make the most of Cabintree:</p>
              <div className="space-y-2.5 text-sm">
                <div className="bg-white/10 rounded-xl p-3"><strong>📊 Dashboard</strong> — your net worth, trends, and a live tax-bracket bar as you log pay.</div>
                <div className="bg-white/10 rounded-xl p-3"><strong>🧾 Receipts</strong> — snap a photo and we read the details automatically.</div>
                <div className="bg-white/10 rounded-xl p-3"><strong>📁 Budget</strong> — give every dollar a job with monthly folders.</div>
                <div className="bg-white/10 rounded-xl p-3"><strong>📋 Tax Report</strong> — a robust refund estimate for your province, any year.</div>
              </div>
              <p className="text-teal-100 text-xs mt-4">Everything saves privately on your device. Fill things in as you go — there's no rush.</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 max-w-md mx-auto w-full">
        <div className="flex justify-center gap-1.5 mb-4">{Array.from({ length: total }, (_, i) => <Dot key={i} i={i} />)}</div>
        <div className="flex justify-between items-center">
          <div>{step > 0 && <Btn onClick={() => setStep(step - 1)}>Back</Btn>}</div>
          <div className="flex gap-2">
            {step < total - 1 && step > 0 && <Btn onClick={() => onFinish(null)}>Skip</Btn>}
            {step < total - 1 ? <Btn primary onClick={() => setStep(step + 1)}>{step === 0 ? "Get started" : "Next"}</Btn> : <Btn primary onClick={finish}>Enter Cabintree</Btn>}
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthScreen({ onAuth, inviteBanner }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [resendStatus, setResendStatus] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotStatus, setForgotStatus] = useState("");
  const [forgotError, setForgotError] = useState("");

  const handleResend = async () => {
    setResendStatus("sending");
    const { error: resendError } = await supabase.auth.resend({ type: "signup", email });
    setResendStatus(resendError ? "error" : "sent");
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotStatus("sending");
    setForgotError("");
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}${window.location.pathname}`,
    });
    if (resetError) { setForgotError(resetError.message); setForgotStatus("error"); }
    else setForgotStatus("sent");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignUp) {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        if (authData?.session) {
          // email confirmation is disabled on this project — session is issued immediately
          onAuth(authData.user);
        } else {
          // confirmation required: no session yet, don't let them into the app
          setPendingVerification(true);
        }
      } else {
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          if (/email not confirmed/i.test(signInError.message)) {
            setPendingVerification(true);
          } else {
            throw signInError;
          }
        } else {
          onAuth(authData.user);
        }
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-stone-200 shadow-sm p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-5">
            <Mail size={26} className="text-teal-600" />
          </div>
          <h2 className="text-2xl font-semibold text-stone-900 mb-2">Verify your email</h2>
          <p className="text-stone-500 text-sm mb-1">
            We sent a confirmation link to
          </p>
          <p className="font-semibold text-stone-800 mb-4">{email}</p>
          <p className="text-stone-500 text-sm mb-6">
            Click the link in that email from Cabintree to activate your account, then come back here and sign in.
          </p>

          {resendStatus === "sent" ? (
            <p className="text-emerald-600 text-sm flex items-center justify-center gap-2 mb-2">
              <CheckCircle size={16} /> Email resent — check your inbox (and spam folder).
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resendStatus === "sending"}
              className="text-teal-700 font-semibold text-sm underline hover:text-teal-800 disabled:opacity-50"
            >
              {resendStatus === "sending" ? "Resending…" : "Didn't get it? Resend email"}
            </button>
          )}

          <div className="mt-6 pt-6 border-t border-stone-100">
            <button
              onClick={() => { setPendingVerification(false); setIsSignUp(false); setResendStatus(""); }}
              className="text-stone-400 text-sm hover:text-stone-600 transition"
            >
              ← Back to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (forgotMode) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
          {forgotStatus === "sent" ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-5">
                <Mail size={26} className="text-teal-600" />
              </div>
              <h2 className="text-2xl font-semibold text-stone-900 mb-2">Check your email</h2>
              <p className="text-stone-500 text-sm mb-1">We sent a password reset link to</p>
              <p className="font-semibold text-stone-800 mb-6">{email}</p>
              <button
                onClick={() => { setForgotMode(false); setForgotStatus(""); setForgotError(""); }}
                className="text-teal-700 font-semibold text-sm hover:text-teal-800"
              >
                ← Back to sign in
              </button>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <h2 className="text-xl font-semibold text-stone-900 mb-1.5">Reset your password</h2>
                <p className="text-stone-400 text-sm">Enter your email and we'll send you a link to set a new password.</p>
              </div>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <TextField label="Email" type="email" placeholder="you@example.com" value={email} onChange={setEmail} required />
                {forgotError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg p-3">{forgotError}</div>
                )}
                <button
                  type="submit"
                  disabled={forgotStatus === "sending"}
                  className="w-full px-4 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 disabled:opacity-50 transition mt-2"
                >
                  {forgotStatus === "sending" ? "Sending…" : "Send reset link"}
                </button>
              </form>
              <div className="mt-6 pt-6 border-t border-stone-100 text-center">
                <button onClick={() => { setForgotMode(false); setForgotError(""); }} className="text-stone-400 text-sm hover:text-stone-600 transition">
                  ← Back to sign in
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  const capabilityStrip = [
    { icon: Home, label: "Dashboard" },
    { icon: Folder, label: "Budget" },
    { icon: Receipt, label: "Receipts" },
    { icon: PiggyBank, label: "Investments" },
    { icon: Building2, label: "Properties" },
    { icon: FileText, label: "Tax report" },
    { icon: Users, label: "Family" },
  ];

  const capabilities = [
    { icon: Home, title: "Net worth dashboard", sub: "Track assets, debt, and net worth trends over time, with a monthly spending breakdown and personalized insights." },
    { icon: Folder, title: "Envelope budgeting", sub: "Give every dollar a job with monthly folders that link straight to your spending, so you always know what's left." },
    { icon: Receipt, title: "Receipt scanning", sub: "Snap a photo and let built-in OCR pull the merchant, date, and total automatically." },
    { icon: PiggyBank, title: "RRSP, TFSA, FHSA & RESP", sub: "Track contribution room, deductions, and growth across every registered account you hold." },
    { icon: Building2, title: "Rental properties", sub: "Manage multiple properties with mortgage tracking and T776 reporting built in." },
    { icon: FileText, title: "Canadian tax estimates", sub: "See your bracket, projected refund, and a CRA-ready summary organized by category." },
    { icon: Users, title: "Family sharing", sub: "Invite a partner to a shared household by email — everyone sees the same numbers, kept in sync." },
    { icon: Target, title: "Savings goals", sub: "Set a target and a date, and see exactly how much to save each month to get there." },
    { icon: Wallet, title: "Everyday expenses", sub: "Childcare, vehicle payments, and one-off costs — categorized and rolled into your full picture." },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&q=80" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-stone-950/92 via-stone-950/78 to-teal-950/70" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Left: Hero copy */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-8">
              <Logo size={36} />
              <span className="text-lg font-semibold text-white tracking-tight">Cabintree</span>
            </div>

            <h1 className="text-4xl lg:text-[3.4rem] font-semibold text-white tracking-tight leading-[1.06] mb-5">
              Take control of your<br />Canadian finances
            </h1>
            <div className="w-14 h-1 bg-teal-400 rounded-full mb-6" />

            <p className="text-lg text-stone-200 mb-10 leading-relaxed max-w-md">
              Budgeting, investments, rental properties, and tax season — all in one place, built around how Canadians actually manage money.
            </p>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-300">
              <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-teal-400" /> 100% Canadian tax support</span>
              <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-teal-400" /> Multi-device sync</span>
              <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-teal-400" /> Privacy-first</span>
            </div>
          </div>

          {/* Right: Sign In / Sign Up Form */}
          <div id="auth-form">
            {inviteBanner && (
              <div className="bg-teal-50 border border-teal-200 text-teal-800 text-sm rounded-2xl p-4 mb-4 flex items-start gap-2">
                <Users size={16} className="shrink-0 mt-0.5" />
                <span>You've been invited to a shared household on Cabintree. Sign in or create an account using the email address the invite was sent to, then it'll be accepted automatically.</span>
              </div>
            )}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xl p-8">
              <div className="mb-7">
                <h2 className="text-xl font-semibold text-stone-900 mb-1.5">
                  {isSignUp ? "Create your account" : "Welcome back"}
                </h2>
                <p className="text-stone-400 text-sm">
                  {isSignUp
                    ? "Join Canadians taking control of their finances."
                    : "Log in to continue managing your wealth."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <TextField label="Email" type="email" placeholder="you@example.com" value={email} onChange={setEmail} required />
                <TextField label="Password" type="password" placeholder="••••••••" value={password} onChange={setPassword} required />

                {!isSignUp && (
                  <div className="text-right -mt-2">
                    <button type="button" onClick={() => { setForgotMode(true); setError(""); }} className="text-xs text-teal-700 hover:text-teal-800 hover:underline">
                      Forgot password?
                    </button>
                  </div>
                )}

                {error && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg p-3">
                    {error}
                  </div>
                )}

                {isSignUp && (
                  <p className="text-stone-400 text-xs -mt-1">
                    We'll email you a link to verify your address before you can sign in.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 disabled:opacity-50 transition mt-6"
                >
                  {loading ? "Loading…" : isSignUp ? "Create Account" : "Sign In"}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-stone-100">
                <p className="text-center text-stone-500 text-sm">
                  {isSignUp ? "Already have an account? " : "New to Cabintree? "}
                  <button
                    onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
                    className="font-semibold text-teal-700 hover:text-teal-800 transition"
                  >
                    {isSignUp ? "Sign in here" : "Create one"}
                  </button>
                </p>
              </div>

              <p className="text-center text-stone-400 text-xs mt-4">
                Your data is encrypted and secure. We never sell your information.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Capability strip */}
      <div className="bg-stone-900 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-wrap justify-center gap-x-10 gap-y-3">
          {capabilityStrip.map((c) => (
            <span key={c.label} className="flex items-center gap-2 text-stone-300 text-sm">
              <c.icon size={15} className="text-teal-400" /> {c.label}
            </span>
          ))}
        </div>
      </div>

      {/* Capability grid */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <h2 className="text-3xl font-semibold text-stone-900 tracking-tight mb-4">Everything you need, in one place</h2>
          <p className="text-stone-500 leading-relaxed">Stop juggling spreadsheets, banking apps, and tax software. Cabintree brings your whole financial picture together.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((c) => (
            <div key={c.title} className="bg-white rounded-2xl border border-stone-200 p-6">
              <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center mb-4">
                <c.icon size={20} className="text-teal-600" />
              </div>
              <h3 className="font-semibold text-stone-800 mb-1.5">{c.title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{c.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trust / story split */}
      <div className="bg-stone-100 py-20">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <img
            src="https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=900&q=80"
            alt="A quiet cabin in the woods"
            className="rounded-3xl w-full h-72 lg:h-96 object-cover"
          />
          <div>
            <h2 className="text-3xl font-semibold text-stone-900 tracking-tight mb-5 leading-tight">
              Built with the calm of a cabin, the growth of a tree
            </h2>
            <p className="text-stone-500 leading-relaxed mb-8">
              Financial wellness shouldn't feel like a second job. Cabintree gives you a quiet, organized home base for your money — one that grows with you, from your first budget to your first rental property.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-2xl font-semibold text-stone-900">10+</div>
                <div className="text-stone-500 text-sm mt-1">tools in one app</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-stone-900">2026</div>
                <div className="text-stone-500 text-sm mt-1">tax brackets, kept current</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-stone-900">100%</div>
                <div className="text-stone-500 text-sm mt-1">designed for Canadians</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-stone-900">Private</div>
                <div className="text-stone-500 text-sm mt-1">your data, never sold</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-stone-900 py-16 text-center px-6">
        <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-4">Ready to take control?</h2>
        <p className="text-stone-400 mb-8 max-w-md mx-auto">Set up takes about a minute. Change anything later.</p>
        <a href="#auth-form" className="inline-block px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition">
          Get started free
        </a>
      </div>
    </div>
  );
}

function ResetPasswordScreen({ onDone }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) { setError(updateError.message); return; }
    setDone(true);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
        {done ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={26} className="text-teal-600" />
            </div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-2">Password updated</h2>
            <p className="text-stone-500 text-sm mb-6">Sign in again with your new password.</p>
            <button onClick={onDone} className="w-full px-4 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition">
              Back to sign in
            </button>
          </div>
        ) : (
          <>
            <div className="mb-7">
              <h2 className="text-xl font-semibold text-stone-900 mb-1.5">Set a new password</h2>
              <p className="text-stone-400 text-sm">Choose a new password for your Cabintree account.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <TextField label="New password" type="password" placeholder="••••••••" value={password} onChange={setPassword} required />
              <TextField label="Confirm new password" type="password" placeholder="••••••••" value={confirm} onChange={setConfirm} required />
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg p-3">{error}</div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 disabled:opacity-50 transition mt-2"
              >
                {loading ? "Updating…" : "Update password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- Household switcher & invites ---------- */
function HouseholdSwitcher({ memberships, activeHouseholdId, onSwitch, onCreateFamily, onLeave }) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [familyName, setFamilyName] = useState("");
  const [seedData, setSeedData] = useState(true);
  const [inviteFor, setInviteFor] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [busy, setBusy] = useState(false);

  const active = memberships.find((m) => m.household_id === activeHouseholdId);
  const activeType = active?.households?.type || "personal";

  const handleCreate = async () => {
    setBusy(true);
    try {
      await onCreateFamily(familyName.trim() || "Our Household", seedData);
      setCreating(false);
      setFamilyName("");
    } catch (e) {
      setInviteError(e.message || "Couldn't create household");
    }
    setBusy(false);
  };

  const handleInvite = async (householdId) => {
    if (!inviteEmail.trim()) return;
    setBusy(true);
    setInviteError("");
    try {
      const { data: token, error } = await supabase.rpc("create_invite", { p_household: householdId, p_email: inviteEmail.trim() });
      if (error) throw error;
      setInviteLink(`${window.location.origin}${window.location.pathname}?invite=${token}`);
    } catch (e) {
      setInviteError(e.message || "Couldn't create invite");
    }
    setBusy(false);
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-xs font-medium text-stone-700 transition">
        {activeType === "family" ? <Users size={12} /> : <User size={12} />}
        <span className="hidden sm:inline">{active?.households?.name || "Personal"}</span>
        <ChevronDown size={12} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-stone-200 shadow-lg p-3 z-20 text-left">
          <div className="text-xs font-medium text-stone-400 px-1 mb-1.5">Your households</div>
          <div className="space-y-1 mb-2">
            {memberships.map((m) => (
              <div key={m.household_id} className={`rounded-lg px-2.5 py-2 ${m.household_id === activeHouseholdId ? "bg-teal-50" : "hover:bg-stone-50"}`}>
                <div className="flex items-center justify-between gap-2">
                  <button onClick={() => onSwitch(m.household_id)} className="flex items-center gap-2 flex-1 min-w-0 text-left">
                    {m.households?.type === "family" ? <Users size={14} className="text-teal-600 shrink-0" /> : <User size={14} className="text-stone-400 shrink-0" />}
                    <span className={`text-sm truncate ${m.household_id === activeHouseholdId ? "font-medium text-teal-800" : "text-stone-700"}`}>{m.households?.name}</span>
                  </button>
                  {m.households?.type === "family" && (
                    <button onClick={() => { setInviteFor(m.household_id); setInviteLink(""); setInviteError(""); }} className="text-xs text-teal-700 hover:underline shrink-0">Invite</button>
                  )}
                </div>
                {inviteFor === m.household_id && (
                  <div className="mt-2 pt-2 border-t border-stone-100 space-y-2">
                    {inviteLink ? (
                      <div className="space-y-1.5">
                        <p className="text-xs text-stone-500">Share this link — it works once the invited person signs in with that email.</p>
                        <div className="flex gap-1.5">
                          <input readOnly value={inviteLink} className="flex-1 px-2 py-1 text-xs border border-stone-300 rounded-lg bg-stone-50 truncate" onFocus={(e) => e.target.select()} />
                          <button onClick={() => navigator.clipboard?.writeText(inviteLink)} className="text-xs bg-teal-600 text-white px-2.5 rounded-lg hover:bg-teal-700 shrink-0">Copy</button>
                        </div>
                        <a href={`mailto:${inviteEmail}?subject=${encodeURIComponent("Join our household on Cabintree")}&body=${encodeURIComponent(`Here's the link to join our shared household on Cabintree: ${inviteLink}`)}`} className="text-xs text-teal-700 hover:underline">Send via email</a>
                      </div>
                    ) : (
                      <div className="flex gap-1.5">
                        <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} type="email" placeholder="partner@email.com" className="flex-1 px-2 py-1 text-xs border border-stone-300 rounded-lg" />
                        <button disabled={busy} onClick={() => handleInvite(m.household_id)} className="text-xs bg-teal-600 text-white px-2.5 rounded-lg hover:bg-teal-700 disabled:opacity-50 shrink-0">Send</button>
                      </div>
                    )}
                    {inviteError && <p className="text-xs text-rose-600">{inviteError}</p>}
                    {m.role !== "owner" || m.households?.type === "family" ? (
                      <button onClick={() => onLeave(m.household_id)} className="text-xs text-stone-400 hover:text-rose-600">Leave this household</button>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-stone-100 pt-2">
            {creating ? (
              <div className="space-y-2 px-1">
                <input value={familyName} onChange={(e) => setFamilyName(e.target.value)} placeholder="e.g. The Smith Family" className="w-full px-2 py-1.5 text-sm border border-stone-300 rounded-lg" />
                <label className="flex items-center gap-1.5 text-xs text-stone-500">
                  <input type="checkbox" checked={seedData} onChange={(e) => setSeedData(e.target.checked)} /> Copy my current data into it
                </label>
                <div className="flex gap-2">
                  <button disabled={busy} onClick={handleCreate} className="text-xs bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 disabled:opacity-50">Create</button>
                  <button onClick={() => setCreating(false)} className="text-xs text-stone-400">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setCreating(true)} className="w-full flex items-center gap-1.5 px-2.5 py-2 text-sm text-teal-700 hover:bg-teal-50 rounded-lg transition">
                <Plus size={14} /> Create a family household
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState(DEFAULTS());
  const [onboard, setOnboard] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [householdId, setHouseholdId] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [inviteBanner, setInviteBanner] = useState(null);
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const shared = false; // receipt photo cache isn't shared across household members yet

  const loadHouseholdData = async (hid) => {
    const { data: householdRow } = await supabase.from("household_data").select("data").eq("household_id", hid).maybeSingle();
    if (householdRow?.data) {
      setData(applyDefaults(typeof householdRow.data === "string" ? JSON.parse(householdRow.data) : householdRow.data));
    } else {
      setData(DEFAULTS());
    }
  };

  const loadMemberships = async (userId) => {
    const { data: rows } = await supabase.from("household_members").select("household_id, role, households(name, type)").eq("user_id", userId);
    setMemberships(rows || []);
  };

  const loadUserContext = async (sessionUser) => {
    const { data: profile } = await supabase.from("profiles").select("active_household_id").eq("id", sessionUser.id).single();
    if (profile?.active_household_id) {
      setHouseholdId(profile.active_household_id);
      await loadHouseholdData(profile.active_household_id);
      await loadMemberships(sessionUser.id);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user: sessionUser } } = await supabase.auth.getUser();
        if (sessionUser) {
          setUser(sessionUser);
          await loadUserContext(sessionUser);
          try { const o = await window.storage.get(ONBOARD_KEY); if (!o || !o.value) setOnboard(true); } catch (e) { setOnboard(true); }
        }
      } catch (err) {
        console.log("Auth check: no session or error loading data");
      } finally {
        setAuthLoading(false);
        setLoaded(true);
      }
    };
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === "PASSWORD_RECOVERY") setPasswordRecovery(true);
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
        setHouseholdId(null);
      }
    });
    return () => subscription?.unsubscribe();
  }, []);

  // covers sign-in via the form (same page load, no reload) — checkAuth above only runs once at mount
  useEffect(() => {
    if (!user || householdId) return;
    (async () => {
      await loadUserContext(user);
      setLoaded(true);
    })();
  }, [user, householdId]);

  // accept a pending household invite from a shared link (?invite=<token>)
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("invite");
    if (!token) return;
    if (!user) {
      setInviteBanner({ status: "pending", token });
      return;
    }
    (async () => {
      try {
        const { error } = await supabase.rpc("accept_invite", { p_token: token });
        if (error) throw error;
        const { data: profile } = await supabase.from("profiles").select("active_household_id").eq("id", user.id).single();
        if (profile?.active_household_id) {
          setHouseholdId(profile.active_household_id);
          await loadHouseholdData(profile.active_household_id);
          await loadMemberships(user.id);
        }
        setInviteBanner({ status: "accepted" });
      } catch (err) {
        setInviteBanner({ status: "error", message: err.message || "Couldn't accept that invite." });
      } finally {
        window.history.replaceState({}, "", window.location.pathname);
      }
    })();
  }, [user]);

  // persist working data to Supabase & localStorage
  useEffect(() => {
    if (!loaded || !user || !householdId) return;
    const t = setTimeout(async () => {
      try {
        const { error } = await supabase.from("household_data").upsert({ household_id: householdId, data: JSON.stringify(data) }, { onConflict: "household_id" });
        if (!error) window.storage.set(shared ? FAMILY_KEY : PERSONAL_KEY, JSON.stringify(data), shared).catch(() => {});
      } catch (e) {
        console.error("Failed to save data to Supabase:", e);
        window.storage.set(shared ? FAMILY_KEY : PERSONAL_KEY, JSON.stringify(data), shared).catch(() => {});
      }
    }, 400);
    return () => clearTimeout(t);
  }, [data, loaded, user, householdId]);

  // monthly snapshot upsert (freezes prior months, keeps current month live)
  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => {
      setData((d) => {
        const tot = computeTotals(d);
        const month = currentMonth();
        const snaps = d.snapshots || [];
        const cur = snaps.find((s) => s.month === month);
        const next = { month, netWorth: Math.round(tot.netWorth), debt: Math.round(tot.debt), savings: Math.round(tot.savings), investments: Math.round(tot.investments) };
        if (cur && cur.netWorth === next.netWorth && cur.debt === next.debt && cur.savings === next.savings && cur.investments === next.investments) return d;
        return { ...d, snapshots: [...snaps.filter((s) => s.month !== month), next] };
      });
    }, 1300);
    return () => clearTimeout(t);
  }, [data, loaded]);

  const switchHousehold = async (hid) => {
    if (hid === householdId) return;
    const { error } = await supabase.rpc("set_active_household", { p_household: hid });
    if (error) return;
    setHouseholdId(hid);
    await loadHouseholdData(hid);
  };
  const createFamilyHousehold = async (name, seed) => {
    const { data: hid, error } = await supabase.rpc("create_family_household", { p_name: name, p_seed: seed });
    if (error) throw error;
    setHouseholdId(hid);
    await loadHouseholdData(hid);
    await loadMemberships(user.id);
    return hid;
  };
  const leaveHousehold = async (hid) => {
    const { error } = await supabase.rpc("leave_household", { p_household: hid });
    if (error) throw error;
    const { data: profile } = await supabase.from("profiles").select("active_household_id").eq("id", user.id).single();
    if (profile?.active_household_id) {
      setHouseholdId(profile.active_household_id);
      await loadHouseholdData(profile.active_household_id);
    }
    await loadMemberships(user.id);
  };

  const setHH = (patch) => setData((d) => ({ ...d, household: { ...d.household, ...patch } }));
  const addProperty = () => setData((d) => ({ ...d, properties: [...d.properties, emptyProperty()] }));
  const updProperty = (id, patch) => setData((d) => ({ ...d, properties: d.properties.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
  const delProperty = (id) => setData((d) => ({ ...d, properties: d.properties.filter((p) => p.id !== id) }));

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setData(DEFAULTS());
  };

  if (passwordRecovery) return <ResetPasswordScreen onDone={async () => { await supabase.auth.signOut(); setPasswordRecovery(false); }} />;
  if (authLoading) return <div className="p-8 text-stone-500">Loading…</div>;
  if (!user) return <AuthScreen onAuth={setUser} inviteBanner={inviteBanner?.status === "pending" ? inviteBanner : null} />;
  if (!loaded) return <div className="p-8 text-stone-500">Loading your data…</div>;

  const finishOnboarding = (setup) => {
    if (setup) {
      setData((d) => {
        const next = { ...d, household: { ...d.household, ...setup.household } };
        if (setup.addProperty) next.properties = [...d.properties, emptyProperty()];
        if (setup.child) next.children = [...d.children, { id: uid(), name: setup.child.name || "", birthYear: setup.child.birthYear || "", disability: false }];
        return next;
      });
    }
    window.storage.set(ONBOARD_KEY, "1").catch(() => {});
    setOnboard(false);
    setTab("dashboard");
  };
  if (onboard) return <Onboarding onFinish={finishOnboarding} />;

  const tabs = [
    { id: "dashboard", label: "Dashboard", short: "Home", icon: Home },
    { id: "properties", label: "Properties", short: "Property", icon: Building2 },
    { id: "investments", label: "Investments", short: "Invest", icon: PiggyBank },
    { id: "debts", label: "Debts & Bills", short: "Debts", icon: CreditCard },
    { id: "budget", label: "Budget", short: "Budget", icon: Folder },
    { id: "receipts", label: "Receipts", short: "Receipts", icon: Receipt },
    { id: "childcare", label: "Childcare", short: "Kids", icon: Baby },
    { id: "vehicles", label: "Vehicles", short: "Cars", icon: Car },
    { id: "goals", label: "Goals", short: "Goals", icon: Target },
    { id: "household", label: "Household", short: "Setup", icon: Wallet },
    { id: "tax", label: "Tax Report", short: "Tax", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      <header className="bg-white border-b border-stone-200 px-4 sm:px-6 py-3.5 sm:py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Logo size={32} tone="brand" />
            <span className="text-base sm:text-lg font-semibold text-stone-900 tracking-tight">Cabintree</span>
          </div>
          <div className="flex items-center gap-3">
            <HouseholdSwitcher memberships={memberships} activeHouseholdId={householdId} onSwitch={switchHousehold} onCreateFamily={createFamilyHousehold} onLeave={leaveHousehold} />
            <button onClick={handleSignOut} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-700 text-xs sm:text-sm transition"><LogOut size={14} /> <span className="hidden sm:inline">Sign out</span></button>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex overflow-x-auto px-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1.5 px-2 sm:px-3.5 py-2 sm:py-3 text-[10px] sm:text-sm whitespace-nowrap border-b-2 transition-colors ${tab === t.id ? "border-teal-600 text-teal-700 font-medium" : "border-transparent text-stone-500 hover:text-stone-700"}`}>
                <Icon size={14} />
                <span className="sm:hidden">{t.short}</span>
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {inviteBanner && inviteBanner.status !== "pending" && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-3">
          <div className={`rounded-xl px-3 py-2 text-xs flex items-center justify-between gap-2 border ${inviteBanner.status === "accepted" ? "bg-teal-50 border-teal-200 text-teal-800" : "bg-rose-50 border-rose-200 text-rose-700"}`}>
            <span className="flex items-center gap-2"><Users size={14} /> {inviteBanner.status === "accepted" ? "You've joined the shared household." : inviteBanner.message}</span>
            <button onClick={() => setInviteBanner(null)} className="opacity-60 hover:opacity-100">✕</button>
          </div>
        </div>
      )}

      <main className="p-4 sm:p-6 max-w-5xl mx-auto">
        {tab === "dashboard" && <Dashboard data={data} setData={setData} />}
        {tab === "properties" && <Properties properties={data.properties} addProperty={addProperty} updProperty={updProperty} delProperty={delProperty} />}
        {tab === "investments" && <Investments data={data} setData={setData} />}
        {tab === "debts" && <DebtsBills data={data} setData={setData} />}
        {tab === "budget" && <Budget data={data} setData={setData} />}
        {tab === "receipts" && <Receipts data={data} setData={setData} shared={shared} />}
        {tab === "childcare" && <Childcare data={data} setData={setData} />}
        {tab === "vehicles" && <Vehicles data={data} setData={setData} />}
        {tab === "goals" && <Goals data={data} setData={setData} />}
        {tab === "household" && <Household data={data} setHH={setHH} setData={setData} />}
        {tab === "tax" && <TaxReport data={data} setData={setData} />}
      </main>
      <div className="h-8" />
    </div>
  );
}

/* ---------- UI building blocks ---------- */
function NumberField({ label, value, onChange, prefix = "$", className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs text-stone-500">{label}</span>
      <div className="flex items-center mt-0.5 border border-stone-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-teal-500">
        {prefix && <span className="pl-2 text-stone-400 text-sm">{prefix}</span>}
        <input type="number" value={value === 0 ? "" : value} placeholder="0" onChange={(e) => onChange(num(e.target.value))} className="w-full px-2 py-1.5 text-sm bg-transparent outline-none rounded-lg" />
      </div>
    </label>
  );
}
function TextField({ label, value, onChange, placeholder = "", type = "text", required = false, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs text-stone-500">{label}</span>
      <input type={type} value={value || ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} required={required} className="w-full mt-0.5 px-2 py-1.5 text-sm border border-stone-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-teal-500" />
    </label>
  );
}
function CategorySelect({ label = "Category", value, categories, onChange, onAddCategory, emptyLabel, className = "" }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const opts = value && !categories.includes(value) ? [...categories, value] : categories;
  const commit = () => {
    const c = draft.trim();
    if (c) { onAddCategory(c); onChange(c); }
    setDraft(""); setAdding(false);
  };
  if (adding) {
    return (
      <label className={`block ${className}`}>
        <span className="text-xs text-stone-500">{label}</span>
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setDraft(""); setAdding(false); } }}
          placeholder="New category"
          className="w-full mt-0.5 px-2 py-1.5 text-sm border border-teal-400 rounded-lg bg-white outline-none focus:ring-2 focus:ring-teal-500"
        />
      </label>
    );
  }
  return (
    <label className={`block ${className}`}>
      <span className="text-xs text-stone-500">{label}</span>
      <select
        value={value || ""}
        onChange={(e) => { if (e.target.value === "__other__") setAdding(true); else onChange(e.target.value); }}
        className="w-full mt-0.5 px-1 py-1.5 text-xs border border-stone-300 rounded-lg bg-white"
      >
        {emptyLabel != null && <option value="">{emptyLabel}</option>}
        {opts.map((c) => <option key={c}>{c}</option>)}
        <option value="__other__">Other…</option>
      </select>
    </label>
  );
}
function Stat({ label, value, sub, tone = "slate" }) {
  const tones = { slate: "text-stone-800", green: "text-emerald-600", red: "text-rose-600" };
  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4">
      <div className="text-xs text-stone-500">{label}</div>
      <div className={`text-xl font-semibold mt-1 ${tones[tone]}`}>{value}</div>
      {sub && <div className="text-xs text-stone-400 mt-0.5">{sub}</div>}
    </div>
  );
}
function Card({ children, className = "" }) {
  return <div className={`bg-white rounded-2xl border border-stone-200 shadow-sm p-4 ${className}`}>{children}</div>;
}
function ChartCard({ title, children, hint }) {
  return (
    <Card>
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="font-medium text-stone-700 text-sm">{title}</h3>
        {hint && <span className="text-xs text-stone-400">{hint}</span>}
      </div>
      {children}
    </Card>
  );
}

/* ---------- Income & tax-bracket progression ---------- */
function IncomeTracker({ data, setData }) {
  const yr = new Date().getFullYear();
  const t = taxTableFor(yr);
  const provCode = data.household.province || "BC";
  const p = provFor(t, provCode);
  const log = (data.incomeLog || []).filter((e) => (e.date || "").slice(0, 4) === String(yr));
  const hasP2 = (data.household.p2Name && data.household.p2Name !== "Spouse/Partner") || log.some((e) => e.person === "p2");
  const people = hasP2 ? [{ key: "p1", name: data.household.p1Name || "Me" }, { key: "p2", name: data.household.p2Name || "Partner" }] : [{ key: "p1", name: data.household.p1Name || "Me" }];
  const [busy, setBusy] = useState(false);

  const ytdFor = (key) => log.filter((e) => e.person === key).reduce((s, e) => s + num(e.gross), 0);
  const taxFor = (key) => log.filter((e) => e.person === key).reduce((s, e) => s + num(e.taxWithheld), 0);
  // recurring vs one-time split, so bonuses aren't annualized as if they repeat
  const recurringGross = (key) => log.filter((e) => e.person === key && !e.oneTime).reduce((s, e) => s + num(e.gross), 0);
  const recurringTax = (key) => log.filter((e) => e.person === key && !e.oneTime).reduce((s, e) => s + num(e.taxWithheld), 0);
  const oneTimeGross = (key) => log.filter((e) => e.person === key && e.oneTime).reduce((s, e) => s + num(e.gross), 0);
  const oneTimeTax = (key) => log.filter((e) => e.person === key && e.oneTime).reduce((s, e) => s + num(e.taxWithheld), 0);
  const monthsElapsed = (new Date().getMonth() + 1);
  const annualize = (v) => (monthsElapsed > 0 ? (v / monthsElapsed) * 12 : 0);

  const addEntry = (person) => setData((d) => ({ ...d, incomeLog: [{ id: uid(), person, date: new Date().toISOString().slice(0, 10), gross: 0, taxWithheld: 0, oneTime: false, source: "manual" }, ...(d.incomeLog || [])] }));
  const updEntry = (id, patch) => setData((d) => ({ ...d, incomeLog: d.incomeLog.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
  const delEntry = (id) => setData((d) => ({ ...d, incomeLog: d.incomeLog.filter((e) => e.id !== id) }));

  // recurring templates: save a typical paycheque, apply with one tap
  const templates = (data.payTemplates || []);
  const applyTemplate = (tpl) => setData((d) => ({ ...d, incomeLog: [{ id: uid(), person: tpl.person, date: new Date().toISOString().slice(0, 10), gross: num(tpl.gross), taxWithheld: num(tpl.taxWithheld), oneTime: false, source: "template" }, ...(d.incomeLog || [])] }));
  const delTemplate = (id) => setData((d) => ({ ...d, payTemplates: d.payTemplates.filter((x) => x.id !== id) }));
  const saveTemplate = (person) => {
    const last = (data.incomeLog || []).find((e) => e.person === person && !e.oneTime);
    const n = (data.payTemplates || []).filter((t) => t.person === person).length + 1;
    setData((d) => ({ ...d, payTemplates: [...(d.payTemplates || []), { id: uid(), person, name: `Pay template ${n}`, gross: last ? num(last.gross) : 0, taxWithheld: last ? num(last.taxWithheld) : 0 }] }));
  };

  const compress = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => { const img = new Image(); img.onload = () => { const max = 1100; let { width, height } = img; if (width > max || height > max) { const s = max / Math.max(width, height); width = Math.round(width * s); height = Math.round(height * s); } const c = document.createElement("canvas"); c.width = width; c.height = height; c.getContext("2d").drawImage(img, 0, 0, width, height); res(c.toDataURL("image/jpeg", 0.6)); }; img.onerror = rej; img.src = r.result; }; r.onerror = rej; r.readAsDataURL(file);
  });
  const uploadStub = async (person, file) => {
    if (!file) return; setBusy(true);
    try {
      const dataUrl = await compress(file);
      const { default: Tesseract } = await import("tesseract.js");
      const { data: { text } } = await Tesseract.recognize(dataUrl, "eng", { logger: () => {} });
      const { gross, taxWithheld, payDate } = parsePayStubText(text);
      setData((d) => ({ ...d, incomeLog: [{ id: uid(), person, date: payDate || new Date().toISOString().slice(0, 10), gross, taxWithheld, source: "paystub" }, ...(d.incomeLog || [])] }));
    } catch (e) {}
    setBusy(false);
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-medium text-stone-700 text-sm">Income & tax brackets · {yr}</h3>
        <span className="text-xs text-stone-400">{PROV_NAMES[provCode]}</span>
      </div>
      <p className="text-xs text-stone-400 mb-3">Log pay or upload a pay stub — your income fills in across the year, marking each tax bracket you cross and comparing estimated vs. actual tax.</p>

      {people.map((pp) => {
        const ytd = ytdFor(pp.key);
        const withheld = taxFor(pp.key);
        // project: annualize recurring pay, add one-time amounts once
        const projected = annualize(recurringGross(pp.key)) + oneTimeGross(pp.key);
        const projWithholding = annualize(recurringTax(pp.key)) + oneTimeTax(pp.key);
        const projTaxFull = computeTax({ employment: projected }, yr, { province: provCode }).totalTax;
        const projResult = projWithholding - projTaxFull;
        const hasOneTime = oneTimeGross(pp.key) > 0;
        const marginal = marginalAt(ytd, t, p);
        const fedB = t.fed;
        const maxScale = Math.max(projected, ytd, fedB[1][0]) * 1.05 || fedB[1][0];
        const curBracketIdx = fedB.findIndex(([lim]) => ytd <= lim);
        return (
          <div key={pp.key} className="mb-4 last:mb-2">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-sm font-medium text-stone-700">{pp.name}</span>
              <span className="text-xs text-stone-500">YTD {fmt(ytd)} · marginal {marginal.toFixed(0)}%</span>
            </div>
            {/* bracket bar */}
            <div className="relative h-7 rounded-lg overflow-hidden bg-stone-100">
              {fedB.map(([lim, rate], i) => {
                const start = i === 0 ? 0 : fedB[i - 1][0];
                const end = Math.min(lim, maxScale);
                if (start >= maxScale) return null;
                const left = (start / maxScale) * 100;
                const width = ((end - start) / maxScale) * 100;
                const shades = ["#ccfbf1", "#99f6e4", "#5eead4", "#2dd4bf", "#14b8a6"];
                return <div key={i} className="absolute top-0 h-full" style={{ left: `${left}%`, width: `${width}%`, background: shades[Math.min(i, shades.length - 1)], borderRight: "1px solid #fff" }} title={`${(rate * 100).toFixed(0)}% bracket`} />;
              })}
              {/* YTD fill marker */}
              <div className="absolute top-0 h-full bg-teal-700/30 border-r-2 border-teal-800" style={{ width: `${Math.min(100, (ytd / maxScale) * 100)}%` }} />
              {/* projected marker */}
              {projected > ytd && <div className="absolute top-0 h-full border-r-2 border-dashed border-amber-500" style={{ width: `${Math.min(100, (projected / maxScale) * 100)}%` }} title="Projected year-end" />}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-stone-500">
              <span>Crossed into the {curBracketIdx >= 0 ? (fedB[curBracketIdx][1] * 100).toFixed(0) : "top"}% federal bracket</span>
              <span className="text-amber-600">Projected year-end: {fmt(projected)}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2 text-center text-xs">
              <div className="bg-stone-50 rounded-lg p-2"><div className="text-stone-400">Projected full-year tax</div><div className="font-semibold text-sm">{fmt(projTaxFull)}</div></div>
              <div className="bg-stone-50 rounded-lg p-2"><div className="text-stone-400">Projected withholding</div><div className="font-semibold text-sm">{fmt(projWithholding)}</div></div>
              <div className={`rounded-lg p-2 ${projResult >= 0 ? "bg-emerald-50" : "bg-rose-50"}`}><div className="text-stone-400">Projected {projResult >= 0 ? "refund" : "owing"}</div><div className={`font-semibold text-sm ${projResult >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{projResult >= 0 ? "+" : "−"}{fmt(Math.abs(projResult))}</div></div>
            </div>
            <div className="text-xs text-stone-400 mt-1 text-center">So far this year: {fmt(ytd)} earned · {fmt(withheld)} tax withheld{hasOneTime ? ` · incl. ${fmt(oneTimeGross(pp.key))} one-time (not annualized)` : ""}</div>
            <div className="flex flex-wrap gap-3 mt-2 items-center">
              <button onClick={() => addEntry(pp.key)} className="text-xs flex items-center gap-1 text-teal-700"><Plus size={12} /> Log pay</button>
              <label className="text-xs flex items-center gap-1 text-teal-700 cursor-pointer">{busy ? <Sparkles size={12} className="animate-pulse" /> : <Camera size={12} />} Upload pay stub<input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => uploadStub(pp.key, e.target.files[0])} /></label>
              <button onClick={() => saveTemplate(pp.key)} className="text-xs text-stone-500 hover:text-stone-700">Save as template</button>
            </div>
            {/* recurring templates */}
            {templates.filter((tp) => tp.person === pp.key).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {templates.filter((tp) => tp.person === pp.key).map((tp) => (
                  <span key={tp.id} className="flex items-center gap-1.5 bg-teal-50 border border-teal-200 rounded-full pl-3 pr-1.5 py-1 text-xs">
                    <button onClick={() => applyTemplate(tp)} className="text-teal-800 font-medium">{tp.name} · {fmt(tp.gross)}</button>
                    <button onClick={() => delTemplate(tp.id)} className="text-teal-400 hover:text-rose-500">×</button>
                  </span>
                ))}
                <span className="text-xs text-stone-400 self-center">tap to log instantly</span>
              </div>
            )}
            {/* entries */}
            {log.filter((e) => e.person === pp.key).length > 0 && (
              <div className="mt-2 space-y-1.5 border-t border-stone-100 pt-2">
                {log.filter((e) => e.person === pp.key).map((e) => (
                  <div key={e.id} className="grid grid-cols-2 sm:grid-cols-12 gap-2 items-end">
                    <TextField label="Pay date" type="date" value={e.date} onChange={(v) => updEntry(e.id, { date: v })} className="col-span-1 sm:col-span-3" />
                    <NumberField label="Gross" value={e.gross} onChange={(v) => updEntry(e.id, { gross: v })} className="col-span-1 sm:col-span-3" />
                    <NumberField label="Tax withheld" value={e.taxWithheld} onChange={(v) => updEntry(e.id, { taxWithheld: v })} className="col-span-2 sm:col-span-3" />
                    <div className="col-span-2 sm:col-span-3 flex items-center justify-between pb-2">
                      <label className="flex items-center gap-1 text-xs text-stone-600" title="One-time amounts (bonus, lump sum) aren't annualized"><input type="checkbox" checked={!!e.oneTime} onChange={(ev) => updEntry(e.id, { oneTime: ev.target.checked })} /> One-time</label>
                      <button onClick={() => delEntry(e.id)} className="text-rose-400 hover:text-rose-600"><Trash2 size={13} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <p className="text-xs text-stone-400">Projections annualize your recurring pay to a full year and add one-time amounts (tick "1×" for bonuses or lump sums) just once — so a bonus doesn't inflate the projection as if it repeats. It sharpens as more pay periods are logged.</p>
    </Card>
  );
}

/* ---------- Dashboard ---------- */
function Dashboard({ data, setData }) {
  const tot = computeTotals(data);
  const rentMonthly = data.properties.reduce((s, p) => s + monthlyRent(p), 0);
  const mortgagePay = data.properties.reduce((s, p) => s + num(p.mortgage.payment), 0);
  const carPay = data.vehicles.reduce((s, v) => s + num(v.payment), 0);
  const debtPay = (data.debts || []).reduce((s, x) => s + num(x.payment), 0);
  const billsMonthly = (data.bills || []).reduce((s, b) => s + billMonthly(b), 0);
  const netFlow = rentMonthly - mortgagePay - carPay - debtPay - billsMonthly;

  const snaps = [...(data.snapshots || [])].sort((a, b) => a.month.localeCompare(b.month)).slice(-12);
  const cur = snaps[snaps.length - 1], prev = snaps[snaps.length - 2];
  const delta = prev ? tot.netWorth - prev.netWorth : null;

  // insights
  const insights = [];
  if (prev) {
    const dDebt = tot.debt - prev.debt, dSav = tot.savings - prev.savings, dNW = tot.netWorth - prev.netWorth;
    if (dDebt > 1) insights.push({ tone: "bad", text: `Total debt rose ${fmt(dDebt)} since last month — check what's driving it.` });
    else if (dDebt < -1) insights.push({ tone: "good", text: `You paid down ${fmt(-dDebt)} of debt since last month. Keep it up.` });
    if (dSav < -1) insights.push({ tone: "warn", text: `Savings & investments dipped ${fmt(-dSav)} this month.` });
    else if (dSav > 1) insights.push({ tone: "good", text: `Savings & investments grew ${fmt(dSav)} this month.` });
    if (dNW < -1) insights.push({ tone: "warn", text: `Net worth slipped ${fmt(-dNW)} month over month.` });
  }
  if (netFlow < 0) insights.push({ tone: "warn", text: `Rental income doesn't cover your monthly payments by ${fmt(-netFlow)} — the gap comes from employment income.` });
  else if (netFlow > 0 && rentMonthly > 0) insights.push({ tone: "good", text: `Rental income covers your tracked payments with ${fmt(netFlow)} to spare each month.` });
  const goalsTarget = (data.goals || []).reduce((s, g) => s + num(g.target), 0);
  const goalsSaved = (data.goals || []).reduce((s, g) => s + num(g.saved), 0);

  // tips & tricks
  const monthlyBurn = mortgagePay + carPay + debtPay + billsMonthly;
  const liquidCash = num(data.household.cash) + (data.household.accounts || []).reduce((s, a) => s + num(a.balance), 0);
  const emergencyTarget = monthlyBurn * 3;
  const tfsaRoomLeft = num(data.investments?.tfsa?.room) - contribInYear(data.investments?.tfsa?.contributions, data.taxYear);
  const rrspRoomLeft = num(data.investments?.rrsp?.room) - contribInYear(data.investments?.rrsp?.contributions, data.taxYear);
  if (monthlyBurn > 0 && liquidCash > emergencyTarget + 5000 && (tfsaRoomLeft > 0 || rrspRoomLeft > 0)) {
    const room = Math.max(tfsaRoomLeft, rrspRoomLeft);
    const excess = liquidCash - emergencyTarget;
    insights.push({ tone: "good", text: `You have ${fmt(excess)} in cash beyond a 3-month expense buffer — with ${fmt(room)} of ${tfsaRoomLeft >= rrspRoomLeft ? "TFSA" : "RRSP"} room available, there may be room to invest it.` });
  }
  const highRateDebt = (data.debts || []).find((x) => num(x.rate) > 10 && num(x.balance) > 0);
  if (highRateDebt && liquidCash > monthlyBurn + 1000) {
    insights.push({ tone: "warn", text: `${highRateDebt.name || "A debt"} is charging ${num(highRateDebt.rate)}% interest while you're holding ${fmt(liquidCash)} in cash — paying it down could save more than most savings accounts earn.` });
  }
  (data.goals || []).forEach((g) => {
    if (!g.targetDate || !num(g.target)) return;
    const target = new Date(g.targetDate), now = new Date();
    const monthsLeft = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
    const remaining = num(g.target) - num(g.saved);
    if (monthsLeft <= 3 && monthsLeft >= 0 && remaining > num(g.target) * 0.1) {
      insights.push({ tone: "warn", text: `"${g.name || "Your goal"}" is due in ${monthsLeft <= 0 ? "under a month" : `${monthsLeft} month${monthsLeft === 1 ? "" : "s"}`} with ${fmt(remaining)} still to save.` });
    }
  });
  if (tot.debt === 0 && tot.investments > 0) insights.push({ tone: "good", text: `You're debt-free with ${fmt(tot.investments)} invested — consider directing more of your monthly cash flow toward investing.` });
  else if (tot.assets > 0 && tot.debt / tot.assets > 0.8) insights.push({ tone: "warn", text: `Debt makes up ${((tot.debt / tot.assets) * 100).toFixed(0)}% of your assets — a highly leveraged position worth keeping an eye on.` });

  const spend = [
    { name: "Mortgages", value: mortgagePay },
    { name: "Car loans", value: carPay },
    { name: "Debt payments", value: debtPay },
  ];
  const thisMonth = currentMonth();
  const byCat = {};
  (data.bills || []).forEach((b) => { byCat[b.category] = (byCat[b.category] || 0) + billMonthly(b); });
  (data.receipts || []).filter((r) => (r.date || "").slice(0, 7) === thisMonth).forEach((r) => { byCat[r.category] = (byCat[r.category] || 0) + num(r.amount); });
  (data.oneTime || []).filter((o) => (o.date || "").slice(0, 7) === thisMonth).forEach((o) => { byCat[o.category] = (byCat[o.category] || 0) + num(o.amount); });
  Object.entries(byCat).forEach(([k, v]) => spend.push({ name: k, value: v }));
  const spendData = spend.filter((s) => s.value > 0);
  const spendTotal = spendData.reduce((s, x) => s + x.value, 0);

  const toneCls = { good: "bg-emerald-50 border-emerald-200 text-emerald-800", warn: "bg-amber-50 border-amber-200 text-amber-800", bad: "bg-rose-50 border-rose-200 text-rose-800" };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-7">
        <div className="text-stone-400 text-sm font-medium">Net worth</div>
        <div className="text-4xl sm:text-5xl font-semibold tracking-tight mt-1.5">{fmt(tot.netWorth)}</div>
        {delta != null && (
          <div className={`inline-flex items-center gap-1 mt-3 text-sm px-2.5 py-1 rounded-full ${delta >= 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"}`}>
            {delta >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {delta >= 0 ? "+" : "−"}{fmt(Math.abs(delta))} this month
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 mt-5 text-sm">
          <div className="bg-white/5 rounded-2xl p-3"><div className="text-stone-400 text-xs">Assets</div><div className="font-semibold text-lg mt-0.5">{fmt(tot.assets)}</div></div>
          <div className="bg-white/5 rounded-2xl p-3"><div className="text-stone-400 text-xs">Debt</div><div className="font-semibold text-lg mt-0.5">{fmt(tot.debt)}</div></div>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="space-y-2">
          {insights.map((i, idx) => (
            <div key={idx} className={`flex items-start gap-2.5 text-sm rounded-2xl border px-4 py-3 ${toneCls[i.tone]}`}>
              {i.tone === "good" ? <TrendingUp size={16} className="shrink-0 mt-0.5" /> : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
              <span>{i.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Mini stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Property equity" value={fmt(tot.equity)} sub={`${data.properties.length} propert${data.properties.length === 1 ? "y" : "ies"}`} />
        <Stat label="Investments" value={fmt(tot.investments)} sub="RRSP · TFSA · RESP" />
        <Stat label="Total debt" value={fmt(tot.debt)} tone="red" sub="Mortgages, loans, cards" />
        <Stat label="Net flow / mo" value={fmt(netFlow)} tone={netFlow >= 0 ? "green" : "red"} sub="Rent − payments" />
      </div>

      {/* Income & bracket tracker */}
      <IncomeTracker data={data} setData={setData} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ChartCard title="Net worth trend" hint={snaps.length < 2 ? "builds monthly" : ""}>
          {snaps.length < 2 ? <Placeholder /> : (
            <ResponsiveContainer width="100%" height={170}>
              <AreaChart data={snaps} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs><linearGradient id="nw" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0d9488" stopOpacity={0.4} /><stop offset="100%" stopColor="#0d9488" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0eee8" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#a8a29e" }} />
                <YAxis tick={{ fontSize: 10, fill: "#a8a29e" }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} width={36} />
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Area type="monotone" dataKey="netWorth" stroke="#0d9488" strokeWidth={2} fill="url(#nw)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Debt paydown" hint={snaps.length < 2 ? "builds monthly" : ""}>
          {snaps.length < 2 ? <Placeholder /> : (
            <ResponsiveContainer width="100%" height={170}>
              <LineChart data={snaps} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0eee8" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#a8a29e" }} />
                <YAxis tick={{ fontSize: 10, fill: "#a8a29e" }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} width={36} />
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Line type="monotone" dataKey="debt" stroke="#e11d48" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Savings & investments" hint={snaps.length < 2 ? "builds monthly" : ""}>
          {snaps.length < 2 ? <Placeholder /> : (
            <ResponsiveContainer width="100%" height={170}>
              <AreaChart data={snaps} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs><linearGradient id="sv" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0891b2" stopOpacity={0.4} /><stop offset="100%" stopColor="#0891b2" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0eee8" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#a8a29e" }} />
                <YAxis tick={{ fontSize: 10, fill: "#a8a29e" }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} width={36} />
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Area type="monotone" dataKey="savings" stroke="#0891b2" strokeWidth={2} fill="url(#sv)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
          {goalsTarget > 0 && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-stone-500 mb-1"><span>Goals progress</span><span>{fmt(goalsSaved)} / {fmt(goalsTarget)}</span></div>
              <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden"><div className="bg-teal-500 h-full" style={{ width: `${Math.min(100, (goalsSaved / goalsTarget) * 100)}%` }} /></div>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Monthly spending" hint={spendTotal > 0 ? fmt(spendTotal) + "/mo" : ""}>
          {spendData.length === 0 ? <Placeholder text="Add bills, receipts, or expenses to see this" /> : (
            <div className="flex items-center gap-2">
              <ResponsiveContainer width="55%" height={170}>
                <PieChart>
                  <Pie data={spendData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={38} outerRadius={70} paddingAngle={2}>
                    {spendData.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1 text-xs">
                {spendData.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE[i % PIE.length] }} />
                    <span className="text-stone-600 flex-1 truncate">{s.name}</span>
                    <span className="text-stone-500">{fmt(s.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      {/* Year in review */}
      <YearOverview data={data} />

      {/* Properties */}
      <Card>
        <h3 className="font-medium text-stone-700 mb-3 text-sm">Properties at a glance</h3>
        {data.properties.length === 0 ? <p className="text-sm text-stone-400">No properties yet — add them in the Properties tab.</p> : (
          <div className="space-y-2">
            {data.properties.map((p) => {
              const eq = propEquity(p);
              const ltv = num(p.currentValue) ? (num(p.mortgage.balance) / num(p.currentValue)) * 100 : 0;
              return (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-stone-100 last:border-0">
                  <div><div className="font-medium text-sm">{p.name}</div><div className="text-xs text-stone-400">{p.address || "No address"}</div></div>
                  <div className="flex gap-5 text-sm">
                    <div><span className="text-xs text-stone-400 block">Value</span>{fmt(p.currentValue)}</div>
                    <div><span className="text-xs text-stone-400 block">Equity</span><span className={eq >= 0 ? "text-emerald-600" : "text-rose-600"}>{fmt(eq)}</span></div>
                    <div><span className="text-xs text-stone-400 block">LTV</span>{ltv.toFixed(0)}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="bg-amber-50 border-amber-200">
        <div className="flex gap-2 text-sm text-amber-800"><AlertCircle size={18} className="shrink-0 mt-0.5" /><p>Trend charts fill in as the months pass. Values are entered manually — keep them current. This isn't financial or tax advice.</p></div>
      </Card>
    </div>
  );
}
function Placeholder({ text = "Two months of data needed" }) {
  return <div className="h-[170px] flex items-center justify-center text-xs text-stone-400 bg-stone-50 rounded-xl">{text}</div>;
}

function YearOverview({ data }) {
  const allSnaps = [...(data.snapshots || [])].sort((a, b) => a.month.localeCompare(b.month));
  const thisYear = String(new Date().getFullYear());
  const availYears = [...new Set(allSnaps.map((s) => s.month.slice(0, 4)))].sort().reverse();
  const [year, setYear] = useState(thisYear);

  if (allSnaps.length === 0) return null;

  const ySnaps = allSnaps.filter((s) => s.month.startsWith(year));
  const startSnap = ySnaps[0];
  const endSnap = ySnaps[ySnaps.length - 1];

  const nwChange = startSnap && endSnap && ySnaps.length > 1 ? endSnap.netWorth - startSnap.netWorth : null;
  const debtChange = startSnap && endSnap && ySnaps.length > 1 ? endSnap.debt - startSnap.debt : null;
  const savChange = startSnap && endSnap && ySnaps.length > 1 ? endSnap.savings - startSnap.savings : null;
  const income = (data.incomeLog || []).filter((e) => (e.date || "").startsWith(year)).reduce((s, e) => s + num(e.gross), 0);
  const receiptsTotal = (data.receipts || []).filter((r) => (r.date || "").startsWith(year)).reduce((s, r) => s + num(r.amount), 0);

  let best = null, worst = null;
  for (let i = 1; i < ySnaps.length; i++) {
    const chg = ySnaps[i].netWorth - ySnaps[i - 1].netWorth;
    if (best === null || chg > best.chg) best = { month: ySnaps[i].month, chg };
    if (worst === null || chg < worst.chg) worst = { month: ySnaps[i].month, chg };
  }

  return (
    <ChartCard title="Year in review">
      {availYears.length > 0 && (
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {availYears.map((y) => (
            <button key={y} onClick={() => setYear(y)} className={`px-2.5 py-1 rounded-full text-xs font-medium ${year === y ? "bg-teal-600 text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200"}`}>{y}</button>
          ))}
        </div>
      )}

      {ySnaps.length === 0 && <p className="text-sm text-stone-400">No data recorded for {year} yet.</p>}

      {ySnaps.length >= 2 && (
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={ySnaps} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="yrNw" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0d9488" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0eee8" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#a8a29e" }} />
            <YAxis tick={{ fontSize: 10, fill: "#a8a29e" }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} width={36} />
            <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Area type="monotone" dataKey="netWorth" stroke="#0d9488" strokeWidth={2} fill="url(#yrNw)" name="Net worth" />
            <Line type="monotone" dataKey="debt" stroke="#e11d48" strokeWidth={1.5} dot={false} name="Debt" />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {ySnaps.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
            {endSnap && <div className="bg-stone-50 rounded-xl p-2.5"><div className="text-xs text-stone-400">{year === thisYear ? "Current" : "Year-end"} net worth</div><div className="font-semibold text-sm mt-0.5">{fmt(endSnap.netWorth)}</div></div>}
            {nwChange !== null && <div className="bg-stone-50 rounded-xl p-2.5"><div className="text-xs text-stone-400">Net worth change</div><div className={`font-semibold text-sm mt-0.5 ${nwChange >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{nwChange >= 0 ? "+" : "−"}{fmt(Math.abs(nwChange))}</div></div>}
            {debtChange !== null && <div className="bg-stone-50 rounded-xl p-2.5"><div className="text-xs text-stone-400">Debt change</div><div className={`font-semibold text-sm mt-0.5 ${debtChange <= 0 ? "text-emerald-600" : "text-rose-600"}`}>{debtChange <= 0 ? "−" : "+"}{fmt(Math.abs(debtChange))}</div></div>}
            {savChange !== null && <div className="bg-stone-50 rounded-xl p-2.5"><div className="text-xs text-stone-400">Savings change</div><div className={`font-semibold text-sm mt-0.5 ${savChange >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{savChange >= 0 ? "+" : "−"}{fmt(Math.abs(savChange))}</div></div>}
            {income > 0 && <div className="bg-stone-50 rounded-xl p-2.5"><div className="text-xs text-stone-400">Gross income logged</div><div className="font-semibold text-sm mt-0.5">{fmt(income)}</div></div>}
            {receiptsTotal > 0 && <div className="bg-stone-50 rounded-xl p-2.5"><div className="text-xs text-stone-400">Receipts tracked</div><div className="font-semibold text-sm mt-0.5">{fmt(receiptsTotal)}</div></div>}
          </div>
          {ySnaps.length >= 2 && (best || worst) && (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
              {best && best.chg > 0 && <span className="text-emerald-600">Best month: <strong>{best.month}</strong> (+{fmt(best.chg)})</span>}
              {worst && worst.chg < 0 && <span className="text-rose-600">Toughest month: <strong>{worst.month}</strong> (−{fmt(Math.abs(worst.chg))})</span>}
            </div>
          )}
          {availYears.length > 1 && (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs text-stone-600">
                <thead><tr className="text-stone-400 border-b border-stone-100"><th className="text-left py-1 font-normal">Year</th><th className="text-right font-normal">Year-end NW</th><th className="text-right font-normal">Change</th><th className="text-right font-normal">Income</th></tr></thead>
                <tbody>
                  {availYears.map((y) => {
                    const yS = allSnaps.filter((s) => s.month.startsWith(y));
                    const end = yS[yS.length - 1];
                    const start = yS[0];
                    const chg = end && start && yS.length > 1 ? end.netWorth - start.netWorth : null;
                    const inc = (data.incomeLog || []).filter((e) => (e.date || "").startsWith(y)).reduce((s, e) => s + num(e.gross), 0);
                    return (
                      <tr key={y} onClick={() => setYear(y)} className={`border-b border-stone-50 cursor-pointer hover:bg-stone-50 ${year === y ? "bg-teal-50" : ""}`}>
                        <td className="py-1.5 font-medium">{y}</td>
                        <td className="text-right">{end ? fmt(end.netWorth) : "—"}</td>
                        <td className={`text-right ${chg == null ? "" : chg >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{chg == null ? "—" : `${chg >= 0 ? "+" : "−"}${fmt(Math.abs(chg))}`}</td>
                        <td className="text-right">{inc > 0 ? fmt(inc) : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </ChartCard>
  );
}

/* ---------- Properties ---------- */
function Properties({ properties, addProperty, updProperty, delProperty }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="font-medium text-stone-700">Rental properties</h2>
        <button onClick={addProperty} className="flex items-center gap-1 text-sm bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700"><Plus size={15} /> Add property</button>
      </div>
      {properties.length === 0 && <p className="text-sm text-stone-400">No properties yet. Add your first one above.</p>}
      {properties.map((p) => <PropertyCard key={p.id} p={p} open={open === p.id} toggle={() => setOpen(open === p.id ? null : p.id)} upd={(patch) => updProperty(p.id, patch)} del={() => delProperty(p.id)} />)}
    </div>
  );
}
function PropertyCard({ p, open, toggle, upd, del }) {
  const eq = propEquity(p);
  const setMortgage = (patch) => upd({ mortgage: { ...p.mortgage, ...patch } });
  const setExpense = (code, v) => upd({ expenses: { ...p.expenses, [code]: v } });
  const amort = amortize(p.mortgage.balance, p.mortgage.rate, p.mortgage.payment);
  const addTenant = () => upd({ tenants: [...(p.tenants || []), { id: uid(), name: "", unit: "", rent: 0, leaseEnd: "" }] });
  const updTenant = (id, patch) => upd({ tenants: p.tenants.map((t) => (t.id === id ? { ...t, ...patch } : t)) });
  const delTenant = (id) => upd({ tenants: p.tenants.filter((t) => t.id !== id) });
  const addRepair = () => upd({ repairs: [...(p.repairs || []), { id: uid(), date: "", description: "", amount: 0, kind: "current", scope: "rental" }] });
  const updRepair = (id, patch) => upd({ repairs: p.repairs.map((r) => (r.id === id ? { ...r, ...patch } : r)) });
  const delRepair = (id) => upd({ repairs: p.repairs.filter((r) => r.id !== id) });

  return (
    <Card className="!p-0 overflow-hidden">
      <button onClick={toggle} className="w-full flex items-center justify-between p-4 hover:bg-stone-50">
        <div className="flex items-center gap-2 text-left">
          {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          <div><div className="font-medium">{p.name}</div><div className="text-xs text-stone-400">{p.occupancy === "partial" ? `Mixed-use · ${p.personalUsePct}% personal` : "Fully rented"}</div></div>
        </div>
        <div className="text-right text-sm"><div className="text-xs text-stone-400">Equity</div><div className={eq >= 0 ? "text-emerald-600" : "text-rose-600"}>{fmt(eq)}</div></div>
      </button>
      {open && (
        <div className="border-t border-stone-100 p-4 space-y-5">
          <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <TextField label="Name / nickname" value={p.name} onChange={(v) => upd({ name: v })} className="col-span-2 sm:col-span-1" />
            <TextField label="Address" value={p.address} onChange={(v) => upd({ address: v })} className="col-span-2" />
            <NumberField label="Purchase price" value={p.purchasePrice} onChange={(v) => upd({ purchasePrice: v })} />
            <TextField label="Purchase date" type="date" value={p.purchaseDate} onChange={(v) => upd({ purchaseDate: v })} />
            <NumberField label="Your ownership %" prefix="" value={p.ownershipPct} onChange={(v) => upd({ ownershipPct: v })} />
            <NumberField label="Current value (manual)" value={p.currentValue} onChange={(v) => upd({ currentValue: v })} />
            <TextField label="Value last updated" type="date" value={p.valueUpdated} onChange={(v) => upd({ valueUpdated: v })} />
            <label className="block"><span className="text-xs text-stone-500">Occupancy</span>
              <select value={p.occupancy} onChange={(e) => upd({ occupancy: e.target.value, personalUsePct: e.target.value === "full" ? 0 : p.personalUsePct })} className="w-full mt-0.5 px-2 py-1.5 text-sm border border-stone-300 rounded-lg bg-white">
                <option value="full">Fully rented out</option><option value="partial">I live in part of it</option>
              </select>
            </label>
            {p.occupancy === "partial" && <NumberField label="Personal-use %" prefix="" value={p.personalUsePct} onChange={(v) => upd({ personalUsePct: v })} />}
          </section>

          <section>
            <h4 className="text-sm font-medium text-stone-600 mb-2">Mortgage, equity & payoff</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <NumberField label="Balance owing" value={p.mortgage.balance} onChange={(v) => setMortgage({ balance: v })} />
              <NumberField label="Interest rate %" prefix="" value={p.mortgage.rate} onChange={(v) => setMortgage({ rate: v })} />
              <NumberField label="Monthly payment" value={p.mortgage.payment} onChange={(v) => setMortgage({ payment: v })} />
              <div className="bg-stone-50 rounded-lg p-2 text-xs"><div className="text-stone-400">Equity / LTV</div><div className="font-medium text-sm">{fmt(eq)}</div><div className="text-stone-400">{num(p.currentValue) ? ((num(p.mortgage.balance) / num(p.currentValue)) * 100).toFixed(0) : 0}% LTV</div></div>
            </div>
            {amort && amort.neverPaysOff && <p className="text-xs text-rose-500 mt-2 flex items-center gap-1"><AlertCircle size={13} /> Payment too low to cover interest — the balance never clears.</p>}
            {amort && !amort.neverPaysOff && (
              <div className="mt-3 bg-stone-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs font-medium text-stone-600 mb-2"><TrendingDown size={14} /> Payoff projection</div>
                <div className="grid grid-cols-3 gap-2 text-center mb-2">
                  <div><div className="text-sm font-semibold text-stone-700">{amort.years.toFixed(1)} yrs</div><div className="text-xs text-stone-400">to payoff</div></div>
                  <div><div className="text-sm font-semibold text-stone-700">{fmtMonthYear(amort.payoffDate)}</div><div className="text-xs text-stone-400">payoff date</div></div>
                  <div><div className="text-sm font-semibold text-rose-600">{fmt(amort.totalInterest)}</div><div className="text-xs text-stone-400">total interest</div></div>
                </div>
                <ResponsiveContainer width="100%" height={110}>
                  <AreaChart data={amort.series} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                    <defs><linearGradient id={`g-${p.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0d9488" stopOpacity={0.4} /><stop offset="100%" stopColor="#0d9488" stopOpacity={0} /></linearGradient></defs>
                    <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#a8a29e" }} tickFormatter={(y) => `${y}y`} />
                    <YAxis tick={{ fontSize: 10, fill: "#a8a29e" }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} width={34} />
                    <Tooltip formatter={(v) => fmt(v)} labelFormatter={(y) => `Year ${y}`} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Area type="monotone" dataKey="balance" stroke="#0d9488" strokeWidth={2} fill={`url(#g-${p.id})`} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
            <p className="text-xs text-stone-400 mt-1.5">Est. annual interest ≈ {fmt(propAnnualInterestEstimate(p))} — use your lender's figure for line 8710.</p>
          </section>

          <section>
            <div className="flex justify-between items-center mb-2"><h4 className="text-sm font-medium text-stone-600">Tenants</h4><button onClick={addTenant} className="text-xs flex items-center gap-1 text-teal-700"><Plus size={13} /> Add tenant</button></div>
            {(p.tenants || []).length === 0 && <p className="text-xs text-stone-400">No tenants added.</p>}
            <div className="space-y-2">
              {(p.tenants || []).map((t) => (
                <div key={t.id} className="grid grid-cols-12 gap-2 items-end">
                  <TextField label="Name" value={t.name} onChange={(v) => updTenant(t.id, { name: v })} className="col-span-4" />
                  <TextField label="Unit" value={t.unit} onChange={(v) => updTenant(t.id, { unit: v })} className="col-span-2" />
                  <NumberField label="Rent/mo" value={t.rent} onChange={(v) => updTenant(t.id, { rent: v })} className="col-span-3" />
                  <TextField label="Lease end" type="date" value={t.leaseEnd} onChange={(v) => updTenant(t.id, { leaseEnd: v })} className="col-span-2" />
                  <button onClick={() => delTenant(t.id)} className="col-span-1 text-rose-400 hover:text-rose-600 pb-2"><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
            {monthlyRent(p) > 0 && <p className="text-xs text-stone-500 mt-1.5">Gross rent: {fmt(monthlyRent(p))}/mo · {fmt(monthlyRent(p) * 12)}/yr</p>}
          </section>

          <section>
            <h4 className="text-sm font-medium text-stone-600 mb-2">Annual operating expenses (T776 lines)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{T776_LINES.map((line) => <NumberField key={line.code} label={`${line.code} · ${line.label}`} value={p.expenses[line.code] || 0} onChange={(v) => setExpense(line.code, v)} />)}</div>
            <p className="text-xs text-stone-400 mt-1.5">Line 8960 fills automatically from the repairs log below.</p>
          </section>

          <section>
            <div className="flex justify-between items-center mb-2"><h4 className="text-sm font-medium text-stone-600">Repairs & improvements log</h4><button onClick={addRepair} className="text-xs flex items-center gap-1 text-teal-700"><Plus size={13} /> Add entry</button></div>
            {(p.repairs || []).length === 0 && <p className="text-xs text-stone-400">Current repairs → deductible now (8960). Capital improvements → tracked for CCA.</p>}
            <div className="space-y-2">
              {(p.repairs || []).map((r) => (
                <div key={r.id} className="grid grid-cols-12 gap-2 items-end bg-stone-50 rounded-lg p-2">
                  <TextField label="Date" type="date" value={r.date} onChange={(v) => updRepair(r.id, { date: v })} className="col-span-3" />
                  <TextField label="Description" value={r.description} onChange={(v) => updRepair(r.id, { description: v })} className="col-span-4" />
                  <NumberField label="Amount" value={r.amount} onChange={(v) => updRepair(r.id, { amount: v })} className="col-span-2" />
                  <label className="col-span-2"><span className="text-xs text-stone-500">Type</span>
                    <select value={r.kind} onChange={(e) => updRepair(r.id, { kind: e.target.value })} className="w-full mt-0.5 px-1 py-1.5 text-xs border border-stone-300 rounded-lg bg-white"><option value="current">Current</option><option value="capital">Capital</option></select>
                  </label>
                  <button onClick={() => delRepair(r.id)} className="col-span-1 text-rose-400 hover:text-rose-600 pb-2"><Trash2 size={15} /></button>
                  {p.occupancy === "partial" && (
                    <label className="col-span-12 sm:col-span-4"><span className="text-xs text-stone-500">Scope</span>
                      <select value={r.scope} onChange={(e) => updRepair(r.id, { scope: e.target.value })} className="w-full mt-0.5 px-1 py-1.5 text-xs border border-stone-300 rounded-lg bg-white"><option value="rental">Rental only (100%)</option><option value="shared">Whole building (prorate)</option></select>
                    </label>
                  )}
                </div>
              ))}
            </div>
          </section>

          <div className="flex justify-end pt-2 border-t border-stone-100"><button onClick={del} className="text-sm flex items-center gap-1 text-rose-500 hover:text-rose-700"><Trash2 size={15} /> Delete property</button></div>
        </div>
      )}
    </Card>
  );
}

/* ---------- Investments ---------- */
function ContribList({ list, onAdd, onUpd, onDel, label }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5"><span className="text-xs font-medium text-stone-500">{label}</span><button onClick={onAdd} className="text-xs flex items-center gap-1 text-teal-700"><Plus size={12} /> Add</button></div>
      <div className="space-y-1.5">
        {(list || []).map((c) => (
          <div key={c.id} className="grid grid-cols-12 gap-2 items-end">
            <TextField label="Date" type="date" value={c.date} onChange={(v) => onUpd(c.id, { date: v })} className="col-span-6" />
            <NumberField label="Amount" value={c.amount} onChange={(v) => onUpd(c.id, { amount: v })} className="col-span-5" />
            <button onClick={() => onDel(c.id)} className="col-span-1 text-rose-400 hover:text-rose-600 pb-2"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
function Investments({ data, setData }) {
  const year = data.taxYear;
  const inv = data.investments || emptyInvestments();
  const setInv = (key, patch) => setData((d) => ({ ...d, investments: { ...d.investments, [key]: { ...d.investments[key], ...patch } } }));
  const contribOps = (key) => ({
    onAdd: () => setInv(key, { contributions: [...(inv[key].contributions || []), { id: uid(), date: "", amount: 0 }] }),
    onUpd: (id, patch) => setInv(key, { contributions: inv[key].contributions.map((c) => (c.id === id ? { ...c, ...patch } : c)) }),
    onDel: (id) => setInv(key, { contributions: inv[key].contributions.filter((c) => c.id !== id) }),
  });
  const rrspThisYear = contribInYear(inv.rrsp.contributions, year);
  const tfsaThisYear = contribInYear(inv.tfsa.contributions, year);
  const tfsaRemaining = num(inv.tfsa.room) - tfsaThisYear;
  const respThisYear = contribInYear(inv.resp.contributions, year);
  const cesg = Math.min(respThisYear * 0.2, 500);
  const fhsa = inv.fhsa || { room: 8000, value: 0, contributions: [] };
  const fhsaThisYear = contribInYear(fhsa.contributions, year);
  const fhsaRemaining = num(fhsa.room) - fhsaThisYear;
  const addNonreg = () => setData((d) => ({ ...d, investments: { ...d.investments, nonreg: [...d.investments.nonreg, { id: uid(), name: "", value: 0, bookCost: 0 }] } }));
  const updNonreg = (id, patch) => setData((d) => ({ ...d, investments: { ...d.investments, nonreg: d.investments.nonreg.map((n) => (n.id === id ? { ...n, ...patch } : n)) } }));
  const delNonreg = (id) => setData((d) => ({ ...d, investments: { ...d.investments, nonreg: d.investments.nonreg.filter((n) => n.id !== id) } }));
  const nonregValue = inv.nonreg.reduce((s, n) => s + num(n.value), 0);
  const nonregGain = inv.nonreg.reduce((s, n) => s + (num(n.value) - num(n.bookCost)), 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Total invested" value={fmt(investTotal(inv))} sub="All accounts" />
        <Stat label="RRSP deduction" value={fmt(rrspThisYear)} sub={`${year} · line 20800`} tone="green" />
        <Stat label="FHSA deduction" value={fmt(fhsaThisYear)} sub={`${year} · line 20805`} tone="green" />
        <Stat label="TFSA room left" value={fmt(tfsaRemaining)} tone={tfsaRemaining < 0 ? "red" : "slate"} sub={tfsaRemaining < 0 ? "Over-contributed!" : "Available"} />
      </div>
      <Card>
        <h3 className="font-medium text-stone-700 mb-3">RRSP — Retirement Savings</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <NumberField label="Deduction limit (from NOA)" value={inv.rrsp.room} onChange={(v) => setInv("rrsp", { room: v })} />
          <NumberField label="Current value" value={inv.rrsp.value} onChange={(v) => setInv("rrsp", { value: v })} />
          <div className="bg-stone-50 rounded-lg p-2 text-xs"><div className="text-stone-400">Contributed {year}</div><div className="font-medium text-sm">{fmt(rrspThisYear)}</div></div>
          <div className="bg-stone-50 rounded-lg p-2 text-xs"><div className="text-stone-400">Room left</div><div className={`font-medium text-sm ${num(inv.rrsp.room) - rrspThisYear < 0 ? "text-rose-600" : "text-emerald-600"}`}>{fmt(num(inv.rrsp.room) - rrspThisYear)}</div></div>
        </div>
        <ContribList list={inv.rrsp.contributions} label="Contributions" {...contribOps("rrsp")} />
        <p className="text-xs text-stone-400 mt-2">Reduces taxable income (line 20800). 2026 dollar-limit ceiling is $33,810; your limit is on your Notice of Assessment.</p>
      </Card>
      <Card>
        <h3 className="font-medium text-stone-700 mb-3">TFSA — Tax-Free Savings</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <NumberField label="Contribution room" value={inv.tfsa.room} onChange={(v) => setInv("tfsa", { room: v })} />
          <NumberField label="Current value" value={inv.tfsa.value} onChange={(v) => setInv("tfsa", { value: v })} />
          <div className="bg-stone-50 rounded-lg p-2 text-xs"><div className="text-stone-400">Contributed {year}</div><div className="font-medium text-sm">{fmt(tfsaThisYear)}</div></div>
          <div className="bg-stone-50 rounded-lg p-2 text-xs"><div className="text-stone-400">Room left</div><div className={`font-medium text-sm ${tfsaRemaining < 0 ? "text-rose-600" : "text-emerald-600"}`}>{fmt(tfsaRemaining)}</div></div>
        </div>
        <ContribList list={inv.tfsa.contributions} label="Contributions" {...contribOps("tfsa")} />
        <p className="text-xs text-stone-400 mt-2">Tax-free growth. Annual limit $7,000 (2024–2026); over-contributions cost 1%/month.</p>
      </Card>
      <Card>
        <h3 className="font-medium text-stone-700 mb-3">RESP — Education Savings</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <NumberField label="Current value" value={inv.resp.value} onChange={(v) => setInv("resp", { value: v })} />
          <div className="bg-stone-50 rounded-lg p-2 text-xs"><div className="text-stone-400">Contributed {year}</div><div className="font-medium text-sm">{fmt(respThisYear)}</div></div>
          <div className="bg-emerald-50 rounded-lg p-2 text-xs"><div className="text-emerald-600">Est. CESG {year}</div><div className="font-medium text-sm text-emerald-700">{fmt(cesg)}</div></div>
          <div className="bg-stone-50 rounded-lg p-2 text-xs"><div className="text-stone-400">To max grant</div><div className="font-medium text-sm">{fmt(Math.max(0, 2500 - respThisYear))}</div></div>
        </div>
        <ContribList list={inv.resp.contributions} label="Contributions" {...contribOps("resp")} />
        <p className="text-xs text-stone-400 mt-2">Government adds 20% (up to $500/yr per child, $7,200 lifetime). Lifetime contribution cap $50,000 per child.</p>
      </Card>
      <Card>
        <h3 className="font-medium text-stone-700 mb-3">FHSA — First Home Savings Account</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <NumberField label="Contribution room" value={fhsa.room} onChange={(v) => setInv("fhsa", { room: v })} />
          <NumberField label="Current value" value={fhsa.value} onChange={(v) => setInv("fhsa", { value: v })} />
          <div className="bg-stone-50 rounded-lg p-2 text-xs"><div className="text-stone-400">Contributed {year}</div><div className="font-medium text-sm">{fmt(fhsaThisYear)}</div></div>
          <div className="bg-stone-50 rounded-lg p-2 text-xs"><div className="text-stone-400">Room left</div><div className={`font-medium text-sm ${fhsaRemaining < 0 ? "text-rose-600" : "text-emerald-600"}`}>{fmt(fhsaRemaining)}</div></div>
        </div>
        <ContribList list={fhsa.contributions} label="Contributions" {...contribOps("fhsa")} />
        <p className="text-xs text-stone-400 mt-2">Best of both worlds for a first home: contributions are tax-deductible like an RRSP (line 20805) and withdrawals for a qualifying home are tax-free like a TFSA. $8,000/year, $40,000 lifetime. Carry forward up to $8,000 of unused room.</p>
      </Card>
      <Card>
        <div className="flex justify-between items-center mb-3"><h3 className="font-medium text-stone-700">Non-registered investments</h3><button onClick={addNonreg} className="text-sm flex items-center gap-1 text-teal-700"><Plus size={14} /> Add holding</button></div>
        {inv.nonreg.length === 0 && <p className="text-sm text-stone-400">Add taxable holdings. Book cost tracks unrealized gains.</p>}
        <div className="space-y-2">
          {inv.nonreg.map((n) => (
            <div key={n.id} className="grid grid-cols-12 gap-2 items-end">
              <TextField label="Holding" value={n.name} onChange={(v) => updNonreg(n.id, { name: v })} className="col-span-5" />
              <NumberField label="Market value" value={n.value} onChange={(v) => updNonreg(n.id, { value: v })} className="col-span-3" />
              <NumberField label="Book cost" value={n.bookCost} onChange={(v) => updNonreg(n.id, { bookCost: v })} className="col-span-3" />
              <button onClick={() => delNonreg(n.id)} className="col-span-1 text-rose-400 hover:text-rose-600 pb-2"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
        {inv.nonreg.length > 0 && <p className="text-sm text-stone-600 mt-3 pt-2 border-t border-stone-100">Value {fmt(nonregValue)} · Unrealized gain <span className={nonregGain >= 0 ? "text-emerald-600" : "text-rose-600"}>{fmt(nonregGain)}</span> <span className="text-xs text-stone-400">(50% of realized gains taxable)</span></p>}
      </Card>
    </div>
  );
}

/* ---------- Debts & Bills ---------- */
function DebtsBills({ data, setData }) {
  const cats = data.receiptCategories || [];
  const addCat = (c) => { if (c && !cats.includes(c)) setData((d) => ({ ...d, receiptCategories: [...(d.receiptCategories || []), c] })); };
  const debts = data.debts || [];
  const addDebt = () => setData((d) => ({ ...d, debts: [...(d.debts || []), { id: uid(), name: "", type: "Credit card", balance: 0, limit: 0, rate: 0, payment: 0 }] }));
  const updDebt = (id, patch) => setData((d) => ({ ...d, debts: d.debts.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
  const delDebt = (id) => setData((d) => ({ ...d, debts: d.debts.filter((x) => x.id !== id) }));
  const bills = data.bills || [];
  const addBill = () => setData((d) => ({ ...d, bills: [...(d.bills || []), { id: uid(), name: "", amount: 0, category: "Phone/Internet", frequency: "monthly" }] }));
  const updBill = (id, patch) => setData((d) => ({ ...d, bills: d.bills.map((b) => (b.id === id ? { ...b, ...patch } : b)) }));
  const delBill = (id) => setData((d) => ({ ...d, bills: d.bills.filter((b) => b.id !== id) }));
  const totalDebt = debts.reduce((s, x) => s + num(x.balance), 0);
  const totalDebtPay = debts.reduce((s, x) => s + num(x.payment), 0);
  const monthlyInterest = debts.reduce((s, x) => s + num(x.balance) * (num(x.rate) / 100 / 12), 0);
  const billsMonthly = bills.reduce((s, b) => s + billMonthly(b), 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Consumer debt" value={fmt(totalDebt)} tone="red" sub="LOC + cards" />
        <Stat label="Monthly payments" value={fmt(totalDebtPay)} />
        <Stat label="Interest / mo" value={fmt(monthlyInterest)} tone="red" />
      </div>
      <Card>
        <div className="flex justify-between items-center mb-3"><h3 className="font-medium text-stone-700">Lines of credit & credit cards</h3><button onClick={addDebt} className="text-sm flex items-center gap-1 text-teal-700"><Plus size={14} /> Add debt</button></div>
        {debts.length === 0 && <p className="text-sm text-stone-400">Add lines of credit, credit cards, or other consumer debt.</p>}
        <div className="space-y-3">
          {debts.map((x) => {
            const util = num(x.limit) ? Math.min(100, (num(x.balance) / num(x.limit)) * 100) : 0;
            return (
              <div key={x.id} className="bg-stone-50 rounded-xl p-3">
                <div className="grid grid-cols-12 gap-2 items-end">
                  <TextField label="Name" value={x.name} onChange={(v) => updDebt(x.id, { name: v })} className="col-span-6 sm:col-span-3" />
                  <label className="col-span-6 sm:col-span-2"><span className="text-xs text-stone-500">Type</span>
                    <select value={x.type} onChange={(e) => updDebt(x.id, { type: e.target.value })} className="w-full mt-0.5 px-1 py-1.5 text-xs border border-stone-300 rounded-lg bg-white">{["Credit card", "Line of credit", "Personal loan", "Other"].map((t) => <option key={t}>{t}</option>)}</select>
                  </label>
                  <NumberField label="Balance" value={x.balance} onChange={(v) => updDebt(x.id, { balance: v })} className="col-span-4 sm:col-span-2" />
                  <NumberField label="Limit" value={x.limit} onChange={(v) => updDebt(x.id, { limit: v })} className="col-span-4 sm:col-span-2" />
                  <NumberField label="Rate %" prefix="" value={x.rate} onChange={(v) => updDebt(x.id, { rate: v })} className="col-span-3 sm:col-span-1" />
                  <NumberField label="Pmt/mo" value={x.payment} onChange={(v) => updDebt(x.id, { payment: v })} className="col-span-3 sm:col-span-1" />
                  <button onClick={() => delDebt(x.id)} className="col-span-1 text-rose-400 hover:text-rose-600 pb-2"><Trash2 size={15} /></button>
                </div>
                {num(x.limit) > 0 && (
                  <div className="mt-2"><div className="flex justify-between text-xs text-stone-400 mb-1"><span>Utilization</span><span className={util > 30 ? "text-amber-600" : ""}>{util.toFixed(0)}%</span></div>
                    <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden"><div className={`h-full rounded-full ${util > 70 ? "bg-rose-500" : util > 30 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${util}%` }} /></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
      <Card>
        <div className="flex justify-between items-center mb-3"><h3 className="font-medium text-stone-700">Recurring bills</h3><button onClick={addBill} className="text-sm flex items-center gap-1 text-teal-700"><Plus size={14} /> Add bill</button></div>
        {bills.length === 0 && <p className="text-sm text-stone-400">Cell phone, internet, insurance, subscriptions. These flow into the dashboard.</p>}
        <div className="space-y-2">
          {bills.map((b) => (
            <div key={b.id} className="grid grid-cols-12 gap-2 items-end">
              <TextField label="Bill" value={b.name} onChange={(v) => updBill(b.id, { name: v })} className="col-span-4" />
              <CategorySelect label="Category" value={b.category} categories={cats} onChange={(v) => updBill(b.id, { category: v })} onAddCategory={addCat} className="col-span-3" />
              <NumberField label="Amount" value={b.amount} onChange={(v) => updBill(b.id, { amount: v })} className="col-span-2" />
              <label className="col-span-2"><span className="text-xs text-stone-500">Freq.</span>
                <select value={b.frequency} onChange={(e) => updBill(b.id, { frequency: e.target.value })} className="w-full mt-0.5 px-1 py-1.5 text-xs border border-stone-300 rounded-lg bg-white"><option value="monthly">Monthly</option><option value="annual">Annual</option></select>
              </label>
              <button onClick={() => delBill(b.id)} className="col-span-1 text-rose-400 hover:text-rose-600 pb-2"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
        {billsMonthly > 0 && <p className="text-sm text-stone-600 mt-3 pt-2 border-t border-stone-100">Total recurring: <span className="font-medium">{fmt2(billsMonthly)}/mo</span> · {fmt(billsMonthly * 12)}/yr</p>}
      </Card>
      <Card>
        <div className="flex justify-between items-center mb-3"><h3 className="font-medium text-stone-700">One-time expenses</h3><button onClick={() => setData((d) => ({ ...d, oneTime: [...(d.oneTime || []), { id: uid(), date: "", description: "", amount: 0, category: "Other" }] }))} className="text-sm flex items-center gap-1 text-teal-700"><Plus size={14} /> Add expense</button></div>
        {(data.oneTime || []).length === 0 && <p className="text-sm text-stone-400">One-off costs — appliances, a vacation, medical bills, a big repair.</p>}
        <div className="space-y-2">
          {(data.oneTime || []).map((o) => (
            <div key={o.id} className="grid grid-cols-12 gap-2 items-end">
              <TextField label="Date" type="date" value={o.date} onChange={(v) => setData((d) => ({ ...d, oneTime: d.oneTime.map((x) => (x.id === o.id ? { ...x, date: v } : x)) }))} className="col-span-3" />
              <TextField label="Description" value={o.description} onChange={(v) => setData((d) => ({ ...d, oneTime: d.oneTime.map((x) => (x.id === o.id ? { ...x, description: v } : x)) }))} className="col-span-4" />
              <CategorySelect label="Category" value={o.category} categories={cats} onChange={(v) => setData((d) => ({ ...d, oneTime: d.oneTime.map((x) => (x.id === o.id ? { ...x, category: v } : x)) }))} onAddCategory={addCat} className="col-span-2" />
              <NumberField label="Amount" value={o.amount} onChange={(v) => setData((d) => ({ ...d, oneTime: d.oneTime.map((x) => (x.id === o.id ? { ...x, amount: v } : x)) }))} className="col-span-2" />
              <button onClick={() => setData((d) => ({ ...d, oneTime: d.oneTime.filter((x) => x.id !== o.id) }))} className="col-span-1 text-rose-400 hover:text-rose-600 pb-2"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
        {((data.oneTime || []).length > 0 || (data.receipts || []).some((r) => r.applyTo === "onetime")) && (() => {
          const recYr = (data.receipts || []).filter((r) => r.applyTo === "onetime" && (r.date || "").slice(0, 4) === String(data.taxYear)).reduce((s, r) => s + num(r.amount), 0);
          const recAll = (data.receipts || []).filter((r) => r.applyTo === "onetime").reduce((s, r) => s + num(r.amount), 0);
          const yr = (data.oneTime || []).filter((o) => (o.date || "").slice(0, 4) === String(data.taxYear)).reduce((s, o) => s + num(o.amount), 0) + recYr;
          const all = (data.oneTime || []).reduce((s, o) => s + num(o.amount), 0) + recAll;
          return <p className="text-sm text-stone-600 mt-3 pt-2 border-t border-stone-100">This year ({data.taxYear}): <span className="font-medium">{fmt(yr)}</span> · All-time: {fmt(all)} {recAll > 0 && <span className="text-xs text-stone-400">(incl. {fmt(recAll)} from receipts)</span>}</p>;
        })()}
      </Card>
    </div>
  );
}

/* ---------- Receipts ---------- */
function Receipts({ data, setData, shared }) {
  const cats = data.receiptCategories || [];
  const receipts = data.receipts || [];
  const [images, setImages] = useState({});
  const [busy, setBusy] = useState(null);
  const [filter, setFilter] = useState("All");
  const [newCat, setNewCat] = useState("");
  const [showCats, setShowCats] = useState(false);
  const [expanded, setExpanded] = useState({});
  const isExpanded = (id) => !!expanded[id];
  const openReceipt = (id) => setExpanded((s) => ({ ...s, [id]: true }));
  const closeReceipt = (id) => setExpanded((s) => { const n = { ...s }; delete n[id]; return n; });

  useEffect(() => {
    (async () => {
      const cutoff = Date.now() - RECEIPT_EXPIRY_DAYS * 86400000;
      for (const r of receipts) {
        if (!r.hasImage) continue;
        if (r.photoAddedAt && r.photoAddedAt < cutoff) {
          try { await window.storage.delete(`receipt-img:${r.id}`, shared); } catch (e) {}
          updR(r.id, { hasImage: false, photoExpired: true });
          continue;
        }
        if (!images[r.id]) {
          try { const res = await window.storage.get(`receipt-img:${r.id}`, shared); if (res && res.value) setImages((m) => ({ ...m, [r.id]: res.value })); } catch (e) {}
        }
      }
    })();
    // eslint-disable-next-line
  }, []);

  const updR = (id, patch) => setData((d) => ({ ...d, receipts: d.receipts.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
  const addBlank = () => {
    const id = uid();
    setData((d) => ({ ...d, receipts: [{ id, label: "", description: "", date: "", time: "", amount: 0, category: cats[0] || "Other", applyTo: "log", hasImage: false }, ...(d.receipts || [])] }));
    openReceipt(id);
  };
  const delR = async (id) => {
    setData((d) => ({ ...d, receipts: d.receipts.filter((x) => x.id !== id) }));
    setImages((m) => { const n = { ...m }; delete n[id]; return n; });
    try { await window.storage.delete(`receipt-img:${id}`, shared); } catch (e) {}
  };
  const compress = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 1100; let { width, height } = img;
        if (width > max || height > max) { const s = max / Math.max(width, height); width = Math.round(width * s); height = Math.round(height * s); }
        const c = document.createElement("canvas"); c.width = width; c.height = height;
        c.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(c.toDataURL("image/jpeg", 0.6));
      };
      img.onerror = reject; img.src = reader.result;
    };
    reader.onerror = reject; reader.readAsDataURL(file);
  });
  const extract = async (id, dataUrl) => {
    setBusy(id);
    try {
      const { default: Tesseract } = await import("tesseract.js");
      const { data: { text } } = await Tesseract.recognize(dataUrl, "eng", { logger: () => {} });
      const { amount, date, merchant } = parseReceiptText(text);
      updR(id, { label: merchant, date, amount, category: cats[0] || "Other" });
    } catch (e) {}
    setBusy(null);
  };
  const onFile = async (id, file) => {
    if (!file) return;
    try {
      const dataUrl = await compress(file);
      setImages((m) => ({ ...m, [id]: dataUrl }));
      updR(id, { hasImage: true, photoAddedAt: Date.now(), photoExpired: false });
      await window.storage.set(`receipt-img:${id}`, dataUrl, shared);
      extract(id, dataUrl);
    } catch (e) {}
  };
  const addCatValue = (c) => { if (c && !cats.includes(c)) setData((d) => ({ ...d, receiptCategories: [...(d.receiptCategories || []), c] })); };
  const addCat = () => { addCatValue(newCat.trim()); setNewCat(""); };
  const delCat = (c) => setData((d) => ({ ...d, receiptCategories: d.receiptCategories.filter((x) => x !== c) }));
  const shown = filter === "All" ? receipts : receipts.filter((r) => r.category === filter);
  const shownTotal = shown.reduce((s, r) => s + num(r.amount), 0);
  const yearTotal = receipts.filter((r) => (r.date || "").slice(0, 4) === String(data.taxYear)).reduce((s, r) => s + num(r.amount), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h2 className="font-medium text-stone-700">Receipts</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCats(!showCats)} className="text-sm text-stone-500 hover:text-stone-700">Categories</button>
          <button onClick={addBlank} className="flex items-center gap-1 text-sm bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700"><Plus size={15} /> Add receipt</button>
        </div>
      </div>
      {showCats && (
        <Card>
          <h3 className="text-sm font-medium text-stone-600 mb-2">Customize categories</h3>
          <div className="flex flex-wrap gap-2 mb-3">{cats.map((c) => <span key={c} className="flex items-center gap-1 bg-stone-100 text-stone-600 text-xs px-2 py-1 rounded-full">{c}<button onClick={() => delCat(c)} className="text-stone-400 hover:text-rose-500">×</button></span>)}</div>
          <div className="flex gap-2"><input value={newCat} onChange={(e) => setNewCat(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCat()} placeholder="New category" className="flex-1 px-2 py-1.5 text-sm border border-stone-300 rounded-lg" /><button onClick={addCat} className="text-sm bg-stone-700 text-white px-3 rounded-lg">Add</button></div>
        </Card>
      )}
      <Card className="bg-teal-50 border-teal-200">
        <div className="flex gap-2 text-sm text-teal-800"><Sparkles size={18} className="shrink-0 mt-0.5" /><p>Snap or upload a receipt — OCR reads the merchant, date, and total automatically. Accuracy depends on image clarity; fix anything off or type it in. Set "Apply to" so it counts toward a rental or one-time expenses. Photos auto-clear after {RECEIPT_EXPIRY_DAYS} days.</p></div>
      </Card>
      {receipts.length > 1 && (
        <div className="flex items-center gap-2"><span className="text-xs text-stone-500">Filter</span>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-2 py-1.5 text-sm border border-stone-300 rounded-lg bg-white"><option>All</option>{cats.map((c) => <option key={c}>{c}</option>)}</select>
        </div>
      )}
      {receipts.length === 0 && <p className="text-sm text-stone-400">No receipts yet. Tap "Add receipt," then the photo box to capture one.</p>}
      <div className="space-y-2">
        {shown.map((r) => (
          <Card key={r.id} className="!p-0 overflow-hidden">
            {/* Compact row (collapsed) */}
            {!isExpanded(r.id) && (
              <div className="flex items-center gap-3 px-3 py-2.5">
                {images[r.id]
                  ? <img src={images[r.id]} alt="receipt" className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0" />
                  : <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center shrink-0"><Receipt size={16} className="text-stone-300" /></div>}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{r.label || <span className="text-stone-400">Untitled receipt</span>}</div>
                  <div className="text-xs text-stone-400">{r.date || "No date"} · {r.category || "Uncategorized"}{r.applyTo && r.applyTo !== "log" ? ` · ${r.applyTo.startsWith("rental:") ? "Rental" : "One-time"}` : ""}</div>
                </div>
                <div className="text-sm font-semibold shrink-0">{r.amount > 0 ? fmt2(r.amount) : <span className="text-stone-300">$0</span>}</div>
                <button onClick={() => openReceipt(r.id)} className="text-xs text-teal-700 hover:underline shrink-0 ml-1">Edit</button>
                <button onClick={() => delR(r.id)} className="text-rose-400 hover:text-rose-600 shrink-0"><Trash2 size={14} /></button>
              </div>
            )}

            {/* Expanded form */}
            {isExpanded(r.id) && (
              <div className="p-3">
                {busy === r.id && (
                  <div className="flex items-center gap-1.5 text-xs text-teal-700 mb-2"><Sparkles size={12} className="animate-pulse" /> Reading receipt with OCR…</div>
                )}
                <div className="flex gap-3">
                  <div className="w-20 shrink-0">
                    {images[r.id]
                      ? <img src={images[r.id]} alt="receipt" className="w-20 h-20 object-cover rounded-lg border border-stone-200" />
                      : <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-stone-300 rounded-lg cursor-pointer text-stone-400 hover:border-teal-400 hover:text-teal-500"><Camera size={18} /><span className="text-[10px] mt-1">Add photo</span><input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onFile(r.id, e.target.files[0])} /></label>}
                    {images[r.id] && !busy && <label className="text-[10px] text-teal-700 cursor-pointer block mt-1 text-center hover:underline">Replace<input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onFile(r.id, e.target.files[0])} /></label>}
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <TextField label="Label / merchant" value={r.label} onChange={(v) => updR(r.id, { label: v })} />
                    <NumberField label="Amount" value={r.amount} onChange={(v) => updR(r.id, { amount: v })} />
                    <TextField label="Date" type="date" value={r.date} onChange={(v) => updR(r.id, { date: v })} />
                    <TextField label="Time" type="time" value={r.time} onChange={(v) => updR(r.id, { time: v })} />
                    <CategorySelect label="Category" value={r.category} categories={cats} onChange={(v) => updR(r.id, { category: v })} onAddCategory={addCatValue} />
                    <label className="block"><span className="text-xs text-stone-500">Apply to</span><select value={r.applyTo || "log"} onChange={(e) => updR(r.id, { applyTo: e.target.value })} className="w-full mt-0.5 px-2 py-1.5 text-sm border border-stone-300 rounded-lg bg-white"><option value="log">Log only</option><option value="onetime">One-time expense</option>{data.properties.map((p) => <option key={p.id} value={`rental:${p.id}`}>Rental: {p.name}</option>)}</select></label>
                    <TextField label="Description" value={r.description} onChange={(v) => updR(r.id, { description: v })} className="col-span-2" />
                    {(r.applyTo || "").startsWith("rental:") && <p className="col-span-2 text-xs text-teal-700">→ T776 line {receiptLine(r.category)}</p>}
                    {r.applyTo === "onetime" && <p className="col-span-2 text-xs text-teal-700">→ Counts toward one-time expenses.</p>}
                    {r.photoExpired && <p className="col-span-2 text-xs text-stone-400">Photo auto-removed after {RECEIPT_EXPIRY_DAYS} days.</p>}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100">
                  <button onClick={() => delR(r.id)} className="text-xs text-rose-400 hover:text-rose-600 flex items-center gap-1"><Trash2 size={12} /> Delete</button>
                  <button onClick={() => closeReceipt(r.id)} className="flex items-center gap-1.5 text-sm bg-teal-600 text-white px-4 py-1.5 rounded-lg hover:bg-teal-700">Save receipt</button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
      {receipts.length > 0 && (
        <Card className="bg-stone-800 text-white">
          <div className="flex justify-between items-center">
            <div><div className="text-xs text-stone-300">{filter === "All" ? "Total of all receipts" : `Total · ${filter}`}</div><div className="text-2xl font-semibold">{fmt2(shownTotal)}</div></div>
            <div className="text-right text-sm text-stone-300"><div>{shown.length} receipt{shown.length === 1 ? "" : "s"}</div><div>{data.taxYear}: {fmt(yearTotal)}</div></div>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ---------- Childcare ---------- */
function Childcare({ data, setData }) {
  const year = data.taxYear;
  const addChild = () => setData((d) => ({ ...d, children: [...d.children, { id: uid(), name: "", birthYear: "", disability: false }] }));
  const updChild = (id, patch) => setData((d) => ({ ...d, children: d.children.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  const delChild = (id) => setData((d) => ({ ...d, children: d.children.filter((c) => c.id !== id) }));
  const addExp = () => setData((d) => ({ ...d, childcare: [...d.childcare, { id: uid(), childId: "", date: "", provider: "", providerSIN: "", amount: 0 }] }));
  const updExp = (id, patch) => setData((d) => ({ ...d, childcare: d.childcare.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
  const delExp = (id) => setData((d) => ({ ...d, childcare: d.childcare.filter((e) => e.id !== id) }));
  const cc = computeChildcare(data, year);

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex justify-between items-center mb-3"><h3 className="font-medium text-stone-700">Children</h3><button onClick={addChild} className="text-sm flex items-center gap-1 text-teal-700"><Plus size={14} /> Add child</button></div>
        {data.children.length === 0 && <p className="text-sm text-stone-400">Add your daughter (and any other children) to set the right deduction limits.</p>}
        <div className="space-y-2">
          {data.children.map((c) => (
            <div key={c.id} className="grid grid-cols-12 gap-2 items-end">
              <TextField label="Name" value={c.name} onChange={(v) => updChild(c.id, { name: v })} className="col-span-5" />
              <NumberField label="Birth year" prefix="" value={c.birthYear} onChange={(v) => updChild(c.id, { birthYear: v })} className="col-span-3" />
              <label className="col-span-3 flex items-center gap-2 pb-2 text-xs text-stone-600"><input type="checkbox" checked={c.disability} onChange={(e) => updChild(c.id, { disability: e.target.checked })} /> Disability</label>
              <button onClick={() => delChild(c.id)} className="col-span-1 text-rose-400 hover:text-rose-600 pb-2"><Trash2 size={15} /></button>
              <div className="col-span-12 text-xs text-stone-400">Annual limit: {fmt(cc.childLimit(c))}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <div className="flex justify-between items-center mb-3"><h3 className="font-medium text-stone-700">Childcare payments ({year})</h3><button onClick={addExp} className="text-sm flex items-center gap-1 text-teal-700"><Plus size={14} /> Add payment</button></div>
        <div className="space-y-2">
          {data.childcare.map((e) => (
            <div key={e.id} className="grid grid-cols-12 gap-2 items-end bg-stone-50 rounded-lg p-2">
              <label className="col-span-3"><span className="text-xs text-stone-500">Child</span><select value={e.childId} onChange={(ev) => updExp(e.id, { childId: ev.target.value })} className="w-full mt-0.5 px-1 py-1.5 text-xs border border-stone-300 rounded-lg bg-white"><option value="">—</option>{data.children.map((c) => <option key={c.id} value={c.id}>{c.name || "Child"}</option>)}</select></label>
              <TextField label="Date" type="date" value={e.date} onChange={(v) => updExp(e.id, { date: v })} className="col-span-2" />
              <TextField label="Provider" value={e.provider} onChange={(v) => updExp(e.id, { provider: v })} className="col-span-3" />
              <TextField label="Provider SIN/BN" value={e.providerSIN} onChange={(v) => updExp(e.id, { providerSIN: v })} className="col-span-2" />
              <NumberField label="Amount" value={e.amount} onChange={(v) => updExp(e.id, { amount: v })} className="col-span-1" />
              <button onClick={() => delExp(e.id)} className="col-span-1 text-rose-400 hover:text-rose-600 pb-2"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
        <p className="text-xs text-stone-400 mt-2">Keep every receipt — the CRA requires the provider's name and SIN (for individuals) if they ask.</p>
      </Card>
      <Card className="bg-emerald-50 border-emerald-200">
        <h3 className="font-medium text-emerald-800 mb-2">Estimated deduction (line 21400)</h3>
        <div className="text-sm text-emerald-900 space-y-1">
          <div className="flex justify-between"><span>Total paid in {year}</span><span>{fmt(cc.totalPaid)}</span></div>
          <div className="flex justify-between"><span>Age-based ceiling</span><span>{fmt(cc.limitByAge)}</span></div>
          <div className="flex justify-between"><span>⅔ of lower income ({cc.lowerName})</span><span>{fmt(cc.incomeLimit)}</span></div>
          <div className="flex justify-between font-semibold text-base pt-1 border-t border-emerald-200 mt-1"><span>Claimable (lesser of three)</span><span>{fmt(cc.deduction)}</span></div>
        </div>
        <p className="text-xs text-emerald-700 mt-2">Generally the lower-income spouse ({cc.lowerName}) claims this. Verify on Form T778.</p>
      </Card>
    </div>
  );
}

/* ---------- Vehicles ---------- */
function Vehicles({ data, setData }) {
  const add = () => setData((d) => ({ ...d, vehicles: [...d.vehicles, { id: uid(), name: "", loanBalance: 0, rate: 0, payment: 0 }] }));
  const upd = (id, patch) => setData((d) => ({ ...d, vehicles: d.vehicles.map((v) => (v.id === id ? { ...v, ...patch } : v)) }));
  const del = (id) => setData((d) => ({ ...d, vehicles: d.vehicles.filter((v) => v.id !== id) }));
  const totalBal = data.vehicles.reduce((s, v) => s + num(v.loanBalance), 0);
  const totalPay = data.vehicles.reduce((s, v) => s + num(v.payment), 0);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3"><Stat label="Total car loans" value={fmt(totalBal)} tone="red" /><Stat label="Monthly payments" value={fmt(totalPay)} /></div>
      <Card>
        <div className="flex justify-between items-center mb-3"><h3 className="font-medium text-stone-700">Vehicles & loans</h3><button onClick={add} className="text-sm flex items-center gap-1 text-teal-700"><Plus size={14} /> Add vehicle</button></div>
        {data.vehicles.length === 0 && <p className="text-sm text-stone-400">Add your two cars and their loans.</p>}
        <div className="space-y-3">
          {data.vehicles.map((v) => {
            const am = amortize(v.loanBalance, v.rate, v.payment);
            return (
              <div key={v.id}>
                <div className="grid grid-cols-12 gap-2 items-end">
                  <TextField label="Vehicle" value={v.name} onChange={(val) => upd(v.id, { name: val })} className="col-span-4" />
                  <NumberField label="Loan balance" value={v.loanBalance} onChange={(val) => upd(v.id, { loanBalance: val })} className="col-span-3" />
                  <NumberField label="Rate %" prefix="" value={v.rate} onChange={(val) => upd(v.id, { rate: val })} className="col-span-2" />
                  <NumberField label="Payment/mo" value={v.payment} onChange={(val) => upd(v.id, { payment: val })} className="col-span-2" />
                  <button onClick={() => del(v.id)} className="col-span-1 text-rose-400 hover:text-rose-600 pb-2"><Trash2 size={15} /></button>
                </div>
                {am && !am.neverPaysOff && <p className="text-xs text-stone-400 mt-1">Paid off in {am.years.toFixed(1)} yrs ({fmtMonthYear(am.payoffDate)}) · {fmt(am.totalInterest)} interest</p>}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* ---------- Budget (envelopes) ---------- */
function Budget({ data, setData }) {
  const month = currentMonth();
  const monthLabel = new Date(month + "-01").toLocaleDateString("en-CA", { month: "long", year: "numeric" });
  const b = data.budget || { monthlyIncome: 0, envelopes: [] };
  const envs = b.envelopes || [];
  const cats = data.receiptCategories || [];
  const addCat = (c) => { if (c && !cats.includes(c)) setData((d) => ({ ...d, receiptCategories: [...(d.receiptCategories || []), c] })); };
  const setB = (patch) => setData((d) => ({ ...d, budget: { ...(d.budget || { monthlyIncome: 0, envelopes: [] }), ...patch } }));
  const updEnv = (id, patch) => setB({ envelopes: envs.map((e) => (e.id === id ? { ...e, ...patch } : e)) });
  const addEnv = () => setB({ envelopes: [...envs, { id: uid(), name: "New folder", category: "", budgeted: 0, color: PIE[envs.length % PIE.length], rollover: false, spends: [] }] });
  const delEnv = (id) => setB({ envelopes: envs.filter((e) => e.id !== id) });

  const receiptsThisMonth = (data.receipts || []).filter((r) => (r.date || "").slice(0, 7) === month);
  const spentFor = (e) => {
    const manual = (e.spends || []).filter((s) => (s.date || "").slice(0, 7) === month).reduce((a, s) => a + num(s.amount), 0);
    const fromReceipts = e.category ? receiptsThisMonth.filter((r) => r.category === e.category).reduce((a, r) => a + num(r.amount), 0) : 0;
    return manual + fromReceipts;
  };
  const logSpend = (id) => { const e = envs.find((x) => x.id === id); updEnv(id, { spends: [...(e.spends || []), { id: uid(), date: new Date().toISOString().slice(0, 10), amount: 0, note: "" }] }); };
  const updSpend = (eid, sid, patch) => { const e = envs.find((x) => x.id === eid); updEnv(eid, { spends: e.spends.map((s) => (s.id === sid ? { ...s, ...patch } : s)) }); };
  const delSpend = (eid, sid) => { const e = envs.find((x) => x.id === eid); updEnv(eid, { spends: e.spends.filter((s) => s.id !== sid) }); };

  const totalBudgeted = envs.reduce((s, e) => s + num(e.budgeted), 0);
  const totalSpent = envs.reduce((s, e) => s + spentFor(e), 0);
  const toAllocate = num(b.monthlyIncome) - totalBudgeted;

  return (
    <div className="space-y-5">
      {/* Allocation hero */}
      <div className="bg-gradient-to-br from-teal-600 to-emerald-600 text-white rounded-3xl p-5 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-teal-50 text-sm">Left to budget · {monthLabel}</div>
            <div className="text-3xl font-bold mt-1">{fmt(toAllocate)}</div>
          </div>
          <label className="text-right">
            <span className="text-teal-100 text-xs">Monthly take-home</span>
            <div className="flex items-center mt-0.5 bg-white/15 rounded-lg px-2">
              <span className="text-teal-100 text-sm">$</span>
              <input type="number" value={b.monthlyIncome === 0 ? "" : b.monthlyIncome} placeholder="0" onChange={(e) => setB({ monthlyIncome: num(e.target.value) })} className="w-28 px-1 py-1.5 bg-transparent outline-none text-white placeholder-teal-200 text-right" />
            </div>
          </label>
        </div>
        <div className="mt-3 text-xs text-teal-50">
          {toAllocate > 0 ? `Give every dollar a job — ${fmt(toAllocate)} still unassigned.` : toAllocate < 0 ? `You've assigned ${fmt(-toAllocate)} more than you earn — trim a folder.` : "Every dollar is assigned. Nicely balanced."}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Budgeted" value={fmt(totalBudgeted)} />
        <Stat label="Spent so far" value={fmt(totalSpent)} tone={totalSpent > totalBudgeted ? "red" : "slate"} />
        <Stat label="Remaining" value={fmt(totalBudgeted - totalSpent)} tone={totalBudgeted - totalSpent < 0 ? "red" : "green"} />
      </div>

      <div className="flex justify-between items-center">
        <h2 className="font-medium text-stone-700">Folders</h2>
        <button onClick={addEnv} className="flex items-center gap-1 text-sm bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700"><Plus size={15} /> Add folder</button>
      </div>

      {envs.length === 0 && <p className="text-sm text-stone-400">Create folders like Groceries, Dining, Kids, Fun. Assign each a monthly amount, then watch it draw down as you spend.</p>}

      <div className="space-y-3">
        {envs.map((e) => {
          const spent = spentFor(e);
          const budgeted = num(e.budgeted);
          const remaining = budgeted - spent;
          const pct = budgeted ? Math.min(100, (spent / budgeted) * 100) : 0;
          const over = spent > budgeted && budgeted > 0;
          const bar = over ? "bg-rose-500" : pct > 80 ? "bg-amber-500" : "bg-teal-500";
          return (
            <Card key={e.id} className="!p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: e.color }} />
                <input value={e.name} onChange={(ev) => updEnv(e.id, { name: ev.target.value })} className="font-medium text-sm bg-transparent outline-none border-b border-transparent focus:border-stone-300 flex-1 min-w-0" />
                <button onClick={() => delEnv(e.id)} className="text-rose-300 hover:text-rose-500"><Trash2 size={14} /></button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end mb-2">
                <NumberField label="Monthly budget" value={e.budgeted} onChange={(v) => updEnv(e.id, { budgeted: v })} />
                <CategorySelect label="Linked receipt category" value={e.category || ""} categories={cats} emptyLabel="— none —" onChange={(v) => updEnv(e.id, { category: v })} onAddCategory={addCat} />
                <div className="bg-stone-50 rounded-lg p-2 text-xs"><div className="text-stone-400">Spent</div><div className="font-medium text-sm">{fmt(spent)}</div></div>
                <div className="bg-stone-50 rounded-lg p-2 text-xs"><div className="text-stone-400">Remaining</div><div className={`font-medium text-sm ${remaining < 0 ? "text-rose-600" : "text-emerald-600"}`}>{fmt(remaining)}</div></div>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden"><div className={`h-full rounded-full transition-all ${bar}`} style={{ width: `${pct}%` }} /></div>
              <div className="flex justify-between items-center mt-1.5">
                <span className="text-xs text-stone-400">{e.category ? `Auto-counts ${e.category} receipts this month` : "Log spending below or link a category"}{over ? " · over budget" : ""}</span>
                <button onClick={() => logSpend(e.id)} className="text-xs flex items-center gap-1 text-teal-700"><Plus size={12} /> Log spend</button>
              </div>
              {(e.spends || []).filter((s) => (s.date || "").slice(0, 7) === month).length > 0 && (
                <div className="mt-2 space-y-1.5 border-t border-stone-100 pt-2">
                  {(e.spends || []).filter((s) => (s.date || "").slice(0, 7) === month).map((s) => (
                    <div key={s.id} className="grid grid-cols-12 gap-2 items-end">
                      <TextField label="Date" type="date" value={s.date} onChange={(v) => updSpend(e.id, s.id, { date: v })} className="col-span-3" />
                      <NumberField label="Amount" value={s.amount} onChange={(v) => updSpend(e.id, s.id, { amount: v })} className="col-span-3" />
                      <TextField label="Note" value={s.note} onChange={(v) => updSpend(e.id, s.id, { note: v })} className="col-span-5" />
                      <button onClick={() => delSpend(e.id, s.id)} className="col-span-1 text-rose-400 hover:text-rose-600 pb-2"><Trash2 size={13} /></button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="bg-teal-50 border-teal-200">
        <div className="flex gap-2 text-sm text-teal-800"><Folder size={18} className="shrink-0 mt-0.5" /><p>Folder budgeting: assign your take-home pay across folders until every dollar has a job. Link a folder to a receipt category and your logged receipts count against it automatically each month. Spending resets at the start of each calendar month.</p></div>
      </Card>
    </div>
  );
}

/* ---------- Goals ---------- */
function Goals({ data, setData }) {
  const goals = data.goals || [];
  const add = () => setData((d) => ({ ...d, goals: [...(d.goals || []), { id: uid(), name: "", target: 0, saved: 0, targetDate: "" }] }));
  const upd = (id, patch) => setData((d) => ({ ...d, goals: d.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) }));
  const del = (id) => setData((d) => ({ ...d, goals: d.goals.filter((g) => g.id !== id) }));
  const monthsUntil = (s) => { if (!s) return null; const t = new Date(s), n = new Date(); const m = (t.getFullYear() - n.getFullYear()) * 12 + (t.getMonth() - n.getMonth()); return m > 0 ? m : null; };
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h2 className="font-medium text-stone-700">Savings goals</h2><button onClick={add} className="flex items-center gap-1 text-sm bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700"><Plus size={15} /> Add goal</button></div>
      {goals.length === 0 && <p className="text-sm text-stone-400">Try an emergency fund, daycare buffer, or a property down payment.</p>}
      {goals.map((g) => {
        const pct = num(g.target) ? Math.min(100, (num(g.saved) / num(g.target)) * 100) : 0;
        const remaining = Math.max(0, num(g.target) - num(g.saved));
        const months = monthsUntil(g.targetDate);
        const perMonth = months ? remaining / months : null;
        return (
          <Card key={g.id}>
            <div className="grid grid-cols-12 gap-2 items-end mb-3">
              <TextField label="Goal" value={g.name} onChange={(v) => upd(g.id, { name: v })} className="col-span-5" />
              <NumberField label="Target" value={g.target} onChange={(v) => upd(g.id, { target: v })} className="col-span-3" />
              <NumberField label="Saved so far" value={g.saved} onChange={(v) => upd(g.id, { saved: v })} className="col-span-3" />
              <button onClick={() => del(g.id)} className="col-span-1 text-rose-400 hover:text-rose-600 pb-2"><Trash2 size={15} /></button>
              <TextField label="Target date (optional)" type="date" value={g.targetDate} onChange={(v) => upd(g.id, { targetDate: v })} className="col-span-6" />
            </div>
            <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden"><div className="bg-teal-500 h-full rounded-full transition-all" style={{ width: `${pct}%` }} /></div>
            <div className="flex flex-wrap justify-between gap-2 text-xs text-stone-500 mt-2">
              <span>{fmt(g.saved)} of {fmt(g.target)} · {pct.toFixed(0)}%</span>
              {remaining > 0 && <span>{fmt(remaining)} to go</span>}
              {perMonth != null && remaining > 0 && <span className="text-teal-700 font-medium">Save {fmt(perMonth)}/mo for {months}-mo target</span>}
              {remaining === 0 && num(g.target) > 0 && <span className="text-emerald-600 font-medium">Goal reached 🎉</span>}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/* ---------- Household ---------- */
function Household({ data, setHH, setData }) {
  const deps = data.dependents || [];
  const addDep = () => setData((d) => ({ ...d, dependents: [...(d.dependents || []), { id: uid(), name: "", relationship: "Child", birthYear: "", infirm: false }] }));
  const updDep = (id, patch) => setData((d) => ({ ...d, dependents: d.dependents.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
  const delDep = (id) => setData((d) => ({ ...d, dependents: d.dependents.filter((x) => x.id !== id) }));

  const [importMsg, setImportMsg] = useState("");
  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `family-finance-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    URL.revokeObjectURL(url);
  };
  const importBackup = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed || typeof parsed !== "object" || !parsed.household) throw new Error("bad file");
        setData(applyDefaults(parsed));
        setImportMsg("Backup restored.");
      } catch (e) { setImportMsg("Couldn't read that file — make sure it's a backup exported here."); }
      setTimeout(() => setImportMsg(""), 4000);
    };
    reader.readAsText(file);
  };
  return (
    <div className="space-y-5">
      <Card>
        <h3 className="font-medium text-stone-700 mb-3">Household & incomes</h3>
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Person 1 name" value={data.household.p1Name} onChange={(v) => setHH({ p1Name: v })} />
          <NumberField label="Person 1 net income (line 23600)" value={data.household.p1Income} onChange={(v) => setHH({ p1Income: v })} />
          <TextField label="Person 2 name" value={data.household.p2Name} onChange={(v) => setHH({ p2Name: v })} />
          <NumberField label="Person 2 net income (line 23600)" value={data.household.p2Income} onChange={(v) => setHH({ p2Income: v })} />
          <label className="block col-span-2"><span className="text-xs text-stone-500">Province of residence (Dec 31) — sets your tax rates</span>
            <select value={data.household.province || "BC"} onChange={(e) => setHH({ province: e.target.value })} className="w-full mt-0.5 px-2 py-1.5 text-sm border border-stone-300 rounded-lg bg-white">
              {Object.entries(PROV_NAMES).map(([code, name]) => <option key={code} value={code}>{name}</option>)}
            </select>
          </label>
        </div>
        <p className="text-xs text-stone-400 mt-2">Net incomes drive the childcare two-thirds limit and who claims it. Province sets the tax brackets used in the estimate. Quebec residents note that federal tax is reduced by a 16.5% abatement since QC funds its own programs — still confirm with a tax professional.</p>
      </Card>
      <Card>
        <div className="flex justify-between items-center mb-3"><h3 className="font-medium text-stone-700">Dependents</h3><button onClick={addDep} className="text-sm flex items-center gap-1 text-teal-700"><Plus size={14} /> Add dependent</button></div>
        {deps.length === 0 && <p className="text-sm text-stone-400">List children, an aging parent, or an infirm relative. Helps flag credits like the Canada Caregiver Amount.</p>}
        <div className="space-y-2">
          {deps.map((x) => {
            const age = x.birthYear ? new Date().getFullYear() - num(x.birthYear) : null;
            return (
              <div key={x.id} className="grid grid-cols-12 gap-2 items-end">
                <TextField label="Name" value={x.name} onChange={(v) => updDep(x.id, { name: v })} className="col-span-4" />
                <label className="col-span-3"><span className="text-xs text-stone-500">Relationship</span><select value={x.relationship} onChange={(e) => updDep(x.id, { relationship: e.target.value })} className="w-full mt-0.5 px-1 py-1.5 text-xs border border-stone-300 rounded-lg bg-white">{["Child", "Spouse/Partner", "Parent", "Grandparent", "Other relative"].map((r) => <option key={r}>{r}</option>)}</select></label>
                <NumberField label="Birth year" prefix="" value={x.birthYear} onChange={(v) => updDep(x.id, { birthYear: v })} className="col-span-2" />
                <label className="col-span-2 flex items-center gap-1.5 pb-2 text-xs text-stone-600"><input type="checkbox" checked={x.infirm} onChange={(e) => updDep(x.id, { infirm: e.target.checked })} /> Infirm</label>
                <button onClick={() => delDep(x.id)} className="col-span-1 text-rose-400 hover:text-rose-600 pb-2"><Trash2 size={15} /></button>
                {(age != null || x.infirm) && <div className="col-span-12 text-xs text-stone-400">{age != null && `Age ~${age}. `}{x.infirm && "May qualify for the Canada Caregiver Amount — confirm with CRA."}</div>}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-stone-400 mt-2">For childcare claims, add children in the Childcare tab — that's where deduction limits are calculated.</p>
      </Card>
      <Card>
        <h3 className="font-medium text-stone-700 mb-3">Other assets (for net worth)</h3>
        <div className="grid grid-cols-2 gap-3"><NumberField label="Cash / savings" value={data.household.cash} onChange={(v) => setHH({ cash: v })} /><NumberField label="Other assets" value={data.household.otherAssets} onChange={(v) => setHH({ otherAssets: v })} /></div>
        <p className="text-xs text-stone-400 mt-2">Investment account values live in the Investments tab and are already counted in net worth. Use "Cash / savings" for a single rough figure, or list individual accounts below — both are added together.</p>
      </Card>

      <Card>
        <div className="flex justify-between items-center mb-3"><h3 className="font-medium text-stone-700">Bank accounts</h3><button onClick={() => setHH({ accounts: [...(data.household.accounts || []), { id: uid(), name: "", type: "chequing", balance: 0 }] })} className="text-sm flex items-center gap-1 text-teal-700"><Plus size={14} /> Add account</button></div>
        {(data.household.accounts || []).length === 0 && <p className="text-sm text-stone-400">Optional — break out individual chequing, savings, or other accounts instead of one lump "Cash / savings" figure above.</p>}
        <div className="space-y-2">
          {(data.household.accounts || []).map((a) => (
            <div key={a.id} className="grid grid-cols-12 gap-2 items-end">
              <TextField label="Account" placeholder="e.g. TD Chequing" value={a.name} onChange={(v) => setHH({ accounts: data.household.accounts.map((x) => (x.id === a.id ? { ...x, name: v } : x)) })} className="col-span-5" />
              <label className="col-span-3"><span className="text-xs text-stone-500">Type</span>
                <select value={a.type} onChange={(e) => setHH({ accounts: data.household.accounts.map((x) => (x.id === a.id ? { ...x, type: e.target.value } : x)) })} className="w-full mt-0.5 px-1 py-1.5 text-xs border border-stone-300 rounded-lg bg-white">
                  <option value="chequing">Chequing</option>
                  <option value="savings">Savings</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <NumberField label="Balance" value={a.balance} onChange={(v) => setHH({ accounts: data.household.accounts.map((x) => (x.id === a.id ? { ...x, balance: v } : x)) })} className="col-span-3" />
              <button onClick={() => setHH({ accounts: data.household.accounts.filter((x) => x.id !== a.id) })} className="col-span-1 text-rose-400 hover:text-rose-600 pb-2"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
        {(data.household.accounts || []).length > 0 && <p className="text-sm text-stone-600 mt-3 pt-2 border-t border-stone-100">Total: <span className="font-medium">{fmt((data.household.accounts || []).reduce((s, a) => s + num(a.balance), 0))}</span></p>}
      </Card>

      <Card>
        <div className="flex justify-between items-center mb-3"><h3 className="font-medium text-stone-700">Foreign assets</h3><button onClick={() => setHH({ foreignAssets: [...(data.household.foreignAssets || []), { id: uid(), name: "", currency: "USD", cad: 0 }] })} className="text-sm flex items-center gap-1 text-teal-700"><Plus size={14} /> Add asset</button></div>
        {(data.household.foreignAssets || []).length === 0 && <p className="text-sm text-stone-400">Foreign property, accounts, or investments — entered in CAD, counted in your net worth.</p>}
        <div className="space-y-2">
          {(data.household.foreignAssets || []).map((a) => (
            <div key={a.id} className="grid grid-cols-12 gap-2 items-end">
              <TextField label="Asset" value={a.name} onChange={(v) => setHH({ foreignAssets: data.household.foreignAssets.map((x) => (x.id === a.id ? { ...x, name: v } : x)) })} className="col-span-5" />
              <label className="col-span-3"><span className="text-xs text-stone-500">Currency</span>
                <select value={a.currency} onChange={(e) => setHH({ foreignAssets: data.household.foreignAssets.map((x) => (x.id === a.id ? { ...x, currency: e.target.value } : x)) })} className="w-full mt-0.5 px-1 py-1.5 text-xs border border-stone-300 rounded-lg bg-white">{["USD", "EUR", "GBP", "INR", "CNY", "Other"].map((c) => <option key={c}>{c}</option>)}</select>
              </label>
              <NumberField label="Value (CAD)" value={a.cad} onChange={(v) => setHH({ foreignAssets: data.household.foreignAssets.map((x) => (x.id === a.id ? { ...x, cad: v } : x)) })} className="col-span-3" />
              <button onClick={() => setHH({ foreignAssets: data.household.foreignAssets.filter((x) => x.id !== a.id) })} className="col-span-1 text-rose-400 hover:text-rose-600 pb-2"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
        {(data.household.foreignAssets || []).reduce((s, a) => s + num(a.cad), 0) > 100000 && (
          <p className="text-xs text-amber-700 mt-2">Your foreign assets exceed CAD $100,000 — you likely need to file Form T1135 (Foreign Income Verification Statement). This tracks current value; T1135 uses cost. Confirm with the CRA or an accountant.</p>
        )}
        <p className="text-xs text-stone-400 mt-2">Enter values in CAD (convert at a recent rate). These count toward net worth on the dashboard.</p>
      </Card>

      <Card>
        <h3 className="font-medium text-stone-700 mb-1">Backup & restore</h3>
        <p className="text-xs text-stone-400 mb-3">Your data lives in this browser. Export a backup file regularly — keep it somewhere safe, or use it to move everything to another device or hand it to the other family-account user.</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportBackup} className="flex items-center gap-1.5 text-sm bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700"><Download size={15} /> Export backup</button>
          <label className="flex items-center gap-1.5 text-sm bg-stone-700 text-white px-3 py-1.5 rounded-lg hover:bg-stone-600 cursor-pointer">
            <RefreshCw size={15} /> Restore from file
            <input type="file" accept="application/json,.json" className="hidden" onChange={(e) => importBackup(e.target.files[0])} />
          </label>
        </div>
        {importMsg && <p className={`text-xs mt-2 ${importMsg.startsWith("Couldn't") ? "text-rose-600" : "text-emerald-600"}`}>{importMsg}</p>}
        <p className="text-xs text-stone-400 mt-2">Restoring replaces what's currently loaded in this {data.snapshots ? "" : ""}view — export first if you're unsure.</p>
      </Card>
    </div>
  );
}

/* ---------- Tax estimate (multi-year, per-person, CPP/EI + credits) ---------- */
function emptyTaxPersonFull() {
  return { employment: 0, taxDeducted: 0, selfEmployment: 0, rental: 0, eligibleDividends: 0, nonEligDividends: 0, foreignIncome: 0, foreignTaxPaid: 0, otherIncome: 0,
    rrsp: 0, unionDues: 0, otherDeductions: 0,
    cppEiPaid: 0, age65: false, pensionIncome: 0, disability: false, donations: 0, medical: 0, tuition: 0,
    claimChildcare: true };
}
function computeTax(person, year, opts = {}) {
  const t = taxTableFor(year);
  const p = provFor(t, opts.province || "BC");
  const employment = num(person.employment);
  const se = num(person.selfEmployment);
  const grossDiv = num(person.eligibleDividends);
  const grossedDiv = grossDiv * 1.38;
  const nonEligDiv = num(person.nonEligDividends);
  const grossedNonElig = nonEligDiv * 1.15; // non-eligible gross-up 15%
  const foreign = num(person.foreignIncome);
  const totalIncome = employment + se + num(person.rental) + grossedDiv + grossedNonElig + foreign + num(person.otherIncome) + num(person.pensionIncome);

  const childcareDed = opts.childcareDed || 0;
  const deductions = num(person.rrsp) + num(person.unionDues) + num(person.otherDeductions) + childcareDed;
  const taxable = Math.max(0, totalIncome - deductions);

  const pensionable = Math.max(0, Math.min(employment, t.cppMax / t.cppRate + t.cppExempt) - t.cppExempt);
  const cppAuto = Math.min(pensionable * t.cppRate, t.cppMax);
  const eiAuto = Math.min(employment * t.eiRate, t.eiMax);
  const cppEi = num(person.cppEiPaid) > 0 ? num(person.cppEiPaid) : cppAuto + eiAuto;

  let fedCreditBase = t.fedBPA;
  if (person.age65) fedCreditBase += 9028;
  if (person.disability) fedCreditBase += 10341;
  fedCreditBase += Math.min(num(person.pensionIncome), 2000);
  fedCreditBase += cppEi + num(person.tuition);
  const medThreshold = Math.min(2834, totalIncome * 0.03);
  const medClaim = Math.max(0, num(person.medical) - medThreshold);
  fedCreditBase += medClaim;
  const fedCredit = fedCreditBase * t.fedRate + num(person.donations) * 0.29;
  const divCredit = grossedDiv * 0.150198 + grossedNonElig * 0.090301; // eligible + non-eligible federal DTC
  let fedTax = Math.max(0, progressiveTax(taxable, t.fed) - fedCredit - divCredit);
  if (p.quebec) fedTax = fedTax * (1 - QC_FED_ABATEMENT);

  const provCreditBase = p.bpa + cppEi + Math.min(num(person.pensionIncome), 1000) + medClaim;
  const provDivCr = grossedDiv * ((opts.province && PROV_DIV_CR[opts.province]) || 0) + grossedNonElig * ((opts.province && PROV_DIV_CR_NE[opts.province]) || 0);
  let provTax = Math.max(0, progressiveTax(taxable, p.brackets) - provCreditBase * p.rate - provDivCr);
  if (p.surtax) provTax += 0.20 * Math.max(0, provTax - p.surtax.a) + 0.36 * Math.max(0, provTax - p.surtax.b);
  if (p.lowInc) {
    const reduction = Math.max(0, p.lowInc.r - p.lowInc.claw * Math.max(0, taxable - p.lowInc.start));
    provTax = Math.max(0, provTax - reduction);
  }
  // Foreign tax credit: lesser of foreign tax paid and Canadian tax on the foreign portion
  let ftc = 0;
  if (foreign > 0 && taxable > 0) {
    const canTaxOnForeign = (fedTax + provTax) * Math.min(1, foreign / taxable);
    ftc = Math.min(num(person.foreignTaxPaid), canTaxOnForeign);
    const fedShare = fedTax + provTax > 0 ? fedTax / (fedTax + provTax) : 0.5;
    fedTax = Math.max(0, fedTax - ftc * fedShare);
    provTax = Math.max(0, provTax - ftc * (1 - fedShare));
  }
  const totalTax = fedTax + provTax;

  return { totalIncome, taxable, deductions, cppEi, fedTax, provTax, bcTax: provTax, totalTax, childcareDed, ftc,
    refund: num(person.taxDeducted) - totalTax, marginalRate: marginalAt(taxable, t, p) };
}
function marginalAt(income, t, p) {
  const f = t.fed.find(([lim]) => income <= lim) || t.fed[t.fed.length - 1];
  const b = p.brackets.find(([lim]) => income <= lim) || p.brackets[p.brackets.length - 1];
  return (f[1] + b[1]) * 100;
}

function TaxEstimateCard({ data, setData }) {
  const year = data.taxYear;
  const t = taxTableFor(year);
  const cc = computeChildcare(data, year);
  const [mode, setMode] = useState("p1");
  const [showAdv, setShowAdv] = useState(false);

  // ensure full person shape
  const getP = (key) => ({ ...emptyTaxPersonFull(), ...(data.taxEstimate?.[key] || {}) });
  const setPerson = (key, patch) => setData((d) => ({ ...d, taxEstimate: { ...d.taxEstimate, [key]: { ...emptyTaxPersonFull(), ...(d.taxEstimate?.[key] || {}), ...patch } } }));

  const totalNetRental = data.properties.reduce((s, p) => {
    const pct = p.occupancy === "partial" ? num(p.personalUsePct) / 100 : 0;
    const grossRent = monthlyRent(p) * 12;
    const ops = T776_LINES.filter((l) => l.code !== "8960").reduce((a, l) => a + num(p.expenses[l.code]) * (1 - pct), 0);
    const repairs = repairsByYear(p, year, "current").reduce((a, r) => a + num(r.amount) - (r.scope === "shared" ? num(r.amount) * pct : 0), 0);
    return s + (grossRent - ops - repairs);
  }, 0);

  const people = [{ key: "p1", name: data.household.p1Name || "Person 1", lower: cc.lowerIsP1 }, { key: "p2", name: data.household.p2Name || "Person 2", lower: !cc.lowerIsP1 }];
  const results = {};
  people.forEach((pp) => {
    const person = getP(pp.key);
    const childcareDed = pp.lower && person.claimChildcare ? cc.deduction : 0;
    results[pp.key] = computeTax(person, year, { childcareDed, province: data.household.province });
  });
  const combined = results.p1.refund + results.p2.refund;
  const active = people.find((p) => p.key === mode);
  const person = getP(mode);
  const res = results[mode];

  const Field = ({ label, k, hint }) => <NumberField label={label + (hint ? ` (${hint})` : "")} value={person[k]} onChange={(v) => setPerson(mode, { [k]: v })} />;
  const Check = ({ label, k }) => (
    <label className="flex items-center gap-2 text-sm text-stone-600 py-1"><input type="checkbox" checked={!!person[k]} onChange={(e) => setPerson(mode, { [k]: e.target.checked })} /> {label}</label>
  );

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h3 className="font-medium text-stone-700">Tax estimate · {year}</h3>
        <div className="flex bg-stone-100 rounded-full p-0.5 text-sm">
          {people.map((pp) => (
            <button key={pp.key} onClick={() => setMode(pp.key)} className={`px-3 py-1 rounded-full ${mode === pp.key ? "bg-white shadow-sm text-teal-700 font-medium" : "text-stone-500"}`}>{pp.name}</button>
          ))}
        </div>
      </div>

      {t.approx && <div className="mb-3 text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2">No verified tax tables for {year} yet — using {year < 2025 ? "older" : "latest (2026)"} rates as an approximation. Verified years: 2025, 2026.</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Inputs */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-stone-500 uppercase tracking-wide">Income</div>
          <Field label="Employment income" k="employment" hint="T4 box 14" />
          <Field label="Income tax deducted" k="taxDeducted" hint="T4 box 22" />
          <Field label="Self-employment income" k="selfEmployment" />
          <Field label="Rental income (your share)" k="rental" />
          <Field label="Eligible dividends (actual)" k="eligibleDividends" />
          <Field label="Non-eligible dividends" k="nonEligDividends" hint="small-biz/CCPC" />
          <Field label="Foreign income (in CAD)" k="foreignIncome" />
          <Field label="Foreign tax paid (in CAD)" k="foreignTaxPaid" />
          <Field label="Pension income" k="pensionIncome" />
          <Field label="Other income" k="otherIncome" />

          <div className="text-xs font-medium text-stone-500 uppercase tracking-wide pt-2">Deductions</div>
          <Field label="RRSP deduction" k="rrsp" />
          <Field label="Union / professional dues" k="unionDues" />
          <Field label="Other deductions" k="otherDeductions" />
          {active.lower && cc.deduction > 0 && <Check label={`Claim childcare deduction (${fmt(cc.deduction)})`} k="claimChildcare" />}

          <button onClick={() => setShowAdv(!showAdv)} className="text-xs text-teal-700 pt-1">{showAdv ? "Hide" : "Show"} credits & advanced</button>
          {showAdv && (
            <div className="space-y-2 pt-1 border-t border-stone-100">
              <Field label="Donations" k="donations" />
              <Field label="Medical expenses" k="medical" />
              <Field label="Tuition" k="tuition" />
              <Field label="CPP+EI paid (override)" k="cppEiPaid" hint="auto if 0" />
              <Check label="Age 65 or older" k="age65" />
              <Check label="Eligible for disability amount" k="disability" />
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-2">
          <div className="bg-stone-50 rounded-xl p-3 space-y-1 text-sm">
            <div className="flex justify-between text-stone-500"><span>Total income</span><span>{fmt(res.totalIncome)}</span></div>
            {res.childcareDed > 0 && <div className="flex justify-between text-stone-500"><span>Childcare deduction</span><span>−{fmt(res.childcareDed)}</span></div>}
            <div className="flex justify-between text-stone-500"><span>Total deductions</span><span>−{fmt(res.deductions)}</span></div>
            <div className="flex justify-between font-medium border-t border-stone-200 pt-1"><span>Taxable income</span><span>{fmt(res.taxable)}</span></div>
            <div className="flex justify-between text-stone-500"><span>Federal tax</span><span>{fmt(res.fedTax)}</span></div>
            <div className="flex justify-between text-stone-500"><span>{PROV_NAMES[data.household.province] || "Provincial"} tax</span><span>{fmt(res.bcTax)}</span></div>
            {res.ftc > 0 && <div className="flex justify-between text-stone-500"><span>Foreign tax credit</span><span>−{fmt(res.ftc)}</span></div>}
            <div className="flex justify-between text-stone-500"><span>Est. CPP + EI</span><span>{fmt(res.cppEi)}</span></div>
            <div className="flex justify-between font-medium border-t border-stone-200 pt-1"><span>Total income tax</span><span>{fmt(res.totalTax)}</span></div>
            <div className="flex justify-between text-stone-500"><span>Tax withheld</span><span>{fmt(num(person.taxDeducted))}</span></div>
            <div className="flex justify-between text-stone-400 text-xs"><span>Marginal rate</span><span>{res.marginalRate.toFixed(1)}%</span></div>
          </div>
          <div className={`rounded-xl p-4 text-center ${res.refund >= 0 ? "bg-emerald-50" : "bg-rose-50"}`}>
            <div className={`text-xs ${res.refund >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{active.name} · estimated {res.refund >= 0 ? "refund" : "balance owing"}</div>
            <div className={`text-3xl font-bold mt-1 ${res.refund >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{fmt(Math.abs(res.refund))}</div>
          </div>
          {totalNetRental !== 0 && <p className="text-xs text-stone-400">Household net rental this year ≈ {fmt(totalNetRental)} — split by ownership into each person's "Rental income" field.</p>}
        </div>
      </div>

      <div className={`mt-4 rounded-xl p-3 text-center font-semibold ${combined >= 0 ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
        Combined household: estimated {combined >= 0 ? "refund" : "balance owing"} of {fmt(Math.abs(combined))}
      </div>
      <p className="text-xs text-stone-400 mt-2">A robust estimate using verified {year} federal + provincial brackets, CPP/EI, and major non-refundable credits (basic personal, CPP/EI, pension, age, disability, donations, medical, tuition). It still simplifies some income-tested credits and won't match a filed return exactly — use certified tax software or an accountant to file.</p>
      {(getP("p1").foreignIncome > 0 || getP("p2").foreignIncome > 0) && (
        <div className="mt-2 text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2">
          Foreign income is taxed in Canada with a foreign tax credit for tax already paid abroad (the lesser of foreign tax paid and the Canadian tax on that income). This estimate doesn't model tax treaties or per-country rules. Heads-up: if your foreign property cost totals more than CAD $100,000 at any point in the year, you likely must file <strong>Form T1135</strong> — confirm with the CRA or an accountant.
        </div>
      )}

      <CompareYears person={person} active={active} cc={cc} province={data.household.province} />
    </Card>
  );
}

function CompareYears({ person, active, cc, province }) {
  const [open, setOpen] = useState(false);
  const years = Object.keys(TAX_YEARS).map(Number).sort();
  const rows = years.map((y) => {
    const childcareDed = active.lower && person.claimChildcare ? computeChildcareForYear(cc, y) : 0;
    return { y, ...computeTax(person, y, { childcareDed, province }) };
  });
  return (
    <div className="mt-3">
      <button onClick={() => setOpen(!open)} className="text-xs text-teal-700">{open ? "Hide" : "Compare"} years side by side</button>
      {open && (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-stone-400 border-b border-stone-200"><th className="text-left py-1.5 font-normal">Year</th><th className="text-right font-normal">Taxable</th><th className="text-right font-normal">Total tax</th><th className="text-right font-normal">Avg rate</th><th className="text-right font-normal">Refund / owing</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.y} className="border-b border-stone-50">
                  <td className="py-1.5">{r.y} <span className="text-xs text-stone-400">{active.name}</span></td>
                  <td className="text-right text-stone-500">{fmt(r.taxable)}</td>
                  <td className="text-right">{fmt(r.totalTax)}</td>
                  <td className="text-right text-stone-500">{r.totalIncome ? ((r.totalTax / r.totalIncome) * 100).toFixed(1) : "0.0"}%</td>
                  <td className={`text-right font-medium ${r.refund >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{r.refund >= 0 ? "+" : "−"}{fmt(Math.abs(r.refund))}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-stone-400 mt-1">Same inputs, applied to each year's rates — useful for seeing how indexation and rate changes affect you. Uses {PROV_NAMES[province] || "BC"} provincial rates.</p>
        </div>
      )}
    </div>
  );
}
function computeChildcareForYear(cc, y) { return cc.deduction; }

/* ---------- Tax Report ---------- */
function TaxReport({ data, setData }) {
  const year = data.taxYear;
  const setYear = (y) => setData((d) => ({ ...d, taxYear: num(y) }));
  const summaries = data.properties.map((p) => {
    const pct = p.occupancy === "partial" ? num(p.personalUsePct) / 100 : 0;
    const grossRent = monthlyRent(p) * 12;
    const recForLine = (code) => (data.receipts || []).filter((r) => r.applyTo === `rental:${p.id}` && receiptLine(r.category) === code && (r.date || "").slice(0, 4) === String(year)).reduce((s, r) => s + num(r.amount), 0);
    const lines = T776_LINES.filter((l) => l.code !== "8960").map((l) => {
      const total = num(p.expenses[l.code]) + recForLine(l.code);
      const personal = total * pct;
      return { ...l, total, personal, deductible: total - personal };
    });
    const currentRepairs = repairsByYear(p, year, "current");
    const repairTotal = currentRepairs.reduce((s, r) => s + num(r.amount), 0) + recForLine("8960");
    const repairPersonal = currentRepairs.reduce((s, r) => s + (r.scope === "shared" ? num(r.amount) * pct : 0), 0);
    lines.push({ code: "8960", label: "Maintenance & repairs", total: repairTotal, personal: repairPersonal, deductible: repairTotal - repairPersonal });
    lines.sort((a, b) => a.code.localeCompare(b.code));
    const totalDeductible = lines.reduce((s, l) => s + l.deductible, 0);
    const net = grossRent - totalDeductible;
    const yourShare = net * (num(p.ownershipPct) / 100);
    const capital = repairsByYear(p, year, "capital");
    return { p, grossRent, lines, net, yourShare, capital };
  });
  const buildCSVRows = () => {
    const rows = [["Property", "Line", "Category", "Total expense", "Personal portion", "Deductible"]];
    summaries.forEach((s) => {
      rows.push([s.p.name, "8299", "Gross rental income", s.grossRent.toFixed(2), "", ""]);
      s.lines.forEach((l) => rows.push([s.p.name, l.code, l.label, l.total.toFixed(2), l.personal.toFixed(2), l.deductible.toFixed(2)]));
      rows.push([s.p.name, "9369", "Net income before CCA", "", "", s.net.toFixed(2)]);
      rows.push([s.p.name, "9946", `Your share (${s.p.ownershipPct}%)`, "", "", s.yourShare.toFixed(2)]);
      s.capital.forEach((c) => rows.push([s.p.name, "CCA addition", c.description || c.date, c.amount.toFixed(2), "", ""]));
      rows.push([]);
    });
    return rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  };
  const exportCSV = () => {
    const csv = buildCSVRows();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `tax-summary-${year}.csv`; a.click();
    URL.revokeObjectURL(url);
  };
  const emailReport = () => {
    const prov = PROV_NAMES[data.household.province] || data.household.province || "BC";
    const lines = [
      `Cabintree Tax Summary — ${year}`,
      `Province: ${prov}`,
      `Generated: ${new Date().toLocaleDateString("en-CA")}`,
      "",
    ];
    summaries.forEach((s) => {
      lines.push(`${s.p.name} — T776 Rental Income`);
      lines.push(`  Gross rental income: ${fmt(s.grossRent)}`);
      s.lines.filter((l) => l.total > 0).forEach((l) => {
        lines.push(`  Line ${l.code} ${l.label}: ${fmt(l.deductible)}${l.personal > 0 ? ` (personal: ${fmt(l.personal)})` : ""}`);
      });
      lines.push(`  Net rental income: ${fmt(s.net)}`);
      lines.push(`  Your share (${s.p.ownershipPct}%): ${fmt(s.yourShare)}`);
      lines.push("");
    });
    if (summaries.length === 0) lines.push("No rental properties to report this year.", "");
    lines.push("---");
    lines.push("This is an estimate only. Use certified tax software or an accountant to file.");
    lines.push("Cabintree — cabintree.vercel.app");
    const subject = encodeURIComponent(`Tax Summary ${year} — Cabintree`);
    const body = encodeURIComponent(lines.join("\n"));
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };
  const emailCSV = () => {
    const csv = buildCSVRows();
    const subject = encodeURIComponent(`Tax Summary ${year} CSV — Cabintree`);
    const body = encodeURIComponent(`Tax summary for ${year} — paste the section below into a .csv file to open in Excel or Numbers.\n\n${csv}\n\nGenerated by Cabintree — cabintree.vercel.app`);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2"><span className="text-sm text-stone-600">Tax year</span>
          <select value={year} onChange={(e) => setYear(e.target.value)} className="px-2 py-1.5 text-sm border border-stone-300 rounded-lg bg-white">
            {Array.from({ length: 8 }, (_, i) => 2026 - i).map((y) => <option key={y} value={y}>{y}{TAX_YEARS[y] ? "" : " (approx)"}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={emailReport} className="flex items-center gap-1.5 text-sm border border-stone-300 text-stone-700 px-3 py-1.5 rounded-lg hover:bg-stone-50">✉ Email report</button>
          <div className="flex rounded-lg overflow-hidden border border-stone-800">
            <button onClick={exportCSV} className="flex items-center gap-1.5 text-sm bg-stone-800 text-white px-3 py-1.5 hover:bg-stone-700"><Download size={15} /> Export CSV</button>
            <div className="w-px bg-stone-600" />
            <button onClick={emailCSV} title="Email CSV data" className="flex items-center px-2.5 py-1.5 bg-stone-800 text-white hover:bg-stone-700 text-sm">✉</button>
          </div>
        </div>
      </div>
      <TaxEstimateCard data={data} setData={setData} />
      {summaries.length === 0 && <p className="text-sm text-stone-400">Add properties to generate T776 summaries.</p>}
      {summaries.map((s) => (
        <Card key={s.p.id}>
          <div className="flex justify-between items-baseline mb-3"><h3 className="font-medium text-stone-700">{s.p.name} — T776 summary</h3><span className="text-xs text-stone-400">{s.p.occupancy === "partial" ? `${s.p.personalUsePct}% personal use` : "100% rental"}</span></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-stone-400 border-b border-stone-200"><th className="text-left py-1.5 font-normal">Line</th><th className="text-left font-normal">Category</th><th className="text-right font-normal">Total</th><th className="text-right font-normal">Personal</th><th className="text-right font-normal">Deductible</th></tr></thead>
              <tbody>
                <tr className="border-b border-stone-100"><td className="py-1.5 text-stone-500">8299</td><td className="font-medium">Gross rental income</td><td className="text-right" colSpan={3}>{fmt2(s.grossRent)}</td></tr>
                {s.lines.filter((l) => l.total > 0).map((l) => <tr key={l.code} className="border-b border-stone-50"><td className="py-1 text-stone-500">{l.code}</td><td>{l.label}</td><td className="text-right text-stone-500">{fmt2(l.total)}</td><td className="text-right text-stone-400">{l.personal ? fmt2(l.personal) : "—"}</td><td className="text-right">{fmt2(l.deductible)}</td></tr>)}
                <tr className="border-t border-stone-200 font-medium"><td className="py-1.5 text-stone-500">9369</td><td colSpan={3}>Net rental income (before CCA)</td><td className={`text-right ${s.net >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{fmt2(s.net)}</td></tr>
                <tr className="text-stone-500"><td className="py-1">9946</td><td colSpan={3}>Your share ({s.p.ownershipPct}%)</td><td className="text-right">{fmt2(s.yourShare)}</td></tr>
              </tbody>
            </table>
          </div>
          {s.capital.length > 0 && (
            <div className="mt-3 bg-stone-50 rounded-lg p-3">
              <div className="text-xs font-medium text-stone-600 mb-1">Capital additions {year} → for CCA (line 9936)</div>
              {s.capital.map((c) => <div key={c.id} className="flex justify-between text-xs text-stone-500 py-0.5"><span>{c.description || "—"} ({c.date || "no date"})</span><span>{fmt2(c.amount)}</span></div>)}
              <p className="text-xs text-stone-400 mt-1.5">CCA isn't auto-calculated — it's optional and can affect your principal-residence exemption. Decide with your accountant.</p>
            </div>
          )}
        </Card>
      ))}
      <Card className="bg-emerald-50 border-emerald-200">
        <h3 className="font-medium text-emerald-800 mb-2">Other deductions to remember</h3>
        <div className="text-sm text-emerald-900 space-y-1">
          <div className="flex justify-between"><span>RRSP deduction (line 20800)</span><span>{fmt(contribInYear(data.investments?.rrsp?.contributions, year))}</span></div>
          <div className="flex justify-between"><span>FHSA deduction (line 20805)</span><span>{fmt(contribInYear(data.investments?.fhsa?.contributions, year))}</span></div>
          <div className="flex justify-between"><span>Childcare deduction (line 21400)</span><span>see Childcare tab</span></div>
        </div>
        <p className="text-xs text-emerald-700 mt-2">TFSA and RESP contributions aren't deductible, but RESP earns the CESG grant.</p>
      </Card>
      <Card className="bg-amber-50 border-amber-200"><div className="flex gap-2 text-sm text-amber-800"><AlertCircle size={18} className="shrink-0 mt-0.5" /><p>Organizes your records to CRA categories for {year}. A record-keeping aid, not tax advice or a filed return.</p></div></Card>
    </div>
  );
}
