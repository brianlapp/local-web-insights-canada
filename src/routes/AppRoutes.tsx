
import { Routes, Route } from 'react-router-dom'
import { PetitionPage } from '@/pages/petition/[slug]'
import { BusinessAuditPage } from '@/pages/[businessSlug]'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import HomePage from '@/pages/HomePage'
import AuditPage from '@/pages/AuditPage'
import AuditorPage from '@/pages/AuditorPage'
import AuditorsPage from '@/pages/AuditorsPage'
import { ToolsPage } from '@/pages/ToolsPage'
import SignupPage from '@/pages/SignupPage'
import NotFound from '@/pages/NotFound'
import AboutPage from '@/pages/AboutPage'
import ContactPage from '@/pages/ContactPage'
import AuditsPage from '@/pages/AuditsPage'
import CityPage from '@/pages/CityPage'
import CitiesListPage from '@/pages/CitiesListPage'

// Create Query Client
const queryClient = new QueryClient()

export function AppRoutes() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        {/* Static routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/audits" element={<AuditsPage />} />
        <Route path="/cities" element={<CitiesListPage />} />
        <Route path="/cities/:city" element={<CityPage />} />
        <Route path="/auditors" element={<AuditorsPage />} />
        <Route path="/audit" element={<AuditPage />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Dynamic deep-linked routes */}
        <Route path="/:city/:slug" element={<AuditPage />} />
        <Route path="/auditor/:slug" element={<AuditorPage />} />
        <Route path="/petition/:slug" element={<PetitionPage />} />
        <Route path="/:businessSlug" element={<BusinessAuditPage />} />
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </QueryClientProvider>
  )
} 
