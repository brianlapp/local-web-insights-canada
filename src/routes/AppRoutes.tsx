import { Routes, Route, NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { PetitionPage } from '@/pages/petition/[slug]'
import { BusinessAuditPage } from '@/pages/[businessSlug]'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Page components
const HomePage = () => (
  <div>
    <h1>Welcome to Local Website Insights</h1>
  </div>
)

const AuditPage = () => (
  <div>
    <h1>Website Audit</h1>
  </div>
)

const ToolsPage = () => (
  <div>
    <h1>SEO Tools</h1>
  </div>
)

const SignupPage = () => (
  <div>
    <h1>Sign Up</h1>
  </div>
)

const NotFoundPage = () => (
  <div>
    <h1>404 - Page Not Found</h1>
    <NavLink to="/">Back to Home</NavLink>
  </div>
)

// Create Query Client
const queryClient = new QueryClient()

export function AppRoutes() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        {/* Skip to content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:p-4"
        >
          Skip to content
        </a>

        {/* Header */}
        <header role="banner" className="bg-white shadow-sm">
          <nav role="navigation" className="container mx-auto px-4 py-4">
            <ul className="flex space-x-6">
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    cn(
                      'transition-colors hover:text-primary',
                      isActive ? 'text-primary' : 'text-gray-600'
                    )
                  }
                  end
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/audit"
                  className={({ isActive }) =>
                    cn(
                      'transition-colors hover:text-primary',
                      isActive ? 'text-primary' : 'text-gray-600'
                    )
                  }
                >
                  Audit
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/tools"
                  className={({ isActive }) =>
                    cn(
                      'transition-colors hover:text-primary',
                      isActive ? 'text-primary' : 'text-gray-600'
                    )
                  }
                >
                  Tools
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/signup"
                  className={({ isActive }) =>
                    cn(
                      'transition-colors hover:text-primary',
                      isActive ? 'text-primary' : 'text-gray-600'
                    )
                  }
                >
                  Sign Up
                </NavLink>
              </li>
            </ul>
          </nav>
        </header>

        {/* Main content */}
        <main id="main-content" className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            {/* Static routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/audit" element={<AuditPage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* Dynamic deep-linked routes */}
            <Route path="/petition/:slug" element={<PetitionPage />} />
            <Route path="/:businessSlug" element={<BusinessAuditPage />} />
            
            {/* 404 route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer
          role="contentinfo"
          className="bg-gray-50 border-t border-gray-200 py-8"
        >
          <div className="container mx-auto px-4">
            <p className="text-center text-gray-600">
              © {new Date().getFullYear()} Local Website Insights. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  )
} 