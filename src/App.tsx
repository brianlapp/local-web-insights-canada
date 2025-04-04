import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { AdminAuthProvider } from '@/providers/AdminAuthProvider'
import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { LoginPage } from '@/pages/admin/LoginPage'

// Placeholder components until we implement them
const Dashboard = () => <div>Dashboard</div>
const BusinessList = () => <div>Business List</div>
const PetitionList = () => <div>Petition List</div>
const Settings = () => <div>Settings</div>

function App() {
  return (
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
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="businesses" element={<BusinessList />} />
                    <Route path="petitions" element={<PetitionList />} />
                    <Route path="settings" element={<Settings />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Public routes will go here */}
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </AdminAuthProvider>
      <Toaster />
    </Router>
  )
}

export default App
