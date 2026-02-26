'use client'

import { useState, useEffect } from 'react'

export default function CheckPricePage() {
  const [productA, setProductA] = useState({ price: '', qty: '', unit: 'g' })
  const [productB, setProductB] = useState({ price: '', qty: '', unit: 'g' })
  const [history, setHistory] = useState<any[]>([])

  // ตัวคูณสำหรับแปลงหน่วยให้เป็นหน่วยฐาน (1g หรือ 1ml)
  const unitMultipliers: { [key: string]: number } = {
    g: 1,
    kg: 1000,
    ml: 1,
    l: 1000,
    piece: 1,
  }

  // ฟังก์ชันคำนวณราคาต่อ 1 หน่วยเล็กที่สุด
  const calculateUnitPrice = (price: string, qty: string, unit: string) => {
    const p = parseFloat(price)
    const q = parseFloat(qty)
    const multiplier = unitMultipliers[unit] || 1
    if (!p || !q || q === 0) return 0
    return p / (q * multiplier)
  }

  const unitPriceA = calculateUnitPrice(productA.price, productA.qty, productA.unit)
  const unitPriceB = calculateUnitPrice(productB.price, productB.qty, productB.unit)

  // ตรวจสอบว่าฝั่งไหนคุ้มค่ากว่า
  const isAWinner = unitPriceA > 0 && (unitPriceB === 0 || unitPriceA < unitPriceB)
  const isBWinner = unitPriceB > 0 && (unitPriceA === 0 || unitPriceB < unitPriceA)

  // จัดรูปแบบการแสดงผลเป็นราคาต่อ 1kg หรือ 1L
  const formatDisplayPrice = (unitPrice: number) => {
    if (unitPrice === 0) return '0.00'
    return (unitPrice * 1000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  // ดึงประวัติจาก Database
  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/history')
      if (response.ok) {
        const data = await response.json()
        setHistory(data)
      }
    } catch (error) {
      console.error('Failed to fetch history')
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  // ฟังก์ชันบันทึกข้อมูล
  const handleSave = async (side: 'A' | 'B') => {
    const data = side === 'A' ? productA : productB;
    const unitPrice = side === 'A' ? unitPriceA : unitPriceB;

    if (!data.price || !data.qty) {
      alert('กรุณากรอกข้อมูลให้ครบก่อนบันทึกนะครับ');
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
          unit_price: unitPrice
        }),
      });

      if (response.ok) {
        alert(`บันทึกสำเร็จ!`);
        fetchHistory(); // อัปเดตรายการประวัติทันที
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-8 font-sans bg-slate-50 min-h-screen pb-20">
      <header className="text-center py-4">
        <h1 className="text-4xl font-black text-blue-600 tracking-tighter italic">aCheckPrice</h1>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Smart Shopping Assistant</p>
      </header>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Card แบบ A */}
        <div className={`p-6 rounded-[2.5rem] shadow-xl border-4 transition-all duration-300 ${isAWinner ? 'border-green-500 bg-white scale-[1.02]' : 'border-transparent bg-white/70'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-black ${isAWinner ? 'text-green-600' : 'text-slate-400'}`}>แบบ A</h2>
            {isAWinner && <span className="bg-green-500 text-white text-[10px] px-3 py-1 rounded-full font-bold animate-pulse">คุ้มกว่า!</span>}
          </div>
          
          <div className="space-y-3">
            <input type="number" placeholder="ราคา (บาท)" className="w-full p-4 bg-slate-100 rounded-2xl font-bold focus:ring-2 ring-blue-500 outline-none transition-all"
              value={productA.price} onChange={(e) => setProductA({...productA, price: e.target.value})} />
            
            <div className="flex gap-2">
              <input type="number" placeholder="นน./ปริมาณ" className="w-2/3 p-4 bg-slate-100 rounded-2xl font-bold focus:ring-2 ring-blue-500 outline-none transition-all"
                value={productA.qty} onChange={(e) => setProductA({...productA, qty: e.target.value})} />
              <select className="w-1/3 p-2 bg-slate-200 rounded-2xl text-xs font-black"
                value={productA.unit} onChange={(e) => setProductA({...productA, unit: e.target.value})}>
                <option value="g">G</option>
                <option value="kg">KG</option>
                <option value="ml">ML</option>
                <option value="l">L</option>
                <option value="piece">ชิ้น</option>
              </select>
            </div>
          </div>
          
          <button onClick={() => handleSave('A')} className="w-full mt-4 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-blue-200">บันทึกข้อมูล</button>
          
          <div className="mt-6 pt-4 border-t-2 border-dashed border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 font-black uppercase mb-1">เทียบราคาต่อ 1kg / 1L</p>
            <p className="text-3xl font-black text-blue-900">฿{formatDisplayPrice(unitPriceA)}</p>
          </div>
        </div>

        {/* Card แบบ B */}
        <div className={`p-6 rounded-[2.5rem] shadow-xl border-4 transition-all duration-300 ${isBWinner ? 'border-green-500 bg-white scale-[1.02]' : 'border-transparent bg-white/70'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-black ${isBWinner ? 'text-green-600' : 'text-slate-400'}`}>แบบ B</h2>
            {isBWinner && <span className="bg-green-500 text-white text-[10px] px-3 py-1 rounded-full font-bold animate-pulse">คุ้มกว่า!</span>}
          </div>
          
          <div className="space-y-3">
            <input type="number" placeholder="ราคา (บาท)" className="w-full p-4 bg-slate-100 rounded-2xl font-bold focus:ring-2 ring-blue-500 outline-none transition-all"
              value={productB.price} onChange={(e) => setProductB({...productB, price: e.target.value})} />
            
            <div className="flex gap-2">
              <input type="number" placeholder="นน./ปริมาณ" className="w-2/3 p-4 bg-slate-100 rounded-2xl font-bold focus:ring-2 ring-blue-500 outline-none transition-all"
                value={productB.qty} onChange={(e) => setProductB({...productB, qty: e.target.value})} />
              <select className="w-1/3 p-2 bg-slate-200 rounded-2xl text-xs font-black"
                value={productB.unit} onChange={(e) => setProductB({...productB, unit: e.target.value})}>
                <option value="g">G</option>
                <option value="kg">KG</option>
                <option value="ml">ML</option>
                <option value="l">L</option>
                <option value="piece">ชิ้น</option>
              </select>
            </div>
          </div>

          <button onClick={() => handleSave('B')} className="w-full mt-4 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-blue-200">บันทึกข้อมูล</button>

          <div className="mt-6 pt-4 border-t-2 border-dashed border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 font-black uppercase mb-1">เทียบราคาต่อ 1kg / 1L</p>
            <p className="text-3xl font-black text-blue-900">฿{formatDisplayPrice(unitPriceB)}</p>
          </div>
        </div>
      </div>

      {/* สรุปผลความคุ้มค่า */}
      <footer className="text-center p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">บทสรุป</p>
        <p className={`text-sm font-bold ${isAWinner || isBWinner ? 'text-slate-700' : 'text-slate-400'}`}>
          {isAWinner ? '✅ แบบ A ประหยัดกว่า' : isBWinner ? '✅ แบบ B คุ้มค่ากว่า' : 'กรอกข้อมูลเพื่อเปรียบเทียบ'}
        </p>
      </footer>

      {/* ส่วนแสดงประวัติ */}
      <section className="space-y-4 pt-4">
        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
          🕒 ประวัติล่าสุด
          <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Database Linked</span>
        </h3>
        <div className="space-y-3">
          {history.length > 0 ? (
            history.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center transition-transform active:scale-95">
                <div>
                  <p className="font-bold text-slate-700 text-sm">{item.product_name}</p>
                  <p className="text-[10px] text-slate-400">{item.price} บาท / {item.quantity}{item.unit}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-blue-600">฿{(item.unit_price * 1000).toFixed(2)}</p>
                  <p className="text-[8px] text-slate-300 uppercase font-bold">ต่อ 1kg/1L</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-slate-100/50 rounded-[2rem] border-2 border-dashed border-slate-200">
              <p className="text-xs text-slate-400 font-bold">ยังไม่พบประวัติการบันทึก</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
