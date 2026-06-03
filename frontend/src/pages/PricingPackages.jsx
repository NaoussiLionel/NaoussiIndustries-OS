import { useState, useEffect } from 'react'
import { api } from '../api'
import Modal, { FormGroup } from '../components/Modal'

function buildCatalogueHtml(packages) {
  const body = packages.map(p => `<div class="pkg" style="page-break-before:always;">
    <div class="pkg-header">
      <div class="pkg-name">${p.name}</div>
      <div class="pkg-price">${Number(p.client_price).toLocaleString()} <small>FCFA</small></div>
    </div>
    <div class="pkg-section">
      <div class="pkg-section-title">📦 What's Included</div>
      <div class="pkg-desc">${p.description || 'Full brand identity package with strategic positioning, visual design, and delivery assets.'}</div>
    </div>
    <div class="pkg-section">
      <div class="pkg-section-title">🎯 Best For</div>
      <div class="pkg-desc">${p.use_case || 'Businesses looking for professional brand identity services.'}</div>
    </div>
    <div class="pkg-section">
      <div class="pkg-section-title">✨ Why Choose This Pack</div>
      <div class="pkg-desc" style="font-weight:500;color:#333;">${p.client_advantage || 'A professional brand identity that sets you apart and builds trust with your customers.'}</div>
    </div>
  </div>`).join('')

  return `<!DOCTYPE html><html><head>
    <meta charset="utf-8">
    <title>NI OS — Pricing Catalogue</title>
    <style>
      @page { margin: 18mm; }
      body { font-family: 'Helvetica', Arial, sans-serif; color: #222; font-size: 12px; line-height: 1.5; padding: 30px; }
      .tb { position: fixed; top: 0; left: 0; right: 0; z-index: 999; background: #6c5ce7; padding: 10px 20px; text-align: center; }
      .tb button { background: #fff; color: #6c5ce7; border: none; padding: 8px 24px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
      .tb button:hover { background: #f0edff; }
      @media print { .tb { display: none; } }
      .cover { text-align: center; padding: 80px 0 40px; border-bottom: 2px solid #6c5ce7; margin-bottom: 40px; margin-top: 40px; }
      .cover h1 { font-size: 36px; color: #6c5ce7; margin: 0 0 6px; letter-spacing: -1px; }
      .cover .subtitle { font-size: 14px; color: #888; }
      .cover .date { font-size: 10px; color: #aaa; margin-top: 20px; }
      .intro { text-align: center; color: #666; font-size: 11px; margin-bottom: 40px; }
      .pkg { page-break-inside: avoid; margin-bottom: 36px; border: 1px solid #eee; border-radius: 8px; padding: 24px 28px; }
      .pkg-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
      .pkg-name { font-size: 20px; font-weight: 700; color: #6c5ce7; margin: 0; }
      .pkg-price { font-size: 18px; font-weight: 700; }
      .pkg-price small { font-size: 11px; font-weight: 400; color: #888; }
      .pkg-section { margin-bottom: 16px; }
      .pkg-section:last-child { margin-bottom: 0; }
      .pkg-section-title { font-size: 11px; font-weight: 600; color: #6c5ce7; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
      .pkg-desc { font-size: 12px; color: #555; line-height: 1.7; }
      .pkg-desc strong { color: #333; }
      .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 9px; color: #aaa; }
      .zone-table { width: 100%; border-collapse: collapse; margin-top: 40px; page-break-inside: avoid; }
      .zone-table th { background: #f5f5f5; padding: 8px 14px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #666; }
      .zone-table td { padding: 10px 14px; border-bottom: 1px solid #eee; font-size: 12px; }
    </style>
  </head><body>
    <div class="tb"><button onclick="window.print()">📥 Download PDF</button></div>
    <div class="cover">
      <h1>NAOUSSI INDUSTRIES</h1>
      <div class="subtitle">Design & Brand Strategy — Pricing Catalogue</div>
      <div class="date">${new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
    </div>
    <div class="intro">
      Standard pricing packages for brand identity and design strategy services.<br>
      All prices are in FCFA (Franc CFA).
    </div>
    ${body}
    <h3 style="margin-top:40px; font-size:14px; color:#333; page-break-before:always;">Margin Zone Reference</h3>
    <table class="zone-table">
      <thead><tr><th>Zone</th><th>Range</th><th>Action</th></tr></thead>
      <tbody>
        <tr><td style="color:#00b894;font-weight:600;">🟢 Green</td><td>60% – 100%</td><td>Healthy margin. Maintain pricing. Consider premium positioning.</td></tr>
        <tr><td style="color:#f39c12;font-weight:600;">🟠 Orange</td><td>40% – 59%</td><td>Warning. Review freelancer costs or increase pricing.</td></tr>
        <tr><td style="color:#e74c3c;font-weight:600;">🔴 Red</td><td>0% – 39%</td><td>Critical. Immediate financial review needed.</td></tr>
      </tbody>
    </table>
    <div class="footer">
      Naoussi Industries &middot; Confidential Pricing Document &middot; Generated ${new Date().toLocaleString('en-GB')}
    </div>
  </body></html>`
}

function viewCatalogue(packages) {
  if (packages.length === 0) return
  const w = window.open('', '_blank')
  w.document.write(buildCatalogueHtml(packages))
  w.document.close()
}

function printCatalogue(packages) {
  if (packages.length === 0) return
  const w = window.open('', '_blank')
  w.document.write(buildCatalogueHtml(packages).replace('<div class="tb">', '<div class="tb" style="display:none">'))
  w.document.close()
  setTimeout(() => w.print(), 300)
}

export default function PricingPackages() {
  const [packages, setPackages] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})

  useEffect(() => { api.packages.list().then(setPackages) }, [])

  function openEdit(p) { setForm(p); setModal(true) }
  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }) }

  async function handleSave() {
    await api.packages.update(form.id, { ...form, client_price: Number(form.client_price), freelancer_cost: Number(form.freelancer_cost), target_margin_pct: Number(form.target_margin_pct), description: form.description, use_case: form.use_case, client_advantage: form.client_advantage })
    setModal(null); api.packages.list().then(setPackages)
  }

  return (
    <div>
      <div className="page-header">
        <h2>Pricing Packages</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => viewCatalogue(packages)} disabled={packages.length === 0}>
            👁️ View Catalogue
          </button>
          <button className="btn btn-primary" onClick={() => printCatalogue(packages)} disabled={packages.length === 0}>
            📥 Download Catalogue
          </button>
        </div>
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
              <th>Use Case</th>
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
                <td style={{fontSize:12,color:'var(--text2)',maxWidth:200,whiteSpace:'normal'}}>{p.use_case || '-'}</td>
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
          <FormGroup label="Description (what's included)"><textarea name="description" value={form.description} onChange={handleChange} rows={3} /></FormGroup>
          <FormGroup label="Use Case (best for)"><textarea name="use_case" value={form.use_case} onChange={handleChange} rows={2} /></FormGroup>
          <FormGroup label="Client Advantage (why choose this)"><textarea name="client_advantage" value={form.client_advantage} onChange={handleChange} rows={2} /></FormGroup>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Save</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
