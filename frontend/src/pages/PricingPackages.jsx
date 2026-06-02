import { useState, useEffect } from 'react'
import { api } from '../api'
import Modal, { FormGroup } from '../components/Modal'

export default function PricingPackages() {
  const [packages, setPackages] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})

  useEffect(() => { api.packages.list().then(setPackages) }, [])

  function openEdit(p) { setForm(p); setModal(true) }
  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }) }

  async function handleSave() {
    await api.packages.update(form.id, { ...form, client_price: Number(form.client_price), freelancer_cost: Number(form.freelancer_cost), target_margin_pct: Number(form.target_margin_pct) })
    setModal(null); api.packages.list().then(setPackages)
  }

  return (
    <div>
      <div className="page-header">
        <h2>Pricing Packages</h2>
      </div>

      <div className="card">
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>Reference matrix for standard pricing across all packages.</p>
        <table>
          <thead>
            <tr>
              <th>Package</th>
              <th>Client Price</th>
              <th>Freelancer Cost</th>
              <th>Target Margin</th>
              <th>Description</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {packages.map(p => (
              <tr key={p.id}>
                <td><strong>{p.name}</strong></td>
                <td>{p.client_price} FCFA</td>
                <td>{p.freelancer_cost} FCFA</td>
                <td><span className={`status-badge ${p.target_margin_pct >= 70 ? 'status-active' : p.target_margin_pct >= 65 ? 'status-on_hold' : 'status-pending'}`}>{p.target_margin_pct}%</span></td>
                <td>{p.description || '-'}</td>
                <td><button className="btn btn-sm btn-ghost" onClick={() => openEdit(p)}>Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card mt-4">
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Margin Zone Reference</h3>
        <table>
          <thead>
            <tr><th>Zone</th><th>Range</th><th>Action</th><th>Color</th></tr>
          </thead>
          <tbody>
            <tr><td><span className={`status-badge status-active`}>Green</span></td><td>60%–100%</td><td>Maintain. Consider premium positioning.</td><td style={{ color: '#00b894' }}>■ #00B050</td></tr>
            <tr><td><span className={`status-badge status-on_hold`}>Orange</span></td><td>40%–59%</td><td>Review. Check freelancer costs or increase pricing next time.</td><td style={{ color: '#fdcb6e' }}>■ #FFC000</td></tr>
            <tr><td><span className={`status-badge`} style={{ background: 'rgba(225,112,85,0.15)', color: '#e17055' }}>Red</span></td><td>0%–39%</td><td>Immediate review. Why is this project losing money?</td><td style={{ color: '#e17055' }}>■ #FF0000</td></tr>
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title="Edit Package" onClose={() => setModal(null)}>
          <FormGroup label="Name"><input name="name" value={form.name} onChange={handleChange} /></FormGroup>
          <div className="form-row">
            <FormGroup label="Client Price (FCFA)"><input type="number" name="client_price" value={form.client_price} onChange={handleChange} /></FormGroup>
            <FormGroup label="Freelancer Cost (FCFA)"><input type="number" name="freelancer_cost" value={form.freelancer_cost} onChange={handleChange} /></FormGroup>
          </div>
          <FormGroup label="Target Margin (%)"><input type="number" name="target_margin_pct" value={form.target_margin_pct} onChange={handleChange} /></FormGroup>
          <FormGroup label="Description"><textarea name="description" value={form.description} onChange={handleChange} rows={3} /></FormGroup>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Save</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
