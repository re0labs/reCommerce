import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "reCommerce - Crypto Demo Store",
  description: "Demo store showcasing reCeption API smart contract analysis during crypto payments",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
