import { useState, useEffect } from 'react'
import { api } from '../api'
import Modal, { FormGroup } from '../components/Modal'

const empty = { contract_type: 'Client', client_id: '', freelancer_id: '', project_id: '', signed_date: '', terms: '', status: 'Active' }

export default function Contracts() {
  const [contracts, setContracts] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(empty)
  const [clients, setClients] = useState([])
  const [freelancers, setFreelancers] = useState([])
  const [projects, setProjects] = useState([])

  function load() {
    api.contracts.list().then(setContracts)
    api.clients.list().then(setClients)
    api.freelancers.list().then(setFreelancers)
    api.projects.list().then(setProjects)
  }

  useEffect(() => { load() }, [])

  function openCreate() { setForm(empty); setModal('create') }
  function openEdit(c) { setForm(c); setModal('edit') }
  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }) }

  async function handleSave() {
    const payload = { ...form, client_id: Number(form.client_id) || null, freelancer_id: Number(form.freelancer_id) || null, project_id: Number(form.project_id) || null }
    if (modal === 'create') await api.contracts.create(payload)
    else await api.contracts.update(form.id, payload)
    setModal(null); load()
  }

  async function handleDelete(id) {
    if (!confirm('Delete this contract?')) return
    await api.contracts.delete(id); load()
  }

  return (
    <div>
      <div className="page-header">
        <h2>Contracts</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ New Contract</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Type</th><th>Client / Freelancer</th><th>Project</th><th>Signed Date</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {contracts.map(c => (
              <tr key={c.id}>
                <td><span className={`status-badge ${c.contract_type === 'Client' ? 'status-active' : 'status-completed'}`}>{c.contract_type}</span></td>
                <td>{c.client_name || c.freelancer_name || '-'}</td>
                <td>{c.project_code || '-'}</td>
                <td>{c.signed_date ? new Date(c.signed_date).toLocaleDateString() : '-'}</td>
                <td><span className={`status-badge status-${c.status.toLowerCase()}`}>{c.status}</span></td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-sm btn-ghost" onClick={() => openEdit(c)}>Edit</button>
                    <button className="btn btn-sm btn-red" onClick={() => handleDelete(c.id)}>Del</button>
                  </div>
                </td>
              </tr>
            ))}
            {contracts.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>No contracts yet</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal === 'create' ? 'New Contract' : 'Edit Contract'} onClose={() => setModal(null)}>
          <div className="form-row">
            <FormGroup label="Contract Type">
              <select name="contract_type" value={form.contract_type} onChange={handleChange}>
                <option>Client</option><option>Freelancer</option>
              </select>
            </FormGroup>
            <FormGroup label="Status">
              <select name="status" value={form.status} onChange={handleChange}>
                <option>Active</option><option>Completed</option><option>Terminated</option>
              </select>
            </FormGroup>
          </div>
          <FormGroup label="Client">
            <select name="client_id" value={form.client_id} onChange={handleChange}>
              <option value="">Select client</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="Freelancer">
            <select name="freelancer_id" value={form.freelancer_id} onChange={handleChange}>
              <option value="">Select freelancer</option>
              {freelancers.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="Project">
            <select name="project_id" value={form.project_id} onChange={handleChange}>
              <option value="">Select project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.project_code}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="Signed Date"><input type="date" name="signed_date" value={form.signed_date} onChange={handleChange} /></FormGroup>
          <FormGroup label="Terms"><textarea name="terms" value={form.terms} onChange={handleChange} rows={4} /></FormGroup>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Save</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
