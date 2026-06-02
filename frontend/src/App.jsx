import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Leads from './pages/Leads'
import Freelancers from './pages/Freelancers'
import Projects from './pages/Projects'
import Contracts from './pages/Contracts'
import Financial from './pages/Financial'
import Invoices from './pages/Invoices'
import PricingPackages from './pages/PricingPackages'
import Reports from './pages/Reports'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/freelancers" element={<Freelancers />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/contracts" element={<Contracts />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/financial" element={<Financial />} />
        <Route path="/pricing" element={<PricingPackages />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
