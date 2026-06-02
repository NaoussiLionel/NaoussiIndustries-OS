import { useState, useEffect, useRef } from 'react'
import { api } from '../api'

function buildSystemPrompt(data) {
  const pkgs = data.packages || []
  const clients = data.clients || []
  const projects = data.projects || []
  const leads = data.leads || []
  const freelancers = data.freelancers || []
  const invoices = data.invoices || []
  const contracts = data.contracts || []
  const kpi = data.kpi || {}

  const activeProjects = projects.filter(p => p.status === 'Active').length
  const completedProjects = projects.filter(p => p.status === 'Completed').length
  const totalRevenue = data.summary?.totalRevenue || 0
  const totalCosts = data.summary?.totalCosts || 0
  const marginPct = totalRevenue > 0 ? Math.round((totalRevenue - totalCosts) / totalRevenue * 100) : 0

  return `You are the NI OS (Naoussi Industries Operating System) business assistant. You help the business owner run their design/brand strategy agency.

BUSINESS RULES:
- Payment: 50% deposit BEFORE any work starts. 50% balance BEFORE final delivery.
- Revisions: Maximum 2 revision rounds per package. Additional changes require a new quote.
- Margin targets: Minimum 60%. Green zone = 60%+, Orange = 40-59%, Red = below 40%.
- Freelancers: Paid ONLY after client approval. No direct client contact. All work reviewed internally.
- SOP Workflow: Lead Inquiry → Quote → 50% Deposit → Production → Max 2 Revisions → Final Approval → 50% Balance → Delivery.
- Lead Pipeline: Cold Lead → Contacted → Qualified → Proposal Sent → Closed Won / Closed Lost.

PRICING PACKAGES (in FCFA):
${pkgs.length > 0 ? pkgs.map(p => `- ${p.name}: Client ${p.client_price} FCFA · Freelancer ${p.freelancer_cost} FCFA · Target ${p.target_margin_pct}% margin`).join('\n') : 'No packages configured yet.'}

MARGIN ZONE SYSTEM:
- 🟢 Green (60%+): Healthy. Maintain pricing. Consider premium positioning.
- 🟠 Orange (40-59%): Warning. Review freelancer costs or increase pricing.
- 🔴 Red (below 40%): Critical. Immediate review needed.

PROJECT DURATIONS BY PACKAGE:
- Starter Brand Kit: 14 days
- Business Identity Pack: 21 days
- Growth Brand System: 30 days
- Premium Strategy Pack: 45 days

CURRENT BUSINESS DATA (live):
- Active Projects: ${activeProjects}
- Completed Projects: ${completedProjects}
- Total Clients: ${data.summary?.totalClients || 0}
- Open Leads: ${data.summary?.openLeads || 0}
- Active Freelancers: ${data.summary?.activeFreelancers || 0}
- Revenue: ${totalRevenue.toLocaleString()} FCFA
- Costs: ${totalCosts.toLocaleString()} FCFA
- Overall Margin: ${marginPct}%

RECENT PROJECTS:
${projects.slice(0, 5).map(p => {
  const margin = p.client_price > 0 ? Math.round((p.client_price - p.freelancer_cost) / p.client_price * 100) : 0
  return `- ${p.project_code}: ${p.company_name || '—'} · ${p.package || '—'} · ${p.client_price} FCFA · ${margin}% margin · Status: ${p.status}`
}).join('\n')}

${clients.length > 0 ? `CLIENTS (${clients.length}):\n${clients.slice(0, 10).map(c => `- ${c.company_name} (${c.contact_name || '—'}) · ${c.email || '—'} · Status: ${c.status || 'Active'}`).join('\n')}` : ''}

${leads.length > 0 ? `\nLEADS (${leads.length}):\n${leads.slice(0, 10).map(l => `- ${l.company_name} · ${l.status} · ${l.budget_range || '—'}`).join('\n')}` : ''}

${freelancers.length > 0 ? `\nFREELANCERS (${freelancers.length}):\n${freelancers.slice(0, 10).map(f => `- ${f.name} · ${f.role} · ${f.rate_per_task} FCFA/task · Quality: ${f.quality_score}/10 · On-time: ${f.on_time_pct}%`).join('\n')}` : ''}

${invoices.length > 0 ? `\nINVOICES (${invoices.length}):\n${invoices.slice(0, 5).map(inv => `- ${inv.invoice_number || '—'}: ${inv.company_name || '—'} · ${inv.amount} FCFA · ${inv.status}`).join('\n')}` : ''}

${contracts.length > 0 ? `\nCONTRACTS (${contracts.length}):\n${contracts.slice(0, 5).map(c => `- ${c.name || c.id}: ${c.client_name || c.freelancer_name || '—'} · ${c.contract_type} · ${c.status}`).join('\n')}` : ''}

Respond conversationally in French or English based on the user's language. Be concise but helpful. Give specific data-driven answers when possible. If the user asks about something not in the data, say you don't have that information yet. Use emojis sparingly.`
}

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: '👋 Bonjour! I\'m your NI OS assistant powered by AI. Ask me anything about your business — projects, clients, finances, or operating rules.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [puterReady, setPuterReady] = useState(typeof window !== 'undefined' && window.puter)
  const endRef = useRef(null)

  useEffect(() => {
    if (window.puter) { setPuterReady(true); return }
    const check = setInterval(() => {
      if (window.puter) { setPuterReady(true); clearInterval(check) }
    }, 500)
    return () => clearInterval(check)
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchContext() {
    try {
      const [packages, clients, projects, leads, freelancers, invoices, contracts, summary, kpi] = await Promise.all([
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
      return { packages, clients, projects, leads, freelancers, invoices, contracts, summary, kpi }
    } catch { return { packages: [], clients: [], projects: [], leads: [], freelancers: [], invoices: [], contracts: [], summary: {}, kpi: {} } }
  }

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setMessages(m => [...m, { role: 'user', text }])
    setInput('')
    setLoading(true)

    if (!puterReady) {
      setMessages(m => [...m, { role: 'bot', text: '⚠️ AI is not available yet. Please make sure you are signed in to Puter.com when prompted, or try again in a moment.' }])
      setLoading(false)
      return
    }

    try {
      const context = await fetchContext()
      const systemPrompt = buildSystemPrompt(context)
      const chatMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.filter(m => m.role !== 'system').slice(-10).map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })),
        { role: 'user', content: text },
      ]

      let fullResponse = ''
      const stream = await window.puter.ai.chat(chatMessages, { stream: true, model: 'gpt-4.1-nano' })
      setMessages(m => [...m, { role: 'bot', text: '' }])

      for await (const part of stream) {
        fullResponse += part?.text || ''
        setMessages(m => {
          const updated = [...m]
          updated[updated.length - 1] = { role: 'bot', text: fullResponse }
          return updated
        })
      }
    } catch (err) {
      console.error('Puter AI error:', err)
      setMessages(m => [...m, { role: 'bot', text: `❌ AI error: ${err.message || 'Could not reach AI. Try again.'}` }])
    }
    setLoading(false)
  }

  function quickAsk(text) {
    setInput(text)
    setTimeout(() => send(), 100)
  }

  return (
    <div className={`chatbot ${open ? 'chatbot-open' : ''}`}>
      <button className="chatbot-toggle" onClick={() => setOpen(!open)} title="Business Assistant">
        <span className="chatbot-toggle-icon">{open ? '✕' : '💬'}</span>
        <span className="chatbot-toggle-label">Assistant</span>
      </button>

      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <div>
              <div className="chatbot-title">NI OS Assistant</div>
              <div className="chatbot-subtitle">AI · {puterReady ? 'Connected' : 'Loading...'}</div>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chatbot-msg chatbot-msg-${m.role}`}>
                {m.text.split('\n').map((line, j) => (
                  <div key={j}>{line}</div>
                ))}
                {loading && i === messages.length - 1 && m.role === 'bot' && (
                  <span className="chatbot-cursor">▊</span>
                )}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="chatbot-quick">
            <button className="chatbot-q-btn" onClick={() => quickAsk('Give me a business overview')}>Overview</button>
            <button className="chatbot-q-btn" onClick={() => quickAsk('How is my margin looking?')}>Margins</button>
            <button className="chatbot-q-btn" onClick={() => quickAsk('What are my active projects?')}>Projects</button>
            <button className="chatbot-q-btn" onClick={() => quickAsk('Summarize my finances')}>Finances</button>
            <button className="chatbot-q-btn" onClick={() => quickAsk('Any overdue invoices?')}>Invoices</button>
            <button className="chatbot-q-btn" onClick={() => quickAsk('Who owes me follow-ups?')}>Leads</button>
          </div>

          <div className="chatbot-input">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder={puterReady ? 'Ask about your business...' : 'Waiting for AI connection...'}
              disabled={!puterReady}
            />
            <button className="chatbot-send" onClick={send} disabled={!puterReady || loading}>
              {loading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
