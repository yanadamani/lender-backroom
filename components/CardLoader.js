"use client";

import { useEffect, useState } from "react";
import { CARD_REGISTRY } from "@/lib/cards";
import CardData from "@/components/CardData";

export default function CardLoader({ cardId }) {
  const card = CARD_REGISTRY.find((c) => c.id === cardId);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!card) return;
    setLoading(true);
    card.fetchFn().then((result) => {
      setData(result);
      setLoading(false);
    });
  }, [cardId]);

  if (!card) {
    return <div className="empty-hint">Card not found.</div>;
  }

  return (
    <div className="detail-panel">
      <h2 className="detail-title">{card.title}</h2>
      <p className="detail-desc">{card.description}</p>
      {loading ? <div className="loading">Loading…</div> : <CardData type={card.type} data={data} />}
    </div>
  );
}
