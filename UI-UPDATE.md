# UI update — Forest & Ivory

ปรับทั้ง 6 หน้าด้วยโทนเขียวเข้ม–ครีม: sidebar สีเขียวเข้ม, cards พื้น ivory, typography และ contrast ที่อ่านง่ายขึ้น, status badges, ตาราง, ปุ่ม, ฟอร์ม และ modal แบบเดียวกัน เพิ่มพื้นหลังปิดเมนูบนมือถือ และลด animation ตามการตั้งค่าของอุปกรณ์

ตรวจแล้ว: npm run format:check และ npm run build ผ่าน
ข้อจำกัด: Browser preview เชื่อมต่อ localhost ไม่สำเร็จ จึงยังไม่ได้ตรวจภาพจริงหรือ interaction ใน browser สำหรับดีไซน์รอบนี้

## นำไปอัปเดตเว็บเดิม

แตก ZIP ลงโฟลเดอร์ชั่วคราว แล้วคัดลอก src/style.css และ src/main.tsx ไปทับไฟล์ชื่อเดียวกันใน repository บนเครื่อง ไม่ต้องแทนที่โฟลเดอร์ .git

```powershell
npm run format:check
npm run build
git add src/style.css src/main.tsx
git commit -m "Refresh portal UI with forest and ivory theme"
git push
```

รอ GitHub Actions deploy สำเร็จ แล้วเปิดเว็บ หากยังเห็นแบบเดิมกด Ctrl+F5
