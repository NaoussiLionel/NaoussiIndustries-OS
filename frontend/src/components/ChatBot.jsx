import { useState, useEffect, useRef } from 'react'
import { api } from '../api'

const knowledge = [
  { keywords: ['margin', 'green', 'zone', '60'], response: '🟢 **Green Zone (60%–100%):** Healthy margin. Maintain your pricing strategy. Consider premium positioning for even higher returns.' },
  { keywords: ['margin', 'orange', 'zone', '40'], response: '🟠 **Orange Zone (40%–59%):** Warning. Review freelancer costs or increase client pricing. Target is 60%+.' },
  { keywords: ['margin', 'red', 'zone', '39'], response: '🔴 **Red Zone (0%–39%):** Critical. Immediately review why this project is losing money. Renegotiate or restructure.' },
  { keywords: ['pricing', 'package', 'price', 'starter', 'brand kit'], response: '📦 **Starter Brand Kit:** 80–150 FCFA client · 30–60 FCFA freelancer · Target: 60% margin. Basic logo + brand identity.' },
  { keywords: ['pricing', 'package', 'business identity'], response: '📦 **Business Identity Pack:** 150–300 FCFA client · 60–120 FCFA freelancer · Target: 65% margin. Full business identity suite.' },
  { keywords: ['pricing', 'package', 'growth', 'brand system'], response: '📦 **Growth Brand System:** 300–700 FCFA client · 120–250 FCFA freelancer · Target: 70% margin. Comprehensive brand system.' },
  { keywords: ['pricing', 'package', 'premium', 'strategy'], response: '📦 **Premium Strategy Pack:** 700–1 500+ FCFA client · 250–500 FCFA freelancer · Target: 75% margin. Strategic brand development.' },
  { keywords: ['deposit', 'payment', '50', 'rule'], response: '💳 **Payment Policy:** 50% deposit BEFORE any work starts. 50% balance BEFORE final delivery. No exceptions without written approval.' },
  { keywords: ['revision', 'round', 'max', '2', 'scope'], response: '📋 **Revision Policy:** Maximum 2 revision rounds per package. Additional changes = new quote. No scope creep.' },
  { keywords: ['freelancer', 'pay', 'paid', 'rule', 'client approval'], response: '🤝 **Freelancer Rules:** Paid ONLY after client approval. No direct client contact. All work reviewed internally first.' },
  { keywords: ['sop', 'workflow', 'stage', 'process', 'quote', 'delivery'], response: '📌 **SOP Workflow:** Lead Inquiry → Quote → 50% Deposit → Production → Max 2 Revisions → Final Approval → 50% Balance → Delivery. 7 stages in the project flow.' },
  { keywords: ['project', 'status', 'active', 'completed', 'hold'], response: '📊 **Project Statuses:** Active = in progress, Completed = done, On Hold = paused. Use the stage flow to track progress step by step.' },
  { keywords: ['lead', 'pipeline', 'cold', 'qualified', 'proposal', 'won'], response: '▶️ **Lead Pipeline:** Cold Lead → Contacted → Qualified → Proposal Sent → Closed Won/Closed Lost. Track each stage in the pipeline.' },
  { keywords: ['invoice', 'create', 'new', 'generate'], response: '📄 **Invoices:** Create Deposit invoices at Stage 1 (Quote → Deposit) and Balance invoices at Stage 7 (Final Delivery). Use the Invoice page to manage all billing.' },
  { keywords: ['contract', 'client', 'freelancer'], response: '📝 **Contracts:** Client contracts define scope and payment terms. Freelancer contracts define deliverables and rates. Both enforce NI OS operating rules.' },
  { keywords: ['hello', 'hi', 'hey', 'help', 'what', 'how'], response: '👋 Welcome to NI OS Assistant! Ask me about:\n• **Pricing packages** and margin targets\n• **Payment rules** (50/50 deposit/balance)\n• **Margin zones** (green/orange/red)\n• **SOP workflow** and revision policy\n• **Freelancer rules**\n• **Project status** or **lead pipeline' },
]

