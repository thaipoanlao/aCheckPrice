'use client'

import { useState } from 'react'

export default function CheckPricePage() {
  const [productA, setProductA] = useState({ price: '', qty: '', unit: 'g' })
  const [productB, setProductB] = useState({ price: '', qty: '', unit: 'g' })

  // 1. กำหนดตัวคูณเพื่อแปลงเป็นหน่วยฐาน (Base Unit)
  // g = 1, kg = 1000 | ml = 1, l = 1000
  const unitMultipliers: { [key: string]: number } = {
    g: 1,
    kg: 1000,
    ml: 1,
    l: 1000,
    piece: 1,
  }

  // 2. ปรับปรุงฟังก์ชันคำนวณให้รองรับตัวคูณ
  const calculateUnitPrice = (price: string, qty: string, unit: string) => {
    const p = parseFloat(price)
    const q = parseFloat(qty)
    const multiplier = unitMultipliers[unit] || 1
    
    if (!p || !q || q === 0) return 0
    
    // คำนวณหา "ราคาต่อ 1 หน่วยเล็กที่สุด" (เช่น ราคาต่อ 1 กรัม)
    return p / (q * multiplier)
  }

  const unitPriceA = calculateUnitPrice(productA.price, productA.qty, productA.unit)
  const unitPriceB = calculateUnitPrice(productB.price, productB.qty, productB.unit)

  const isAWinner = unitPriceA > 0 && (unitPriceB === 0 || unitPriceA < unitPriceB)
  const isBWinner = unitPriceB > 0 && (unitPriceA === 0 || unitPriceB < unitPriceA)

  // ฟังก์ชันช่วยแสดงผลราคาต่อหน่วยให้ดูง่าย (เช่น แสดงเป็น ราคาต่อ 1000 หน่วย หรือ 1 กก.)
  const formatDisplayPrice = (unitPrice: number) => {
    if (unitPrice === 0) return '0.00'
    // แสดงเป็นราคาต่อ 1000 หน่วย (เช่น ต่อ 1kg หรือ 1L) เพื่อให้ตัวเลขไม่น้อยเกินไปจนดูยาก
    return (unitPrice * 1000).toFixed(2)
  }

  const handleSave = async (side: 'A' | 'B') => {
    const data = side === 'A' ? productA : productB;
    const unitPrice = side === 'A' ? unitPriceA : unitPriceB;

    if (!data.price || !data.qty) {
      alert('กรุณากรอกข้อมูลให้ครบก่อนบันทึกนะจ๊ะ');
      return;
    }

    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: `สินค้าแบบ ${side}`,
          price: parseFloat(data.price),
          quantity: parseFloat(data.qty),
          unit: data.unit,
          unit_price: unitPrice // บันทึกราคาต่อ 1 หน่วยเล็กที่สุดลง DB เสมอ เพื่อความแม่นยำ
        }),
      });

      if (response.ok) {
        alert(`บันทึกข้อมูลแบบ ${side} เรียบร้อยแล้ว!`);
      }
    } catch (error) {
      alert('บันทึกล้มเหลว');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 font-sans bg-gray-50 min-h-screen">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-black text-blue-600 tracking-tight">aCheckPrice</h1>
        <p className="text-gray-500 text-sm font-medium">ฉลาดเลือก ฉลาดช้อป 🛒</p>
      </header>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Card สินค้า A */}
        <div className={`p-4 rounded-3xl shadow-sm border-4 transition-all ${isAWinner ? 'border-green-500 bg-white scale-105 shadow-green-200' : 'border-white bg-white/50'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">แบบ A</h2>
            {isAWinner && <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full animate-pulse">คุ้มกว่า!</span>}
          </div>
          
          <div className="space-y-3">
            <input type="number" placeholder="ราคา" className="w-full p-3 bg-gray-100 rounded-2xl focus:ring-2 ring-blue-500 outline-none"
              value={productA.price} onChange={(e) => setProductA({...productA, price: e.target.value})} />
            
            <div className="flex gap-2">
              <input type="number" placeholder="ปริมาณ" className="w-2/3 p-3 bg-gray-100 rounded-2xl focus:ring-2 ring-blue-500 outline-none"
                value={productA.qty} onChange={(e) => setProductA({...productA, qty: e.target.value})} />
              <select className="w-1/3 p-2 bg-gray-200 rounded-2xl text-xs font-bold"
                value={productA.unit} onChange={(e) => setProductA({...productA, unit: e.target.value})}>
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="ml">ml</option>
                <option value="l">L</option>
                <option value="piece">ชิ้น</option>
              </select>
            </div>
          </div>
          
          <button onClick={() => handleSave('A')} className="w-full mt-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold active:scale-95 transition-transform">บันทึก</button>
          
          <div className="mt-4 pt-4 border-t border-dashed border-gray-200 text-center">
            <p className="text-[10px] text-gray-400 uppercase font-bold">ราคาต่อ 1kg / 1L</p>
            <p className="text-2xl font-black text-blue-800">{formatDisplayPrice(unitPriceA)}</p>
          </div>
        </div>

        {/* Card สินค้า B */}
        <div className={`p-4 rounded-3xl shadow-sm border-4 transition-all ${isBWinner ? 'border-green-500 bg-white scale-105 shadow-green-200' : 'border-white bg-white/50'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">แบบ B</h2>
            {isBWinner && <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full animate-pulse">คุ้มกว่า!</span>}
          </div>
          
          <div className="space-y-3">
            <input type="number" placeholder="ราคา" className="w-full p-3 bg-gray-100 rounded-2xl focus:ring-2 ring-blue-500 outline-none"
              value={productB.price} onChange={(e) => setProductB({...productB, price: e.target.value})} />
            
            <div className="flex gap-2">
              <input type="number" placeholder="ปริมาณ" className="w-2/3 p-3 bg-gray-100 rounded-2xl focus:ring-2 ring-blue-500 outline-none"
                value={productB.qty} onChange={(e) => setProductB({...productB, qty: e.target.value})} />
              <select className="w-1/3 p-2 bg-gray-200 rounded-2xl text-xs font-bold"
                value={productB.unit} onChange={(e) => setProductB({...productB, unit: e.target.value})}>
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="ml">ml</option>
                <option value="l">L</option>
                <option value="piece">ชิ้น</option>
              </select>
            </div>
          </div>

          <button onClick={() => handleSave('B')} className="w-full mt-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold active:scale-95 transition-transform">บันทึก</button>

          <div className="mt-4 pt-4 border-t border-dashed border-gray-200 text-center">
            <p className="text-[10px] text-gray-400 uppercase font-bold">ราคาต่อ 1kg / 1L</p>
            <p className="text-2xl font-black text-blue-800">{formatDisplayPrice(unitPriceB)}</p>
          </div>
        </div>
      </div>

      <footer className="text-center p-4 bg-white rounded-3xl shadow-inner border border-gray-100">
        <p className="text-xs text-gray-400 mb-1">ผลการวิเคราะห์</p>
        <p className="font-bold text-gray-700">
          {isAWinner ? '🔵 แบบ A ประหยัดกว่า' : isBWinner ? '🟢 แบบ B ประหยัดกว่า' : 'กรุณากรอกข้อมูลเพื่อเริ่มการเปรียบเทียบ'}
        </p>
      </footer>
    </div>
  )
}
