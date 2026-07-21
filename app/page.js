import Link from "next/link";
import { listCardsByCategory } from "@/lib/cards";

export default function DataroomHome() {
  const grouped = listCardsByCategory();

  return (
    <div className="shell">
      <div className="topbar">
        <div>
          <div className="brand">Oro Corp</div>
          <h1 className="title">Lender Dataroom</h1>
        </div>
        <Link href="/admin" className="nav-link">
          Admin
        </Link>
      </div>

      <div className="category-grid">
        {Object.entries(grouped).map(([category, cards]) => (
          <div key={category} className="category-block">
            <div className="category-label">{category}</div>
            <div className="card-grid">
              {cards.map((card) => (
                <Link key={card.id} href={`/card/${card.id}`} className="card-tile">
                  <p className="card-tile-title">{card.title}</p>
                  <p className="card-tile-desc">{card.description}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