function findAnswer(text) {
  const lower = text.toLowerCase()
  for (const item of knowledge) {
    if (item.keywords.some(k => lower.includes(k))) {
      return item.response
    }
  }
  return null
}

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: '👋 Bonjour! I\'m your NI OS business assistant. Ask me about pricing, margins, payment rules, workflows, or anything about running your design business.' }
  ])
  const [input, setInput] = useState('')
  const [summary, setSummary] = useState(null)
  const endRef = useRef(null)

  useEffect(() => {
    api.dashboard.summary().then(setSummary).catch(() => {})
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function send() {
    const text = input.trim()
    if (!text) return
    setMessages(m => [...m, { role: 'user', text }])
    setInput('')

    setTimeout(() => {
      const answer = findAnswer(text)

      if (answer) {
        setMessages(m => [...m, { role: 'bot', text: answer }])
        return
      }

      if (summary && (text.toLowerCase().includes('project') || text.toLowerCase().includes('active'))) {
        setMessages(m => [...m, { role: 'bot', text: `📊 Currently you have **${summary.activeProjects} active** and **${summary.completedProjects} completed** projects.` }])
        return
      }

      if (summary && (text.toLowerCase().includes('client') || text.toLowerCase().includes('customer'))) {
        setMessages(m => [...m, { role: 'bot', text: `👥 You have **${summary.totalClients} active clients** registered in the system.` }])
        return
      }

      if (summary && (text.toLowerCase().includes('lead') || text.toLowerCase().includes('pipeline'))) {
        setMessages(m => [...m, { role: 'bot', text: `▶️ You have **${summary.openLeads} open leads** in your pipeline.` }])
        return
      }

      if (summary && (text.toLowerCase().includes('freelancer') || text.toLowerCase().includes('team'))) {
        setMessages(m => [...m, { role: 'bot', text: `👥 You have **${summary.activeFreelancers} active freelancers** on the team.` }])
        return
      }

      if (text.toLowerCase().includes('revenue') || text.toLowerCase().includes('profit') || text.toLowerCase().includes('money')) {
        const rev = summary?.totalRevenue || 0
        const cost = summary?.totalCosts || 0
        const margin = rev > 0 ? ((rev - cost) / rev * 100).toFixed(0) : 0
        setMessages(m => [...m, { role: 'bot', text: `💰 Total Revenue: **${rev.toLocaleString()} FCFA** · Total Costs: **${cost.toLocaleString()} FCFA** · Margin: **${margin}%**` }])
        return
      }

      setMessages(m => [...m, {
        role: 'bot',
        text: '🤔 I\'m not sure about that. Try asking about:\n• **Pricing packages** ("what are my packages?")\n• **Payment rules** ("how does payment work?")\n• **Margin zones** ("what is green zone?")\n• **SOP workflow** ("how does a project flow?")\n• **Freelancer rules** ("when do I pay freelancers?")'
      }])
    }, 400)
  }

  function quickAsk(text) {
    setInput(text)
    setTimeout(() => send(), 50)
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
              <div className="chatbot-subtitle">Business knowledge base</div>
            </div>
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
            <button className="chatbot-q-btn" onClick={() => quickAsk('What are my pricing packages?')}>Pricing</button>
            <button className="chatbot-q-btn" onClick={() => quickAsk('How does payment work?')}>Payment</button>
            <button className="chatbot-q-btn" onClick={() => quickAsk('What is the green zone?')}>Margins</button>
            <button className="chatbot-q-btn" onClick={() => quickAsk('How does the project workflow go?')}>Workflow</button>
            <button className="chatbot-q-btn" onClick={() => quickAsk('How do I create an invoice?')}>Invoices</button>
            <button className="chatbot-q-btn" onClick={() => quickAsk('What are the freelancer rules?')}>Freelancers</button>
          </div>

          <div className="chatbot-input">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask about your business..."
            />
            <button className="chatbot-send" onClick={send}>Send</button>
          </div>
        </div>
      )}
    </div>
  )
}
