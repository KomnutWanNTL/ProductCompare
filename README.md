# ProductCompare

เว็บเปรียบเทียบราคาสินค้าสำหรับใช้ตอนเดินซื้อของ กรอกแค่ชื่อสินค้า ราคา และปริมาณ เพื่อดูว่ารายการไหนคุ้มที่สุด

## ฟีเจอร์

- รองรับมือถือและเดสก์ท็อป (Responsive)
- กรอกข้อมูลแค่ ชื่อสินค้า, ราคา, ปริมาณ
- คำนวณราคาต่อหน่วยอัตโนมัติ
- ไฮไลต์ตัวเลือกที่คุ้มที่สุดในแต่ละกลุ่มสินค้า
- ค้นหารายการตามชื่อสินค้า และลบรายการได้
- บันทึกข้อมูลไว้ใน browser ด้วย Local Storage
- รองรับ PWA ติดตั้งบนหน้าจอมือถือได้

## การใช้งานในเครื่อง

เปิดไฟล์ `index.html` ด้วยเบราว์เซอร์ได้เลย หรือใช้ Live Server ใน VS Code

## ติดตั้งแบบแอปมือถือ (PWA)

1. เปิดเว็บผ่าน HTTPS (เช่น GitHub Pages)
2. Android/Chrome: กดเมนูเบราว์เซอร์ > Add to Home screen หรือ Install app
3. iPhone/Safari: กด Share > Add to Home Screen
4. เมื่อเปิดจากไอคอน จะใช้งานแบบเต็มหน้าจอคล้ายแอป

## Deploy ขึ้น GitHub Pages (ผ่าน GitHub Actions)

1. สร้าง repository ใหม่บน GitHub แล้ว push โค้ดขึ้น branch `main`
2. ใน GitHub ไปที่ `Settings > Pages`
3. ที่หัวข้อ `Build and deployment` ให้เลือก `Source: GitHub Actions`
4. push ครั้งถัดไป (หรือกด Run workflow ที่หน้า Actions) ระบบจะ deploy ให้อัตโนมัติ
5. รอ workflow สำเร็จ แล้วเข้า URL ที่ GitHub Pages แจ้ง

## โครงสร้างไฟล์

- `index.html` หน้าเว็บหลัก
- `style.css` สไตล์และ responsive layout
- `app.js` ตรรกะคำนวณและจัดการรายการ
- `manifest.webmanifest` ตั้งค่า PWA
- `service-worker.js` แคชไฟล์เพื่อรองรับการใช้งานต่อเนื่อง
- `.github/workflows/deploy.yml` workflow สำหรับ deploy ขึ้น GitHub Pages
