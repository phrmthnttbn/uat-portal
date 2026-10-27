export type Status = 'Not run' | 'Passed' | 'Failed' | 'Blocked';
export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
export interface Project {
  id: string;
  code: string;
  name: string;
  description: string;
  archived: boolean;
}
export interface Scenario {
  id: string;
  projectId: string;
  code: string;
  name: string;
  description: string;
}
export interface Case {
  id: string;
  projectId: string;
  scenarioId: string;
  code: string;
  name: string;
  steps: string;
  expected: string;
  priority: Priority;
  owner: string;
}
export interface Result {
  id: string;
  projectId: string;
  caseId: string;
  status: Status;
  actual: string;
  tester: string;
  date: string;
  evidence: string;
}
export interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
}
export interface Defect {
  id: string;
  projectId: string;
  caseId: string;
  code: string;
  name: string;
  description: string;
  severity: Priority;
  owner: string;
  status: 'Open' | 'In progress' | 'Resolved' | 'Closed';
  comments: Comment[];
}
export interface SignOff {
  id: string;
  projectId: string;
  name: string;
  note: string;
  date: string;
}
export interface Database {
  version: 2;
  projects: Project[];
  scenarios: Scenario[];
  cases: Case[];
  results: Result[];
  defects: Defect[];
  signoffs: SignOff[];
}
export const uid = () => crypto.randomUUID();
export function seed(): Database {
  const projectId = 'p-rider';
  const scenarios: Scenario[] = ['Account', 'Delivery', 'Finance', 'Support'].map((name, i) => ({
    id: `s-${i}`,
    projectId,
    code: `SC-00${i + 1}`,
    name,
    description: `ทดสอบกระบวนการ ${name}`,
  }));
  const names = [
    'สมัครสมาชิกด้วยเบอร์โทรศัพท์',
    'ตรวจสอบ OTP หมดอายุ',
    'รับงานใหม่',
    'ยืนยันส่งสินค้าพร้อมรูปภาพ',
    'ตรวจสอบรายได้รายวัน',
    'ถอนเงินเข้าบัญชี',
    'ติดต่อฝ่ายช่วยเหลือ',
    'รายงานเหตุฉุกเฉิน',
  ];
  const cases: Case[] = names.map((name, i) => ({
    id: `c-${i}`,
    projectId,
    scenarioId: `s-${Math.floor(i / 2)}`,
    code: `TC-00${i + 1}`,
    name,
    steps: '1. เข้าสู่ระบบด้วยบัญชีทดสอบ\n2. เปิดเมนูที่เกี่ยวข้อง\n3. ทำรายการและตรวจสอบผล',
    expected: 'ระบบทำรายการสำเร็จและแสดงข้อมูลถูกต้อง',
    priority: i % 2 ? 'Medium' : 'High',
    owner: ['Nicha', 'Krit', 'Ploy'][i % 3],
  }));
  const results: Result[] = cases.slice(0, 6).map((c, i) => ({
    id: `r-${i}`,
    projectId,
    caseId: c.id,
    status: i === 3 ? 'Failed' : i === 5 ? 'Blocked' : 'Passed',
    actual:
      i === 3 ? 'อัปโหลดรูปไม่สำเร็จ' : i === 5 ? 'บริการธนาคารไม่พร้อม' : 'ผลตรงตามที่คาดหวัง',
    tester: c.owner,
    date: '2026-10-22T03:00:00.000Z',
    evidence: '',
  }));
  return {
    version: 2,
    projects: [
      {
        id: projectId,
        code: 'RIDER',
        name: 'Rider Application',
        description: 'ทดสอบทุกขั้นตอนก่อนเปิดใช้งาน',
        archived: false,
      },
      {
        id: 'p-portal',
        code: 'PORTAL',
        name: 'UAT Portal Management',
        description: 'โครงการตัวอย่างสำหรับเริ่มสร้าง Test Scenario',
        archived: false,
      },
    ],
    scenarios,
    cases,
    results,
    defects: [
      {
        id: 'd-1',
        projectId,
        caseId: 'c-3',
        code: 'DEF-001',
        name: 'อัปโหลดรูปส่งงานไม่สำเร็จ',
        description: 'พบปัญหาระหว่างยืนยันส่งงาน',
        severity: 'High',
        owner: 'Mobile team',
        status: 'Open',
        comments: [],
      },
      {
        id: 'd-2',
        projectId,
        caseId: 'c-5',
        code: 'DEF-002',
        name: 'บริการธนาคารไม่พร้อม',
        description: 'ไม่สามารถถอนเงินใน sandbox',
        severity: 'Critical',
        owner: 'Payment team',
        status: 'In progress',
        comments: [],
      },
    ],
    signoffs: [],
  };
}
export function latest(db: Database, caseId: string): Result | undefined {
  return [...db.results].reverse().find((r) => r.caseId === caseId);
}
export function summary(db: Database, projectId: string) {
  const cases = db.cases.filter((c) => c.projectId === projectId);
  const statuses = cases.map((c) => latest(db, c.id)?.status ?? 'Not run');
  const passed = statuses.filter((s) => s === 'Passed').length,
    failed = statuses.filter((s) => s === 'Failed').length,
    blocked = statuses.filter((s) => s === 'Blocked').length,
    notRun = statuses.filter((s) => s === 'Not run').length;
  const open = db.defects.filter((d) => d.projectId === projectId && d.status !== 'Closed').length;
  return {
    total: cases.length,
    passed,
    failed,
    blocked,
    notRun,
    open,
    executed: cases.length - notRun,
    progress: cases.length ? Math.round(((cases.length - notRun) / cases.length) * 100) : 0,
    ready: cases.length > 0 && passed === cases.length && open === 0,
  };
}
export function invalidate(db: Database, projectId: string): Database {
  return { ...db, signoffs: db.signoffs.filter((s) => s.projectId !== projectId) };
}
export function codeNext(prefix: string, codes: string[]) {
  let n = 1;
  while (codes.includes(`${prefix}-${String(n).padStart(3, '0')}`)) n++;
  return `${prefix}-${String(n).padStart(3, '0')}`;
}
export function deleteCase(db: Database, id: string): Database {
  const c = db.cases.find((c) => c.id === id);
  if (!c) return db;
  if (db.defects.some((d) => d.caseId === id))
    throw Error('Test Case นี้มี Defect อ้างอิง กรุณาเก็บไว้เพื่อรักษาประวัติ');
  return invalidate(
    {
      ...db,
      cases: db.cases.filter((c) => c.id !== id),
      results: db.results.filter((r) => r.caseId !== id),
    },
    c.projectId,
  );
}
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [],
    cell = '',
    quoted = false;
  text = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (quoted) quoted = false;
      else if (cell === '') quoted = true;
      else throw Error('เครื่องหมาย quote ใน CSV ไม่ถูกต้อง');
    } else if (c === ',' && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((c === '\n' || c === '\r') && !quoted) {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      if (row.some((v) => v.trim())) rows.push(row);
      row = [];
      cell = '';
    } else cell += c;
  }
  if (quoted) throw Error('CSV มีเครื่องหมาย quote ที่ยังไม่ปิด');
  row.push(cell);
  if (row.some((v) => v.trim())) rows.push(row);
  return rows;
}
export function csv(rows: string[][]): string {
  return (
    '\uFEFF' +
    rows
      .map((r) =>
        r
          .map((v) => '"' + (/^[=+@\-\t\r]/.test(v) ? "'" : '') + v.replaceAll('"', '""') + '"')
          .join(','),
      )
      .join('\r\n')
  );
}
export function importCsv(
  db: Database,
  projectId: string,
  kind: 'scenarios' | 'cases',
  text: string,
): Database {
  const rows = parseCsv(text);
  if (rows.length < 2) throw Error('ต้องมีหัวตารางและข้อมูลอย่างน้อย 1 แถว');
  const headers =
    kind === 'scenarios'
      ? ['code', 'name', 'description']
      : ['code', 'scenarioCode', 'name', 'steps', 'expected', 'priority', 'owner'];
  if (rows[0].join('|') !== headers.join('|'))
    throw Error('หัวตารางไม่ตรงกับ Template กรุณาดาวน์โหลด Template ก่อน');
  const next = structuredClone(db);
  const seen = new Set<string>();
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i].map((v) => v.trim());
    if (row.length !== headers.length) throw Error(`แถว ${i + 1}: จำนวนคอลัมน์ไม่ถูกต้อง`);
    const [code] = row;
    if (!code || !row[1] || seen.has(code.toLowerCase()))
      throw Error(`แถว ${i + 1}: ข้อมูลจำเป็นว่างหรือรหัสซ้ำในไฟล์`);
    seen.add(code.toLowerCase());
    if (kind === 'scenarios') {
      if (
        next.scenarios.some(
          (s) => s.projectId === projectId && s.code.toLowerCase() === code.toLowerCase(),
        )
      )
        throw Error(`แถว ${i + 1}: รหัส Scenario ซ้ำ`);
      next.scenarios.push({ id: uid(), projectId, code, name: row[1], description: row[2] });
    } else {
      const scenario = next.scenarios.find((s) => s.projectId === projectId && s.code === row[1]);
      if (
        !scenario ||
        !row[2] ||
        !row[3] ||
        !row[4] ||
        !['Low', 'Medium', 'High', 'Critical'].includes(row[5])
      )
        throw Error(
          `แถว ${i + 1}: Scenario ไม่มีในโครงการ หรือข้อมูล name/steps/expected/priority ไม่ถูกต้อง`,
        );
      if (
        next.cases.some(
          (c) => c.projectId === projectId && c.code.toLowerCase() === code.toLowerCase(),
        )
      )
        throw Error(`แถว ${i + 1}: รหัส Test Case ซ้ำ`);
      next.cases.push({
        id: uid(),
        projectId,
        code,
        scenarioId: scenario.id,
        name: row[2],
        steps: row[3],
        expected: row[4],
        priority: row[5] as Priority,
        owner: row[6],
      });
    }
  }
  return invalidate(next, projectId);
}
export function validateBackup(value: unknown): Database {
  if (!value || typeof value !== 'object') throw Error('ไฟล์สำรองไม่ถูกต้อง');
  const d = value as Database;
  if (
    d.version !== 2 ||
    !['projects', 'scenarios', 'cases', 'results', 'defects', 'signoffs'].every((k) =>
      Array.isArray((d as unknown as Record<string, unknown>)[k]),
    )
  )
    throw Error('รองรับไฟล์ Backup version 2 เท่านั้น');
  const strings = (o: unknown, keys: string[]) =>
    !!o &&
    typeof o === 'object' &&
    keys.every((k) => typeof (o as Record<string, unknown>)[k] === 'string');
  if (
    !d.projects.every(
      (p) => strings(p, ['id', 'code', 'name', 'description']) && typeof p.archived === 'boolean',
    ) ||
    !d.scenarios.every((s) => strings(s, ['id', 'projectId', 'code', 'name', 'description'])) ||
    !d.cases.every(
      (c) =>
        strings(c, [
          'id',
          'projectId',
          'scenarioId',
          'code',
          'name',
          'steps',
          'expected',
          'priority',
          'owner',
        ]) && ['Low', 'Medium', 'High', 'Critical'].includes(c.priority),
    ) ||
    !d.results.every(
      (r) =>
        strings(r, [
          'id',
          'projectId',
          'caseId',
          'status',
          'actual',
          'tester',
          'date',
          'evidence',
        ]) &&
        ['Not run', 'Passed', 'Failed', 'Blocked'].includes(r.status) &&
        Number.isFinite(Date.parse(r.date)),
    ) ||
    !d.defects.every(
      (f) =>
        strings(f, [
          'id',
          'projectId',
          'caseId',
          'code',
          'name',
          'description',
          'severity',
          'owner',
          'status',
        ]) &&
        ['Low', 'Medium', 'High', 'Critical'].includes(f.severity) &&
        ['Open', 'In progress', 'Resolved', 'Closed'].includes(f.status) &&
        Array.isArray(f.comments) &&
        f.comments.every(
          (c) =>
            strings(c, ['id', 'author', 'text', 'date']) && Number.isFinite(Date.parse(c.date)),
        ),
    )
  )
    throw Error('โครงสร้างข้อมูลใน Backup ไม่ถูกต้อง');
  if (
    !d.signoffs.every(
      (s) =>
        strings(s, ['id', 'projectId', 'name', 'note', 'date']) &&
        Number.isFinite(Date.parse(s.date)),
    )
  )
    throw Error('ข้อมูล Sign-off ไม่ถูกต้อง');
  for (const list of [d.projects, d.scenarios, d.cases, d.results, d.defects, d.signoffs]) {
    if (new Set(list.map((x) => x.id)).size !== list.length) throw Error('พบ ID ซ้ำ');
  }
  const project = (id: string) => d.projects.some((p) => p.id === id);
  const test = (id: string, p: string) => d.cases.some((c) => c.id === id && c.projectId === p);
  if (
    d.scenarios.some((s) => !project(s.projectId)) ||
    d.cases.some(
      (c) => !d.scenarios.some((s) => s.id === c.scenarioId && s.projectId === c.projectId),
    ) ||
    d.results.some((r) => !test(r.caseId, r.projectId)) ||
    d.defects.some((f) => !test(f.caseId, f.projectId)) ||
    d.signoffs.some((s) => !project(s.projectId) || !summary(d, s.projectId).ready)
  )
    throw Error('ข้อมูลอ้างอิงข้าม Project หรือเงื่อนไข Sign-off ไม่ถูกต้อง');
  if (new Set(d.projects.map((p) => p.code.toLowerCase())).size !== d.projects.length)
    throw Error('รหัส Project ซ้ำ');
  for (const p of d.projects)
    for (const list of [d.scenarios, d.cases, d.defects]) {
      const codes = list.filter((x) => x.projectId === p.id).map((x) => x.code.toLowerCase());
      if (new Set(codes).size !== codes.length) throw Error('รหัสภายใน Project ซ้ำ');
    }
  return d;
}
