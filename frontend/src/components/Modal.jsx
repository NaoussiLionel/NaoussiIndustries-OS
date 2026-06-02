import { NavLink } from 'react-router-dom'
import { useState } from 'react'

export default function Modal({ title, subtitle, children, onClose, wide }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={wide ? { width: 720 } : {}} onClick={e => e.stopPropagation()}>
        <h3>{title}</h3>
        {subtitle && <div className="modal-sub">{subtitle}</div>}
        {children}
      </div>
    </div>
  )
}

export function FormGroup({ label, children }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      {children}
    </div>
  )
}

export function StatusBadge({ status, label }) {
  const map = {
    'Active': 'badge-green',
    'Completed': 'badge-blue',
    'On_Hold': 'badge-orange',
    'On Hold': 'badge-orange',
    'Cold Lead': 'badge-gray',
    'Contacted': 'badge-purple',
    'Qualified': 'badge-orange',
    'Proposal Sent': 'badge-blue',
    'Closed Won': 'badge-green',
    'Closed Lost': 'badge-red',
    'Pending': 'badge-gray',
    'In Progress': 'badge-orange',
    'Past': 'badge-gray',
    'Archived': 'badge-red',
    'On Leave': 'badge-orange',
    'Inactive': 'badge-red',
    'Terminated': 'badge-red',
    'Client': 'badge-purple',
    'Freelancer': 'badge-blue',
    'Client Payment': 'badge-green',
    'Deposit': 'badge-purple',
    'Balance': 'badge-blue',
    'Freelancer Payment': 'badge-orange',
    'Other': 'badge-gray',
  }
  const cls = map[label || status] || 'badge-gray'
  return (
    <span className={`badge ${cls}`}>
      <span className="badge-dot" />
      {label || status}
    </span>
  )
}

export function MarginBadge({ pct }) {
  const p = Number(pct)
  if (isNaN(p)) return null
  if (p >= 60) return <span className="badge badge-green"><span className="badge-dot" />{p.toFixed(0)}%</span>
  if (p >= 40) return <span className="badge badge-orange"><span className="badge-dot" />{p.toFixed(0)}%</span>
  return <span className="badge badge-red"><span className="badge-dot" />{p.toFixed(0)}%</span>
}

export function MarginBar({ pct }) {
  const p = Number(pct)
  if (isNaN(p)) return null
  const color = p >= 60 ? 'var(--green)' : p >= 40 ? 'var(--orange)' : 'var(--red)'
  return (
    <div className="margin-gauge">
      <div className="margin-bar">
        <div className="margin-bar-fill" style={{ width: `${Math.min(p, 100)}%`, background: color }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color, minWidth: 36 }}>{p.toFixed(0)}%</span>
    </div>
  )
}

export function StageFlow({ stages, currentStage }) {
  const stageNames = ['Quote', 'Brief', 'Design', 'Assets', 'Invoices', 'Revisions', 'Delivery']
  const stageKeys = ['01_Quote', '02_Brief', '03_Design_Work', '04_Assets', '05_Invoices', '06_Revisions', '07_Final_Delivery']

  const current = stages ? stages.findIndex(s => s.status === 'In Progress') : -1

  return (
    <div className="stage-flow">
      {stageKeys.map((key, i) => {
        const stage = stages ? stages.find(s => s.stage_name === key) : null
        const status = stage ? stage.status : 'Pending'
        const cls = status === 'Completed' ? 'completed' : status === 'In Progress' ? 'active' : ''
        return (
          <div key={key} className={`stage-step ${cls}`}>
            <div className="stage-circle">
              {status === 'Completed' ? '✓' : i + 1}
            </div>
            <div className="stage-label">{stageNames[i]}</div>
          </div>
        )
      })}
    </div>
  )
}
