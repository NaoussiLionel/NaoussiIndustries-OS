import { useState, useEffect, useRef } from 'react'
import { api } from '../api'

function getOverview(data) {
  const { summary, packages, clients, projects, leads, freelancers, invoices, contracts } = data
  const marginPct = summary?.totalRevenue > 0
    ? Math.round(((summary.totalRevenue - summary.totalCosts) / summary.totalRevenue) * 100)
    : 0
  return [
    `📊 **Business Overview**`,
    ``,
    `Revenue: **${(summary?.totalRevenue || 0).toLocaleString()} FCFA**`,
    `Costs: **${(summary?.totalCosts || 0).toLocaleString()} FCFA**`,
    `Overall Margin: **${marginPct}%**`,
    ``,
    `Active Projects: **${projects?.filter(p => p.status === 'Active').length || 0}**`,
    `Completed Projects: **${projects?.filter(p => p.status === 'Completed').length || 0}**`,
    `Clients: **${clients?.length || 0}**`,
    `Open Leads: **${leads?.filter(l => l.status !== 'Closed Won' && l.status !== 'Closed Lost').length || 0}**`,
    `Freelancers: **${freelancers?.length || 0}**`,
    `Invoices: **${invoices?.length || 0}** (Outstanding: **${invoices?.filter(i => i.status === 'Unpaid' || i.status === 'Partial').length || 0}**)`,
    `Contracts: **${contracts?.length || 0}**`,
    ``,
    `📦 Packages: **${packages?.length || 0}** configured`,
    `━━━━━━━━━━━━━━━━━━`,
    `Tip: Ask me about margins, projects, finances, invoices, leads, freelancers, or clients.`
  ].join('\n')
}

function getMargins(data) {
  const projects = data.projects || []
  const packages = data.packages || []
  const lines = ['📈 **Margin Analysis**', '']
  if (projects.length === 0) {
    lines.push('No projects yet. Create a project to see margin analysis.')
    return lines.join('\n')
  }
  const withMargins = projects.map(p => {
    const margin = p.client_price > 0 ? Math.round(((p.client_price - p.freelancer_cost) / p.client_price) * 100) : 0
    return { ...p, margin }
  })
  const green = withMargins.filter(p => p.margin >= 60)
  const orange = withMargins.filter(p => p.margin >= 40 && p.margin < 60)
  const red = withMargins.filter(p => p.margin < 40)
  lines.push(`🟢 Green (60%+): **${green.length}** project(s)`)
  lines.push(`🟠 Orange (40-59%): **${orange.length}** project(s)`)
  lines.push(`🔴 Red (below 40%): **${red.length}** project(s)`)
  if (withMargins.length > 0) {
    const avgMargin = Math.round(withMargins.reduce((s, p) => s + p.margin, 0) / withMargins.length)
    lines.push(`Average Margin: **${avgMargin}%**`)
  }
  lines.push('')
  withMargins.sort((a, b) => a.margin - b.margin).slice(0, 5).forEach(p => {
    const zone = p.margin >= 60 ? '🟢' : p.margin >= 40 ? '🟠' : '🔴'
    lines.push(`${zone} ${p.project_code || '—'} — ${p.company_name || '—'}: **${p.margin}%** (${(p.client_price || 0).toLocaleString()} / ${(p.freelancer_cost || 0).toLocaleString()} FCFA)`)
  })
  if (packages.length > 0) {
    lines.push('')
    lines.push('**Target margins by package:**')
    packages.forEach(p => {
      lines.push(`• ${p.name}: target **${p.target_margin_pct}%**`)
    })
  }
  return lines.join('\n')
}

function getProjects(data) {
  const projects = data.projects || []
  if (projects.length === 0) return 'No projects yet. Create one from the Projects page.'
  const statuses = [...new Set(projects.map(p => p.status))]
  const lines = ['📋 **Projects**', '']
  statuses.forEach(s => {
    const filtered = projects.filter(p => p.status === s)
    if (filtered.length === 0) return
    lines.push(`**${s}** (${filtered.length}):`)
    filtered.forEach(p => {
      const margin = p.client_price > 0 ? Math.round(((p.client_price - p.freelancer_cost) / p.client_price) * 100) : 0
      lines.push(`  ${p.project_code || '—'} · ${p.company_name || '—'} · ${p.package || '—'} · ${margin}% margin`)
    })
    lines.push('')
  })
  return lines.join('\n')
}

