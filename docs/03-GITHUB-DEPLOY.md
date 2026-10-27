# 03 — GitHub, develop และ main

## 1. ตรวจ repository ปลายทาง

เปิด Terminal ใน repository เดิม:

```powershell
git remote -v
git branch --show-current
```

origin ควรเป็น https://github.com/phrmthnttbn/uat-portal-management.git และ branch develop หาก origin ผิด:

```powershell
git remote set-url origin https://github.com/phrmthnttbn/uat-portal-management.git
```

## 2. ส่งเวอร์ชันใหม่เข้า develop

คัดลอก source ตามคู่มือ 01 แล้วรันทีละคำสั่ง ตรวจให้ผ่านก่อน push:

```powershell
npm ci
npm run format:check
npm test
npm run build
git status
git add src index.html package.json package-lock.json tests docs public .github .prettierrc.json .prettierignore README.md BUILD-VERIFICATION.md
git diff --cached --stat
git commit -m "Complete general UAT management features"
git push -u origin develop
```

อย่าเพิ่ม dist หรือ node_modules ใน Git ถ้ารายการ staged มีไฟล์ส่วนตัวที่ไม่เกี่ยวข้อง ให้เอาออกก่อน commit

## 3. ตั้ง GitHub Pages

Repository → Settings → Pages → Source เลือก GitHub Actions

Settings → Environments → github-pages → Deployment branches and tags เลือก Selected branches and tags และอนุญาต Branch main กับ develop โดยเก็บ protection อื่นที่ทีมตั้งไว้ หากมี required reviewer ให้ผู้ดูแลอนุมัติใน Actions

ทั้ง main และ develop ต้องมี .github/workflows/deploy.yml เวอร์ชันเดียวกันใน ZIP หาก main ยังเป็นเวอร์ชันเก่า ให้คัดลอกเฉพาะ workflow นี้ผ่าน GitHub editor ใน main ก่อน ไม่จำเป็นต้อง merge ฟีเจอร์ที่ยังไม่ทดสอบ

Workflow สร้าง main ลง root และ develop ลง /develop/ แล้วรวมเป็น artifact เดียวก่อน deploy ทุก push เข้า main/develop จะสร้างทั้งสองเว็บใหม่ หาก branch ใด build ไม่ผ่าน จะยังไม่ deploy รอบนั้น

การ push develop ไม่ merge source เข้า main แต่จะ rebuild source main ปัจจุบันด้วย ดังนั้น deployment นี้เป็นการ deploy ร่วม ไม่ใช่ hosting สองชุดที่แยกอิสระ

## 4. ตรวจผล

Actions → Deploy main and develop → เปิดรอบล่าสุด → ทั้ง build/deploy ต้องสีเขียว

- เว็บหลัก: https://phrmthnttbn.github.io/uat-portal-management/
- เว็บทดสอบ: https://phrmthnttbn.github.io/uat-portal-management/develop/

กด Ctrl+F5 หากยังเห็นแบบเก่า เวอร์ชันใหม่มี footer v2.0

## 5. นำงานที่ทดสอบแล้วขึ้น main

แนะนำใช้ Pull Request บน GitHub: base main ← compare develop ตรวจ Files changed แล้ว merge หลังทดสอบผ่าน อย่า merge หาก develop มีงานอื่นที่ยังไม่พร้อม

หลัง merge ให้รอ Actions แล้วเปิดเว็บหลัก โค้ดเปลี่ยนแต่ข้อมูล localStorage ของเว็บหลักจะไม่คัดลอกจาก develop ต้อง Backup/Restore เองหากตั้งใจจะนำข้อมูลทดสอบไปด้วย

## 6. สั่งรันเอง

Actions → Deploy main and develop → Run workflow → เลือก develop หรือ main → Run workflow หากไม่เห็นปุ่ม ให้ตรวจว่า workflow มี workflow_dispatch และมีไฟล์บน default branch

## 7. แก้ปัญหา

- Branch develop is not allowed: เพิ่ม develop ในกฎ github-pages environment
- 404 เฉพาะ /develop/: ตรวจว่า main ยังใช้ workflow เก่าหรือไม่ และ Combine both websites ทำงานสำเร็จหรือไม่
- npm ci ล้มเหลว: package/lockfile ต้องตรงกัน ตรวจ logs ว่า main หรือ develop ล้มเหลว
- test ไม่ผ่าน: เปิดขั้น Test development เพื่อดูชื่อ test และ error
- Invalid username or token: ใช้ Git Credential Manager เข้าระบบผ่าน browser ด้วยบัญชีที่มีสิทธิ์ repository ไม่ใช้ password GitHub กับ Git HTTPS
- Git push rejected: git status ก่อน แล้ว pull ตามกระบวนการทีม อย่า force push เพื่อข้ามปัญหา

## 8. ย้อนเวอร์ชัน

Backup ข้อมูลใน browser ก่อน บน GitHub revert Pull Request ที่นำเวอร์ชันใหม่เข้า main หรือใช้ git revert ของ commit ที่ต้องการผ่าน branch/PR ตามกระบวนการทีม แล้วรอ workflow การย้อน source ไม่ได้ย้อน localStorage อัตโนมัติ

การส่งมอบครั้งนี้ไม่ได้ push หรือแก้ remote repository ให้คุณ
