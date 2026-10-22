# Rider UAT Portal

เว็บสำหรับทดลอง UAT ด้วย React + TypeScript + Vite + Tailwind CSS รองรับมือถือและ Desktop

## เริ่มใช้งานบน Windows

1. ติดตั้ง Node.js 22 LTS และ Git for Windows
2. แตก ZIP แล้วเปิด PowerShell ในโฟลเดอร์ `uat-portal` ที่มี package.json
3. รันคำสั่งทีละบรรทัด:

```powershell
npm ci
npm run dev
```

เปิด URL ที่ Vite แสดง (ปกติ http://127.0.0.1:5173) หยุดด้วย Ctrl+C
หาก PowerShell แจ้งว่าปิดการรันสคริปต์ ให้ใช้ `npm.cmd` แทน `npm` ในทุกคำสั่ง ไม่จำเป็นต้องเปลี่ยน Execution Policy

## Build และดูตัวอย่าง production

```powershell
npm run build
npm run preview
```

เปิด URL ที่แสดง (ปกติ http://127.0.0.1:4173) ผล build อยู่ใน dist/ ห้ามเปิด index.html โดยตรงด้วย file://

## ฟังก์ชัน

- Dashboard: คำนวณยอด test cases, passed, failed, open defects และ execution progress จากข้อมูลปัจจุบัน
- Test Scenarios: 4 สถานการณ์ ครอบคลุม Account, Delivery, Finance, Support กด Explore เพื่อกรอง Test Cases
- Test Cases: ค้นหาด้วยชื่อ ID module หรือผู้ทดสอบ กรองสถานะ เปิด Record เพื่อดูขั้นตอนและ expected result
- Test Results: บันทึก Passed / Failed / Blocked / Not run และ actual result ผลรวมจะอัปเดตใน Dashboard
- Defect Tracking: Report defect ผูกกับ Test Case ระบุ severity และผู้รับผิดชอบ เปลี่ยนสถานะ Open → In progress → Resolved → Closed
- UAT Sign-off: อนุมัติเมื่อทุก case เป็น Passed และ Defect ทุกข้อเป็น Closed กรอกชื่อผู้อนุมัติ ระบบบันทึกเวลา การแก้ผลทดสอบหรือ Defect จะล้างการอนุมัติเดิม
- Export report: ดาวน์โหลด JSON ของ test cases, defects และ sign-off
- Reset demo data: รีเซ็ตข้อมูลหลังยืนยัน

ข้อมูลเริ่มต้นอยู่ใน src/data.ts แก้ไข scenarios, initialCases และ initialDefects ได้ ข้อมูลที่เคยบันทึกในเบราว์เซอร์จะมีผลเหนือข้อมูลเริ่มต้น กด Reset demo data หลังแก้ seed data

## Deploy GitHub Pages บน Windows

1. สร้าง repository ใหม่แบบว่างใน GitHub เช่น `uat-portal` (ไม่เลือกสร้าง README บน GitHub) บัญชี Free ควรใช้ public repository สำหรับ Pages
2. เปิด PowerShell ในโฟลเดอร์โปรเจกต์ แทน YOUR_USERNAME ด้วยชื่อ GitHub ของคุณ และแก้ชื่อ repo หากตั้งชื่ออื่น:

```powershell
git init
git add .
git commit -m "Create Rider UAT Portal"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/uat-portal.git
git push -u origin main
```

ถ้า Git ถามชื่อหรืออีเมล ให้ตั้ง `git config user.name "Your Name"` และ `git config user.email "your-email@example.com"` แล้ว commit ใหม่ การ push ครั้งแรกอาจเปิด browser ให้เข้าสู่ระบบ GitHub

3. ไปที่ repository → Settings → Pages → Build and deployment → Source → เลือก **GitHub Actions**
4. ไปที่ Actions → Deploy GitHub Pages หากรอบแรกไม่สำเร็จเพราะยังไม่ได้ตั้ง Source ให้กด Re-run all jobs หรือ Run workflow ที่ branch main
5. หลัง build และ deploy สำเร็จ เปิด URL จาก Settings → Pages หรือ job deploy เช่น https://YOUR_USERNAME.github.io/uat-portal/
6. การแก้ครั้งถัดไปใช้ `git add .`, `git commit -m "Update portal"`, `git push` Workflow จะ build และ deploy อัตโนมัติ

Workflow อยู่ที่ .github/workflows/deploy.yml ใช้ npm ci, TypeScript check และ Vite build ก่อน upload dist จากนั้น deploy ด้วย GitHub Pages environment ไม่ต้องสร้าง gh-pages branch และไม่ต้องใส่ access token ใน source

Vite ใช้ base './' เพื่อให้ assets โหลดได้ทั้ง root และ project subpath หน้าจอใช้ hash URL เช่น #Test%20Cases จึง refresh ได้บน GitHub Pages โดยไม่ต้องตั้ง server fallback หาก repo บังคับอนุมัติ environment ให้ผู้ดูแลอนุมัติ job deploy ใน Actions

## ขอบเขตข้อมูลและการใช้งาน

นี่เป็น mock application ไม่มี backend, login, การแบ่งสิทธิ์ หรือฐานข้อมูลกลาง ข้อมูลอยู่ใน localStorage ของ origin และ browser นั้น ผู้ใช้อื่นจะไม่เห็นการแก้ไข และการล้าง browser data จะลบข้อมูล ผล sign-off เป็นตัวอย่าง ไม่ใช่การลงนามที่ตรวจสอบตัวตนได้ อย่าใส่ข้อมูลลูกค้าหรือข้อมูลลับใน repository หรือ mock data ที่เผยแพร่บน Pages

หากเปิดหลาย tab ให้ refresh เพื่อรับข้อมูลล่าสุดก่อนทำงาน การใช้งานในเครื่องและบน GitHub Pages มี localStorage คนละชุด Export report เพื่อเก็บสำเนาได้ แต่เวอร์ชันนี้ไม่มี import

## โครงสร้าง

```text
src/
  main.tsx         หน้าจอ การนำทาง การคำนวณ และ state
  data.ts          types และข้อมูลตัวอย่าง
  style.css        Tailwind directives และ styles
.github/workflows/deploy.yml
vite.config.ts
package.json
package-lock.json
```

## การตรวจสอบก่อนส่งมอบ

ดูผลจริงใน BUILD-VERIFICATION.md ตรวจ build ซ้ำได้ด้วย npm ci และ npm run build
