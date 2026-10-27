# 01 — ติดตั้งและอัปเดตบน Windows

## A. เปิดโปรเจกต์ใหม่จาก ZIP

1. ติดตั้ง Node.js 22 LTS, Git for Windows และ VS Code หากยังไม่มี
2. คลิกขวา ZIP → Extract All ให้ได้โฟลเดอร์ uat-portal-management
3. อย่าเปิดงานภายใน ZIP ให้แตกไฟล์ก่อน
4. เปิด VS Code → File → Open Folder → เลือกโฟลเดอร์ที่มี package.json
5. เลือก Terminal → New Terminal ตรวจว่าอยู่โฟลเดอร์โปรเจกต์
6. รันคำสั่งทีละบรรทัด:

```powershell
npm ci
npm run dev
```

7. เปิด URL ที่ Terminal แสดง ปกติ http://127.0.0.1:5173/
8. ลองสลับ Project ด้านบน ระหว่าง RIDER กับ PORTAL ต้องเห็นข้อมูลต่างกัน
9. หยุด server ด้วย Ctrl+C

หาก PowerShell ไม่อนุญาต npm.ps1 ใช้ npm.cmd แทน npm ทุกคำสั่ง ไม่ต้องเปลี่ยน Execution Policy

## B. อัปเดต repository เดิมโดยเก็บประวัติ Git

1. ก่อนอัปเดต ให้เปิดเว็บเดิมแล้ว Export ข้อมูลที่ต้องเก็บไว้ เก็บ ZIP/source เดิมสำรองด้วย
2. แตก ZIP ใหม่นอก repository เดิมเพื่อป้องกันโฟลเดอร์ซ้อน
3. เปิด repository เดิมใน VS Code ตรวจการแก้ที่ค้างอยู่ก่อน:

```powershell
git status
git branch --show-current
```

4. ถ้ามีงานที่ยังไม่บันทึก ให้ commit งานเดิมหรือสำรองก่อน แล้วสลับ develop:

```powershell
git switch develop
git pull --ff-only origin develop
```

5. คัดลอกไฟล์ต่อไปนี้จาก ZIP ไปยังตำแหน่งชื่อเดียวกันใน repository เดิม:

- src/main.tsx และ src/model.ts
- src/style.css
- index.html
- package.json และ package-lock.json (ต้องคัดลอกเป็นคู่)
- tests/ ทั้งโฟลเดอร์
- docs/ ทั้งโฟลเดอร์
- public/samples/ ทั้งโฟลเดอร์
- .github/workflows/deploy.yml
- .prettierrc.json และ .prettierignore
- README.md และ BUILD-VERIFICATION.md

6. คงไฟล์ vite.config.ts, tsconfig.json, tailwind.config.js และ postcss.config.js เดิมได้หากยังเหมือนเวอร์ชันเริ่มต้น ถ้าแก้เองให้เทียบกับ ZIP ก่อน
7. ห้ามลบหรือแทนที่ .git และไม่ต้องคัดลอก node_modules หรือ dist
8. src/data.ts เก่า, ProjectManager.tsx หรือ auth.ts ที่เคยสร้างไว้ไม่ถูกใช้ใน entry ใหม่ จะเก็บไว้ก่อนได้
9. ติดตั้งและตรวจ:

```powershell
npm ci
npm run format:check
npm test
npm run build
npm run dev
```

10. หน้าจอแสดง UAT Portal Management v2 และเมนู Projects / Data & Backup ข้อมูลเริ่มต้นใหม่เป็นปกติ เพราะแยกจาก localStorage รุ่นเดิม
11. ทดลองตาม docs/05-ACCEPTANCE-CHECKLIST.md ก่อนส่งขึ้น GitHub

## C. ปัญหาที่พบบ่อย

- ENOENT package.json: เปิด Terminal ผิดโฟลเดอร์ ให้เข้าโฟลเดอร์ที่มี package.json
- npm ci ล้มเหลวเพราะ lockfile: ตรวจว่าคัดลอก package.json และ package-lock.json จาก ZIP ชุดเดียวกัน
- Port ถูกใช้: ใช้ URL ใหม่ที่ Vite แสดง ไม่ยึด 5173 เสมอ
- ไม่เห็นข้อมูลเดิม: v2 เริ่ม storage ใหม่ ข้อมูลเก่าไม่ถูกแปลงอัตโนมัติ
- บันทึกไม่สำเร็จ: browser อาจปิด localStorage หรือพื้นที่เต็ม Backup ข้อมูลก่อนล้าง browser
- เปิด index.html แล้วหน้าขาว: ต้องใช้ npm run dev หรือ npm run preview ไม่ใช้ file://
