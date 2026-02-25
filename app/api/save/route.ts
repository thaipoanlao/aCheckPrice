import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const client = await db.connect();
  
  try {
    const { product_name, price, quantity, unit, unit_price } = await request.json();

    // คำสั่ง SQL สำหรับบันทึกข้อมูล
    await client.sql`
      INSERT INTO price_logs (product_name, price, quantity, unit, unit_price, user_tier)
      VALUES (${product_name}, ${price}, ${quantity}, ${unit}, ${unit_price}, 'free');
    `;

    return NextResponse.json({ message: 'บันทึกสำเร็จ!' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการบันทึก' }, { status: 500 });
  } finally {
    client.release();
  }
}
