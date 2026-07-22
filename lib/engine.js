// lib/engine.js
//
// Thin wrapper around the xlsx library: read the uploaded master sheet into
// plain row objects, and write a recipe's output back out as a downloadable
// .xlsx file.

import * as XLSX from "xlsx";

// Parses the first sheet of an uploaded workbook into an array of plain
// objects, keyed by header row (e.g. { City: "Chennai", LoanID: "L1001", ... }).
export function parseMasterSheet(arrayBuffer) {
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
}

// Checks the parsed rows actually contain the columns a recipe needs, so a
// mismatched master sheet fails with a clear message instead of silently
// producing an empty/wrong report.
export function validateColumns(rows, requiredColumns) {
  if (!rows.length) return { ok: false, missing: requiredColumns };
  const actualColumns = new Set(Object.keys(rows[0]));
  const missing = requiredColumns.filter((c) => !actualColumns.has(c));
  return { ok: missing.length === 0, missing };
}

// Converts a recipe's { columns, rows } output into a downloadable .xlsx
// Blob, matching the format the department currently produces by hand.
export function buildOutputWorkbook(title, { columns, rows }) {
  const sheetData = [columns, ...rows];
  const sheet = XLSX.utils.aoa_to_sheet(sheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, title.slice(0, 31)); // sheet name length limit
  const out = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  return new Blob([out], { type: "application/octet-stream" });
}