function getFinances(data) {
  const summary = data.summary || {}
  const projects = data.projects || []
  const invoices = data.invoices || []
  const lines = ['💰 **Financial Summary**', '']
  lines.push(`Revenue: **${(summary.totalRevenue || 0).toLocaleString()} FCFA**`)
  lines.push(`Costs: **${(summary.totalCosts || 0).toLocaleString()} FCFA**`)
  const margin = summary.totalRevenue > 0 ? Math.round(((summary.totalRevenue - summary.totalCosts) / summary.totalRevenue) * 100) : 0
  lines.push(`Profit: **${((summary.totalRevenue || 0) - (summary.totalCosts || 0)).toLocaleString()} FCFA** (${margin}%)`)
  lines.push('')
  lines.push(`Total projects: **${projects.length}**`)
  const totalFees = projects.reduce((s, p) => s + (p.client_price || 0), 0)
  const totalCosts = projects.reduce((s, p) => s + (p.freelancer_cost || 0), 0)
  lines.push(`Sum of project fees: **${totalFees.toLocaleString()} FCFA**`)
  lines.push(`Sum of freelancer costs: **${totalCosts.toLocaleString()} FCFA**`)
  if (invoices.length > 0) {
    const unpaid = invoices.filter(i => i.status === 'Unpaid' || i.status === 'Partial')
    const totalDue = unpaid.reduce((s, i) => s + (i.amount || 0), 0)
    const totalInvoiced = invoices.reduce((s, i) => s + (i.amount || 0), 0)
    lines.push('')
    lines.push(`Total invoiced: **${totalInvoiced.toLocaleString()} FCFA**`)
    lines.push(`Outstanding: **${totalDue.toLocaleString()} FCFA** (${unpaid.length} invoice(s) unpaid)`)
  }
  return lines.join('\n')
}

function getInvoices(data) {
  const invoices = data.invoices || []
  if (invoices.length === 0) return 'No invoices yet. Create one from the Invoices page.'
  const lines = ['🧾 **Invoices**', '']
  const statuses = [...new Set(invoices.map(i => i.status))]
  statuses.forEach(s => {
    const filtered = invoices.filter(i => i.status === s)
    lines.push(`**${s}** (${filtered.length}):`)
    filtered.forEach(inv => {
      lines.push(`  ${inv.invoice_number || '—'} · ${inv.company_name || '—'} · ${(inv.amount || 0).toLocaleString()} FCFA`)
    })
    lines.push('')
  })
  const unpaid = invoices.filter(i => i.status === 'Unpaid')
  if (unpaid.length > 0) {
    lines.push(`⚠️ **${unpaid.length} unpaid invoice(s)** — follow up with clients.`)
  }
  return lines.join('\n')
}

function getLeads(data) {
  const leads = data.leads || []
  if (leads.length === 0) return 'No leads in the pipeline yet.'
  const lines = ['🔍 **Lead Pipeline**', '']
  const stages = ['Cold Lead', 'Contacted', 'Qualified', 'Proposal Sent', 'Closed Won', 'Closed Lost']
  stages.forEach(stage => {
    const filtered = leads.filter(l => l.status === stage)
    if (filtered.length === 0) return
    lines.push(`**${stage}**: ${filtered.length}`)
    filtered.forEach(l => {
      lines.push(`  ${l.company_name || '—'} · ${l.budget_range || 'No budget'} · ${l.contact_name || '—'}`)
    })
    lines.push('')
  })
  return lines.join('\n')
}

function getClients(data) {
  const clients = data.clients || []
  if (clients.length === 0) return 'No clients registered yet.'
  const lines = ['👥 **Clients**', '']
  clients.forEach(c => {
    lines.push(`• **${c.company_name}** — ${c.contact_name || '—'} · ${c.email || '—'} · ${c.status || 'Active'}`)
  })
  lines.push('')
  const projects = data.projects || []
  const activeClients = [...new Set(projects.filter(p => p.status === 'Active').map(p => p.company_name).filter(Boolean))]
  if (activeClients.length > 0) {
    lines.push(`Active engagements: **${activeClients.join(', ')}**`)
  }
  return lines.join('\n')
}

