import Link from "next/link";
import CardLoader from "@/components/CardLoader";

export default function CardPage({ params }) {
  return (
    <div className="shell">
      <Link href="/" className="back-link">
        ← Back to dataroom
      </Link>
      <CardLoader cardId={params.cardId} />
    </div>
  );
}
