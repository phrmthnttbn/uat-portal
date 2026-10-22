# Build verification

ตรวจวันที่ 22 ตุลาคม 2026

- Node.js v20.13.1 / npm 10.5.2 บน Windows
- npm install: ผ่าน (137 packages) และสร้าง package-lock.json แล้ว
- npm run build: ผ่าน exit code 0 (tsc -b และ Vite 6.4.5)
- Production output: dist/index.html, CSS 17.76 kB, JavaScript 171.53 kB
- Vite preview: เริ่มสำเร็จที่ http://127.0.0.1:4173/
- HTTP smoke check: หน้า production ตอบกลับ 200
- Browser UI verification: เครื่องมือเปิด browser ตอบช้าและไม่คืนผลหน้าจอที่ใช้ยืนยันได้ จึงยังไม่ได้ยืนยัน interaction/visual layout ผ่าน browser
- GitHub Pages: เตรียม workflow แล้ว ยังไม่ได้ push หรือ deploy จริง เนื่องจากไม่มี repository ปลายทางในคำขอ

Dashboard เริ่มต้น: 10 test cases, 6 Passed, 1 Failed, 1 Blocked, 2 Not run, execution 80%, 2 open defects

รัน npm ci และ npm run build เพื่อตรวจซ้ำหลังแก้ไข ดูคู่มือ README.md สำหรับ Windows และ GitHub Pages

เปลี่ยนชื่อ package และโฟลเดอร์เป็น uat-portal-management และตรวจ npm run build ซ้ำผ่านแล้ว (22 ตุลาคม 2026)