function getFreelancers(data) {
  const freelancers = data.freelancers || []
  if (freelancers.length === 0) return 'No freelancers registered yet.'
  const lines = ['👤 **Freelancers**', '']
  freelancers.forEach(f => {
    const qualityBadge = f.quality_score >= 8 ? '🟢' : f.quality_score >= 6 ? '🟠' : '🔴'
    const onTimeBadge = f.on_time_pct >= 80 ? '🟢' : f.on_time_pct >= 60 ? '🟠' : '🔴'
    lines.push(`• **${f.name}** — ${f.role || '—'}`)
    lines.push(`  Rate: ${(f.rate_per_task || 0).toLocaleString()} FCFA/task · ${qualityBadge} Quality ${f.quality_score}/10 · ${onTimeBadge} On-time ${f.on_time_pct}%`)
  })
  return lines.join('\n')
}

function getHelp() {
  return [
    '🤖 **I can help you with:**',
    '',
    '• `overview` / `summary` — Full business snapshot',
    '• `margins` / `profit` — Margin analysis per project & zone',
    '• `projects` / `active` — Project list by status',
    '• `finances` / `revenue` / `money` — Financial summary',
    '• `invoices` / `outstanding` / `unpaid` — Invoice status & due amounts',
    '• `leads` / `pipeline` / `follow-up` — Lead pipeline by stage',
    '• `clients` / `customers` — Client list',
    '• `freelancers` / `contractors` — Freelancer roster & ratings',
    '• `rules` / `sop` / `policy` — Business operating rules',
    '',
    'Ask me anything in French or English!'
  ].join('\n')
}

function getRules() {
  return [
    '📜 **Business Operating Rules**',
    '',
    '**Payment Terms**',
    '• 50% deposit BEFORE any work starts',
    '• 50% balance BEFORE final delivery',
    '',
    '**Revisions**',
    '• Maximum 2 revision rounds per package',
    '• Additional changes require a new quote',
    '',
    '**Margin Targets**',
    '• 🟢 Green (60%+): Healthy',
    '• 🟠 Orange (40-59%): Review costs',
    '• 🔴 Red (below 40%): Immediate action needed',
    '',
    '**Freelancer Policy**',
    '• Paid ONLY after client approval',
    '• No direct client contact',
    '• All work reviewed internally',
    '',
    '**SOP Workflow**',
    'Lead Inquiry → Quote → 50% Deposit → Production → Max 2 Revisions → Final Approval → 50% Balance → Delivery',
    '',
    '**Lead Pipeline**',
    'Cold Lead → Contacted → Qualified → Proposal Sent → Closed Won / Closed Lost'
  ].join('\n')
}

function matchIntent(text) {
  const lower = text.toLowerCase()

  const helpWords = ['help', 'hi', 'hello', 'bonjour', 'what can you', 'que peux', 'command', 'capabilities']
  if (helpWords.some(w => lower.includes(w))) return 'help'

  const overviewWords = ['overview', 'summary', 'business', 'snapshot', 'état', 'résumé', 'general']
  if (overviewWords.some(w => lower.includes(w))) return 'overview'

  const marginWords = ['margin', 'profit', 'marge', 'bénéfice', 'zone', 'green', 'orange', 'red', 'ratio']
  if (marginWords.some(w => lower.includes(w))) return 'margins'

  const projectWords = ['project', 'projet', 'active', 'stage', 'workflow', 'status', 'progress']
  if (projectWords.some(w => lower.includes(w))) return 'projects'

  const financeWords = ['finance', 'revenue', 'cost', 'money', 'budget', 'financial', 'chiffre', 'coût', 'dépense', 'profit']
  if (financeWords.some(w => lower.includes(w))) return 'finances'

  const invoiceWords = ['invoice', 'facture', 'outstanding', 'unpaid', 'payment', 'paiement', 'due', 'overdue']
  if (invoiceWords.some(w => lower.includes(w))) return 'invoices'

  const leadWords = ['lead', 'pipeline', 'prospect', 'follow-up', 'follow up', 'qualified', 'cold']
  if (leadWords.some(w => lower.includes(w))) return 'leads'

  const clientWords = ['client', 'customer', 'company', 'société', 'entreprise', 'contact']
  if (clientWords.some(w => lower.includes(w))) return 'clients'

  const freelancerWords = ['freelancer', 'contractor', 'prestataire', 'indépendant', 'talent', 'worker']
  if (freelancerWords.some(w => lower.includes(w))) return 'freelancers'

  const rulesWords = ['rule', 'sop', 'policy', 'procedure', 'process', 'règle', 'procédure', 'workflow']
  if (rulesWords.some(w => lower.includes(w))) return 'rules'

  if (lower.includes('merci') || lower.includes('thanks') || lower.includes('thank')) {
    return 'thanks'
  }

  return 'unknown'
}

