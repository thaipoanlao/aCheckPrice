import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// บังคับให้ Fetch ข้อมูลใหม่เสมอ ไม่ใช้ Cache เก่า
export const revalidate = 0;

export async function GET() {
  try {
    const client = await db.connect();
    
    // ดึงข้อมูล 10 รายการล่าสุดจากตาราง price_logs
    const { rows } = await client.sql`
      SELECT * FROM price_logs 
      ORDER BY created_at DESC 
      LIMIT 10;
    `;

    client.release();
    return NextResponse.json(rows);
  } catch (error) {
    console.error('History fetch error:', error);
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลได้' }, { status: 500 });
  }
}
