'use client'

import { useState, useEffect } from 'react'

export default function CheckPricePage() {
  const [productName, setProductName] = useState('')
  const [productA, setProductA] = useState({ price: '', qty: '', unit: 'g' })
  const [productB, setProductB] = useState({ price: '', qty: '', unit: 'g' })
  const [history, setHistory] = useState<any[]>([])

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
          unit_price: unitPrice
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
    <div className="max-w-md mx-auto p-4 space-y-6 font-sans bg-slate-50 min-h-screen pb-20">
      <header className="text-center py-4">
        <h1 className="text-4xl font-black text-blue-600 tracking-tighter italic">aCheckPrice</h1>
        <p className="text-slate-400 text-[10px] font-bold uppercase mt-1 tracking-widest">Smart Shopping Assistant</p>
      </header>

      <div className="bg-white p-4 rounded-3xl shadow-sm border border-blue-100">
        <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-2 px-2">ชื่อสินค้าที่กำลังเทียบ</label>
        <input 
          type="text" 
          placeholder="เช่น นมสด, ผงซักฟอก..." 
          className="w-full p-4 bg-blue-50/50 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 ring-blue-500 transition-all"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Card แบบ A */}
        <div className={`p-4 rounded-[2.5rem] shadow-lg border-4 transition-all duration-300 ${isAWinner ? 'border-green-500 bg-white scale-105 z-10' : 'border-transparent bg-white/60'}`}>
          <div className="flex justify-between items-center mb-3">
            <span className={`text-lg font-black ${isAWinner ? 'text-green-600' : 'text-slate-400'}`}>แบบ A</span>
          </div>
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
          <div className="mt-4 pt-3 border-t border-dashed border-slate-100 text-center">
            <p className="text-xl font-black text-blue-900 leading-none">฿{formatDisplayPrice(unitPriceA)}</p>
          </div>
        </div>

        {/* Card แบบ B */}
        <div className={`p-4 rounded-[2.5rem] shadow-lg border-4 transition-all duration-300 ${isBWinner ? 'border-green-500 bg-white scale-105 z-10' : 'border-transparent bg-white/60'}`}>
          <div className="flex justify-between items-center mb-3">
            <span className={`text-lg font-black ${isBWinner ? 'text-green-600' : 'text-slate-400'}`}>แบบ B</span>
          </div>
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
          <div className="mt-4 pt-3 border-t border-dashed border-slate-100 text-center">
            <p className="text-xl font-black text-blue-900 leading-none">฿{formatDisplayPrice(unitPriceB)}</p>
          </div>
        </div>
      </div>

      <div className="text-center p-4 bg-white rounded-[2rem] shadow-sm border border-slate-100">
        <p className={`text-xs font-bold ${isAWinner || isBWinner ? 'text-slate-700' : 'text-slate-400'}`}>
          {isAWinner ? '✅ แบบ A คุ้มค่ากว่า' : isBWinner ? '✅ แบบ B คุ้มค่ากว่า' : 'กรอกข้อมูลเพื่อเปรียบเทียบ'}
        </p>
      </div>

      {/* ส่วนประวัติล่าสุดที่ปรับปรุงแล้ว */}
      <section className="space-y-3 pt-2">
        <h3 className="text-lg font-black text-slate-800 px-2 flex items-center gap-2 text-center justify-center">🕒 ประวัติล่าสุด</h3>
        <div className="space-y-2">
          {history.length > 0 ? (
            history.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center group">
                <div className="flex-1">
                  <p className="font-black text-slate-800 text-xs truncate max-w-[150px]">{item.product_name}</p>
                  {/* แสดงปริมาณสินค้าที่ซื้อ */}
                  <p className="text-[9px] text-slate-400 font-bold uppercase">ปริมาณ: {item.quantity}{item.unit}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    {/* ราคาซื้อจริง (สีน้ำเงิน ตัวหนา) */}
                    <p className="text-sm font-black text-blue-600">฿{parseFloat(item.price).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                    {/* ราคาต่อหน่วย (สีเทา ตัวเล็ก) */}
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">
                      ฿{(item.unit_price * 1000).toLocaleString(undefined, {maximumFractionDigits: 2})} / KG,L
                    </p>
                  </div>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-red-200 hover:text-red-500 transition-colors">🗑️</button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-slate-200/20 rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-widest">ยังไม่พบประวัติ</div>
          )}
        </div>
      </section>
    </div>
  )
}
