# Build verification — UAT Portal Management v2

ตรวจบน Windows วันที่ 22 ตุลาคม 2026 ด้วย Node.js v20.13.1 และ npm 10.5.2 (คู่มือแนะนำ Node 22)

## ผลที่ตรวจจริง

- TypeScript strict check และ Vite production build ผ่าน
- ชุดทดสอบกฎข้อมูล 8 รายการผ่าน: แยก Project, ใช้ผลล่าสุดและคงประวัติ, เงื่อนไข Sign-off, ล้าง Sign-off เฉพาะโครงการ, Import CSV แบบ atomic, ป้องกันข้อมูลอ้างอิงข้ามโครงการ, ป้องกันลบ Case ที่มี Defect, Backup validation และ CSV formula escaping
- Prettier format:check ผ่าน
- Workflow main/develop เตรียมแล้ว ไม่ได้ push หรือ deploy เวอร์ชันนี้จริง

## ข้อจำกัดการตรวจ

เครื่องมือ browser หยุดทำงานขณะเปิด preview จึงยังไม่ได้ยืนยันภาพจริง การคลิกฟอร์ม หรือ responsive layout ใน browser ชุดทดสอบที่ผ่านเป็น model tests ไม่ใช่ end-to-end tests

ใช้ docs/05-ACCEPTANCE-CHECKLIST.md ทดลองหน้าจอจริงก่อนเผยแพร่ให้ทีมใช้

## ข้อจำกัดผลิตภัณฑ์

ไม่มี Role/login/backend ตามขอบเขตเวอร์ชันนี้ บันทึกใน browser แยกตาม path, ไม่ซิงก์ข้ามเครื่อง, หลักฐานเป็น URL ไม่อัปโหลดไฟล์, Import CSV ไม่รองรับ XLSX, Sign-off ไม่ตรวจตัวตน, ไม่มี migration v1 อัตโนมัติ
