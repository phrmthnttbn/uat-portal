export type Status = 'Not run' | 'Passed' | 'Failed' | 'Blocked';
export type TestCase = { id: string; scenario: string; title: string; module: string; priority: string; owner: string; status: Status; expected: string; steps: string; actual: string; };
export type Defect = { id: string; title: string; severity: string; status: string; owner: string; caseId: string };
export const scenarios = [
 {id:'SC-001',name:'Rider onboarding',description:'สมัครสมาชิก ยืนยันตัวตน และเริ่มต้นใช้งาน',module:'Account'},
 {id:'SC-002',name:'Accept & deliver an order',description:'รับงาน รับสินค้า และส่งมอบให้ลูกค้า',module:'Delivery'},
 {id:'SC-003',name:'Earnings & payout',description:'ตรวจสอบรายได้และถอนเงินเข้าบัญชี',module:'Finance'},
 {id:'SC-004',name:'Support & safety',description:'ติดต่อฝ่ายช่วยเหลือและรายงานเหตุฉุกเฉิน',module:'Support'},
];
export const initialCases: TestCase[] = [
 ['TC-001','SC-001','สมัคร Rider ด้วยเบอร์โทรศัพท์','Account','High','Nicha','Passed'],
 ['TC-002','SC-001','ยืนยัน OTP ที่หมดอายุ','Account','High','Nicha','Passed'],
 ['TC-003','SC-001','อัปโหลดเอกสารยืนยันตัวตน','Account','Medium','Ploy','Not run'],
 ['TC-004','SC-002','รับงานจากหน้ารายการงาน','Delivery','High','Krit','Passed'],
 ['TC-005','SC-002','เปิดเส้นทางไปจุดรับสินค้า','Delivery','Medium','Krit','Passed'],
 ['TC-006','SC-002','ยืนยันส่งงานพร้อมรูปภาพ','Delivery','High','Ploy','Failed'],
 ['TC-007','SC-003','ตรวจสอบสรุปรายได้รายวัน','Finance','Medium','Nicha','Passed'],
 ['TC-008','SC-003','ถอนเงินเข้าบัญชีธนาคาร','Finance','High','Krit','Blocked'],
 ['TC-009','SC-004','เริ่มแชตกับฝ่ายช่วยเหลือ','Support','Medium','Ploy','Passed'],
 ['TC-010','SC-004','รายงานเหตุฉุกเฉินระหว่างส่งงาน','Support','High','Nicha','Not run'],
].map(([id,scenario,title,module,priority,owner,status]) => ({id,scenario,title,module,priority,owner,status:status as Status,steps:'1. เข้าสู่ระบบด้วยบัญชี Rider สำหรับทดสอบ\n2. เปิดเมนูที่เกี่ยวข้อง\n3. ทำรายการตามชื่อ Test Case และตรวจสอบผล',expected:'ระบบแสดงผลถูกต้อง บันทึกข้อมูลครบถ้วน และแจ้งผลการทำรายการ',actual:status==='Passed'?'ผลลัพธ์ถูกต้องตามที่คาดหวัง':''}));
export const initialDefects: Defect[] = [
 {id:'DEF-001',title:'รูปยืนยันการส่งงานอัปโหลดไม่สำเร็จ',severity:'High',status:'Open',owner:'Mobile team',caseId:'TC-006'},
 {id:'DEF-002',title:'บริการธนาคารทดสอบไม่พร้อมใช้งาน',severity:'Critical',status:'In progress',owner:'Payment team',caseId:'TC-008'},
 {id:'DEF-003',title:'ข้อความ OTP แสดงผลไม่ครบ',severity:'Low',status:'Closed',owner:'Mobile team',caseId:'TC-002'},
];
