import { NavLink, useLocation } from 'react-router-dom'

const sections = [
  {
    label: 'Overview',
    links: [
      { to: '/', label: 'Dashboard', icon: '◈' },
      { to: '/reports', label: 'Reports & KPIs', icon: '◎' },
    ]
  },
  {
    label: 'Operations',
    links: [
      { to: '/projects', label: 'Projects', icon: '●' },
      { to: '/invoices', label: 'Invoices', icon: '📄' },
      { to: '/clients', label: 'Clients', icon: '◆' },
      { to: '/leads', label: 'Leads Pipeline', icon: '▶' },
    ]
  },
  {
    label: 'Resources',
    links: [
      { to: '/freelancers', label: 'Freelancers', icon: '○' },
      { to: '/contracts', label: 'Contracts', icon: '◈' },
    ]
  },
  {
    label: 'Finance',
    links: [
      { to: '/financial', label: 'Financial', icon: '▲' },
      { to: '/pricing', label: 'Pricing', icon: '★' },
    ]
  }
]

export default function Layout({ children }) {
  const location = useLocation()
  const pageTitle = sections
    .flatMap(s => s.links)
    .find(l => l.to === location.pathname)?.label || 'NI OS Admin'

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-brand">
          <h1>NI OS</h1>
          <div className="subtitle">Admin Portal v1.0</div>
        </div>
        <div className="sidebar-nav">
          {sections.map(section => (
            <div key={section.label}>
              <div className="sidebar-section-label">{section.label}</div>
              {section.links.map(link => (
                <NavLink key={link.to} to={link.to} end={link.to === '/'}>
                  <span className="nav-icon">{link.icon}</span>
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </div>
        <div className="sidebar-footer">
          Naoussi Industries OS
        </div>
      </nav>
      <div className="main">
        <div className="main-header">
          <h2>{pageTitle}</h2>
        </div>
        <div className="main-body">{children}</div>
      </div>
    </div>
  )
}
