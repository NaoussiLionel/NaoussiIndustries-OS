import { useState, useEffect } from 'react'
import { api } from '../api'
import Modal, { FormGroup, StatusBadge } from '../components/Modal'

const empty = { company_name: '', contact_name: '', email: '', phone: '', source: '', budget_range: '', status: 'Cold Lead', follow_up_date: '', notes: '' }

const emptyState = (
  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
    <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>▶</div>
    <div style={{ fontWeight: 600, marginBottom: 4 }}>No leads in pipeline</div>
    <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 16, lineHeight: 1.5 }}>
      Leads are potential clients in your sales funnel.<br />
      Track them from cold contact through to closing the deal.
    </div>
  </div>
)

export default function Leads() {
  const [leads, setLeads] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(empty)
  const [filter, setFilter] = useState('all')

  useEffect(() => { api.leads.list().then(setLeads) }, [])

  function openCreate() { setForm(empty); setModal('create') }
  function openEdit(l) { setForm(l); setModal('edit') }
  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }) }

  async function handleSave() {
    if (modal === 'create') await api.leads.create(form)
    else await api.leads.update(form.id, form)
    setModal(null); api.leads.list().then(setLeads)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this lead?')) return
    await api.leads.delete(id); api.leads.list().then(setLeads)
  }

  const filtered = filter === 'all' ? leads : leads.filter(l => l.status === filter)

  const pipelineCounts = {
    'Cold Lead': leads.filter(l => l.status === 'Cold Lead').length,
    'Contacted': leads.filter(l => l.status === 'Contacted').length,
    'Qualified': leads.filter(l => l.status === 'Qualified').length,
    'Proposal Sent': leads.filter(l => l.status === 'Proposal Sent').length,
    'Closed Won': leads.filter(l => l.status === 'Closed Won').length,
  }

  return (
    <div>
      {/* Pipeline Funnel */}
      <div className="kpi-ticker">
        {Object.entries(pipelineCounts).map(([status, count]) => (
          <div key={status} className="kpi-ticker-item" style={{ cursor: 'pointer', background: filter === status ? 'var(--surface2)' : '' }} onClick={() => setFilter(filter === status ? 'all' : status)}>
            <div className="kpi-label">{status}</div>
            <div className="kpi-value" style={{ color: count > 0 ? 'var(--primary)' : 'var(--text3)', fontSize: 18 }}>{count}</div>
          </div>
        ))}
        <div className="kpi-ticker-item" style={{ cursor: 'pointer', background: filter === 'all' ? 'var(--surface2)' : '' }} onClick={() => setFilter('all')}>
          <div className="kpi-label">Total</div>
          <div className="kpi-value" style={{ fontSize: 18 }}>{leads.length}</div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div style={{ fontSize: 13, color: 'var(--text3)' }}>
          {filter !== 'all' ? `Showing ${filter}` : `${leads.length} lead${leads.length !== 1 ? 's' : ''} in pipeline`}
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ New Lead</button>
      </div>

      <div className="table-wrap">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Company</th><th>Contact</th><th>Source</th><th>Budget</th><th>Status</th><th>Follow Up</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id}>
                  <td><span style={{ fontWeight: 600 }}>{l.company_name}</span></td>
                  <td>{l.contact_name}</td>
                  <td>{l.source || <span className="text-muted">—</span>}</td>
                  <td>{l.budget_range || <span className="text-muted">—</span>}</td>
                  <td><StatusBadge status={l.status} /></td>
                  <td style={{ fontSize: 12 }}>{l.follow_up_date ? new Date(l.follow_up_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : <span className="text-muted">—</span>}</td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn btn-sm btn-ghost" onClick={() => openEdit(l)}>Edit</button>
                      <button className="btn btn-sm btn-ghost btn-ghost-danger" onClick={() => handleDelete(l.id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7}>{emptyState}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal title={modal === 'create' ? 'New Lead' : 'Edit Lead'} onClose={() => setModal(null)}>
          <FormGroup label="Company Name"><input name="company_name" value={form.company_name} onChange={handleChange} /></FormGroup>
          <FormGroup label="Contact Name"><input name="contact_name" value={form.contact_name} onChange={handleChange} /></FormGroup>
          <div className="form-row">
            <FormGroup label="Email"><input name="email" type="email" value={form.email} onChange={handleChange} /></FormGroup>
            <FormGroup label="Phone"><input name="phone" value={form.phone} onChange={handleChange} /></FormGroup>
          </div>
          <div className="form-row">
            <FormGroup label="Source">
              <select name="source" value={form.source} onChange={handleChange}>
                <option value="">Select</option><option>Website</option><option>Referral</option><option>LinkedIn</option><option>Instagram</option><option>Email</option><option>Event</option><option>Other</option>
              </select>
            </FormGroup>
            <FormGroup label="Budget Range">
              <select name="budget_range" value={form.budget_range} onChange={handleChange}>
                <option value="">Select</option><option>80-150 FCFA</option><option>150-300 FCFA</option><option>300-700 FCFA</option><option>700-1 500 FCFA</option>
              </select>
            </FormGroup>
          </div>
          <div className="form-row">
            <FormGroup label="Status">
              <select name="status" value={form.status} onChange={handleChange}>
                <option>Cold Lead</option><option>Contacted</option><option>Qualified</option><option>Proposal Sent</option><option>Closed Won</option><option>Closed Lost</option>
              </select>
            </FormGroup>
            <FormGroup label="Follow Up"><input type="date" name="follow_up_date" value={form.follow_up_date} onChange={handleChange} /></FormGroup>
          </div>
          <FormGroup label="Notes"><textarea name="notes" value={form.notes} onChange={handleChange} rows={3} /></FormGroup>
          <div className="form-actions">
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Save</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
