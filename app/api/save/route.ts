import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. รับข้อมูลจากหน้าบ้าน (Frontend)
    const { product_name, price, quantity, unit, unit_price } = await request.json();

    // 2. เชื่อมต่อกับ Database acheckprice-db
    const client = await db.connect();
    
    // 3. ยัดข้อมูลลงตาราง price_logs
    await client.sql`
      INSERT INTO price_logs (product_name, price, quantity, unit, unit_price, user_tier)
      VALUES (${product_name}, ${price}, ${quantity}, ${unit}, ${unit_price}, 'free');
    `;

    // 4. คืนการเชื่อมต่อ (สำคัญเพื่อไม่ให้ DB เต็ม)
    client.release();
    
    return NextResponse.json({ message: 'บันทึกสำเร็จ!' }, { status: 200 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการบันทึก' }, { status: 500 });
  }
}
