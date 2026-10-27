import { useState } from 'react';

export interface UatProject {
  id: string;
  code: string;
  name: string;
  description: string;
  status: 'Active' | 'Archived';
}

interface Props {
  projects: UatProject[];
  selectedId: string;
  onSelect: (id: string) => void;
  onChange: (projects: UatProject[]) => void;
}

const emptyForm = {
  code: '',
  name: '',
  description: '',
};

export default function ProjectManager({ projects, selectedId, onSelect, onChange }: Props) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  function closeForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError('');
  }

  function saveProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const code = form.code.trim().toUpperCase();
    const name = form.name.trim();

    if (!code || !name) {
      setError('กรุณากรอกรหัสและชื่อโครงการ');
      return;
    }

    const duplicate = projects.some(
      (project) => project.id !== editingId && project.code.toUpperCase() === code,
    );

    if (duplicate) {
      setError('รหัสโครงการนี้มีอยู่แล้ว');
      return;
    }

    if (editingId) {
      onChange(
        projects.map((project) =>
          project.id === editingId
            ? {
                ...project,
                code,
                name,
                description: form.description.trim(),
              }
            : project,
        ),
      );
    } else {
      const project: UatProject = {
        id: crypto.randomUUID(),
        code,
        name,
        description: form.description.trim(),
        status: 'Active',
      };

      onChange([...projects, project]);
      onSelect(project.id);
    }

    closeForm();
  }

  function changeStatus(project: UatProject) {
    const archiving = project.status === 'Active';

    if (archiving && !window.confirm(`เก็บโครงการ "${project.name}" เข้าถาวร?`)) {
      return;
    }

    onChange(
      projects.map((item) =>
        item.id === project.id
          ? {
              ...item,
              status: archiving ? 'Archived' : 'Active',
            }
          : item,
      ),
    );

    if (archiving && selectedId === project.id) {
      const nextProject = projects.find(
        (item) => item.id !== project.id && item.status === 'Active',
      );

      onSelect(nextProject?.id ?? '');
    }
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <h3>Projects</h3>

        <button
          className="button primary"
          onClick={() => {
            closeForm();
            setShowForm(true);
          }}
        >
          + เพิ่มโครงการ
        </button>
      </div>

      <p className="muted">เลือกโครงการที่ต้องการทำงาน หรือจัดการข้อมูลโครงการ</p>

      {showForm && (
        <form className="project-form" onSubmit={saveProject}>
          <h3>{editingId ? 'แก้ไขโครงการ' : 'เพิ่มโครงการ'}</h3>

          <label className="field">
            รหัสโครงการ *
            <input
              value={form.code}
              maxLength={30}
              placeholder="เช่น RIDER"
              required
              onChange={(event) => {
                setError('');
                setForm({ ...form, code: event.target.value });
              }}
            />
          </label>

          <label className="field">
            ชื่อโครงการ *
            <input
              value={form.name}
              maxLength={120}
              placeholder="เช่น Rider Application"
              required
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </label>

          <label className="field">
            รายละเอียด
            <textarea
              value={form.description}
              maxLength={1000}
              placeholder="อธิบายขอบเขตการทดสอบ"
              onChange={(event) =>
                setForm({
                  ...form,
                  description: event.target.value,
                })
              }
            />
          </label>

          {error && <p role="alert">{error}</p>}

          <div className="project-actions">
            <button className="button primary" type="submit">
              บันทึกโครงการ
            </button>

            <button className="button secondary" type="button" onClick={closeForm}>
              ยกเลิก
            </button>
          </div>
        </form>
      )}

      <div className="project-list">
        {projects.map((project) => (
          <article className="project-item" key={project.id}>
            <div>
              <small className="id">{project.code}</small>

              <h3>{project.name}</h3>

              <p className="muted">{project.description || 'ยังไม่มีรายละเอียด'}</p>

              <span className={`badge ${project.status === 'Active' ? 'passed' : 'not-run'}`}>
                {project.status === 'Active' ? 'กำลังใช้งาน' : 'เก็บถาวร'}
              </span>
            </div>

            <div className="project-actions">
              {project.status === 'Active' && (
                <button
                  className={selectedId === project.id ? 'button primary' : 'button secondary'}
                  onClick={() => onSelect(project.id)}
                  disabled={selectedId === project.id}
                >
                  {selectedId === project.id ? 'กำลังเลือก' : 'เลือกโครงการ'}
                </button>
              )}

              <button
                className="button secondary"
                onClick={() => {
                  setForm({
                    code: project.code,
                    name: project.name,
                    description: project.description,
                  });
                  setEditingId(project.id);
                  setError('');
                  setShowForm(true);
                }}
              >
                แก้ไข
              </button>

              <button className="button secondary" onClick={() => changeStatus(project)}>
                {project.status === 'Active' ? 'เก็บถาวร' : 'นำกลับมาใช้'}
              </button>
            </div>
          </article>
        ))}

        {projects.length === 0 && (
          <div className="empty">ยังไม่มีโครงการ กดเพิ่มโครงการเพื่อเริ่มต้น</div>
        )}
      </div>
    </section>
  );
}
