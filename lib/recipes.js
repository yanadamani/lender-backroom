// lib/recipes.js
//
// portfolio-cuts below is a faithful port of the production logic described
// in a logic-audit of the original Portfolio Cuts tool
// (src/components/PortfolioTab.jsx + src/utils/dataHelpers.js). Function
// names and behavior are kept 1:1 with that audit, including its known
// quirks (asymmetric GL/SL ROI filtering, LTV's special top-bucket override,
// dead tenure bins, non-mutually-exclusive GL/SL rows). See chat history for
// the audit document and the discrepancies it flagged — those quirks are
// preserved here deliberately, not fixed, since this must match the real
// tool's output.
//
// Only field names and transform logic are encoded here — no real figures.

function toNum(v) {
  if (v === null || v === undefined || v === "" || v === "null") return 0;
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

// Change 1 (per audit): active = Closure is blank/null/'null'/NaN
export function isActiveRow(row) {
  const c = row["Closure"];
  if (c === null || c === undefined || c === "" || c === "null") return true;
  if (typeof c === "number" && isNaN(c)) return true;
  if (typeof c === "string" && c.trim() === "") return true;
  return false;
}

// GL/SL are NOT mutually exclusive — a row can be both.
export function isGL(row) {
  return toNum(row["gl amount"]) > 0;
}
export function isSL(row) {
  return toNum(row["sl amount"]) > 0;
}

// Change 4 (per audit): NPA-1/2/3 all collapse to 91-180 DPD.
// 181-365 DPD and >365 DPD are never populated by this map at all.
export const DPD_BUCKET_MAP = {
  "M-1": "Current", "M-2": "Current", "M-3": "Current",
  "M-4": "Current", "M-5": "Current", "M-6": "Current",
  "P-1": "1-30 DPD",
  "P-2": "31-60 DPD",
  "P-3": "61-90 DPD",
  "NPA-1": "91-180 DPD", "NPA-2": "91-180 DPD", "NPA-3": "91-180 DPD",
};

const DPD_COLUMNS = ["Current", "1-30 DPD", "31-60 DPD", "61-90 DPD", "91-180 DPD", "181-365 DPD", ">365 DPD"];

function getLoanId(row) {
  return String(row["loan id"] || row["Loan ID"] || "");
}

// Tenure is determined SOLELY by loan ID prefix — no date math.
// OMGL -> 3-6 Months, TCGL -> 9-12 Months. The other two bins are dead
// (can never populate) under the current loan-ID scheme — this matches
// the real tool's behavior, not a bug in this port.
export function getTenureBinByLoanId(row) {
  const id = getLoanId(row).toUpperCase();
  if (id.startsWith("OMGL")) return "3-6 Months";
  if (id.startsWith("TCGL")) return "9-12 Months";
  return null;
}
export const TENURE_BINS = ["< 3 Months", "3-6 Months", "6-9 Months", "9-12 Months"];

// Falls back through three columns in order — Loan Amount, then loan amount,
// then gl amount. This inconsistency (flagged in the audit) is preserved.
export function getLoanAmount(row) {
  return toNum(row["Loan Amount"] || row["loan amount"] || row["gl amount"]);
}

export const TICKET_BINS = [
  "<=10K", "10-20K", "20-30K", "30-40K", "40-50K", "50-75K", "75-100K",
  "1-2L", "2-3L", "3-4L", "4-5L", "5-6L", "6-7L", "7-8L", "8-9L", "9-10L", ">10L",
];
export const DEFAULT_TICKET_BREAKPOINTS = [
  10000, 20000, 30000, 40000, 50000, 75000, 100000,
  200000, 300000, 400000, 500000, 600000, 700000, 800000, 900000, 1000000,
];

export const LTV_BINS = ["<=25%", ">25-40%", ">40-50%", ">50-60%", ">60-75%", ">75-80%", ">80%"];
export const DEFAULT_LTV_BREAKPOINTS = [25, 40, 50, 60, 75, 80];

export const IRR_BINS = ["<=12%", "12-15%", "15-18%", "18-21%", "21-24%", "24-27%", "27-30%", ">30%"];
export const DEFAULT_IRR_BREAKPOINTS = [12, 15, 18, 21, 24, 27, 30];

// Upper-bound-inclusive / lower-bound-exclusive.
export function getBinFromBreakpoints(value, breakpoints, labels) {
  for (let i = 0; i < breakpoints.length; i++) {
    if (value <= breakpoints[i]) return labels[i];
  }
  return labels[labels.length - 1];
}

// Change 10 (per audit): this is an ALLOWLIST, not an exclusion list —
// any city not present here (including Kochi) is dropped by omission.
export const CITY_STATE_MAP = {
  chennai: "Tamil Nadu",
  perambur: "Tamil Nadu",
  ambattur: "Tamil Nadu",
  bengaluru: "Karnataka",
  bangalore: "Karnataka",
  hyderabad: "Telangana",
  "hyd-west": "Telangana",
  "hyd-east": "Telangana",
  "hyd-central": "Telangana",
  karimnagar: "Telangana",
  warangal: "Telangana",
  vijayawada: "Andhra Pradesh",
  guntur: "Andhra Pradesh",
  pune: "Maharashtra",
};
export const STATE_BINS = ["Karnataka", "Tamil Nadu", "Andhra Pradesh", "Telangana", "Maharashtra"];

export function getCityState(city) {
  if (!city) return null;
  return CITY_STATE_MAP[String(city).trim().toLowerCase()] || null;
}

function emptyPortfolioRow() {
  const dpd = {};
  DPD_COLUMNS.forEach((c) => (dpd[c] = 0));
  return { amount: 0, count: 0, dpd };
}

// Core table builder — identical shape to the audited buildPortfolioTable.
export function buildPortfolioTable(rows, dimFn, amountFn) {
  const table = {};
  rows.forEach((row) => {
    const dim = dimFn(row);
    if (!dim) return;
    const amt = amountFn(row);
    const bucketCode = String(row["Bucket"] || "").trim();
    const dpdBucket = DPD_BUCKET_MAP[bucketCode] || null;
    if (!table[dim]) table[dim] = emptyPortfolioRow();
    table[dim].amount += amt;
    table[dim].count += 1;
    if (dpdBucket && table[dim].dpd[dpdBucket] !== undefined) {
      table[dim].dpd[dpdBucket] += amt;
    }
  });
  return table;
}

function fillBins(table, bins) {
  bins.forEach((b) => {
    if (!table[b]) table[b] = emptyPortfolioRow();
  });
  return table;
}

function toCr(v) {
  return `₹${(v / 1e7).toFixed(7)} Cr`;
}

// Flattens a { segment: { amount, count, dpd } } table into output rows for
// the given sheet/side label pair, preserving DPD columns per the audit
// (181-365 and >365 are always 0/dash here since DPD_BUCKET_MAP never
// populates them).
function flattenTable(table, sheet, side, orderedBins) {
  const bins = orderedBins || Object.keys(table);
  return bins.map((segment) => {
    const row = table[segment] || emptyPortfolioRow();
    return [
      sheet,
      side,
      segment,
      toCr(row.amount),
      String(row.count),
      ...DPD_COLUMNS.map((c) => (row.dpd[c] ? toCr(row.dpd[c]) : "-")),
    ];
  });
}

export const RECIPE_REGISTRY = [
  {
    id: "portfolio-cuts",
    title: "Portfolio Cuts",
    description:
      "Faithful port of the production Portfolio Cuts logic — Tenure, Ticket Size, LTV, Interest Rate, and State cuts, GL/SL split where applicable.",
    requiredColumns: [
      "loan id", "Closure", "gl amount", "sl amount", "Bucket", "City",
      "GL LTV", "GL ROI", "SL ROI",
    ],
    run(rows) {
      const activeRows = rows.filter(isActiveRow);
      const glRows = activeRows.filter(isGL);
      const slRows = activeRows.filter(isSL);

      const out = [];

      // --- Tenure Wise: GL and SL, same dimension fn, different amount col ---
      const tenureGL = fillBins(
        buildPortfolioTable(glRows, getTenureBinByLoanId, (r) => toNum(r["gl amount"])),
        TENURE_BINS
      );
      const tenureSL = fillBins(
        buildPortfolioTable(slRows, getTenureBinByLoanId, (r) => toNum(r["sl amount"])),
        TENURE_BINS
      );
      out.push(...flattenTable(tenureGL, "Tenure Wise", "Gold Loan", TENURE_BINS));
      out.push(...flattenTable(tenureSL, "Tenure Wise", "Support Loan", TENURE_BINS));

      // --- Ticket Size Wise: single combined table (not GL/SL split) ---
      const ticketTable = fillBins(
        buildPortfolioTable(
          activeRows,
          (r) => getBinFromBreakpoints(getLoanAmount(r), DEFAULT_TICKET_BREAKPOINTS, TICKET_BINS),
          (r) => getLoanAmount(r)
        ),
        TICKET_BINS
      );
      out.push(...flattenTable(ticketTable, "Ticket Size Wise", "Combined", TICKET_BINS));

      // --- LTV Wise: GL-only, case/whitespace-tolerant column resolution,
      //     special top-bucket override ---
      const ltvColKey =
        activeRows.length > 0
          ? Object.keys(activeRows[0]).find((k) => k.trim().toLowerCase() === "gl ltv") || "GL LTV"
          : "GL LTV";
      const lastLtvBp = DEFAULT_LTV_BREAKPOINTS[DEFAULT_LTV_BREAKPOINTS.length - 1];
      const ltvTable = fillBins(
        buildPortfolioTable(
          activeRows,
          (r) => {
            const ltv = toNum(r[ltvColKey]);
            if (!ltv) return null;
            const pct = parseFloat((ltv * 100).toFixed(4));
            if (pct >= lastLtvBp) return LTV_BINS[LTV_BINS.length - 1];
            return getBinFromBreakpoints(pct, DEFAULT_LTV_BREAKPOINTS, LTV_BINS);
          },
          (r) => toNum(r["gl amount"])
        ),
        LTV_BINS
      );
      out.push(...flattenTable(ltvTable, "LTV Wise", "Gold Loan", LTV_BINS));

      // --- Interest Rate Wise: GL and SL, separate ROI columns, SL has a
      //     sentinel-value pre-filter GL does not have ---
      const irrGL = fillBins(
        buildPortfolioTable(
          glRows,
          (r) => {
            const roi = toNum(r["GL ROI"]);
            if (!roi) return null;
            return getBinFromBreakpoints(roi > 1 ? roi : roi * 100, DEFAULT_IRR_BREAKPOINTS, IRR_BINS);
          },
          (r) => toNum(r["gl amount"])
        ),
        IRR_BINS
      );
      const irrSL = fillBins(
        buildPortfolioTable(
          slRows.filter((r) => r["SL ROI"] !== "No SL"),
          (r) => {
            const roi = toNum(r["SL ROI"]);
            if (!roi) return null;
            return getBinFromBreakpoints(roi > 1 ? roi : roi * 100, DEFAULT_IRR_BREAKPOINTS, IRR_BINS);
          },
          (r) => toNum(r["sl amount"])
        ),
        IRR_BINS
      );
      out.push(...flattenTable(irrGL, "Interest Rate Wise", "Gold Loan", IRR_BINS));
      out.push(...flattenTable(irrSL, "Interest Rate Wise", "Support Loan", IRR_BINS));

      // --- State Wise: GL and SL, allowlist City->State lookup ---
      const stateGL = fillBins(
        buildPortfolioTable(glRows, (r) => getCityState(r["City"]), (r) => toNum(r["gl amount"])),
        STATE_BINS
      );
      const stateSL = fillBins(
        buildPortfolioTable(slRows, (r) => getCityState(r["City"]), (r) => toNum(r["sl amount"])),
        STATE_BINS
      );
      out.push(...flattenTable(stateGL, "State Wise", "Gold Loan", STATE_BINS));
      out.push(...flattenTable(stateSL, "State Wise", "Support Loan", STATE_BINS));

      return {
        columns: ["Sheet", "Side", "Segment", "AUM", "Loans", ...DPD_COLUMNS],
        rows: out,
      };
    },
  },
];

export function getRecipe(recipeId) {
  return RECIPE_REGISTRY.find((r) => r.id === recipeId) || null;
}
