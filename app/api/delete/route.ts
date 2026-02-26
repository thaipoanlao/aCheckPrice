import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json(); // รับ ID ของรายการที่จะลบ
    const client = await db.connect();
    
    // คำสั่ง SQL สำหรับลบข้อมูลตาม ID
    await client.sql`
      DELETE FROM price_logs 
      WHERE id = ${id};
    `;

    client.release();
    return NextResponse.json({ message: 'ลบข้อมูลสำเร็จ' }, { status: 200 });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'ไม่สามารถลบข้อมูลได้' }, { status: 500 });
  }
}
