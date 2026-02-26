'use client'

import { useState, useEffect } from 'react'

export default function CheckPricePage() {
  const [productName, setProductName] = useState('')
  const [category, setCategory] = useState('อาหารและเครื่องดื่ม')
  const [location, setLocation] = useState("Lotus's")
  const [productA, setProductA] = useState({ price: '', qty: '', unit: 'g' })
  const [productB, setProductB] = useState({ price: '', qty: '', unit: 'g' })
  const [history, setHistory] = useState<any[]>([])

  // 1. รายการหมวดหมู่ 4 อย่างตามที่กำหนด
  const categories = [
    "อาหารและเครื่องดื่ม", 
    "ของใช้ในบ้าน (เช่น น้ำยาล้างจาน, ทิชชู่)", 
    "ของใช้ส่วนตัว (เช่น สบู่, แชมพู)", 
    "ขนมและของว่าง"
  ]

  // 2. รายการสถานที่ 4 อย่างตามที่กำหนด
  const locations = [
    "Lotus's",
    "Makro",
    "Big C",
    "7-Eleven"
  ]

  const unitMultipliers: { [key: string]: number } = {
    g: 1, kg: 1000, ml: 1, l: 1000, piece: 1,
  }

  const calculateUnitPrice = (price: string, qty: string, unit: string) => {
    const p = parseFloat(price); const q = parseFloat(qty)
    const multiplier = unitMultipliers[unit] || 1
    if (!p || !q || q === 0) return 0
    return p / (q * multiplier)
  }

  const unitPriceA = calculateUnitPrice(productA.price, productA.qty, productA.unit)
  const unitPriceB = calculateUnitPrice(productB.price, productB.qty, productB.unit)
  const isAWinner = unitPriceA > 0 && (unitPriceB === 0 || unitPriceA < unitPriceB)
  const isBWinner = unitPriceB > 0 && (unitPriceA === 0 || unitPriceB < unitPriceA)

  const formatDisplayPrice = (unitPrice: number) => {
    if (unitPrice === 0) return '0.00'
    return (unitPrice * 1000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/history')
      if (response.ok) {
        const data = await response.json()
        setHistory(data)
      }
    } catch (error) { console.error('Fetch error') }
  }

  useEffect(() => { fetchHistory() }, [])

  const handleSave = async (side: 'A' | 'B') => {
    const data = side === 'A' ? productA : productB
    const unitPrice = side === 'A' ? unitPriceA : unitPriceB
    if (!data.price || !data.qty) return alert('กรุณากรอกข้อมูลให้ครบ')

    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: productName || `สินค้าแบบ ${side}`,
          price: parseFloat(data.price),
          quantity: parseFloat(data.qty),
          unit: data.unit,
          unit_price: unitPrice,
          category: category,
          location: location
        }),
      })
      if (response.ok) { fetchHistory() }
    } catch (error) { alert('บันทึกล้มเหลว') }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('ยืนยันว่าจะลบรายการนี้ใช่ไหม?')) return
    try {
      const response = await fetch('/api/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (response.ok) { fetchHistory() }
    } catch (error) { alert('ลบไม่สำเร็จ') }
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 font-sans bg-slate-50 min-h-screen pb-20">
      <header className="text-center py-2">
        <h1 className="text-3xl font-black text-blue-600 tracking-tighter italic">aCheckPrice</h1>
      </header>

      {/* ส่วนกรอกข้อมูลส่วนกลาง (Dropdown ทั้งหมด) */}
      <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-blue-100 space-y-3">
        <input type="text" placeholder="ชื่อสินค้า (เช่น นมสด)" className="w-full p-3 bg-blue-50/50 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-blue-500"
          value={productName} onChange={(e) => setProductName(e.target.value)} />
        
        <div className="grid grid-cols-1 gap-2">
          {/* Dropdown หมวดหมู่ */}
          <select 
            className="p-3 bg-slate-50 rounded-xl text-xs font-black outline-none border border-slate-100 w-full"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Dropdown สถานที่ */}
          <select 
            className="p-3 bg-slate-50 rounded-xl text-xs font-black outline-none border border-slate-100 w-full"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* ส่วนเปรียบเทียบ 2 Column */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card แบบ A */}
        <div className={`p-4 rounded-[2rem] shadow-lg border-4 transition-all duration-300 ${isAWinner ? 'border-green-500 bg-white scale-105 z-10' : 'border-transparent bg-white/60'}`}>
          <p className="text-[10px] font-black text-slate-400 mb-2 uppercase">แบบ A</p>
          <div className="space-y-2">
            <input type="number" placeholder="ราคา" className="w-full p-3 bg-slate-100 rounded-xl font-bold text-sm outline-none"
              value={productA.price} onChange={(e) => setProductA({...productA, price: e.target.value})} />
            <div className="flex gap-1">
              <input type="number" placeholder="นน." className="w-3/5 p-3 bg-slate-100 rounded-xl font-bold text-sm outline-none"
                value={productA.qty} onChange={(e) => setProductA({...productA, qty: e.target.value})} />
              <select className="w-2/5 p-1 bg-slate-200 rounded-xl text-[10px] font-black uppercase"
                value={productA.unit} onChange={(e) => setProductA({...productA, unit: e.target.value})}>
                <option value="g">G</option><option value="kg">KG</option>
                <option value="ml">ML</option><option value="l">L</option>
                <option value="piece">ชิ้น</option>
              </select>
            </div>
          </div>
          <button onClick={() => handleSave('A')} className="w-full mt-3 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase active:scale-95 shadow-md">บันทึก</button>
          <div className="mt-4 pt-2 border-t border-dashed border-slate-100 text-center">
            <p className="text-lg font-black text-blue-900 leading-none">฿{formatDisplayPrice(unitPriceA)}</p>
          </div>
        </div>

        {/* Card แบบ B */}
        <div className={`p-4 rounded-[2.5rem] shadow-lg border-4 transition-all duration-300 ${isBWinner ? 'border-green-500 bg-white scale-105 z-10' : 'border-transparent bg-white/60'}`}>
          <p className="text-[10px] font-black text-slate-400 mb-2 uppercase">แบบ B</p>
          <div className="space-y-2">
            <input type="number" placeholder="ราคา" className="w-full p-3 bg-slate-100 rounded-xl font-bold text-sm outline-none"
              value={productB.price} onChange={(e) => setProductB({...productB, price: e.target.value})} />
            <div className="flex gap-1">
              <input type="number" placeholder="นน." className="w-3/5 p-3 bg-slate-100 rounded-xl font-bold text-sm outline-none"
                value={productB.qty} onChange={(e) => setProductB({...productB, qty: e.target.value})} />
              <select className="w-2/5 p-1 bg-slate-200 rounded-xl text-[10px] font-black uppercase"
                value={productB.unit} onChange={(e) => setProductB({...productB, unit: e.target.value})}>
                <option value="g">G</option><option value="kg">KG</option>
                <option value="ml">ML</option><option value="l">L</option>
                <option value="piece">ชิ้น</option>
              </select>
            </div>
          </div>
          <button onClick={() => handleSave('B')} className="w-full mt-3 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase active:scale-95 shadow-md">บันทึก</button>
          <div className="mt-4 pt-2 border-t border-dashed border-slate-100 text-center">
            <p className="text-lg font-black text-blue-900 leading-none">฿{formatDisplayPrice(unitPriceB)}</p>
          </div>
        </div>
      </div>

      {/* ส่วนประวัติล่าสุดพร้อมป้ายข้อมูล */}
      <section className="space-y-3 pt-2">
        <h3 className="text-lg font-black text-slate-800 px-2 flex items-center gap-2">🕒 ประวัติล่าสุด</h3>
        <div className="space-y-2">
          {history.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-slate-100 flex justify-between items-center group animate-fadeIn">
              <div className="flex-1">
                <p className="font-black text-slate-800 text-xs truncate max-w-[150px]">{item.product_name}</p>
                <div className="flex gap-1 mt-0.5 flex-wrap">
                  <span className="text-[7px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold uppercase">{item.category}</span>
                  <span className="text-[7px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">📍 {item.location}</span>
                </div>
                <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase">{item.quantity}{item.unit} | {item.price}฿</p>
              </div>
              <div className="flex items-center gap-2 text-right">
                <div>
                  <p className="text-sm font-black text-blue-600">฿{parseFloat(item.price).toFixed(2)}</p>
                  <p className="text-[7px] text-slate-400 font-bold uppercase">฿{(item.unit_price * 1000).toFixed(2)}/KG,L</p>
                </div>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-red-200 hover:text-red-500 transition-colors">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
