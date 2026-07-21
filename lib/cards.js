// lib/cards.js
//
// A "card" is the atomic unit of the dataroom. Each card has metadata
// (id, title, description, category) plus a fetchFn that returns its data.
//
// Right now every fetchFn returns mock data. When the real data catalog and
// source system (Metabase / prod DB / aggregation layer) are known, only
// fetchFn needs to change per card — the registry shape, the UI shell, and
// the admin panel do not.
//
// `type` tells the UI how to render the card's data:
//   "metric"  -> one big number + label
//   "table"   -> rows/columns
//   "list"    -> simple bullet list of key/value pairs

function mockDelay(data, ms = 350) {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export const CARD_REGISTRY = [
  {
    id: "loan-book-snapshot",
    title: "Loan Book Snapshot",
    description: "Outstanding loan book summary — count, principal, and average ticket size.",
    category: "Portfolio",
    type: "metric",
    fetchFn: async () =>
      mockDelay({
        asOf: new Date().toISOString().slice(0, 10),
        metrics: [
          { label: "Active loans", value: "12,480" },
          { label: "Outstanding principal", value: "₹184.2 Cr" },
          { label: "Average ticket size", value: "₹1.48 L" },
        ],
      }),
  },
  {
    id: "collateral-valuation",
    title: "Collateral Valuation",
    description: "Gold collateral valuation summary across active loans.",
    category: "Collateral",
    type: "table",
    fetchFn: async () =>
      mockDelay({
        asOf: new Date().toISOString().slice(0, 10),
        columns: ["Purity", "Total gross weight (g)", "Valuation (₹)"],
        rows: [
          ["22K", "48,210", "₹22.4 Cr"],
          ["18K", "9,340", "₹3.1 Cr"],
          ["24K", "2,110", "₹1.2 Cr"],
        ],
      }),
  },
  {
    id: "portfolio-quality",
    title: "Portfolio Quality / NPA",
    description: "Non-performing asset ratios and delinquency buckets.",
    category: "Risk",
    type: "table",
    fetchFn: async () =>
      mockDelay({
        asOf: new Date().toISOString().slice(0, 10),
        columns: ["Bucket", "Loans", "Outstanding (₹)", "% of book"],
        rows: [
          ["0–30 days", "312", "₹4.1 Cr", "2.2%"],
          ["31–60 days", "88", "₹1.3 Cr", "0.7%"],
          ["61–90 days", "41", "₹0.6 Cr", "0.3%"],
          ["90+ days (NPA)", "19", "₹0.3 Cr", "0.15%"],
        ],
      }),
  },
  {
    id: "ltv-breach",
    title: "LTV Breach Report",
    description: "Loans currently breaching sanctioned loan-to-value thresholds.",
    category: "Risk",
    type: "metric",
    fetchFn: async () =>
      mockDelay({
        asOf: new Date().toISOString().slice(0, 10),
        metrics: [
          { label: "Loans in breach", value: "27" },
          { label: "Total exposure", value: "₹41.6 L" },
          { label: "Avg. breach severity", value: "4.2%" },
        ],
      }),
  },
  {
    id: "disbursement-trend",
    title: "Disbursement Trend",
    description: "Monthly disbursement volume over the trailing 6 months.",
    category: "Portfolio",
    type: "list",
    fetchFn: async () =>
      mockDelay({
        asOf: new Date().toISOString().slice(0, 10),
        items: [
          { label: "Feb 2026", value: "₹14.8 Cr" },
          { label: "Mar 2026", value: "₹16.2 Cr" },
          { label: "Apr 2026", value: "₹15.1 Cr" },
          { label: "May 2026", value: "₹17.9 Cr" },
          { label: "Jun 2026", value: "₹18.4 Cr" },
          { label: "Jul 2026", value: "₹12.0 Cr (MTD)" },
        ],
      }),
  },
  {
    id: "financial-statements",
    title: "Financial Statements",
    description: "Latest audited/management financial statement references.",
    category: "Financials",
    type: "list",
    fetchFn: async () =>
      mockDelay({
        asOf: new Date().toISOString().slice(0, 10),
        items: [
          { label: "FY 2024–25 Audited Financials", value: "Available" },
          { label: "Q1 FY 2026–27 Management Accounts", value: "Available" },
          { label: "Statutory Auditor", value: "Placeholder & Co." },
        ],
      }),
  },
  {
    id: "audited-financials",
    title: "Audited Financials",
    description: "Statutory audited financial statements by fiscal year.",
    category: "Financials",
    type: "list",
    fetchFn: async () =>
      mockDelay({
        asOf: new Date().toISOString().slice(0, 10),
        items: [
          { label: "FY 2023–24 Audited Financials", value: "Available" },
          { label: "FY 2024–25 Audited Financials", value: "Available" },
          { label: "Statutory Auditor", value: "Placeholder & Co." },
        ],
      }),
  },
  {
    id: "provisional-financials",
    title: "Provisional Financials",
    description: "Latest unaudited / management-prepared provisional financials.",
    category: "Financials",
    type: "list",
    fetchFn: async () =>
      mockDelay({
        asOf: new Date().toISOString().slice(0, 10),
        items: [
          { label: "Q1 FY 2026–27 Provisional P&L", value: "Available" },
          { label: "Q1 FY 2026–27 Provisional Balance Sheet", value: "Available" },
          { label: "Prepared by", value: "Internal Finance Team" },
        ],
      }),
  },
  {
    id: "debt-profile",
    title: "Debt Profile",
    description: "Oro's own borrowing profile — lender mix, tenor, and cost of funds.",
    category: "Financials",
    type: "metric",
    fetchFn: async () =>
      mockDelay({
        asOf: new Date().toISOString().slice(0, 10),
        metrics: [
          { label: "Total borrowings", value: "₹142.6 Cr" },
          { label: "Active lenders", value: "7" },
          { label: "Weighted avg. cost of funds", value: "11.4%" },
        ],
      }),
  },
  {
    id: "portfolio-cuts",
    title: "Portfolio Cuts",
    description: "Loan book segmented by city, ticket size, and tenor.",
    category: "Portfolio",
    type: "table",
    fetchFn: async () =>
      mockDelay({
        asOf: new Date().toISOString().slice(0, 10),
        columns: ["Segment", "Loans", "Outstanding (₹)"],
        rows: [
          ["Chennai", "4,120", "₹58.1 Cr"],
          ["Coimbatore", "2,340", "₹31.4 Cr"],
          ["Madurai", "1,880", "₹24.9 Cr"],
          ["Others", "4,140", "₹69.8 Cr"],
        ],
      }),
  },
  {
    id: "corporate-deck",
    title: "Corporate Deck",
    description: "Company overview deck — business model, footprint, and key highlights.",
    category: "Company Overview",
    type: "list",
    fetchFn: async () =>
      mockDelay({
        asOf: new Date().toISOString().slice(0, 10),
        items: [
          { label: "Corporate Overview Deck", value: "Available" },
          { label: "Last updated", value: "Jul 2026" },
        ],
      }),
  },
];

export function getCardMeta(cardId) {
  return CARD_REGISTRY.find((c) => c.id === cardId) || null;
}

// Controls the order categories render in on the dataroom home page.
// Any category not listed here falls back to the end, in first-seen order.
const CATEGORY_ORDER = ["Company Overview", "Portfolio", "Collateral", "Risk", "Financials"];

export function listCardsByCategory() {
  const grouped = {};
  for (const card of CARD_REGISTRY) {
    grouped[card.category] = grouped[card.category] || [];
    grouped[card.category].push(card);
  }

  const ordered = {};
  for (const category of CATEGORY_ORDER) {
    if (grouped[category]) {
      ordered[category] = grouped[category];
      delete grouped[category];
    }
  }
  // Any remaining (unlisted) categories are appended after the defined order.
  return { ...ordered, ...grouped };
}
