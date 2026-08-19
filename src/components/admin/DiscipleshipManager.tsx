'use client';

import { useCallback, useEffect, useState } from 'react';
import FileUploadField from '@/components/admin/FileUploadField';

type Program = {
  id: number;
  program_name: string;
  description: string;
  features?: string;
  image_url?: string;
  duration?: string;
  requirements?: string;
  status: string;
  display_order: number;
};

type Module = {
  id: number;
  program_id: number;
  title: string;
  description?: string;
  display_order: number;
  pass_mark_pct: number;
};

type Resource = {
  id: number;
  module_id: number;
  resource_type: string;
  title?: string;
  content?: string;
  file_path?: string;
  display_order: number;
};

type Enrollment = {
  id: number;
  status: string;
  full_name: string;
  email: string;
  certificate_issued?: number;
  certificate_number?: string;
  completed_at?: string;
};

type View =
  | { kind: 'programs' }
  | { kind: 'program'; id?: number }
  | { kind: 'modules'; programId: number }
  | { kind: 'module'; programId: number; id?: number }
  | { kind: 'resources'; programId: number; moduleId: number }
  | { kind: 'resource'; programId: number; moduleId: number; id?: number }
  | { kind: 'questions'; programId: number; moduleId: number }
  | { kind: 'enrollments'; programId: number };

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  return res.json();
}

