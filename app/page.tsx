'use client'

import { useState } from 'react'

export default function CheckPricePage() {
  const [productA, setProductA] = useState({ price: '', qty: '', unit: 'g' })
  const [productB, setProductB] = useState({ price: '', qty: '', unit: 'g' })

  const calculateUnitPrice = (price: string, qty: string) => {
    const p = parseFloat(price)
    const q = parseFloat(qty)
    if (!p || !q) return 0
    return p / q
  }

  const unitPriceA = calculateUnitPrice(productA.price, productA.qty)
  const unitPriceB = calculateUnitPrice(productB.price, productB.qty)

  // ตรวจสอบว่าใครคุ้มกว่า
  const isAWinner = unitPriceA > 0 && (unitPriceB === 0 || unitPriceA < unitPriceB)
  const isBWinner = unitPriceB > 0 && (unitPriceA === 0 || unitPriceB < unitPriceA)

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 font-sans">
      <h1 className="text-3xl font-black text-center text-blue-600">aCheckPrice</h1>
      <p className="text-center text-gray-500 text-sm">เปรียบเทียบความคุ้มค่าแบบ Real-time</p>
      
      <div className="grid grid-cols-2 gap-4">
        {/* ฝั่งสินค้า A */}
        <div className={`p-4 rounded-2xl border-4 transition-all ${isAWinner ? 'border-green-500 bg-green-50' : 'border-gray-100'}`}>
          <h2 className="font-bold text-center mb-4">แบบ A</h2>
          <input type="number" placeholder="ราคา" className="w-full p-3 border rounded-xl mb-3"
            value={productA.price} onChange={(e) => setProductA({...productA, price: e.target.value})} />
          <input type="number" placeholder="ปริมาณ" className="w-full p-3 border rounded-xl mb-3"
            value={productA.qty} onChange={(e) => setProductA({...productA, qty: e.target.value})} />
          <select className="w-full p-3 border rounded-xl bg-white"
            value={productA.unit} onChange={(e) => setProductA({...productA, unit: e.target.value})}>
            <option value="g">กรัม (g)</option>
            <option value="ml">มิลลิลิตร (ml)</option>
            <option value="piece">ชิ้น (pcs)</option>
          </select>
          <div className="mt-4 text-center">
            <span className="text-xs text-gray-400">ราคาต่อหน่วย</span>
            <p className="text-lg font-bold">{unitPriceA.toFixed(4)}</p>
          </div>
        </div>

        {/* ฝั่งสินค้า B */}
        <div className={`p-4 rounded-2xl border-4 transition-all ${isBWinner ? 'border-green-500 bg-green-50' : 'border-gray-100'}`}>
          <h2 className="font-bold text-center mb-4">แบบ B</h2>
          <input type="number" placeholder="ราคา" className="w-full p-3 border rounded-xl mb-3"
            value={productB.price} onChange={(e) => setProductB({...productB, price: e.target.value})} />
          <input type="number" placeholder="ปริมาณ" className="w-full p-3 border rounded-xl mb-3"
            value={productB.qty} onChange={(e) => setProductB({...productB, qty: e.target.value})} />
          <select className="w-full p-3 border rounded-xl bg-white"
            value={productB.unit} onChange={(e) => setProductB({...productB, unit: e.target.value})}>
            <option value="g">กรัม (g)</option>
            <option value="ml">มิลลิลิตร (ml)</option>
            <option value="piece">ชิ้น (pcs)</option>
          </select>
          <div className="mt-4 text-center">
            <span className="text-xs text-gray-400">ราคาต่อหน่วย</span>
            <p className="text-lg font-bold">{unitPriceB.toFixed(4)}</p>
          </div>
        </div>
      </div>

      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform">
        บันทึกข้อมูลราคา
      </button>

      {isAWinner || isBWinner ? (
        <div className="bg-blue-50 p-4 rounded-xl text-center text-blue-800 font-bold animate-bounce">
          🎉 {isAWinner ? 'แบบ A' : 'แบบ B'} คุ้มค่ากว่าเห็นๆ!
        </div>
      ) : null}
    </div>
  )
}

// ... โค้ดเดิมด้านบน ...

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
        product_name: `สินค้าแบบ ${side}`, // ในอนาคตค่อยเพิ่มช่องกรอกชื่อ
        price: parseFloat(data.price),
        quantity: parseFloat(data.qty),
        unit: data.unit,
        unit_price: unitPrice
      }),
    });

    if (response.ok) {
      alert(`บันทึกข้อมูลแบบ ${side} เรียบร้อยแล้ว!`);
    }
  } catch (error) {
    alert('บันทึกล้มเหลว ลองใหม่อีกครั้งนะครับ');
  }
};

// ในส่วนของ Return อย่าลืมไปใส่ onClick ให้ปุ่มด้วยนะครับ:
// <button onClick={() => handleSave('A')} ...>บันทึกแบบ A</button>
// <button onClick={() => handleSave('B')} ...>บันทึกแบบ B</button>
