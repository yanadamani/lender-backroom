"use client";

import { useState } from "react";
import { CARD_REGISTRY } from "@/lib/cards";

const SEED_LENDERS = [
  { id: "l1", name: "Federal Bank", cardIds: ["loan-book-snapshot", "collateral-valuation"] },
  { id: "l2", name: "Tenmark Capital", cardIds: ["portfolio-quality", "ltv-breach"] },
];

export default function AdminPanel() {
  const [lenders, setLenders] = useState(SEED_LENDERS);
  const [selectedId, setSelectedId] = useState(SEED_LENDERS[0]?.id || null);
  const [newLenderName, setNewLenderName] = useState("");

  const selected = lenders.find((l) => l.id === selectedId) || null;

  function addLender() {
    const name = newLenderName.trim();
    if (!name) return;
    const id = `l${Date.now()}`;
    const next = [...lenders, { id, name, cardIds: [] }];
    setLenders(next);
    setSelectedId(id);
    setNewLenderName("");
  }

  function removeLender(id) {
    const next = lenders.filter((l) => l.id !== id);
    setLenders(next);
    if (selectedId === id) setSelectedId(next[0]?.id || null);
  }

  function toggleCard(cardId) {
    if (!selected) return;
    const has = selected.cardIds.includes(cardId);
    const updatedCardIds = has
      ? selected.cardIds.filter((c) => c !== cardId)
      : [...selected.cardIds, cardId];
    setLenders(lenders.map((l) => (l.id === selected.id ? { ...l, cardIds: updatedCardIds } : l)));
  }

  return (
    <div className="shell">
      <div className="topbar">
        <div>
          <div className="brand">Oro Corp</div>
          <h1 className="title">Dataroom Admin</h1>
        </div>
        <a href="/" className="nav-link">
          View dataroom
        </a>
      </div>

      <div className="note-banner">
        Scaffold mode — lenders and permissions here are in-memory only (reset on refresh) and there is
        no login/OTP yet. This is the shape the real admin panel will take once wired to Firestore and
        auth.
      </div>

      <div className="admin-grid">
        <div className="panel">
          <h3>Lenders</h3>
          <div className="form-row">
            <input
              type="text"
              placeholder="New lender name"
              value={newLenderName}
              onChange={(e) => setNewLenderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addLender()}
            />
            <button onClick={addLender}>Add</button>
          </div>
          {lenders.length === 0 && <div className="empty-hint">No lenders yet.</div>}
          {lenders.map((l) => (
            <div
              key={l.id}
              className={`lender-row ${l.id === selectedId ? "active" : ""}`}
              onClick={() => setSelectedId(l.id)}
            >
              <span>{l.name}</span>
              <span className="badge" onClick={(e) => { e.stopPropagation(); removeLender(l.id); }}>
                remove
              </span>
            </div>
          ))}
        </div>

        <div className="panel">
          <h3>{selected ? `Card access — ${selected.name}` : "Card access"}</h3>
          {!selected && <div className="empty-hint">Select or add a lender to manage their card access.</div>}
          {selected &&
            CARD_REGISTRY.map((card) => (
              <label key={card.id} className="checkbox-row">
                <input
                  type="checkbox"
                  checked={selected.cardIds.includes(card.id)}
                  onChange={() => toggleCard(card.id)}
                />
                <span>{card.title}</span>
                <span className="badge" style={{ marginLeft: "auto" }}>
                  {card.category}
                </span>
              </label>
            ))}
        </div>
      </div>
    </div>
  );
}
