
import { Link, useLocation } from 'react-router-dom'
import { useAdminAuth } from '@/providers/AdminAuthProvider'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  Building2,
  ClipboardList,
  LogOut,
  Settings,
  User,
  Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: BarChart3 },
  { name: 'Businesses', href: '/admin/businesses', icon: Building2 },
  { name: 'Scraper', href: '/admin/scraper', icon: Search },
  { name: 'Import', href: '/admin/import', icon: "database" },
  { name: 'Petitions', href: '/admin/petitions', icon: ClipboardList },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { signOut } = useAdminAuth()
  const location = useLocation()

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden w-64 flex-shrink-0 bg-white md:flex md:flex-col">
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex flex-shrink-0 items-center px-4 py-4">
            <Link to="/admin/dashboard" className="flex items-center">
              <img 
                src="/lovable-uploads/af7f3d5a-06a1-4f42-8ffb-d9129686f86b.png" 
                alt="LocalWebsiteAudit.ca Logo" 
                className="h-8"
              />
            </Link>
          </div>
          <nav className="mt-5 flex-1 space-y-1 px-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'group flex items-center rounded-md px-2 py-2 text-sm font-medium',
                    location.pathname === item.href
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      location.pathname === item.href
                        ? 'text-gray-500'
                        : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
          <div className="group block w-full flex-shrink-0">
            <div className="flex items-center">
              <div>
                <User className="inline-block h-9 w-9 rounded-full" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  Admin User
                </p>
                <Button
                  variant="ghost"
                  className="text-xs font-medium text-gray-500 group-hover:text-gray-700"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
          {children}
        </main>
      </div>
    </div>
  )
}
