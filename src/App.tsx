import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AdminAuthProvider } from '@/providers/AdminAuthProvider'
import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { LoginPage } from '@/pages/admin/LoginPage'
import { DashboardPage } from '@/pages/admin/DashboardPage'
import HomePage from './pages/HomePage'
import AuditPage from './pages/AuditPage'
import AuditorPage from './pages/AuditorPage'
import NotFound from './pages/NotFound'

// Placeholder components until we implement them
const BusinessList = () => <div>Business List</div>
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
              {/* Admin routes */}
              <Route path="/admin/login" element={<LoginPage />} />
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <Routes>
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route path="businesses" element={<BusinessList />} />
                        <Route path="petitions" element={<PetitionList />} />
                        <Route path="settings" element={<Settings />} />
                      </Routes>
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/:city/:slug" element={<AuditPage />} />
              <Route path="/auditor/:slug" element={<AuditorPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
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
