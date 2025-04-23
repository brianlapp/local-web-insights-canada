
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AdminAuthProvider } from '@/providers/AdminAuthProvider'
import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { LoginPage } from '@/pages/admin/LoginPage'
import { DashboardPage } from '@/pages/admin/DashboardPage'
import BusinessList from '@/pages/admin/BusinessList'
import BusinessForm from '@/pages/admin/BusinessForm'
import ScraperControl from '@/pages/admin/ScraperControl'
import HomePage from './pages/HomePage'
import AuditPage from './pages/AuditPage'
import AuditorPage from './pages/AuditorPage'
import AuditorsPage from './pages/AuditorsPage'
import AuditsPage from './pages/AuditsPage'
import NotFound from './pages/NotFound'
import AboutPage from './pages/AboutPage'
import { ResetPasswordPage } from './pages/admin/ResetPasswordPage'
import { UpdatePasswordPage } from './pages/admin/UpdatePasswordPage'
import SignupPage from './pages/SignupPage'
import { ToolsPage } from './pages/ToolsPage'
import ContactPage from './pages/ContactPage'
import PageLayout from './components/layout/PageLayout'
import { PetitionPage } from './pages/petition/[slug]'
import { BusinessAuditPage } from './pages/[businessSlug]'

const PetitionList = () => <div>Petition List</div>
const Settings = () => <div>Settings</div>

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <AdminAuthProvider>
            <Routes>
              <Route path="/admin">
                <Route path="login" element={<LoginPage />} />
                <Route path="reset-password" element={<ResetPasswordPage />} />
                <Route path="update-password" element={<UpdatePasswordPage />} />
                <Route element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <Outlet />
                    </AdminLayout>
                  </ProtectedRoute>
                }>
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="businesses" element={<BusinessList />} />
                  <Route path="businesses/new" element={<BusinessForm />} />
                  <Route path="businesses/:id" element={<BusinessForm />} />
                  <Route path="scraper" element={<ScraperControl />} />
                  <Route path="petitions" element={<PetitionList />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Route>

              <Route element={<PageLayout><Outlet /></PageLayout>}>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/auditors" element={<AuditorsPage />} />
                <Route path="/audits" element={<AuditsPage />} />
                <Route path="/audit" element={<AuditPage />} />
                <Route path="/tools" element={<ToolsPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/:city/:slug" element={<AuditPage />} />
                <Route path="/auditor/:slug" element={<AuditorPage />} />
                <Route path="/petition/:slug" element={<PetitionPage />} />
                <Route path="/:businessSlug" element={<BusinessAuditPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </AdminAuthProvider>
          <Toaster />
          <Sonner />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App
