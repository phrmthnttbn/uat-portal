import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  LayoutDashboard,
  FolderKanban,
  Layers,
  ListChecks,
  ClipboardCheck,
  Bug,
  FileCheck2,
  Download,
  Plus,
  ArrowRight,
  Bike,
  Menu,
  X,
  Database as DatabaseIcon,
  Search,
} from 'lucide-react';
import {
  seed,
  uid,
  latest,
  summary,
  invalidate,
  codeNext,
  deleteCase,
  csv,
  importCsv,
  validateBackup,
  type Database,
  type Project,
  type Scenario,
  type Case,
  type Result,
  type Defect,
  type Status,
} from './model';
import './style.css';
const pages = [
  'Dashboard',
  'Projects',
  'Test Scenarios',
  'Test Cases',
  'Test Results',
  'Defect Tracking',
  'UAT Sign-off',
  'Data & Backup',
] as const;
type Page = (typeof pages)[number];
const icons = [
  LayoutDashboard,
  FolderKanban,
  Layers,
  ListChecks,
  ClipboardCheck,
  Bug,
  FileCheck2,
  DatabaseIcon,
];
const storageKey = `uat-management-v2:${location.pathname.replace(/\/+$/, '') || '/'}`;
function load(): Database {
  const raw = localStorage.getItem(storageKey);
  return raw ? validateBackup(JSON.parse(raw)) : seed();
}
function Badge({ value }: { value: string }) {
  return <span className={'badge ' + value.toLowerCase().replaceAll(' ', '-')}>{value}</span>;
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      {label}
      {children}
    </label>
  );
}
function App() {
  const [initial] = useState(() => {
    try {
      return { db: load(), error: '' };
    } catch {
      return {
        db: seed(),
        error:
          'อ่านข้อมูลที่บันทึกไว้ไม่ได้ ระบบแสดงข้อมูลตัวอย่าง กรุณาดาวน์โหลดข้อมูลเดิมจาก Data & Backup ก่อนบันทึกทับ',
      };
    }
  });
  const [db, setDb] = useState<Database>(initial.db);
  const [storageError, setStorageError] = useState(initial.error);
  const [projectId, setProjectId] = useState(
    initial.db.projects.find((p) => !p.archived)?.id ?? '',
  );
  const [page, setPage] = useState<Page>('Dashboard');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [scenarioFilter, setScenarioFilter] = useState('All');
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState('');
  const [modal, setModal] = useState<{
    kind: 'project' | 'scenario' | 'case' | 'result' | 'defect';
    item?: Project | Scenario | Case | Result | Defect;
    caseId?: string;
  } | null>(null);
  const [formError, setFormError] = useState('');
  const [detailId, setDetailId] = useState('');
  const [importKind, setImportKind] = useState<'scenarios' | 'cases'>('scenarios');
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  useEffect(() => {
    if (!modal) return;
    const previous = document.activeElement as HTMLElement | null;
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
    const focusable = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], summary',
        ) ?? [],
      ).filter((e) => e.getClientRects().length > 0);
    focusable()[0]?.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const elements = focusable();
      const first = elements[0],
        last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    dialog?.addEventListener('keydown', trap);
    return () => {
      dialog?.removeEventListener('keydown', trap);
      previous?.focus();
    };
  }, [modal]);
  const project = db.projects.find((p) => p.id === projectId);
  const stats = summary(db, projectId);
  const locked = !project || project.archived;
  const scopedCases = db.cases.filter((c) => c.projectId === projectId);
  const scopedScenarios = db.scenarios.filter((s) => s.projectId === projectId);
  const scopedDefects = db.defects.filter((d) => d.projectId === projectId);
  const sign = db.signoffs.find((s) => s.projectId === projectId);
  const detail = scopedDefects.find((d) => d.id === detailId);
  function notify(message: string) {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 5000);
  }
  function save(next: Database, message = 'บันทึกแล้ว') {
    try {
      validateBackup(next);
      localStorage.setItem(storageKey, JSON.stringify(next));
      setDb(next);
      setStorageError('');
      notify(message);
      return true;
    } catch (e) {
      setFormError('บันทึกไม่สำเร็จ กรุณาตรวจคำเตือนและสำรองข้อมูลก่อนลองอีกครั้ง');
      setStorageError(
        `บันทึกไม่สำเร็จ: ${e instanceof Error ? e.message : 'พื้นที่ไม่พอหรือ browser ไม่อนุญาต'} กรุณา Backup ข้อมูลปัจจุบัน`,
      );
      return false;
    }
  }
  function nav(p: Page) {
    setPage(p);
    setQuery('');
    setStatusFilter('All');
    setScenarioFilter('All');
    setDetailId('');
    setMenu(false);
  }
  function open(
    kind: NonNullable<typeof modal>['kind'],
    item?: NonNullable<typeof modal>['item'],
    caseId?: string,
  ) {
    setFormError('');
    setModal({ kind, item, caseId });
  }
  function download(name: string, content: string, type = 'application/json') {
    const a = document.createElement('a');
    const url = URL.createObjectURL(new Blob([content], { type }));
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function report() {
    download(
      `${project?.code ?? 'all'}-uat-report.json`,
      JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          project,
          summary: stats,
          scenarios: scopedScenarios,
          cases: scopedCases,
          results: db.results.filter((r) => r.projectId === projectId),
          defects: scopedDefects,
          signoff: sign ?? null,
        },
        null,
        2,
      ),
    );
  }
  function exportCsv(kind: 'scenarios' | 'cases', template = false) {
    const rows =
      kind === 'scenarios'
        ? [
            ['code', 'name', 'description'],
            ...(template
              ? [['SC-NEW', 'ตัวอย่าง Scenario', 'รายละเอียด']]
              : scopedScenarios.map((s) => [s.code, s.name, s.description])),
          ]
        : [
            ['code', 'scenarioCode', 'name', 'steps', 'expected', 'priority', 'owner'],
            ...(template
              ? [
                  [
                    'TC-NEW',
                    scopedScenarios[0]?.code ?? 'SC-NEW',
                    'ตัวอย่าง Test Case',
                    '1. เปิดหน้าจอ\n2. ทดสอบ',
                    'แสดงข้อมูลถูกต้อง',
                    'High',
                    'Tester',
                  ],
                ]
              : scopedCases.map((c) => [
                  c.code,
                  scopedScenarios.find((s) => s.id === c.scenarioId)?.code ?? '',
                  c.name,
                  c.steps,
                  c.expected,
                  c.priority,
                  c.owner,
                ])),
          ];
    download(
      `${kind}-${template ? 'template' : project?.code}.csv`,
      csv(rows),
      'text/csv;charset=utf-8',
    );
  }
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!modal) return;
    const data = new FormData(e.currentTarget);
    const v = (key: string) => String(data.get(key) ?? '').trim();
    try {
      let next = structuredClone(db);
      const id = modal.item?.id ?? uid();
      const kind = modal.kind;
      if (kind !== 'project' && locked) throw Error('เลือกโครงการที่กำลังใช้งานก่อน');
      if (kind === 'project') {
        if (!v('code') || !v('name')) throw Error('กรอกรหัสและชื่อโครงการ');
        if (
          db.projects.some((p) => p.id !== id && p.code.toLowerCase() === v('code').toLowerCase())
        )
          throw Error('รหัสโครงการซ้ำ');
        const p: Project = {
          id,
          code: v('code').toUpperCase(),
          name: v('name'),
          description: v('description'),
          archived: (modal.item as Project | undefined)?.archived ?? false,
        };
        next.projects = modal.item
          ? next.projects.map((x) => (x.id === id ? p : x))
          : [...next.projects, p];
      }
      if (kind === 'scenario') {
        if (!v('code') || !v('name')) throw Error('กรอกข้อมูลจำเป็น');
        if (
          scopedScenarios.some(
            (s) => s.id !== id && s.code.toLowerCase() === v('code').toLowerCase(),
          )
        )
          throw Error('รหัส Scenario ซ้ำ');
        const s: Scenario = {
          id,
          projectId,
          code: v('code'),
          name: v('name'),
          description: v('description'),
        };
        next.scenarios = modal.item
          ? next.scenarios.map((x) => (x.id === id ? s : x))
          : [...next.scenarios, s];
        next = invalidate(next, projectId);
      }
      if (kind === 'case') {
        if (
          !v('name') ||
          !v('code') ||
          !v('steps') ||
          !v('expected') ||
          !scopedScenarios.some((s) => s.id === v('scenarioId'))
        )
          throw Error('กรอกข้อมูลให้ครบและเลือก Scenario');
        if (
          scopedCases.some((c) => c.id !== id && c.code.toLowerCase() === v('code').toLowerCase())
        )
          throw Error('รหัส Test Case ซ้ำ');
        const c: Case = {
          id,
          projectId,
          scenarioId: v('scenarioId'),
          code: v('code'),
          name: v('name'),
          steps: v('steps'),
          expected: v('expected'),
          priority: v('priority') as Case['priority'],
          owner: v('owner'),
        };
        next.cases = modal.item ? next.cases.map((x) => (x.id === id ? c : x)) : [...next.cases, c];
        next = invalidate(next, projectId);
      }
      if (kind === 'result') {
        const c = scopedCases.find((c) => c.id === modal.caseId);
        if (!c) throw Error('ไม่พบ Test Case');
        if (!v('tester') || !v('actual')) throw Error('กรอกผู้ทดสอบและผลที่พบจริง');
        if (v('evidence') && !/^https?:\/\//i.test(v('evidence')))
          throw Error('ลิงก์หลักฐานต้องขึ้นต้นด้วย https:// หรือ http://');
        next.results.push({
          id,
          projectId,
          caseId: c.id,
          status: v('status') as Status,
          actual: v('actual'),
          tester: v('tester'),
          date: new Date().toISOString(),
          evidence: v('evidence'),
        });
        next = invalidate(next, projectId);
      }
      if (kind === 'defect') {
        if (!v('name') || !v('description') || !scopedCases.some((c) => c.id === v('caseId')))
          throw Error('กรอกชื่อ รายละเอียด และเลือก Test Case');
        const previous = modal.item as Defect | undefined;
        const d: Defect = {
          id,
          projectId,
          caseId: v('caseId'),
          code:
            previous?.code ??
            codeNext(
              'DEF',
              scopedDefects.map((d) => d.code),
            ),
          name: v('name'),
          description: v('description'),
          severity: v('severity') as Defect['severity'],
          owner: v('owner'),
          status: previous?.status ?? 'Open',
          comments: previous?.comments ?? [],
        };
        next.defects = previous
          ? next.defects.map((x) => (x.id === id ? d : x))
          : [...next.defects, d];
        next = invalidate(next, projectId);
      }
      if (save(next)) {
        if (kind === 'project') setProjectId(id);
        setModal(null);
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'บันทึกไม่สำเร็จ');
    }
  }
  const match = (s: string) => s.toLowerCase().includes(query.toLowerCase());
  const shownCases = scopedCases.filter(
    (c) =>
      match(`${c.code} ${c.name} ${c.owner}`) &&
      (statusFilter === 'All' || (latest(db, c.id)?.status ?? 'Not run') === statusFilter) &&
      (scenarioFilter === 'All' || c.scenarioId === scenarioFilter),
  );
  return (
    <div className="app">
      {menu && (
        <button className="menu-scrim" aria-label="ปิดเมนู" onClick={() => setMenu(false)} />
      )}
      <aside className={menu ? 'sidebar shown' : 'sidebar'}>
        <a
          href="#"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            nav('Dashboard');
          }}
        >
          <span className="brand-icon">
            <Bike size={25} />
          </span>
          uat<span className="brand-dot">.</span>
        </a>
        <div className="workspace">
          MANAGEMENT <span>PORTAL</span>
        </div>
        <nav>
          {pages.map((p, i) => {
            const Icon = icons[i];
            return (
              <button className={page === p ? 'nav active' : 'nav'} key={p} onClick={() => nav(p)}>
                <Icon size={18} />
                {p}
                {p === 'Defect Tracking' && <b>{stats.open}</b>}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <span className="env-dot" />
          {location.pathname.includes('/develop') ? 'Development preview' : 'UAT workspace'}
          <p>ข้อมูลบันทึกในเบราว์เซอร์นี้</p>
        </div>
        <div className="profile">
          <span className="avatar">UT</span>
          <div>
            UAT Team<small>General workspace · No roles</small>
          </div>
        </div>
      </aside>
      <div className="main">
        <header>
          <button className="mobile-menu" aria-label="เปิดเมนู" onClick={() => setMenu(!menu)}>
            <Menu />
          </button>
          <div className="breadcrumb">
            Workspace <span>/</span>
            <strong>{page}</strong>
          </div>
          <select
            className="project-picker"
            aria-label="เลือกโครงการ"
            value={projectId}
            onChange={(e) => {
              setProjectId(e.target.value);
              setQuery('');
              setScenarioFilter('All');
              setDetailId('');
            }}
          >
            <option value="">เลือกโครงการ</option>
            {db.projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} · {p.name}
                {p.archived ? ' (Archived)' : ''}
              </option>
            ))}
          </select>
        </header>
        <main>
          {storageError && (
            <div className="alert" role="alert">
              {storageError}
            </div>
          )}
          {project?.archived && (
            <div className="alert">
              โครงการนี้เก็บถาวรแล้ว ดูและ Export ได้ กรุณานำกลับมาใช้ก่อนแก้ไข
            </div>
          )}
          <div className="page-heading">
            <div>
              <div className="eyebrow">{project?.code ?? 'UAT'} / ACCEPTANCE WORKSPACE</div>
              <h1>{page}</h1>
              <p>{project?.name ?? 'เลือกหรือสร้างโครงการเพื่อเริ่มต้นทดสอบ'}</p>
            </div>
            <button className="button secondary" disabled={!project} onClick={report}>
              <Download size={16} />
              Export report
            </button>
          </div>
          {page === 'Projects' ? (
            <>
              <div className="toolbar">
                <label className="search">
                  <Search size={17} />
                  <input
                    placeholder="ค้นหาโครงการ…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                <button className="button primary" onClick={() => open('project')}>
                  <Plus size={16} />
                  เพิ่มโครงการ
                </button>
              </div>
              <div className="scenario-grid">
                {db.projects
                  .filter((p) => match(p.code + ' ' + p.name))
                  .map((p) => (
                    <section className="panel scenario" key={p.id}>
                      <div className="panel-heading">
                        <span className="eyebrow">{p.code}</span>
                        <Badge value={p.archived ? 'Archived' : 'Active'} />
                      </div>
                      <h2>{p.name}</h2>
                      <p>{p.description || 'ยังไม่มีรายละเอียด'}</p>
                      <div className="project-actions">
                        <button
                          className="button primary"
                          onClick={() => {
                            setProjectId(p.id);
                            nav('Dashboard');
                          }}
                        >
                          เปิดโครงการ <ArrowRight size={15} />
                        </button>
                        <button className="button secondary" onClick={() => open('project', p)}>
                          แก้ไข
                        </button>
                        <button
                          className="button secondary"
                          onClick={() => {
                            if (
                              confirm(
                                p.archived
                                  ? 'นำโครงการกลับมาใช้งาน?'
                                  : 'เก็บโครงการถาวร? ข้อมูลจะยังอยู่ แต่แก้ไขไม่ได้',
                              )
                            )
                              save({
                                ...db,
                                projects: db.projects.map((x) =>
                                  x.id === p.id ? { ...x, archived: !x.archived } : x,
                                ),
                              });
                          }}
                        >
                          {p.archived ? 'นำกลับมาใช้' : 'เก็บถาวร'}
                        </button>
                      </div>
                    </section>
                  ))}
              </div>
              {!db.projects.length && (
                <div className="empty">ยังไม่มีโครงการ กดเพิ่มโครงการเพื่อเริ่มต้น</div>
              )}
            </>
          ) : null}
          {page !== 'Projects' && page !== 'Data & Backup' && !project ? (
            <section className="panel empty">
              เลือกโครงการด้านบน หรือ{' '}
              <button className="text-button" onClick={() => nav('Projects')}>
                เพิ่มโครงการ
              </button>
            </section>
          ) : null}
          {page === 'Dashboard' && project && (
            <>
              <section className="hero">
                <div>
                  <span className="hero-label">
                    <span /> PROJECT {project.code} ·{' '}
                    {project.archived ? 'ARCHIVED' : 'IN PROGRESS'}
                  </span>
                  <h2>
                    Confidence in every
                    <br />
                    release.
                  </h2>
                  <p>เห็นภาพรวม ทดสอบอย่างเป็นระบบ พร้อมส่งมอบอย่างมั่นใจ</p>
                  <button className="button light" onClick={() => nav('Test Cases')}>
                    เริ่มทดสอบ <ArrowRight size={16} />
                  </button>
                </div>
                <div className="hero-progress">
                  <div
                    className="ring"
                    style={{
                      background: `conic-gradient(#cce5ab ${stats.progress}%, #ffffff20 0)`,
                    }}
                  >
                    <div>
                      <strong>
                        {stats.progress}
                        <small>%</small>
                      </strong>
                      <span>Execution progress</span>
                    </div>
                  </div>
                  <p>
                    {stats.executed} of {stats.total} test cases executed
                  </p>
                </div>
              </section>
              <div className="stats">
                {[
                  ['Test cases', stats.total, 'ทั้งหมดในโครงการ'],
                  ['Passed', stats.passed, 'ผ่านการทดสอบ'],
                  ['Failed', stats.failed, 'ต้องตรวจสอบ'],
                  ['Open defects', stats.open, 'ยังไม่ปิดปัญหา'],
                ].map(([label, n, caption], i) => (
                  <div className={'stat stat-' + i} key={label}>
                    <div>{label}</div>
                    <strong>{String(n).padStart(2, '0')}</strong>
                    <small>{caption}</small>
                  </div>
                ))}
              </div>
              <div className="dashboard-grid">
                <section className="panel">
                  <div className="panel-heading">
                    <h3>Testing by scenario</h3>
                    <Layers size={19} />
                  </div>
                  {scopedScenarios.map((s) => {
                    const cases = scopedCases.filter((c) => c.scenarioId === s.id);
                    const n = cases.filter(
                      (c) => latest(db, c.id) && latest(db, c.id)?.status !== 'Not run',
                    ).length;
                    return (
                      <div className="module" key={s.id}>
                        <div>
                          <span>{s.name}</span>
                          <small>
                            {n}/{cases.length} cases
                          </small>
                        </div>
                        <div className="bar">
                          <span
                            style={{ width: `${cases.length ? (n / cases.length) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {!scopedScenarios.length && (
                    <p className="muted">
                      ยังไม่มี Scenario เริ่มสร้างแผนทดสอบได้ที่ Test Scenarios
                    </p>
                  )}
                </section>
                <section className="panel readiness">
                  <h3>Release readiness</h3>
                  <Badge value={stats.ready ? 'Passed' : 'Blocked'} />
                  <h2>{stats.ready ? 'Ready to sign off.' : 'Let’s clear the road.'}</h2>
                  <p>
                    {stats.notRun} ยังไม่ทดสอบ · {stats.blocked} Blocked · {stats.open} Defect
                    ที่ยังไม่ปิด
                  </p>
                  <button className="text-button" onClick={() => nav('UAT Sign-off')}>
                    ตรวจเงื่อนไข Sign-off <ArrowRight size={16} />
                  </button>
                </section>
              </div>
              <section className="panel">
                <div className="panel-heading">
                  <h3>Next to test</h3>
                  <button className="text-button" onClick={() => nav('Test Cases')}>
                    ดูทั้งหมด
                  </button>
                </div>
                {scopedCases
                  .filter((c) => latest(db, c.id)?.status !== 'Passed')
                  .slice(0, 5)
                  .map((c) => (
                    <div className="check-row" key={c.id}>
                      <div>
                        <strong>
                          {c.code} · {c.name}
                        </strong>
                        <small>{c.owner || 'ยังไม่ระบุผู้ทดสอบ'}</small>
                      </div>
                      <Badge value={latest(db, c.id)?.status ?? 'Not run'} />
                      <button
                        className="text-button"
                        disabled={locked}
                        onClick={() => open('result', undefined, c.id)}
                      >
                        ทดสอบ
                      </button>
                    </div>
                  ))}
                {stats.total === stats.passed && <p className="muted">ไม่มีรายการทดสอบค้าง</p>}
              </section>
            </>
          )}
          {page === 'Test Scenarios' && project && (
            <>
              <div className="toolbar">
                <label className="search">
                  <Search size={17} />
                  <input
                    placeholder="ค้นหา Scenario…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                <button
                  disabled={locked}
                  className="button primary"
                  onClick={() => open('scenario')}
                >
                  <Plus size={16} />
                  เพิ่ม Scenario
                </button>
                <button className="button secondary" onClick={() => exportCsv('scenarios')}>
                  Export CSV
                </button>
              </div>
              <div className="scenario-grid">
                {scopedScenarios
                  .filter((s) => match(s.code + ' ' + s.name))
                  .map((s, i) => (
                    <section className="panel scenario" key={s.id}>
                      <div className="scenario-no">
                        {String(i + 1).padStart(2, '0')}
                        <Layers size={21} />
                      </div>
                      <small>{s.code}</small>
                      <h2>{s.name}</h2>
                      <p className="pre">{s.description}</p>
                      <div className="scenario-footer">
                        <span>
                          {scopedCases.filter((c) => c.scenarioId === s.id).length} test cases
                        </span>
                        <button
                          className="text-button"
                          onClick={() => {
                            nav('Test Cases');
                            setScenarioFilter(s.id);
                          }}
                        >
                          เปิด Test Cases <ArrowRight size={14} />
                        </button>
                      </div>
                      <div className="project-actions">
                        <button
                          className="text-button"
                          disabled={locked}
                          onClick={() => open('scenario', s)}
                        >
                          แก้ไข
                        </button>
                        <button
                          className="text-button danger"
                          disabled={locked}
                          onClick={() => {
                            if (scopedCases.some((c) => c.scenarioId === s.id)) {
                              notify('ลบไม่ได้: มี Test Case อ้างอิง Scenario นี้');
                              return;
                            }
                            if (confirm('ลบ Scenario นี้?'))
                              save(
                                invalidate(
                                  { ...db, scenarios: db.scenarios.filter((x) => x.id !== s.id) },
                                  projectId,
                                ),
                              );
                          }}
                        >
                          ลบ
                        </button>
                      </div>
                    </section>
                  ))}
              </div>
              {!scopedScenarios.length && (
                <div className="empty">ยังไม่มี Scenario เพิ่มรายการหรือ Import CSV</div>
              )}
            </>
          )}
          {(page === 'Test Cases' || page === 'Test Results') && project && (
            <section className="panel">
              <div className="panel-heading">
                <h3>
                  {page === 'Test Cases' ? 'Test case library' : 'Execution results'}{' '}
                  <span className="count">{shownCases.length}</span>
                </h3>
                <div className="project-actions">
                  {page === 'Test Cases' && (
                    <button
                      className="button primary"
                      disabled={locked || !scopedScenarios.length}
                      onClick={() => open('case')}
                    >
                      <Plus size={16} />
                      เพิ่ม Test Case
                    </button>
                  )}
                  <button className="button secondary" onClick={() => exportCsv('cases')}>
                    Export cases CSV
                  </button>
                </div>
              </div>
              {!scopedScenarios.length && (
                <p className="muted">กรุณาสร้าง Scenario ก่อนเพิ่ม Test Case</p>
              )}
              <div className="toolbar">
                <label className="search">
                  <Search size={17} />
                  <input
                    placeholder="ค้นหา ID, ชื่อ หรือผู้รับผิดชอบ…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                <select
                  aria-label="กรองสถานะ"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {['All', 'Not run', 'Passed', 'Failed', 'Blocked'].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <select
                  aria-label="กรอง Scenario"
                  value={scenarioFilter}
                  onChange={(e) => setScenarioFilter(e.target.value)}
                >
                  <option value="All">ทุก Scenario</option>
                  {scopedScenarios.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} · {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>TEST CASE</th>
                      <th>SCENARIO</th>
                      <th>PRIORITY</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shownCases.map((c) => {
                      const r = latest(db, c.id);
                      return (
                        <tr key={c.id}>
                          <td>
                            <small className="id">
                              {c.code} · {c.owner || 'Unassigned'}
                            </small>
                            <strong>{c.name}</strong>
                            {page === 'Test Results' && <small>{r?.actual ?? 'ยังไม่มีผล'}</small>}
                          </td>
                          <td>{scopedScenarios.find((s) => s.id === c.scenarioId)?.code}</td>
                          <td>
                            <Badge value={c.priority} />
                          </td>
                          <td>
                            <Badge value={r?.status ?? 'Not run'} />
                          </td>
                          <td>
                            <div className="project-actions">
                              <button
                                className="text-button"
                                onClick={() => open('result', undefined, c.id)}
                              >
                                ดู / บันทึกผล
                              </button>
                              {page === 'Test Cases' && (
                                <>
                                  <button
                                    className="text-button"
                                    disabled={locked}
                                    onClick={() => open('case', c)}
                                  >
                                    แก้ไข
                                  </button>
                                  <button
                                    className="text-button danger"
                                    disabled={locked}
                                    onClick={() => {
                                      if (confirm('ลบ Test Case และประวัติผลทดสอบของรายการนี้?'))
                                        try {
                                          save(deleteCase(db, c.id));
                                        } catch (e) {
                                          notify((e as Error).message);
                                        }
                                    }}
                                  >
                                    ลบ
                                  </button>
                                </>
                              )}
                              {r?.status === 'Failed' && (
                                <button
                                  className="text-button"
                                  disabled={locked}
                                  onClick={() => open('defect', undefined, c.id)}
                                >
                                  สร้าง Defect
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {!shownCases.length && <div className="empty">ไม่พบรายการตามตัวกรอง</div>}
              </div>
            </section>
          )}
          {page === 'Defect Tracking' && project && (
            <section className="panel">
              <div className="panel-heading">
                <h3>Defect register</h3>
                <button
                  disabled={locked || !scopedCases.length}
                  className="button primary"
                  onClick={() => open('defect')}
                >
                  <Plus size={16} />
                  รายงาน Defect
                </button>
              </div>
              <div className="toolbar">
                <label className="search">
                  <Search size={17} />
                  <input
                    placeholder="ค้นหา Defect หรือผู้รับผิดชอบ…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                <select
                  aria-label="กรอง Defect"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {['All', 'Open', 'In progress', 'Resolved', 'Closed'].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>DEFECT</th>
                      <th>CASE</th>
                      <th>SEVERITY</th>
                      <th>OWNER</th>
                      <th>STATUS</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {scopedDefects
                      .filter(
                        (d) =>
                          match(d.code + ' ' + d.name + ' ' + d.owner) &&
                          (statusFilter === 'All' || d.status === statusFilter),
                      )
                      .map((d) => (
                        <tr key={d.id}>
                          <td>
                            <small>{d.code}</small>
                            <strong>{d.name}</strong>
                          </td>
                          <td>{scopedCases.find((c) => c.id === d.caseId)?.code}</td>
                          <td>
                            <Badge value={d.severity} />
                          </td>
                          <td>{d.owner || 'Unassigned'}</td>
                          <td>
                            <select
                              disabled={locked}
                              aria-label={`สถานะ ${d.code}`}
                              value={d.status}
                              onChange={(e) =>
                                save(
                                  invalidate(
                                    {
                                      ...db,
                                      defects: db.defects.map((x) =>
                                        x.id === d.id
                                          ? { ...x, status: e.target.value as Defect['status'] }
                                          : x,
                                      ),
                                    },
                                    projectId,
                                  ),
                                )
                              }
                            >
                              {['Open', 'In progress', 'Resolved', 'Closed'].map((s) => (
                                <option key={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <button className="text-button" onClick={() => setDetailId(d.id)}>
                              รายละเอียด / Comment
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {!scopedDefects.length && <div className="empty">ยังไม่มี Defect</div>}
              {detail && (
                <div className="detail-panel">
                  <div className="panel-heading">
                    <h3>
                      {detail.code} · {detail.name}
                    </h3>
                    <button
                      className="text-button"
                      disabled={locked}
                      onClick={() => open('defect', detail)}
                    >
                      แก้ไขรายละเอียด
                    </button>
                  </div>
                  <p className="pre">{detail.description}</p>
                  <h4>Comments</h4>
                  {detail.comments.map((c) => (
                    <div className="comment" key={c.id}>
                      <strong>{c.author}</strong>
                      <small>{new Date(c.date).toLocaleString('th-TH')}</small>
                      <p className="pre">{c.text}</p>
                    </div>
                  ))}
                  {!detail.comments.length && <p className="muted">ยังไม่มีความคิดเห็น</p>}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const f = new FormData(e.currentTarget);
                      const author = String(f.get('author')).trim(),
                        text = String(f.get('text')).trim();
                      if (!author || !text) return;
                      const next = {
                        ...db,
                        defects: db.defects.map((d) =>
                          d.id === detail.id
                            ? {
                                ...d,
                                comments: [
                                  ...d.comments,
                                  { id: uid(), author, text, date: new Date().toISOString() },
                                ],
                              }
                            : d,
                        ),
                      };
                      if (save(next)) e.currentTarget.reset();
                    }}
                  >
                    <Field label="ผู้แสดงความคิดเห็น">
                      <input name="author" required maxLength={100} disabled={locked} />
                    </Field>
                    <Field label="ความคิดเห็น">
                      <textarea name="text" required maxLength={5000} disabled={locked} />
                    </Field>
                    <button className="button primary" disabled={locked}>
                      เพิ่มความคิดเห็น
                    </button>
                  </form>
                </div>
              )}
            </section>
          )}
          {page === 'UAT Sign-off' && project && (
            <div className="dashboard-grid">
              <section className="panel">
                <h3>Acceptance checklist</h3>
                {[
                  [stats.total > 0, 'มี Test Case ในโครงการ', `${stats.total} cases`],
                  [
                    stats.passed === stats.total && stats.total > 0,
                    'ทุก Test Case ผ่าน',
                    `${stats.passed}/${stats.total}`,
                  ],
                  [stats.open === 0, 'ปิด Defect ทั้งหมด', `${stats.open} unresolved`],
                ].map(([ok, title, caption]) => (
                  <div className="check-row" key={String(title)}>
                    <div>
                      <strong>{title}</strong>
                      <small>{caption}</small>
                    </div>
                    <Badge value={ok ? 'Passed' : 'Blocked'} />
                  </div>
                ))}
              </section>
              <section className="panel">
                <div className="eyebrow">FINAL ACCEPTANCE</div>
                <h2>UAT Sign-off</h2>
                <p className="muted">
                  การรับรองในเวอร์ชันทดลอง ไม่มีการตรวจสอบตัวตน การเปลี่ยนข้อมูลที่กระทบผล UAT
                  จะยกเลิกการรับรองเดิม
                </p>
                {sign ? (
                  <>
                    <Badge value="Passed" />
                    <h3>รับรองโดย {sign.name}</h3>
                    <p>{new Date(sign.date).toLocaleString('th-TH')}</p>
                    <p className="pre">{sign.note}</p>
                    <button
                      disabled={locked}
                      className="button secondary"
                      onClick={() => {
                        if (confirm('ยกเลิก Sign-off นี้?')) save(invalidate(db, projectId));
                      }}
                    >
                      ยกเลิก Sign-off
                    </button>
                  </>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (locked || !summary(db, projectId).ready) return;
                      const f = new FormData(e.currentTarget);
                      const name = String(f.get('name')).trim();
                      if (!name) return;
                      save({
                        ...db,
                        signoffs: [
                          ...db.signoffs,
                          {
                            id: uid(),
                            projectId,
                            name,
                            note: String(f.get('note')).trim(),
                            date: new Date().toISOString(),
                          },
                        ],
                      });
                    }}
                  >
                    <Field label="ชื่อผู้รับรอง">
                      <input
                        name="name"
                        required
                        pattern=".*\S.*"
                        disabled={!stats.ready || locked}
                      />
                    </Field>
                    <Field label="หมายเหตุ">
                      <textarea name="note" disabled={!stats.ready || locked} />
                    </Field>
                    <button className="button primary" disabled={!stats.ready || locked}>
                      รับรองผล UAT
                    </button>
                    {!stats.ready && (
                      <p className="block-note">
                        ต้องมี Test Case อย่างน้อย 1 รายการ ทุก Case เป็น Passed และทุก Defect เป็น
                        Closed
                      </p>
                    )}
                  </form>
                )}
              </section>
            </div>
          )}
          {page === 'Data & Backup' && (
            <div className="dashboard-grid">
              <section className="panel">
                <h3>Import / Export CSV</h3>
                <p className="muted">
                  นำเข้าเพิ่มรายการในโครงการที่เลือก ระบบตรวจทั้งไฟล์ก่อนบันทึก
                  รหัสซ้ำจะไม่ถูกเขียนทับ
                </p>
                <Field label="ประเภทข้อมูล">
                  <select
                    value={importKind}
                    onChange={(e) => setImportKind(e.target.value as typeof importKind)}
                  >
                    <option value="scenarios">Test Scenarios</option>
                    <option value="cases">Test Cases</option>
                  </select>
                </Field>
                <div className="project-actions">
                  <button
                    className="button secondary"
                    disabled={!project}
                    onClick={() => exportCsv(importKind, true)}
                  >
                    ดาวน์โหลด Template
                  </button>
                  <button
                    className="button secondary"
                    disabled={!project}
                    onClick={() => exportCsv(importKind)}
                  >
                    Export CSV
                  </button>
                </div>
                <Field label="เลือก CSV UTF-8 เพื่อนำเข้า">
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    disabled={locked}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      if (!file) return;
                      try {
                        if (file.size > 5_000_000) throw Error('CSV ต้องไม่เกิน 5 MB');
                        const text = await file.text();
                        if (confirm(`เพิ่มข้อมูลจาก ${file.name} เข้าโครงการ ${project?.name}?`))
                          save(importCsv(db, projectId, importKind, text), 'Import สำเร็จ');
                      } catch (error) {
                        notify((error as Error).message);
                      }
                    }}
                  />
                </Field>
                <p className="muted">
                  นำเข้า Scenarios ก่อน Cases • คอลัมน์ scenarioCode ต้องตรงกับรหัสใน Project นี้ •
                  แนบหลักฐานเป็น URL ในหน้าบันทึกผล
                </p>
              </section>
              <section className="panel">
                <h3>Backup & Restore</h3>
                <p className="muted">
                  สำรองทุกโครงการรวมประวัติ Defect และ Sign-off เป็น JSON
                  เก็บไฟล์ก่อนเปลี่ยนเครื่องหรือย้าย URL
                </p>
                <div className="project-actions">
                  <button
                    className="button primary"
                    onClick={() => download('uat-backup.json', JSON.stringify(db, null, 2))}
                  >
                    ดาวน์โหลด Backup ทั้งหมด
                  </button>
                  <button
                    className="button secondary"
                    onClick={() =>
                      download(
                        'uat-original-storage.txt',
                        localStorage.getItem(storageKey) ?? 'ไม่มีข้อมูลเดิม',
                        'text/plain',
                      )
                    }
                  >
                    ดาวน์โหลดข้อมูลที่บันทึกดิบ
                  </button>
                </div>
                <Field label="Restore จาก Backup version 2 (แทนที่ข้อมูลทั้งหมด)">
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      if (!file) return;
                      try {
                        if (file.size > 10_000_000) throw Error('Backup ต้องไม่เกิน 10 MB');
                        const restored = validateBackup(JSON.parse(await file.text()));
                        if (
                          confirm(
                            'แทนที่ข้อมูลทั้งหมดด้วย Backup นี้? กรุณาสำรองข้อมูลปัจจุบันก่อน',
                          )
                        )
                          if (save(restored, 'Restore สำเร็จ')) {
                            setProjectId(restored.projects.find((p) => !p.archived)?.id ?? '');
                            setDetailId('');
                          }
                      } catch (error) {
                        notify((error as Error).message);
                      }
                    }}
                  />
                </Field>
                <button
                  className="button secondary danger"
                  onClick={() => {
                    if (confirm('รีเซ็ตทุกโครงการเป็นข้อมูลตัวอย่าง? ข้อมูลปัจจุบันจะถูกแทนที่')) {
                      const next = seed();
                      if (save(next)) {
                        setProjectId(next.projects[0].id);
                        setDetailId('');
                      }
                    }
                  }}
                >
                  รีเซ็ต Demo
                </button>
                <p className="muted">
                  เว็บหลักและ /develop/ เก็บข้อมูลคนละชุด ข้อมูลไม่ซิงก์ระหว่างเครื่อง และ Report
                  JSON ใช้ Restore ไม่ได้
                </p>
              </section>
            </div>
          )}
          <footer>
            <span>UAT PORTAL MANAGEMENT / v2.0</span>
            <span>Browser storage · Export backups regularly</span>
          </footer>
        </main>
      </div>
      {toast && (
        <div role="status" className="toast">
          {toast}
          <button aria-label="ปิดข้อความ" onClick={() => setToast('')}>
            <X size={16} />
          </button>
        </div>
      )}
      {modal && (
        <div className="modal-backdrop">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="modal"
            onKeyDown={(e) => {
              if (e.key === 'Escape') setModal(null);
            }}
          >
            <div className="panel-heading">
              <h3 id="modal-title">
                {modal.kind === 'result'
                  ? 'บันทึกผล / ประวัติ'
                  : `${modal.item ? 'แก้ไข' : 'เพิ่ม'} ${modal.kind}`}
              </h3>
              <button className="icon-button" aria-label="ปิด" onClick={() => setModal(null)}>
                <X />
              </button>
            </div>
            <form onSubmit={submit} key={modal.kind + (modal.item?.id ?? modal.caseId ?? 'new')}>
              {modal.kind === 'project' && (
                <>
                  <Field label="รหัสโครงการ *">
                    <input
                      name="code"
                      required
                      maxLength={30}
                      autoFocus
                      defaultValue={(modal.item as Project)?.code}
                    />
                  </Field>
                  <Field label="ชื่อโครงการ *">
                    <input
                      name="name"
                      required
                      maxLength={150}
                      defaultValue={(modal.item as Project)?.name}
                    />
                  </Field>
                  <Field label="รายละเอียด">
                    <textarea
                      name="description"
                      defaultValue={(modal.item as Project)?.description}
                    />
                  </Field>
                </>
              )}
              {modal.kind === 'scenario' && (
                <>
                  <Field label="รหัส Scenario *">
                    <input
                      name="code"
                      required
                      autoFocus
                      defaultValue={
                        (modal.item as Scenario)?.code ??
                        codeNext(
                          'SC',
                          scopedScenarios.map((s) => s.code),
                        )
                      }
                    />
                  </Field>
                  <Field label="ชื่อ Scenario *">
                    <input name="name" required defaultValue={(modal.item as Scenario)?.name} />
                  </Field>
                  <Field label="รายละเอียด">
                    <textarea
                      name="description"
                      defaultValue={(modal.item as Scenario)?.description}
                    />
                  </Field>
                </>
              )}
              {modal.kind === 'case' && (
                <>
                  <Field label="รหัส Test Case *">
                    <input
                      name="code"
                      required
                      autoFocus
                      defaultValue={
                        (modal.item as Case)?.code ??
                        codeNext(
                          'TC',
                          scopedCases.map((c) => c.code),
                        )
                      }
                    />
                  </Field>
                  <Field label="Scenario *">
                    <select
                      name="scenarioId"
                      required
                      defaultValue={(modal.item as Case)?.scenarioId ?? scopedScenarios[0]?.id}
                    >
                      {scopedScenarios.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.code} · {s.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="ชื่อ Test Case *">
                    <input name="name" required defaultValue={(modal.item as Case)?.name} />
                  </Field>
                  <Field label="ขั้นตอนทดสอบ *">
                    <textarea name="steps" required defaultValue={(modal.item as Case)?.steps} />
                  </Field>
                  <Field label="ผลที่คาดหวัง *">
                    <textarea
                      name="expected"
                      required
                      defaultValue={(modal.item as Case)?.expected}
                    />
                  </Field>
                  <Field label="Priority">
                    <select
                      name="priority"
                      defaultValue={(modal.item as Case)?.priority ?? 'Medium'}
                    >
                      {['Low', 'Medium', 'High', 'Critical'].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="ผู้รับผิดชอบ">
                    <input name="owner" defaultValue={(modal.item as Case)?.owner} />
                  </Field>
                </>
              )}
              {modal.kind === 'result' &&
                (() => {
                  const c = scopedCases.find((c) => c.id === modal.caseId);
                  const r = c ? latest(db, c.id) : undefined;
                  return (
                    <>
                      <h2>
                        {c?.code} · {c?.name}
                      </h2>
                      <h4>Steps</h4>
                      <p className="pre">{c?.steps}</p>
                      <h4>Expected result</h4>
                      <p className="pre">{c?.expected}</p>
                      <Field label="Status">
                        <select
                          name="status"
                          defaultValue={r?.status ?? 'Passed'}
                          disabled={locked}
                        >
                          {['Passed', 'Failed', 'Blocked', 'Not run'].map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="ผลที่พบจริง *">
                        <textarea name="actual" required disabled={locked} />
                      </Field>
                      <Field label="ผู้ทดสอบ *">
                        <input name="tester" required defaultValue={c?.owner} disabled={locked} />
                      </Field>
                      <Field label="ลิงก์หลักฐาน (http/https)">
                        <input
                          name="evidence"
                          type="url"
                          placeholder="https://…"
                          disabled={locked}
                        />
                      </Field>
                      <details>
                        <summary>
                          ประวัติการทดสอบ ({db.results.filter((r) => r.caseId === c?.id).length})
                        </summary>
                        {db.results
                          .filter((r) => r.caseId === c?.id)
                          .slice()
                          .reverse()
                          .map((r) => (
                            <article className="comment" key={r.id}>
                              <Badge value={r.status} />
                              <small>
                                {r.tester} · {new Date(r.date).toLocaleString('th-TH')}
                              </small>
                              <p className="pre">{r.actual}</p>
                              {/^https?:\/\//i.test(r.evidence) && (
                                <a
                                  className="text-button"
                                  href={r.evidence}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  เปิดหลักฐาน ↗
                                </a>
                              )}
                            </article>
                          ))}
                      </details>
                    </>
                  );
                })()}
              {modal.kind === 'defect' && (
                <>
                  <Field label="Test Case *">
                    <select
                      name="caseId"
                      defaultValue={
                        (modal.item as Defect)?.caseId ?? modal.caseId ?? scopedCases[0]?.id
                      }
                    >
                      {scopedCases.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} · {c.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="ชื่อปัญหา *">
                    <input
                      name="name"
                      required
                      defaultValue={
                        (modal.item as Defect)?.name ??
                        (modal.caseId
                          ? `พบปัญหา: ${scopedCases.find((c) => c.id === modal.caseId)?.name}`
                          : '')
                      }
                    />
                  </Field>
                  <Field label="รายละเอียด / วิธีทำให้เกิดปัญหา *">
                    <textarea
                      name="description"
                      required
                      defaultValue={
                        (modal.item as Defect)?.description ??
                        (modal.caseId ? latest(db, modal.caseId)?.actual : '')
                      }
                    />
                  </Field>
                  <Field label="Severity">
                    <select
                      name="severity"
                      defaultValue={(modal.item as Defect)?.severity ?? 'Medium'}
                    >
                      {['Low', 'Medium', 'High', 'Critical'].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="ผู้รับผิดชอบ">
                    <input name="owner" defaultValue={(modal.item as Defect)?.owner} />
                  </Field>
                </>
              )}
              {formError && (
                <p className="error-text" role="alert">
                  {formError}
                </p>
              )}
              <div className="project-actions modal-actions">
                <button className="button primary" disabled={modal.kind !== 'project' && locked}>
                  บันทึก
                </button>
                <button type="button" className="button secondary" onClick={() => setModal(null)}>
                  ยกเลิก
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
