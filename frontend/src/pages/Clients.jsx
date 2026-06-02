import { useState, useEffect } from 'react'
import { api } from '../api'
import Modal, { FormGroup, StatusBadge } from '../components/Modal'

const empty = { company_name: '', contact_name: '', email: '', phone: '', website: '', industry: '', notes: '', status: 'Active' }

const emptyState = (
  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
    <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>◆</div>
    <div style={{ fontWeight: 600, marginBottom: 4 }}>No clients yet</div>
    <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 16, lineHeight: 1.5 }}>
      Clients are businesses you've worked with.<br />
      Add your first client to start tracking projects and invoices.
    </div>
  </div>
)

export default function Clients() {
  const [clients, setClients] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(empty)

  useEffect(() => { api.clients.list().then(setClients) }, [])

  function openCreate() { setForm(empty); setModal('create') }
  function openEdit(c) { setForm(c); setModal('edit') }
  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }) }

  async function handleSave() {
    if (modal === 'create') await api.clients.create(form)
    else await api.clients.update(form.id, form)
    setModal(null); api.clients.list().then(setClients)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this client?')) return
    await api.clients.delete(id); api.clients.list().then(setClients)
  }

  const activeCount = clients.filter(c => c.status === 'Active').length

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Clients</div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>{clients.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{activeCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Past</div>
          <div className="stat-value" style={{ color: 'var(--text3)' }}>{clients.filter(c => c.status === 'Past').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Archived</div>
          <div className="stat-value" style={{ color: 'var(--red)' }}>{clients.filter(c => c.status === 'Archived').length}</div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div style={{ fontSize: 13, color: 'var(--text3)' }}>
          {clients.length > 0 ? `${clients.length} client${clients.length !== 1 ? 's' : ''} registered` : ''}
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ New Client</button>
      </div>

      <div className="table-wrap">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Company</th><th>Contact</th><th>Email</th><th>Phone</th><th>Industry</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {clients.map(c => (
                <tr key={c.id}>
                  <td><span style={{ fontWeight: 600 }}>{c.company_name}</span></td>
                  <td>{c.contact_name}</td>
                  <td>{c.email || <span className="text-muted">—</span>}</td>
                  <td>{c.phone || <span className="text-muted">—</span>}</td>
                  <td>{c.industry || <span className="text-muted">—</span>}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn btn-sm btn-ghost" onClick={() => openEdit(c)}>Edit</button>
                      <button className="btn btn-sm btn-ghost btn-ghost-danger" onClick={() => handleDelete(c.id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && <tr><td colSpan={7}>{emptyState}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal title={modal === 'create' ? 'New Client' : 'Edit Client'} onClose={() => setModal(null)}>
          <FormGroup label="Company Name"><input name="company_name" value={form.company_name} onChange={handleChange} /></FormGroup>
          <FormGroup label="Contact Name"><input name="contact_name" value={form.contact_name} onChange={handleChange} /></FormGroup>
          <div className="form-row">
            <FormGroup label="Email"><input name="email" type="email" value={form.email} onChange={handleChange} /></FormGroup>
            <FormGroup label="Phone"><input name="phone" value={form.phone} onChange={handleChange} /></FormGroup>
          </div>
          <div className="form-row">
            <FormGroup label="Website"><input name="website" value={form.website} onChange={handleChange} /></FormGroup>
            <FormGroup label="Industry"><input name="industry" value={form.industry} onChange={handleChange} /></FormGroup>
          </div>
          <FormGroup label="Status">
            <select name="status" value={form.status} onChange={handleChange}>
              <option>Active</option><option>Past</option><option>Archived</option>
            </select>
          </FormGroup>
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
