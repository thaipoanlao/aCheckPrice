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
