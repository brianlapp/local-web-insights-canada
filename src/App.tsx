
import { BrowserRouter as Router } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AdminAuthProvider } from '@/providers/AdminAuthProvider'
import { AppRoutes } from '@/routes/AppRoutes'
import './index.css'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <AdminAuthProvider>
            <AppRoutes />
            <Toaster />
            <Sonner />
          </AdminAuthProvider>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App
