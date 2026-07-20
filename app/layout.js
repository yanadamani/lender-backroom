import "./globals.css";

export const metadata = {
  title: "Oro Lender Dataroom",
  description: "Live lender data dataroom scaffold",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
