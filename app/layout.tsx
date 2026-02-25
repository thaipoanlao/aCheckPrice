import type { Metadata } from "next";
import "./globals.css"; // บรรทัดนี้สำคัญมาก เพื่อให้สีและดีไซน์ทำงาน

export const metadata: Metadata = {
  title: "aCheckPrice - เปรียบเทียบราคาสินค้า",
  description: "เครื่องมือช่วยตัดสินใจเลือกซื้อสินค้าที่คุ้มค่าที่สุด",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
