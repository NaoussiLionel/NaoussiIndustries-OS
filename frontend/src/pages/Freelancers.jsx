import { useState, useEffect } from 'react'
import { api } from '../api'
import Modal, { FormGroup, StatusBadge } from '../components/Modal'

const empty = { name: '', email: '', phone: '', role: 'Graphic Designer', rate_per_task: 0, status: 'Active', quality_score: 5, on_time_pct: 100, notes: '' }

const emptyState = (
  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
    <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>○</div>
    <div style={{ fontWeight: 600, marginBottom: 4 }}>No freelancers on the team</div>
    <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 16, lineHeight: 1.5 }}>
      Freelancers are your production team.<br />
      Add freelancers to assign them to projects and track performance.
    </div>
  </div>
)

export default function Freelancers() {
  const [freelancers, setFreelancers] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(empty)

  useEffect(() => { api.freelancers.list().then(setFreelancers) }, [])

  function openCreate() { setForm(empty); setModal('create') }
  function openEdit(f) { setForm(f); setModal('edit') }
  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }) }

  async function handleSave() {
    if (modal === 'create') await api.freelancers.create(form)
    else await api.freelancers.update(form.id, form)
    setModal(null); api.freelancers.list().then(setFreelancers)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this freelancer?')) return
    await api.freelancers.delete(id); api.freelancers.list().then(setFreelancers)
  }

  const avgQuality = freelancers.length > 0 ? (freelancers.reduce((s, f) => s + f.quality_score, 0) / freelancers.length).toFixed(1) : 0
  const avgOnTime = freelancers.length > 0 ? (freelancers.reduce((s, f) => s + f.on_time_pct, 0) / freelancers.length).toFixed(0) : 0

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Freelancers</div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>{freelancers.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{freelancers.filter(f => f.status === 'Active').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Quality</div>
          <div className="stat-value" style={{ color: avgQuality >= 8 ? 'var(--green)' : avgQuality >= 5 ? 'var(--orange)' : 'var(--red)', fontSize: 22 }}>{avgQuality}/10</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">On-Time Rate</div>
          <div className="stat-value" style={{ color: avgOnTime >= 90 ? 'var(--green)' : avgOnTime >= 70 ? 'var(--orange)' : 'var(--red)' }}>{avgOnTime}%</div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div style={{ fontSize: 13, color: 'var(--text3)' }}>
          {freelancers.length > 0 ? `Avg rate: $${(freelancers.reduce((s, f) => s + Number(f.rate_per_task), 0) / Math.max(freelancers.length, 1)).toFixed(0)}/task` : ''}
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ New Freelancer</button>
      </div>

      <div className="table-wrap">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Role</th><th>Rate/Task</th><th>Quality</th><th>On Time</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {freelancers.map(f => (
                <tr key={f.id}>
                  <td><span style={{ fontWeight: 600 }}>{f.name}</span></td>
                  <td><StatusBadge label={f.role} status={f.role} /></td>
                  <td><span style={{ fontWeight: 600 }}>${Number(f.rate_per_task).toFixed(0)}</span></td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div style={{ width: 50, height: 4, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${f.quality_score * 10}%`, height: '100%', background: f.quality_score >= 8 ? 'var(--green)' : f.quality_score >= 5 ? 'var(--orange)' : 'var(--red)', borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: 12 }}>{f.quality_score}/10</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ color: f.on_time_pct >= 90 ? 'var(--green)' : f.on_time_pct >= 70 ? 'var(--orange)' : 'var(--red)', fontWeight: 600 }}>{f.on_time_pct}%</span>
                  </td>
                  <td><StatusBadge status={f.status} /></td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn btn-sm btn-ghost" onClick={() => openEdit(f)}>Edit</button>
                      <button className="btn btn-sm btn-ghost btn-ghost-danger" onClick={() => handleDelete(f.id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {freelancers.length === 0 && <tr><td colSpan={7}>{emptyState}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal title={modal === 'create' ? 'New Freelancer' : 'Edit Freelancer'} onClose={() => setModal(null)}>
          <FormGroup label="Full Name"><input name="name" value={form.name} onChange={handleChange} /></FormGroup>
          <div className="form-row">
            <FormGroup label="Email"><input name="email" type="email" value={form.email} onChange={handleChange} /></FormGroup>
            <FormGroup label="Phone"><input name="phone" value={form.phone} onChange={handleChange} /></FormGroup>
          </div>
          <div className="form-row">
            <FormGroup label="Role">
              <select name="role" value={form.role} onChange={handleChange}>
                <option>Logo Designer</option><option>Graphic Designer</option><option>Motion Designer</option><option>UI Designer</option><option>Brand Designer</option>
              </select>
            </FormGroup>
            <FormGroup label="Rate per Task ($)"><input type="number" name="rate_per_task" value={form.rate_per_task} onChange={handleChange} /></FormGroup>
          </div>
          <div className="form-row">
            <FormGroup label="Status">
              <select name="status" value={form.status} onChange={handleChange}>
                <option>Active</option><option>On Leave</option><option>Inactive</option>
              </select>
            </FormGroup>
            <FormGroup label="Quality Score (1-10)"><input type="number" min="1" max="10" name="quality_score" value={form.quality_score} onChange={handleChange} /></FormGroup>
          </div>
          <FormGroup label="On-Time %"><input type="number" min="0" max="100" name="on_time_pct" value={form.on_time_pct} onChange={handleChange} /></FormGroup>
          <FormGroup label="Notes"><textarea name="notes" value={form.notes} onChange={handleChange} rows={3} /></FormGroup>

          <div className="rules-alert">
            <span className="alert-icon">📌</span>
            <div className="alert-text">
              <strong>Freelancer Rules:</strong> Paid <strong>only after client approval</strong>. No direct client contact. All work reviewed internally first.
            </div>
          </div>

          <div className="form-actions">
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Save</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