const WELCOME = '👋 Bonjour! I\'m your NI OS assistant. Ask me about your business — overview, margins, projects, finances, invoices, leads, clients, freelancers, or operating rules. Type **"help"** to see everything I can do.'

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: WELCOME }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)
  const dataCache = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchData() {
    if (dataCache.current) return dataCache.current
    try {
      const data = await Promise.all([
        api.packages.list().catch(() => []),
        api.clients.list().catch(() => []),
        api.projects.list().catch(() => []),
        api.leads.list().catch(() => []),
        api.freelancers.list().catch(() => []),
        api.invoices.list().catch(() => []),
        api.contracts.list().catch(() => []),
        api.dashboard.summary().catch(() => ({})),
        api.reports.kpi().catch(() => ({})),
      ])
      const result = {
        packages: data[0], clients: data[1], projects: data[2],
        leads: data[3], freelancers: data[4], invoices: data[5],
        contracts: data[6], summary: data[7], kpi: data[8]
      }
      dataCache.current = result
      return result
    } catch {
      return { packages: [], clients: [], projects: [], leads: [], freelancers: [], invoices: [], contracts: [], summary: {}, kpi: {} }
    }
  }

  function formatResponse(intent, data) {
    switch (intent) {
      case 'help': return getHelp()
      case 'overview': return getOverview(data)
      case 'margins': return getMargins(data)
      case 'projects': return getProjects(data)
      case 'finances': return getFinances(data)
      case 'invoices': return getInvoices(data)
      case 'leads': return getLeads(data)
      case 'clients': return getClients(data)
      case 'freelancers': return getFreelancers(data)
      case 'rules': return getRules()
      case 'thanks': return 'You\'re welcome! 😊 Let me know if you need anything else.'
      default: return [
        '🤔 I\'m not sure I understand. Here\'s what I can help with:',
        '',
        '• Overview · Margins · Projects · Finances',
        '• Invoices · Leads · Clients · Freelancers · Rules',
        '',
        'Try asking in a simpler way, or type **"help"** for the full list.'
      ].join('\n')
    }
  }

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setMessages(m => [...m, { role: 'user', text }])
    setInput('')
    setLoading(true)

    try {
      const data = await fetchData()
      const intent = matchIntent(text)
      const response = formatResponse(intent, data)
      // Simulate a short delay for natural feel
      await new Promise(r => setTimeout(r, 300))
      setMessages(m => [...m, { role: 'bot', text: response }])
    } catch (err) {
      console.error('Assistant error:', err)
      setMessages(m => [...m, { role: 'bot', text: '❌ Sorry, something went wrong loading your data. Try again.' }])
    }
    setLoading(false)
  }

  function quickAsk(text) {
    setInput(text)
    setTimeout(() => send(), 100)
  }

  return (
    <div className="chatbot">
      <div className="chatbot-header">
        <div className="chatbot-title">NI OS Assistant</div>
        <div className="chatbot-subtitle">Local · Always available</div>
      </div>

      <div className="chatbot-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chatbot-msg chatbot-msg-${m.role}`}>
            {m.text.split('\n').map((line, j) => (
              <div key={j}>{line}</div>
            ))}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="chatbot-quick">
        <button className="chatbot-q-btn" onClick={() => quickAsk('Give me a business overview')}>Overview</button>
        <button className="chatbot-q-btn" onClick={() => quickAsk('How is my margin looking?')}>Margins</button>
        <button className="chatbot-q-btn" onClick={() => quickAsk('What are my active projects?')}>Projects</button>
        <button className="chatbot-q-btn" onClick={() => quickAsk('Summarize my finances')}>Finances</button>
        <button className="chatbot-q-btn" onClick={() => quickAsk('Any unpaid invoices?')}>Invoices</button>
        <button className="chatbot-q-btn" onClick={() => quickAsk('Show my leads')}>Leads</button>
      </div>

      <div className="chatbot-input">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask about your business..."
        />
        <button className="chatbot-send" onClick={send} disabled={loading}>
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  )
}
