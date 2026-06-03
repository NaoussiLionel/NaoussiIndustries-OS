import { useState, useEffect } from 'react'
import { api } from '../api'
import Modal, { FormGroup } from '../components/Modal'

function toLines(text) {
  return (text || '').split('\n').filter(Boolean)
}

function buildCatalogueHtml(packages) {
  const body = packages.map(p => {
    const lines = toLines(p.description)
    const useCases = toLines(p.use_case)
    const advantage = toLines(p.client_advantage)
    const cta = advantage.length > 0 && advantage[advantage.length - 1].startsWith('👉') ? advantage.pop() : ''
    const isLast = p === packages[packages.length - 1]

    return `<div class="pkg">
      <div class="pkg-header">
        <div class="pkg-name">${p.name}</div>
        <div class="pkg-price">${Number(p.client_price).toLocaleString()} <small>FCFA</small></div>
      </div>

      <div class="pkg-section">
        <div class="pkg-section-title">📦 Ce que comprend ce pack</div>
        <ul class="pkg-list">
          ${lines.map(l => `<li>${l}</li>`).join('')}
        </ul>
      </div>

      <div class="pkg-section">
        <div class="pkg-section-title">🎯 À qui s'adresse ce pack</div>
        <div class="pkg-cards">
          ${useCases.map((uc, i) => {
            const icons = ['🚀', '💼', '🏆']
            return `<div class="pkg-card"><span class="pkg-card-icon">${icons[i] || '•'}</span><span>${uc}</span></div>`
          }).join('')}
        </div>
      </div>

      <div class="pkg-section pkg-why">
        <div class="pkg-section-title">✨ Pourquoi choisir ce pack</div>
        ${advantage.map(a => a.trim() ? `<p class="pkg-why-line">${a}</p>` : `<br>`).join('')}
        ${cta ? `<div class="pkg-cta">${cta}</div>` : ''}
      </div>

      <div class="pkg-section">
        <div class="pkg-section-title">⚙️ Comment ça marche</div>
        <div class="pkg-process">
          <div class="pkg-process-step"><span class="p-step-num">1</span><span class="p-step-label">Devis</span></div>
          <div class="pkg-process-arrow">→</div>
          <div class="pkg-process-step"><span class="p-step-num">2</span><span class="p-step-label">Acompte 50%</span></div>
          <div class="pkg-process-arrow">→</div>
          <div class="pkg-process-step"><span class="p-step-num">3</span><span class="p-step-label">Production</span></div>
          <div class="pkg-process-arrow">→</div>
          <div class="pkg-process-step"><span class="p-step-num">4</span><span class="p-step-label">2 révisions max</span></div>
          <div class="pkg-process-arrow">→</div>
          <div class="pkg-process-step"><span class="p-step-num">5</span><span class="p-step-label">Validation finale</span></div>
          <div class="pkg-process-arrow">→</div>
          <div class="pkg-process-step"><span class="p-step-num">6</span><span class="p-step-label">Solde 50%</span></div>
          <div class="pkg-process-arrow">→</div>
          <div class="pkg-process-step"><span class="p-step-num">7</span><span class="p-step-label">Livraison</span></div>
        </div>
      </div>

      <div class="pkg-section">
        <div class="pkg-rules">
          <div class="pkg-rule"><span class="pkg-rule-icon">💰</span><span class="pkg-rule-text"><strong>Paiement :</strong> 50% d'acompte avant le début des travaux, 50% avant la livraison finale</span></div>
          <div class="pkg-rule"><span class="pkg-rule-icon">🔄</span><span class="pkg-rule-text"><strong>Révisions :</strong> Maximum 2 rounds par pack — toute modification supplémentaire fait l'objet d'un nouveau devis</span></div>
          <div class="pkg-rule"><span class="pkg-rule-icon">📅</span><span class="pkg-rule-text"><strong>Délai :</strong> Livraison sous ${p.name === 'Starter Brand Kit' ? '14' : p.name === 'Business Identity Pack' ? '21' : p.name === 'Growth Brand System' ? '30' : '45'} jours calendaires</span></div>
        </div>
      </div>
      ${!isLast ? '<div class="pkg-footer">— Continuez vers le prochain pack —</div>' : ''}
    </div>`
  }).join('')

  return `<!DOCTYPE html><html><head>
    <meta charset="utf-8">
    <title>NI OS — Catalogue des Packs</title>
    <style>
      @page { margin: 0; }
      body { font-family: 'Helvetica', Arial, sans-serif; color: #222; font-size: 11px; line-height: 1.6; margin: 0; padding: 0; }
      .tb { position: fixed; top: 0; left: 0; right: 0; z-index: 999; background: #6c5ce7; padding: 10px 20px; text-align: center; }
      .tb button { background: #fff; color: #6c5ce7; border: none; padding: 8px 24px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
      @media print { .tb { display: none; } }
      .pkg { page-break-after: always; min-height: 297mm; display: flex; flex-direction: column; padding: 24mm 22mm 18mm; box-sizing: border-box; position: relative; }
      .pkg-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 3px solid #6c5ce7; }
      .pkg-name { font-size: 22px; font-weight: 800; color: #6c5ce7; margin: 0; line-height: 1.2; }
      .pkg-price { font-size: 20px; font-weight: 700; white-space: nowrap; }
      .pkg-price small { font-size: 12px; font-weight: 400; color: #888; }
      .pkg-section { margin-bottom: 16px; }
      .pkg-section-title { font-size: 10px; font-weight: 700; color: #6c5ce7; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
      .pkg-list { margin: 0; padding-left: 18px; }
      .pkg-list li { margin-bottom: 4px; font-size: 11px; color: #444; }
      .pkg-cards { display: flex; flex-direction: column; gap: 6px; }
      .pkg-card { display: flex; align-items: center; gap: 8px; background: #f8f6ff; border-radius: 6px; padding: 8px 12px; font-size: 11px; color: #444; }
      .pkg-card-icon { font-size: 16px; flex-shrink: 0; }
      .pkg-why { flex: 1; }
      .pkg-why-line { font-size: 12px; color: #333; margin: 0 0 6px; line-height: 1.7; }
      .pkg-cta { margin-top: 20px; background: #6c5ce7; color: #fff; padding: 14px 20px; border-radius: 8px; font-size: 13px; font-weight: 700; text-align: center; }
      .pkg-process { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; background: #f8f6ff; border-radius: 8px; padding: 10px 14px; }
      .pkg-process-step { display: flex; align-items: center; gap: 5px; }
      .p-step-num { width: 18px; height: 18px; border-radius: 50%; background: #6c5ce7; color: #fff; font-size: 9px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
      .p-step-label { font-size: 9px; color: #555; font-weight: 500; white-space: nowrap; }
      .pkg-process-arrow { color: #ccc; font-size: 10px; }
      .pkg-rules { display: flex; flex-direction: column; gap: 6px; }
      .pkg-rule { display: flex; align-items: flex-start; gap: 8px; font-size: 10px; color: #666; }
      .pkg-rule-icon { flex-shrink: 0; font-size: 12px; }
      .pkg-rule-text { line-height: 1.5; }
      .pkg-rule-text strong { color: #444; }
      .pkg-footer { text-align: center; font-size: 9px; color: #ccc; margin-top: auto; padding-top: 20px; }
      .cover { text-align: center; padding: 60mm 22mm 30mm; min-height: 297mm; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; page-break-after: always; }
      .cover h1 { font-size: 38px; color: #6c5ce7; margin: 0 0 8px; letter-spacing: -1px; }
      .cover .subtitle { font-size: 14px; color: #888; margin-bottom: 6px; }
      .cover .date { font-size: 10px; color: #aaa; }
      .cover .intro { margin-top: 30px; font-size: 11px; color: #666; line-height: 1.8; }
      .cover .cta-large { margin-top: 40px; font-size: 16px; font-weight: 700; color: #6c5ce7; }
    </style>
  </head><body>
    <div class="tb"><button onclick="window.print()">📥 Télécharger le PDF</button></div>
    <div class="cover">
      <h1>NAOUSSI INDUSTRIES</h1>
      <div class="subtitle">Design & Brand Strategy</div>
      <div class="date">${new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      <div class="intro">
        <strong>CATALOGUE DES PACKS</strong><br>
        Découvrez nos formules de branding adaptées à chaque étape de votre croissance.<br>
        Tous les prix sont en FCFA — investissement unique, résultats durables.
      </div>
      <div class="cta-large">👇 Feuilletez pour trouver le pack qui vous correspond</div>
    </div>
    ${body}
    <div style="page-break-after:always;padding:24mm 22mm;min-height:297mm;box-sizing:border-box;">
      <h2 style="font-size:18px;color:#6c5ce7;margin:0 0 20px;">🔍 Vous hésitez encore ?</h2>
      <p style="font-size:12px;color:#555;line-height:1.8;margin-bottom:30px;">
        Chaque entreprise est unique. Si aucun de ces packs ne correspond exactement à vos besoins,<br>
        nous pouvons créer une solution sur mesure pour vous.
      </p>
      <div style="background:#f8f6ff;border-radius:8px;padding:20px;">
        <p style="font-size:12px;color:#333;margin:0 0 6px;"><strong>📞 Contactez-nous pour un devis personnalisé</strong></p>
        <p style="font-size:11px;color:#666;margin:0;">Email : contact@naoussi-industries.com</p>
      </div>
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
