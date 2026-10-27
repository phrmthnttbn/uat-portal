import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { webcrypto } from 'node:crypto';
if (!globalThis.crypto) globalThis.crypto = webcrypto;
const js = ts.transpileModule(fs.readFileSync('src/model.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const m = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
test('seed is valid; projects are isolated and zero cases cannot sign off', () => {
  const d = m.validateBackup(m.seed());
  assert.equal(m.summary(d, 'p-rider').total, 8);
  assert.equal(m.summary(d, 'p-portal').total, 0);
  assert.equal(m.summary(d, 'p-portal').ready, false);
  assert.equal(m.summary(d, 'p-rider').passed, 4);
});
test('latest execution changes totals while preserving history', () => {
  const d = m.seed();
  d.results.push({
    id: 'new',
    projectId: 'p-rider',
    caseId: 'c-3',
    status: 'Passed',
    actual: 'fixed',
    tester: 'Tester',
    date: new Date().toISOString(),
    evidence: '',
  });
  assert.equal(m.summary(d, 'p-rider').failed, 0);
  assert.equal(m.summary(d, 'p-rider').passed, 5);
  assert.equal(d.results.filter((r) => r.caseId === 'c-3').length, 2);
});
test('signoff requires every test passed and every defect closed', () => {
  const d = m.seed();
  d.results = d.cases.map((c) => ({
    id: m.uid(),
    projectId: c.projectId,
    caseId: c.id,
    status: 'Passed',
    actual: 'ok',
    tester: 'T',
    date: new Date().toISOString(),
    evidence: '',
  }));
  assert.equal(m.summary(d, 'p-rider').ready, false);
  d.defects.forEach((f) => (f.status = 'Closed'));
  assert.equal(m.summary(d, 'p-rider').ready, true);
  d.signoffs = [
    { id: 'sign', projectId: 'p-rider', name: 'T', note: '', date: new Date().toISOString() },
  ];
  assert.equal(m.invalidate(d, 'p-portal').signoffs.length, 1);
  assert.equal(m.invalidate(d, 'p-rider').signoffs.length, 0);
});
test('CSV accepts multiline Thai and rejects duplicate codes atomically', () => {
  const d = m.seed();
  const before = JSON.stringify(d);
  const rows = [
    ['code', 'name', 'description'],
    ['SC-NEW', 'ทดสอบ, ชื่อ', 'บรรทัดแรก\nบรรทัดสอง'],
  ];
  const next = m.importCsv(d, 'p-portal', 'scenarios', m.csv(rows));
  assert.equal(next.scenarios.at(-1).description, 'บรรทัดแรก\nบรรทัดสอง');
  assert.equal(d.scenarios.length, 4);
  assert.throws(() =>
    m.importCsv(d, 'p-portal', 'scenarios', 'code,name,description\nX,one,a\nX,two,b'),
  );
  assert.equal(JSON.stringify(d), before);
});
test('case CSV rejects foreign-project scenarios and invalid priorities', () => {
  const d = m.seed();
  const header = 'code,scenarioCode,name,steps,expected,priority,owner\n';
  assert.throws(() => m.importCsv(d, 'p-portal', 'cases', header + 'TC-X,SC-001,N,S,E,High,T'));
  assert.throws(() => m.importCsv(d, 'p-rider', 'cases', header + 'TC-X,SC-001,N,S,E,Urgent,T'));
  const next = m.importCsv(d, 'p-rider', 'cases', header + 'TC-X,SC-001,N,S,E,High,T');
  assert.equal(next.cases.length, 9);
});
test('case deletion protects referenced defects; removes execution history', () => {
  const d = m.seed();
  assert.throws(() => m.deleteCase(d, 'c-3'));
  const next = m.deleteCase(d, 'c-0');
  assert.equal(
    next.cases.some((c) => c.id === 'c-0'),
    false,
  );
  assert.equal(
    next.results.some((r) => r.caseId === 'c-0'),
    false,
  );
});
test('backup rejects broken relations, bad fields, duplicate IDs and forged signoff', () => {
  const d = m.seed();
  assert.throws(() => m.validateBackup({ version: 1 }));
  const a = structuredClone(d);
  a.cases[0].scenarioId = 'missing';
  assert.throws(() => m.validateBackup(a));
  const b = structuredClone(d);
  b.defects[0].comments = [{}];
  assert.throws(() => m.validateBackup(b));
  const c = structuredClone(d);
  c.projects.push(c.projects[0]);
  assert.throws(() => m.validateBackup(c));
  d.signoffs.push({
    id: 's',
    projectId: 'p-rider',
    name: 'T',
    note: '',
    date: new Date().toISOString(),
  });
  assert.throws(() => m.validateBackup(d));
});
test('CSV export guards spreadsheet formulas and malformed CSV fails', () => {
  assert.ok(m.csv([['=1+1']]).includes("'=1+1"));
  assert.throws(() => m.parseCsv('a,b\n"unfinished'));
});