export default function DiscipleshipManager() {
  const [view, setView] = useState<View>({ kind: 'programs' });
  const [programs, setPrograms] = useState<Program[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [questions, setQuestions] = useState<Array<{ id: number; question_text: string; options: Array<{ id: number; option_text: string; is_correct: number }> }>>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [programForm, setProgramForm] = useState<Partial<Program>>({ status: 'active', display_order: 0 });
  const [moduleForm, setModuleForm] = useState<Partial<Module>>({ pass_mark_pct: 70, display_order: 0 });
  const [resourceForm, setResourceForm] = useState<Partial<Resource>>({ resource_type: 'text', display_order: 0 });
  const [questionForm, setQuestionForm] = useState({ question_text: '', options: [{ option_text: '', is_correct: true, feedback_text: '' }, { option_text: '', is_correct: false, feedback_text: '' }] });

  const loadPrograms = useCallback(async () => {
    setLoading(true);
    const data = await api<{ data: Program[] }>('/api/admin/discipleship/programs');
    setPrograms(data.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (view.kind === 'programs') loadPrograms();
  }, [view.kind, loadPrograms]);

  useEffect(() => {
    async function load() {
      if (view.kind === 'modules' || view.kind === 'module' || view.kind === 'resources' || view.kind === 'questions' || view.kind === 'enrollments') {
        setLoading(true);
        const data = await api<{ data: Module[] }>(`/api/admin/discipleship/programs/${view.programId}/modules`);
        setModules(data.data || []);
        setLoading(false);
      }
    }
    load();
  }, [view]);

  useEffect(() => {
    async function load() {
      if (view.kind === 'resources' || view.kind === 'resource' || view.kind === 'questions') {
        const data = await api<{ data: Resource[] }>(`/api/admin/discipleship/modules/${view.moduleId}/resources`);
        setResources(data.data || []);
      }
      if (view.kind === 'questions') {
        const data = await api<{ data: typeof questions }>(`/api/admin/discipleship/modules/${view.moduleId}/questions`);
        setQuestions(data.data || []);
      }
      if (view.kind === 'enrollments') {
        const data = await api<{ data: Enrollment[] }>(`/api/admin/discipleship/programs/${view.programId}/enrollments`);
        setEnrollments(data.data || []);
      }
    }
    load();
  }, [view]);

  async function saveProgram() {
    const isEdit = Boolean(programForm.id);
    const url = isEdit ? `/api/admin/discipleship/programs/${programForm.id}` : '/api/admin/discipleship/programs';
    await api(url, { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(programForm) });
    setMessage('Program saved');
    setView({ kind: 'programs' });
    loadPrograms();
  }

  async function deleteProgram(id: number) {
    if (!confirm('Delete this program and all related content?')) return;
    await api(`/api/admin/discipleship/programs/${id}`, { method: 'DELETE' });
    loadPrograms();
  }

  async function saveModule(programId: number) {
    const isEdit = Boolean(moduleForm.id);
    if (isEdit) {
      await api(`/api/admin/discipleship/modules/${moduleForm.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(moduleForm) });
    } else {
      await api('/api/admin/discipleship/modules', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...moduleForm, program_id: programId }) });
    }
    setView({ kind: 'modules', programId });
  }

  async function deleteModule(moduleId: number, programId: number) {
    if (!confirm('Delete module?')) return;
    await api(`/api/admin/discipleship/modules/${moduleId}`, { method: 'DELETE' });
    setView({ kind: 'modules', programId });
  }

  async function saveResource(moduleId: number, programId: number) {
    const isEdit = Boolean(resourceForm.id);
    if (isEdit) {
      await api(`/api/admin/discipleship/resources/${resourceForm.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(resourceForm) });
    } else {
      await api('/api/admin/discipleship/resources', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...resourceForm, module_id: moduleId }) });
    }
    setView({ kind: 'resources', programId, moduleId });
  }

  async function deleteResource(id: number, programId: number, moduleId: number) {
    if (!confirm('Delete resource?')) return;
    await api(`/api/admin/discipleship/resources/${id}`, { method: 'DELETE' });
    setView({ kind: 'resources', programId, moduleId });
  }

  async function saveQuestion(moduleId: number, programId: number) {
    await api('/api/admin/discipleship/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ module_id: moduleId, question_text: questionForm.question_text, options: questionForm.options }),
    });
    setQuestionForm({ question_text: '', options: [{ option_text: '', is_correct: true, feedback_text: '' }, { option_text: '', is_correct: false, feedback_text: '' }] });
    setView({ kind: 'questions', programId, moduleId });
  }

  async function deleteQuestion(id: number, programId: number, moduleId: number) {
    if (!confirm('Delete question?')) return;
    await api(`/api/admin/discipleship/questions?id=${id}`, { method: 'DELETE' });
    setView({ kind: 'questions', programId, moduleId });
  }

  async function issueCertificate(enrollmentId: number) {
    const certNumber = prompt('Certificate number (leave blank for auto):') || '';
    await api(`/api/admin/discipleship/certificates/${enrollmentId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ certificate_number: certNumber }),
    });
    if (view.kind === 'enrollments') {
      const data = await api<{ data: Enrollment[] }>(`/api/admin/discipleship/programs/${view.programId}/enrollments`);
      setEnrollments(data.data || []);
    }
  }

  if (view.kind === 'program') {
    return (
      <div className="card">
        <div className="card-header d-flex justify-content-between">
          <h5 className="mb-0">{programForm.id ? 'Edit' : 'Add'} Program</h5>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setView({ kind: 'programs' })}>Back</button>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-8">
              <label className="form-label">Program name</label>
              <input className="form-control" value={programForm.program_name || ''} onChange={(e) => setProgramForm({ ...programForm, program_name: e.target.value })} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Status</label>
              <select className="form-select" value={programForm.status || 'active'} onChange={(e) => setProgramForm({ ...programForm, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </div>
            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={4} value={programForm.description || ''} onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Duration</label>
              <input className="form-control" value={programForm.duration || ''} onChange={(e) => setProgramForm({ ...programForm, duration: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Display order</label>
              <input type="number" className="form-control" value={programForm.display_order || 0} onChange={(e) => setProgramForm({ ...programForm, display_order: Number(e.target.value) })} />
            </div>
            <div className="col-12">
              <FileUploadField label="Program image" subdir="discipleship" type="image" value={programForm.image_url || ''} onChange={(p) => setProgramForm({ ...programForm, image_url: p })} />
              <input className="form-control" placeholder="Or paste image URL/path" value={programForm.image_url || ''} onChange={(e) => setProgramForm({ ...programForm, image_url: e.target.value })} />
            </div>
          </div>
          <button type="button" className="btn btn-primary mt-3" onClick={saveProgram}>Save Program</button>
        </div>
      </div>
    );
  }

  if (view.kind === 'modules') {
    const program = programs.find((p) => p.id === view.programId);
    return (
      <div>
        <div className="d-flex justify-content-between mb-3">
          <div>
            <button type="button" className="btn btn-link px-0" onClick={() => setView({ kind: 'programs' })}>← Programs</button>
            <h4 className="mb-0">{program?.program_name || 'Modules'}</h4>
          </div>
          <div className="btn-group">
            <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => { setModuleForm({ pass_mark_pct: 70, display_order: 0 }); setView({ kind: 'module', programId: view.programId }); }}>Add Module</button>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setView({ kind: 'enrollments', programId: view.programId })}>Enrollments</button>
          </div>
        </div>
        <div className="card">
          <div className="table-responsive">
            <table className="table table-sm mb-0">
              <thead><tr><th>#</th><th>Title</th><th>Pass %</th><th></th></tr></thead>
              <tbody>
                {modules.map((m, i) => (
                  <tr key={m.id}>
                    <td>{i + 1}</td>
                    <td>{m.title}</td>
                    <td>{m.pass_mark_pct}%</td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button type="button" className="btn btn-outline-primary" onClick={() => setView({ kind: 'resources', programId: view.programId, moduleId: m.id })}>Resources</button>
                        <button type="button" className="btn btn-outline-success" onClick={() => setView({ kind: 'questions', programId: view.programId, moduleId: m.id })}>Quiz</button>
                        <button type="button" className="btn btn-outline-secondary" onClick={() => { setModuleForm(m); setView({ kind: 'module', programId: view.programId, id: m.id }); }}>Edit</button>
                        <button type="button" className="btn btn-outline-danger" onClick={() => deleteModule(m.id, view.programId)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (view.kind === 'module') {
    return (
      <div className="card">
        <div className="card-header d-flex justify-content-between">
          <h5 className="mb-0">{moduleForm.id ? 'Edit' : 'Add'} Module</h5>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setView({ kind: 'modules', programId: view.programId })}>Back</button>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input className="form-control" value={moduleForm.title || ''} onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })} />
          </div>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows={3} value={moduleForm.description || ''} onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })} />
          </div>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Pass mark %</label>
              <input type="number" className="form-control" value={moduleForm.pass_mark_pct || 70} onChange={(e) => setModuleForm({ ...moduleForm, pass_mark_pct: Number(e.target.value) })} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Display order</label>
              <input type="number" className="form-control" value={moduleForm.display_order || 0} onChange={(e) => setModuleForm({ ...moduleForm, display_order: Number(e.target.value) })} />
            </div>
          </div>
          <button type="button" className="btn btn-primary mt-3" onClick={() => saveModule(view.programId)}>Save Module</button>
        </div>
      </div>
    );
  }

  if (view.kind === 'resources') {
    const mod = modules.find((m) => m.id === view.moduleId);
    return (
      <div>
        <button type="button" className="btn btn-link px-0 mb-2" onClick={() => setView({ kind: 'modules', programId: view.programId })}>← Modules</button>
        <h4>{mod?.title} — Resources</h4>
        <button type="button" className="btn btn-sm btn-primary mb-3" onClick={() => { setResourceForm({ resource_type: 'text', display_order: 0 }); setView({ kind: 'resource', programId: view.programId, moduleId: view.moduleId }); }}>Add Resource</button>
        <div className="card">
          <ul className="list-group list-group-flush">
            {resources.map((r) => (
              <li key={r.id} className="list-group-item d-flex justify-content-between">
                <span><span className="badge bg-secondary me-2">{r.resource_type}</span>{r.title || r.resource_type}</span>
                <div className="btn-group btn-group-sm">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => { setResourceForm(r); setView({ kind: 'resource', programId: view.programId, moduleId: view.moduleId, id: r.id }); }}>Edit</button>
                  <button type="button" className="btn btn-outline-danger" onClick={() => deleteResource(r.id, view.programId, view.moduleId)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (view.kind === 'resource') {
    const rt = resourceForm.resource_type || 'text';
    return (
      <div className="card">
        <div className="card-header d-flex justify-content-between">
          <h5 className="mb-0">{resourceForm.id ? 'Edit' : 'Add'} Resource</h5>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setView({ kind: 'resources', programId: view.programId, moduleId: view.moduleId })}>Back</button>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">Type</label>
            <select className="form-select" value={rt} onChange={(e) => setResourceForm({ ...resourceForm, resource_type: e.target.value })}>
              <option value="text">Text</option>
              <option value="audio">Audio</option>
              <option value="video">Video</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input className="form-control" value={resourceForm.title || ''} onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })} />
          </div>
          {rt === 'text' ? (
            <div className="mb-3">
              <label className="form-label">Content (HTML allowed)</label>
              <textarea className="form-control" rows={8} value={resourceForm.content || ''} onChange={(e) => setResourceForm({ ...resourceForm, content: e.target.value })} />
            </div>
          ) : (
            <>
              <FileUploadField label="Upload file" subdir="discipleship" type={rt as 'audio' | 'video' | 'pdf'} value={resourceForm.file_path || ''} onChange={(p) => setResourceForm({ ...resourceForm, file_path: p })} />
              <input className="form-control" placeholder="File path" value={resourceForm.file_path || ''} onChange={(e) => setResourceForm({ ...resourceForm, file_path: e.target.value })} />
            </>
          )}
          <button type="button" className="btn btn-primary" onClick={() => saveResource(view.moduleId, view.programId)}>Save Resource</button>
        </div>
      </div>
    );
  }

  if (view.kind === 'questions') {
    const mod = modules.find((m) => m.id === view.moduleId);
    return (
      <div>
        <button type="button" className="btn btn-link px-0 mb-2" onClick={() => setView({ kind: 'modules', programId: view.programId })}>← Modules</button>
        <h4>{mod?.title} — Quiz Questions</h4>
        <div className="card mb-4">
          <div className="card-body">
            <h6>Add Question</h6>
            <textarea className="form-control mb-2" placeholder="Question text" value={questionForm.question_text} onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })} />
            {questionForm.options.map((o, i) => (
              <div key={i} className="input-group mb-2">
                <span className="input-group-text">
                  <input type="radio" name="correct" checked={o.is_correct} onChange={() => setQuestionForm({ ...questionForm, options: questionForm.options.map((opt, j) => ({ ...opt, is_correct: j === i })) })} />
                </span>
                <input className="form-control" placeholder={`Option ${i + 1}`} value={o.option_text} onChange={(e) => {
                  const opts = [...questionForm.options];
                  opts[i] = { ...opts[i], option_text: e.target.value };
                  setQuestionForm({ ...questionForm, options: opts });
                }} />
              </div>
            ))}
            <button type="button" className="btn btn-sm btn-outline-secondary me-2" onClick={() => setQuestionForm({ ...questionForm, options: [...questionForm.options, { option_text: '', is_correct: false, feedback_text: '' }] })}>Add option</button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => saveQuestion(view.moduleId, view.programId)}>Save Question</button>
          </div>
        </div>
        {questions.map((q) => (
          <div key={q.id} className="card mb-2">
            <div className="card-body d-flex justify-content-between">
              <div>
                <strong>{q.question_text}</strong>
                <ul className="small mb-0 mt-1">{q.options.map((o) => <li key={o.id}>{o.option_text}{o.is_correct ? ' ✓' : ''}</li>)}</ul>
              </div>
              <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => deleteQuestion(q.id, view.programId, view.moduleId)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (view.kind === 'enrollments') {
    return (
      <div>
        <button type="button" className="btn btn-link px-0 mb-2" onClick={() => setView({ kind: 'modules', programId: view.programId })}>← Modules</button>
        <h4>Enrollments & Certificates</h4>
        <div className="card">
          <table className="table table-sm mb-0">
            <thead><tr><th>Student</th><th>Status</th><th>Certificate</th><th></th></tr></thead>
            <tbody>
              {enrollments.map((e) => (
                <tr key={e.id}>
                  <td>{e.full_name}<br /><small className="text-muted">{e.email}</small></td>
                  <td><span className="badge bg-secondary">{e.status}</span></td>
                  <td>{e.certificate_issued ? e.certificate_number : '—'}</td>
                  <td>
                    {e.status === 'completed' && !e.certificate_issued && (
                      <button type="button" className="btn btn-sm btn-success" onClick={() => issueCertificate(e.id)}>Issue Certificate</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div>
      {message && <div className="alert alert-success">{message}</div>}
      <div className="d-flex justify-content-between mb-3">
        <h4 className="mb-0">Discipleship Programs</h4>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => { setProgramForm({ status: 'active', display_order: 0 }); setView({ kind: 'program' }); }}>Add Program</button>
      </div>
      {loading ? <p>Loading…</p> : (
        <div className="card">
          <table className="table table-sm mb-0">
            <thead><tr><th>Program</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {programs.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.program_name}</strong><br /><small className="text-muted">{String(p.description || '').slice(0, 80)}</small></td>
                  <td><span className="badge bg-secondary">{p.status}</span></td>
                  <td className="text-end">
                    <div className="btn-group btn-group-sm">
                      <button type="button" className="btn btn-outline-primary" onClick={() => setView({ kind: 'modules', programId: p.id })}>Modules</button>
                      <button type="button" className="btn btn-outline-secondary" onClick={() => { setProgramForm(p); setView({ kind: 'program', id: p.id }); }}>Edit</button>
                      <button type="button" className="btn btn-outline-danger" onClick={() => deleteProgram(p.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
