'use client'

import { useState } from 'react'

export default function CheckPricePage() {
  const [productA, setProductA] = useState({ price: '', qty: '', unit: 'g' })
  const [productB, setProductB] = useState({ price: '', qty: '', unit: 'g' })

  // ตัวคูณสำหรับแปลงหน่วย (ใช้สำหรับคำนวณหลังบ้าน)
  const unitMultipliers: { [key: string]: number } = {
    g: 1,
    kg: 1000,
    ml: 1,
    l: 1000,
    piece: 1,
  }

  // ฟังก์ชันคำนวณราคาต่อ 1 หน่วยพื้นฐาน
  const calculateUnitPrice = (price: string, qty: string, unit: string) => {
    const p = parseFloat(price)
    const q = parseFloat(qty)
    const multiplier = unitMultipliers[unit] || 1
    if (!p || !q || q === 0) return 0
    return p / (q * multiplier)
  }

  const unitPriceA = calculateUnitPrice(productA.price, productA.qty, productA.unit)
  const unitPriceB = calculateUnitPrice(productB.price, productB.qty, productB.unit)

  const isAWinner = unitPriceA > 0 && (unitPriceB === 0 || unitPriceA < unitPriceB)
  const isBWinner = unitPriceB > 0 && (unitPriceA === 0 || unitPriceB < unitPriceA)

  // จัดการการแสดงผลราคาต่อ 1kg หรือ 1L เพื่อให้ User เข้าใจง่าย
  const formatDisplayPrice = (unitPrice: number) => {
    if (unitPrice === 0) return '0.00'
    return (unitPrice * 1000).toFixed(2)
  }

  // ฟังก์ชันทดสอบปุ่มบันทึก (ตอนนี้จะแค่ Alert บอกค่าที่จะส่งไป)
  const handleSaveTest = (side: 'A' | 'B') => {
    const data = side === 'A' ? productA : productB
    const unitPrice = side === 'A' ? unitPriceA : unitPriceB
    
    if (!data.price || !data.qty) {
      alert('กรุณากรอกข้อมูลให้ครบก่อนทดสอบบันทึกครับ')
      return
    }

    alert(`
      [Test Mode] ข้อมูลที่จะบันทึกของแบบ ${side}:
      - ราคา: ${data.price} บาท
      - ปริมาณ: ${data.qty} ${data.unit}
      - ราคาต่อหน่วย (1 กรัม/มล.): ${unitPrice.toFixed(6)}
      - ราคาต่อ 1kg/1L: ${formatDisplayPrice(unitPrice)} บาท
    `)
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 font-sans bg-slate-50 min-h-screen">
      <header className="text-center py-4">
        <h1 className="text-4xl font-black text-blue-600 tracking-tighter">aCheckPrice</h1>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Unit Price Comparison</p>
      </header>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Card A */}
        <div className={`p-4 rounded-[2.5rem] shadow-xl border-4 transition-all duration-500 ${isAWinner ? 'border-green-500 bg-white scale-105 z-10' : 'border-transparent bg-white/60'}`}>
          <div className="flex justify-between items-center mb-4 px-2">
            <span className={`text-lg font-black ${isAWinner ? 'text-green-600' : 'text-slate-400'}`}>แบบ A</span>
            {isAWinner && <span className="bg-green-500 text-white text-[10px] px-2 py-1 rounded-full font-bold">คุ้ม!</span>}
          </div>
          
          <div className="space-y-2">
            <input type="number" placeholder="ราคา" className="w-full p-4 bg-slate-100 rounded-2xl font-bold focus:bg-white focus:ring-2 ring-blue-500 outline-none transition-all"
              value={productA.price} onChange={(e) => setProductA({...productA, price: e.target.value})} />
            
            <div className="flex gap-2">
              <input type="number" placeholder="นน." className="w-3/5 p-4 bg-slate-100 rounded-2xl font-bold focus:bg-white focus:ring-2 ring-blue-500 outline-none transition-all"
                value={productA.qty} onChange={(e) => setProductA({...productA, qty: e.target.value})} />
              <select className="w-2/5 p-2 bg-slate-200 rounded-2xl text-xs font-black uppercase"
                value={productA.unit} onChange={(e) => setProductA({...productA, unit: e.target.value})}>
                <option value="g">G</option>
                <option value="kg">KG</option>
                <option value="ml">ML</option>
                <option value="l">L</option>
                <option value="piece">ชิ้น</option>
              </select>
            </div>
          </div>
          
          <button onClick={() => handleSaveTest('A')} className="w-full mt-4 py-3 bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">บันทึกข้อมูล</button>
          
          <div className="mt-5 pt-4 border-t-2 border-dashed border-slate-100 text-center">
            <p className="text-[9px] text-slate-400 font-black uppercase mb-1">ราคาต่อ 1kg / 1L</p>
            <p className="text-2xl font-black text-blue-900 leading-none">฿{formatDisplayPrice(unitPriceA)}</p>
          </div>
        </div>

        {/* Card B */}
        <div className={`p-4 rounded-[2.5rem] shadow-xl border-4 transition-all duration-500 ${isBWinner ? 'border-green-500 bg-white scale-105 z-10' : 'border-transparent bg-white/60'}`}>
          <div className="flex justify-between items-center mb-4 px-2">
            <span className={`text-lg font-black ${isBWinner ? 'text-green-600' : 'text-slate-400'}`}>แบบ B</span>
            {isBWinner && <span className="bg-green-500 text-white text-[10px] px-2 py-1 rounded-full font-bold">คุ้ม!</span>}
          </div>
          
          <div className="space-y-2">
            <input type="number" placeholder="ราคา" className="w-full p-4 bg-slate-100 rounded-2xl font-bold focus:bg-white focus:ring-2 ring-blue-500 outline-none transition-all"
              value={productB.price} onChange={(e) => setProductB({...productB, price: e.target.value})} />
            
            <div className="flex gap-2">
              <input type="number" placeholder="นน." className="w-3/5 p-4 bg-slate-100 rounded-2xl font-bold focus:bg-white focus:ring-2 ring-blue-500 outline-none transition-all"
                value={productB.qty} onChange={(e) => setProductB({...productB, qty: e.target.value})} />
              <select className="w-2/5 p-2 bg-slate-200 rounded-2xl text-xs font-black uppercase"
                value={productB.unit} onChange={(e) => setProductB({...productB, unit: e.target.value})}>
                <option value="g">G</option>
                <option value="kg">KG</option>
                <option value="ml">ML</option>
                <option value="l">L</option>
                <option value="piece">ชิ้น</option>
              </select>
            </div>
          </div>

          <button onClick={() => handleSaveTest('B')} className="w-full mt-4 py-3 bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">บันทึกข้อมูล</button>

          <div className="mt-5 pt-4 border-t-2 border-dashed border-slate-100 text-center">
            <p className="text-[9px] text-slate-400 font-black uppercase mb-1">ราคาต่อ 1kg / 1L</p>
            <p className="text-2xl font-black text-blue-900 leading-none">฿{formatDisplayPrice(unitPriceB)}</p>
          </div>
        </div>
      </div>

      <div className="text-center p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">สรุปความคุ้มค่า</p>
        <p className={`text-sm font-bold ${isAWinner || isBWinner ? 'text-slate-700' : 'text-slate-400'}`}>
          {isAWinner ? '✅ แบบ A คุ้มค่ากว่าเมื่อเทียบต่อหน่วย' : isBWinner ? '✅ แบบ B คุ้มค่ากว่าเมื่อเทียบต่อหน่วย' : 'กรุณากรอกข้อมูลทั้งสองฝั่ง'}
        </p>
      </div>
    </div>
  )
}
