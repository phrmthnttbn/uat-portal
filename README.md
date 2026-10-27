# UAT Portal Management v2

โปรเจกต์ React + TypeScript + Vite + Tailwind + Prettier สำหรับ UAT ทั่วไป ธีมเขียวเข้ม–ครีม ฟอนต์ Kanit ไม่มีระบบ Role ตามขอบเขตที่ตกลง

## เริ่มที่นี่

1. อ่าน [คู่มือติดตั้งและอัปเดตบน Windows](docs/01-WINDOWS-SETUP.md)
2. รัน npm ci แล้ว npm run dev
3. อ่าน [คู่มือใช้งานทุกหน้าจอ](docs/02-USER-GUIDE.md)
4. อ่าน [คู่มือ main/develop และ GitHub Pages](docs/03-GITHUB-DEPLOY.md)
5. อ่าน [คู่มือแก้โค้ดทีละส่วน](docs/04-CODE-WALKTHROUGH.md)
6. ใช้ [รายการทดลองรับมอบ](docs/05-ACCEPTANCE-CHECKLIST.md) ตรวจใน browser ของคุณ

## สิ่งที่ทำได้

- Projects: เพิ่ม แก้ไข ค้นหา เลือก เก็บถาวร นำกลับมาใช้
- Test Scenarios: เพิ่ม แก้ไข ลบ ค้นหา แยกโครงการ
- Test Cases: เพิ่ม แก้ไข ลบ ค้นหา กรองสถานะและ Scenario ขั้นตอนทดสอบ ผลคาดหวัง Priority และผู้รับผิดชอบ
- Test Results: บันทึกผลใหม่ เก็บประวัติ ผู้ทดสอบ เวลา Actual result และ URL หลักฐาน
- Defects: สร้างจาก Fail หรือเพิ่มเอง แก้ไข Severity Owner สถานะและความคิดเห็น
- Dashboard: คำนวณจากผลล่าสุดของ Case ในโครงการที่เลือก ความคืบหน้าแต่ละ Scenario และงานที่ยังไม่ผ่าน
- Sign-off: รับรองเมื่อมี Case อย่างน้อยหนึ่งรายการ ทุก Case ผ่านและทุก Defect ปิดแล้ว บันทึกชื่อ หมายเหตุ เวลา และยกเลิกได้
- CSV: นำเข้า/ส่งออก Scenario และ Case, ดาวน์โหลด Template, ตรวจทั้งไฟล์ก่อนบันทึก
- JSON: รายงานโครงการ, Backup/Restore ทุกโครงการ, ตรวจ version โครงสร้างและข้อมูลอ้างอิง

## คำสั่ง

```powershell
npm ci
npm run dev
npm run format
npm run format:check
npm test
npm run build
npm run preview
```

## ขอบเขตที่ต้องทราบ

ข้อมูลอยู่ใน localStorage แยกตาม URL path ไม่ใช่ฐานข้อมูลกลาง ไม่แชร์ข้อมูลระหว่างผู้ใช้ ไม่มี login หรือสิทธิ์ ไม่มีอัปโหลดไฟล์จริง หลักฐานใช้ URL ส่วน Sign-off เป็นการรับรองจำลองและไม่มี audit ที่ป้องกันการแก้ไข ใช้หนึ่ง tab ต่อ URL เพื่อหลีกเลี่ยงการเขียนทับ

Kanit โหลดจาก Google Fonts หากไม่มีอินเทอร์เน็ตจะแสดงฟอนต์สำรอง Import รองรับ CSV UTF-8 ไม่รองรับ .xlsx โดยตรง CSV export ป้องกัน formula ใน spreadsheet โดยเติม apostrophe ให้ค่าที่เริ่มด้วย = + - @ ดังนั้นค่าดังกล่าวอาจมี apostrophe เมื่อนำกลับเข้า

ข้อมูลเก่า v1 ไม่ถูกลบและไม่ได้ migrate อัตโนมัติ เวอร์ชันนี้ใช้ storage key ใหม่ Backup เก่าหรือ Report JSON ไม่ใช่ Backup v2 จึง Restore ไม่ได้ กรุณาเก็บ Export เดิมไว้ก่อนอัปเดต

ดูผลทดสอบจริงและข้อจำกัดการตรวจ browser ใน BUILD-VERIFICATION.md ยังไม่ได้ push หรือ deploy เวอร์ชันนี้ขึ้น GitHub

อ่านคู่มือรวมแบบเปิดใน browser ได้ที่ [GUIDE.html](GUIDE.html) โดยดับเบิลคลิกหลังแตก ZIP (ไม่ต้องเปิด server สำหรับคู่มือ)
