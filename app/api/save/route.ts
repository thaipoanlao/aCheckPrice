import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. รับข้อมูลจากหน้าบ้าน (Frontend)
    const { 
      product_name, 
      price, 
      quantity, 
      unit, 
      unit_price, 
      category, 
      location 
    } = await request.json();

    // 2. เชื่อมต่อกับฐานข้อมูล acheckprice-db
    const client = await db.connect();
    
    // 3. บันทึกข้อมูลลงตาราง price_logs พร้อมข้อมูลใหม่ (Category & Location)
    await client.sql`
      INSERT INTO price_logs (
        product_name, 
        price, 
        quantity, 
        unit, 
        unit_price, 
        category, 
        location, 
        user_tier
      )
      VALUES (
        ${product_name}, 
        ${price}, 
        ${quantity}, 
        ${unit}, 
        ${unit_price}, 
        ${category || null}, 
        ${location || null}, 
        'free'
      );
    `;

    // 4. คืนการเชื่อมต่อให้กับ Pool
    client.release();
    
    return NextResponse.json({ message: 'บันทึกข้อมูลสำเร็จแล้ว' }, { status: 200 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาตรวจสอบการตั้งค่าฐานข้อมูล' }, 
      { status: 500 }
    );
  }
}
