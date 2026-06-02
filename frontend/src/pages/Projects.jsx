import { useState, useEffect } from 'react'
import { api } from '../api'
import Modal, { FormGroup, StatusBadge, StageFlow, MarginBar } from '../components/Modal'

const empty = { project_code: '', client_id: '', package: '', description: '', status: 'Active', client_price: 0, freelancer_cost: 0, deadline: '', freelancer_id: '' }

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(empty)
  const [clients, setClients] = useState([])
  const [freelancers, setFreelancers] = useState([])
  const [detail, setDetail] = useState(null)
  const [tab, setTab] = useState('all')

  function load() { api.projects.list().then(setProjects); api.clients.list().then(setClients); api.freelancers.list().then(setFreelancers) }
  useEffect(() => { load() }, [])

  function openCreate() { setForm(empty); setModal('create') }
  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }) }

  async function handleSave() {
    if (modal === 'create') await api.projects.create({ ...form, client_id: Number(form.client_id) || null, freelancer_id: Number(form.freelancer_id) || null })
    else await api.projects.update(form.id, { ...form, client_id: Number(form.client_id) || null, freelancer_id: Number(form.freelancer_id) || null })
    setModal(null); api.projects.list().then(setProjects)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this project?')) return
    await api.projects.delete(id); api.projects.list().then(setProjects)
  }

  async function showDetail(id) {
    const p = await api.projects.get(id)
    setDetail(p)
  }

  async function updateStage(stageId, status) {
    if (!detail) return
    await api.projects.updateStage(detail.id, stageId, { status })
    const p = await api.projects.get(detail.id)
    setDetail(p)
  }

  const filtered = projects.filter(p => tab === 'all' || p.status === tab)

  return (
    <div>
      <div className="stat-grid" style={{ marginBottom: 16 }}>
        <div className="stat-card">
          <div className="stat-label">Total Projects</div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>{projects.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{projects.filter(p => p.status === 'Active').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value" style={{ color: 'var(--blue)' }}>{projects.filter(p => p.status === 'Completed').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">On Hold</div>
          <div className="stat-value" style={{ color: 'var(--orange)' }}>{projects.filter(p => p.status === 'On_Hold').length}</div>
        </div>
      </div>

      {/* Business Rule */}
      <div className="rules-alert">
        <span className="alert-icon">📌</span>
        <div className="alert-text">
          <strong>SOP Workflow:</strong> Lead Inquiry → Quote → 50% Deposit → Production → Max 2 Revisions → Final Approval → 50% Balance → Delivery. <strong>No scope creep</strong> — additional changes require a new quote.
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="tabs">
          <button className={`tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>All ({projects.length})</button>
          <button className={`tab ${tab === 'Active' ? 'active' : ''}`} onClick={() => setTab('Active')}>Active</button>
          <button className={`tab ${tab === 'Completed' ? 'active' : ''}`} onClick={() => setTab('Completed')}>Completed</button>
          <button className={`tab ${tab === 'On_Hold' ? 'active' : ''}`} onClick={() => setTab('On_Hold')}>On Hold</button>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ New Project</button>
      </div>

      <div className="table-wrap">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Client</th>
                <th>Package</th>
                <th>Price</th>
                <th>Margin</th>
                <th>Deadline</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const margin = ((p.client_price - p.freelancer_cost) / p.client_price * 100)
                return (
                  <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => showDetail(p.id)}>
                    <td><span style={{ fontWeight: 700 }}>{p.project_code}</span></td>
                    <td>{p.company_name || <span className="text-muted">—</span>}</td>
                    <td>{p.package || <span className="text-muted">—</span>}</td>
                    <td><span style={{ fontWeight: 600 }}>${p.client_price}</span></td>
                    <td><MarginBar pct={margin} /></td>
                    <td style={{ fontSize: 12 }}>{p.deadline ? new Date(p.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : <span className="text-muted">—</span>}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>
                      <button className="btn btn-sm btn-ghost" onClick={e => { e.stopPropagation(); showDetail(p.id) }}>View</button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && <tr><td colSpan={8} className="table-empty">No projects found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Project Detail Modal */}
      {detail && (
        <Modal title={`${detail.project_code}`} subtitle={detail.company_name || ''} onClose={() => setDetail(null)} wide>
          {/* Stage Flow */}
          <StageFlow stages={detail.stages} />

          {/* Project Info */}
          <div className="grid-3 mt-4 mb-4" style={{ gap: 12 }}>
            <div className="detail-panel">
              <div className="detail-panel-header">Financials</div>
              <div className="detail-panel-body">
                <div className="detail-row"><span className="label">Client Price</span><span className="value">${detail.client_price}</span></div>
                <div className="detail-row"><span className="label">Freelancer Cost</span><span className="value">${detail.freelancer_cost}</span></div>
                <div className="detail-row"><span className="label">Net Profit</span><span className="value" style={{ color: 'var(--green)', fontWeight: 700 }}>${detail.client_price - detail.freelancer_cost}</span></div>
                <div className="detail-row"><span className="label">Margin</span><span className="value"><MarginBar pct={((detail.client_price - detail.freelancer_cost) / detail.client_price * 100)} /></span></div>
              </div>
            </div>

            <div className="detail-panel">
              <div className="detail-panel-header">Details</div>
              <div className="detail-panel-body">
                <div className="detail-row"><span className="label">Package</span><span className="value">{detail.package || '—'}</span></div>
                <div className="detail-row"><span className="label">Status</span><span className="value"><StatusBadge status={detail.status} /></span></div>
                <div className="detail-row"><span className="label">Freelancer</span><span className="value">{detail.freelancer_name || <span className="text-muted">—</span>}</span></div>
                <div className="detail-row"><span className="label">Deadline</span><span className="value">{detail.deadline ? new Date(detail.deadline).toLocaleDateString() : '—'}</span></div>
              </div>
            </div>

            <div className="detail-panel">
              <div className="detail-panel-header">Revisions & Quality</div>
              <div className="detail-panel-body">
                <div className="detail-row"><span className="label">Revision Rounds</span><span className="value" style={{ color: detail.revision_rounds > 2 ? 'var(--red)' : 'var(--green)' }}>{detail.revision_rounds} / 2 max</span></div>
                <div className="detail-row"><span className="label">Quality Score</span><span className="value">{detail.quality_score ? `${detail.quality_score}/10` : '—'}</span></div>
              </div>
            </div>
          </div>

          {/* Stage Controls */}
          <div className="card mt-2">
            <div className="card-header">
              <span className="card-title">Stage Progress</span>
            </div>
            {detail.stages.map(s => (
              <div key={s.id} className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2">
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: s.status === 'Completed' ? 'var(--green)' : s.status === 'In Progress' ? 'var(--primary)' : 'var(--border)'
                  }} />
                  <span style={{ fontSize: 13, fontWeight: s.status === 'In Progress' ? 600 : 400 }}>
                    {s.stage_name.replace(/^\d{2}_/, '').replace(/_/g, ' ')}
                  </span>
                  {s.completed_at && <span className="text-xs text-muted">— {new Date(s.completed_at).toLocaleDateString()}</span>}
                </div>
                <select
                  value={s.status}
                  onChange={e => updateStage(s.id, e.target.value)}
                  style={{
                    background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                    padding: '4px 8px', color: 'var(--text)', fontSize: 12, cursor: 'pointer'
                  }}
                >
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button className="btn btn-ghost" onClick={() => setDetail(null)}>Close</button>
          </div>
        </Modal>
      )}

      {/* Create Project Modal */}
      {modal && (
        <Modal title="New Project" subtitle="Create a new project following the NI OS workflow" onClose={() => setModal(null)}>
          <FormGroup label="Project Code"><input name="project_code" value={form.project_code} onChange={handleChange} placeholder="NI-004" /></FormGroup>
          <div className="form-row">
            <FormGroup label="Client">
              <select name="client_id" value={form.client_id} onChange={handleChange}>
                <option value="">Select client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Package">
              <select name="package" value={form.package} onChange={handleChange}>
                <option value="">Select package</option>
                <option>Starter Brand Kit</option>
                <option>Business Identity Pack</option>
                <option>Growth Brand System</option>
                <option>Premium Strategy Pack</option>
              </select>
            </FormGroup>
          </div>

          <div className="form-row">
            <FormGroup label="Client Price ($)"><input type="number" name="client_price" value={form.client_price} onChange={handleChange} /></FormGroup>
            <FormGroup label="Freelancer Cost ($)"><input type="number" name="freelancer_cost" value={form.freelancer_cost} onChange={handleChange} /></FormGroup>
          </div>

          <div className="form-row">
            <FormGroup label="Deadline"><input type="date" name="deadline" value={form.deadline} onChange={handleChange} /></FormGroup>
            <FormGroup label="Assign Freelancer">
              <select name="freelancer_id" value={form.freelancer_id} onChange={handleChange}>
                <option value="">Select freelancer</option>
                {freelancers.filter(f => f.status === 'Active').map(f => <option key={f.id} value={f.id}>{f.name} ({f.role})</option>)}
              </select>
            </FormGroup>
          </div>

          <FormGroup label="Description"><textarea name="description" value={form.description} onChange={handleChange} rows={3} /></FormGroup>

          <div className="rules-alert" style={{ marginTop: 8 }}>
            <span className="alert-icon">💡</span>
            <div className="alert-text">Target margin: <strong>60%+</strong>. Project will auto-generate 7 stages from Quote → Final Delivery.</div>
          </div>

          <div className="form-actions">
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Create Project</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
