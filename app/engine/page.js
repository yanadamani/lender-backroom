"use client";

import { useState } from "react";
import Link from "next/link";
import { RECIPE_REGISTRY } from "@/lib/recipes";
import { parseMasterSheet, validateColumns, buildOutputWorkbook } from "@/lib/engine";

export default function EnginePage() {
  const [rows, setRows] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [recipeId, setRecipeId] = useState(RECIPE_REGISTRY[0].id);
  const [cutoffDate, setCutoffDate] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const recipe = RECIPE_REGISTRY.find((r) => r.id === recipeId);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setResult(null);
    setFileName(file.name);
    const buffer = await file.arrayBuffer();
    try {
      const parsed = parseMasterSheet(buffer);
      setRows(parsed);
    } catch (err) {
      setError("Could not parse that file — is it a valid .xlsx?");
      setRows(null);
    }
  }

  function runRecipe() {
    if (!rows || !recipe) return;
    const check = validateColumns(rows, recipe.requiredColumns);
    if (!check.ok) {
      setError(`Master sheet is missing required column(s): ${check.missing.join(", ")}`);
      setResult(null);
      return;
    }
    if (recipe.needsCutoffDate && !cutoffDate) {
      setError("This recipe needs a report cutoff date — e.g. 2026-03-31 for a March report.");
      setResult(null);
      return;
    }
    setError(null);
    setResult(recipe.run(rows, { cutoffDate }));
  }

  function downloadResult() {
    if (!result || !recipe) return;
    const blob = buildOutputWorkbook(recipe.title, result);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${recipe.id}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="shell">
      <div className="topbar">
        <div>
          <div className="brand">Oro Corp</div>
          <h1 className="title">Report Engine</h1>
        </div>
        <Link href="/" className="nav-link">
          View dataroom
        </Link>
      </div>

      <div className="note-banner">
        "Portfolio Cuts" is a 1:1 port of the audited production logic — including its known quirks
        (GL/SL rows aren't mutually exclusive, some Tenure/DPD bins are permanently dead). Not
        fixed on purpose; this must match the real tool's output.
      </div>

      <div className="admin-grid">
        <div className="panel">
          <h3>1. Upload master sheet</h3>
          <input type="file" accept=".xlsx,.xls" onChange={handleUpload} />
          {fileName && <p className="empty-hint" style={{ marginTop: 10 }}>{fileName} — {rows?.length ?? 0} rows parsed</p>}

          <h3 style={{ marginTop: 24 }}>2. Choose a recipe</h3>
          <select
            className="period-select"
            style={{ width: "100%" }}
            value={recipeId}
            onChange={(e) => { setRecipeId(e.target.value); setResult(null); }}
          >
            {RECIPE_REGISTRY.map((r) => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>
          <p className="empty-hint" style={{ marginTop: 10 }}>{recipe?.description}</p>
          <p className="empty-hint" style={{ marginTop: 4 }}>
            Requires columns: {recipe?.requiredColumns.join(", ")}
          </p>

          {recipe?.needsCutoffDate && (
            <div style={{ marginTop: 16 }}>
              <h3>3. Report cutoff date</h3>
              <input
                type="date"
                value={cutoffDate}
                onChange={(e) => setCutoffDate(e.target.value)}
                style={{ width: "100%" }}
              />
              <p className="empty-hint" style={{ marginTop: 6 }}>
                "Open as of" this date — e.g. 2026-03-31 for the March report.
              </p>
            </div>
          )}

          <button style={{ marginTop: 16, width: "100%" }} onClick={runRecipe} disabled={!rows}>
            Generate
          </button>

          {error && <p style={{ color: "var(--danger)", fontSize: 13, marginTop: 12 }}>{error}</p>}
        </div>

        <div className="panel">
          <h3>3. Preview & download</h3>
          {!result && <div className="empty-hint">Upload a master sheet and generate a report to preview it here.</div>}
          {result && (
            <div>
              <table>
                <thead>
                  <tr>
                    {result.columns.map((c) => <th key={c}>{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => <td key={j}>{cell}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
              <button style={{ marginTop: 16 }} onClick={downloadResult}>
                Download .xlsx
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
