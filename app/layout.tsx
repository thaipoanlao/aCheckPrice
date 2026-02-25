export const metadata = {
  title: 'aCheckPrice - เครื่องคิดเลขเปรียบเทียบราคา',
  description: 'ช่วยคุณตัดสินใจเลือกซื้อสินค้าที่คุ้มค่าที่สุด',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  )
}
