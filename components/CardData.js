"use client";

export default function CardData({ type, data }) {
  if (!data) return null;

  if (type === "metric") {
    return (
      <div>
        <div className="metric-row">
          {data.metrics.map((m) => (
            <div key={m.label}>
              <div className="metric-value">{m.value}</div>
              <div className="metric-label">{m.label}</div>
            </div>
          ))}
        </div>
        <div className="as-of">As of {data.asOf}</div>
      </div>
    );
  }

  if (type === "table") {
    return (
      <div>
        <table>
          <thead>
            <tr>
              {data.columns.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="as-of">As of {data.asOf}</div>
      </div>
    );
  }

  if (type === "list") {
    return (
      <div>
        {data.items.map((item) => (
          <div key={item.label} className="list-row">
            <span>{item.label}</span>
            {item.url ? (
              <a
                className="list-value"
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.value} ↗
              </a>
            ) : (
              <span className="list-value">{item.value}</span>
            )}
          </div>
        ))}
        <div className="as-of">As of {data.asOf}</div>
      </div>
    );
  }

  return <div className="empty-hint">Unknown card type: {type}</div>;


