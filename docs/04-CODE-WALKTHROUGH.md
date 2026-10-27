# 04 — สอนโครงสร้างและวิธีแก้โค้ดทีละส่วน

## 1. รู้จักไฟล์หลัก

```text
src/
  main.tsx       หน้าจอ ฟอร์ม state การบันทึกและดาวน์โหลด
  model.ts      types, seed, summary, CSV, validation และกฎข้อมูล
  style.css     Tailwind directives และธีมเขียวเข้ม–ครีม
index.html      title, metadata และ Kanit
vite.config.ts  React plugin และ base แบบ relative
public/samples/ ตัวอย่าง CSV
 tests/model.test.mjs  ชุดทดสอบกฎข้อมูล
 docs/          คู่มือชุดนี้
.github/workflows/deploy.yml  deploy main/develop
```

src/data.ts เป็นไฟล์ตัวอย่างรุ่นเดิม ไม่ได้ถูก import ใน v2 ให้แก้ seed ใน model.ts แทน ไม่ต้องแก้ไฟล์ dist เพราะ build จะสร้างทับ

## 2. เปลี่ยนชื่อเว็บไซต์และฟอนต์

เปิด index.html แก้ title และ description ลิงก์ Google Fonts โหลด Kanit จากนั้นเปิด src/style.css ค้นหา ':root' บริเวณท้ายไฟล์ที่กำหนด font-family หากเพิ่มน้ำหนักฟอนต์ใหม่ต้องเพิ่ม weight ใน URL Google Fonts ด้วย

แก้ชื่อ brand บน Sidebar ใน src/main.tsx ค้นหา className="brand" ชื่อ package อยู่ package.json หากเปลี่ยน dependencies ใช้ npm install เพื่ออัปเดต package-lock.json อย่าแก้ lockfile เอง

## 3. เปลี่ยนสีและระยะห่าง

เปิด src/style.css ส่วน 'Refined forest & ivory design system' เป็นธีมหลัก ส่วน 'Management screens' ใช้กับหน้าจอ v2

- .sidebar / .nav: เมนู
- .hero / .ring: Dashboard
- .panel / .stat: การ์ด
- table / th / td: ตาราง
- .badge: ป้ายสถานะ
- .modal / .field: ฟอร์ม
- @media(max-width:620px): มือถือ

ไฟล์มี CSS จากรุ่นเริ่มต้นและ override ธีมอยู่ท้ายไฟล์ ให้แก้ส่วน override ที่ตรงกับองค์ประกอบ หลีกเลี่ยงเติมกฎซ้ำหลายชุด ใช้ DevTools ตรวจ computed style เมื่อไม่แน่ใจ

## 4. เปลี่ยนข้อมูลเริ่มต้น

เปิด src/model.ts หา function seed() แก้ projects, scenarios, cases, results และ defects ให้ id เชื่อมกันถูกต้อง

projectId ต้องตรงกับ Project, scenarioId ของ Case ต้องเป็น Scenario ใน Project เดียวกัน, caseId ของ Result/Defect ต้องเป็น Case ของ Project เดียวกัน

seed จะใช้เมื่อยังไม่มี localStorage ของ URL นี้ การแก้ seed ไม่แทนข้อมูลที่เคยบันทึก ถ้าต้องการทดลองใหม่ให้ Backup ก่อนแล้วกด Reset Demo ใน Data & Backup

## 5. เข้าใจการบันทึก

ใน main.tsx:

1. storageKey รวมชื่อเวอร์ชันและ location.pathname เพื่อแยก root กับ /develop/
2. load() อ่าน localStorage แล้วเรียก validateBackup()
3. db เป็น state รวมข้อมูลทุก Project
4. scopedCases/scopedScenarios/scopedDefects กรองด้วย projectId
5. save(next) ตรวจข้อมูลและเขียน localStorage ก่อนอัปเดต state ถ้าเขียนไม่สำเร็จจะแสดงคำเตือน
6. invalidate(next, projectId) ล้าง Sign-off เฉพาะโครงการที่ข้อมูลเปลี่ยน

หากเพิ่ม mutation ที่กระทบผล UAT ต้องเรียก invalidate ก่อน save เสมอ ห้ามเปลี่ยน db โดยตรง ให้สร้าง next จาก structuredClone หรือ immutable update

## 6. ตัวอย่างเพิ่มช่องข้อมูล Test Case

สมมติต้องการเพิ่ม Preconditions:

1. เพิ่ม preconditions: string ใน interface Case ใน model.ts
2. เพิ่มค่าใน Case ทุกจุดของ seed()
3. เพิ่ม Field/textarea name="preconditions" ในฟอร์ม kind==='case' ของ main.tsx
4. ใน submit() ส่วน kind==='case' เพิ่ม preconditions: v('preconditions')
5. แสดงช่องนี้ในหน้าดู Case/บันทึกผล
6. เพิ่ม validation และคอลัมน์ CSV หากต้องการ Import/Export
7. เพิ่มแนวทาง migrate ข้อมูลเก่า เพราะ localStorage เดิมไม่มี field ใหม่นี้ ห้ามเพิ่ม required validation แล้วทำให้ข้อมูลเก่าอ่านไม่ได้โดยไม่เตรียม migration
8. เพิ่ม test ที่ตรวจค่าถูกเก็บและส่งออก
9. รัน npm run format, npm test และ npm run build

## 7. CSV และ Backup

parseCsv รองรับ quoted field, comma, newline และ BOM ส่วน importCsv ตรวจหัวตาราง รหัสซ้ำ ความสัมพันธ์ และ Priority ก่อนคืน Database ใหม่ กรณี error state เดิมไม่ถูกแก้

validateBackup ตรวจ version, types, ค่า enum, ID และความสัมพันธ์ระหว่างข้อมูล ใช้ทั้งตอน load, save และ Restore หากเพิ่ม entity ใหม่ต้องแก้ schema, validation, backup และ tests ให้พร้อมกัน

## 8. วิธีตรวจทุกครั้งหลังแก้

```powershell
npm run format
npm run format:check
npm test
npm run build
npm run dev
```

npm test ใช้ Node test runner และ transpile model.ts ด้วย TypeScript ที่ติดตั้งในโปรเจกต์ ไม่ใช่ browser test การผ่าน test จึงยังต้องลองฟอร์มจริงตาม acceptance checklist

## 9. ต่อฐานข้อมูลภายหลัง

แยก save/load ออกเป็น data service แล้วค่อยเปลี่ยนเป็น API รักษา projectId และ foreign keys ในทุก entity การใช้งานร่วมกันต้องมี transaction/version conflict handling และสำรองข้อมูลที่ server ก่อนเพิ่ม Role ในภายหลัง
