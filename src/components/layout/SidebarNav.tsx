
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  HomeIcon, 
  LayoutDashboardIcon, 
  SearchIcon, 
  RadarIcon,
  FileSpreadsheetIcon,
  CogIcon,
  UsersIcon,
  HelpCircleIcon 
} from 'lucide-react';

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  collapsed?: boolean;
}

export function SidebarNav({ className, collapsed = false, ...props }: SidebarNavProps) {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <nav className={cn("flex flex-col", className)} {...props}>
      <div className="space-y-1">
        <Link
          to="/"
          className={cn(
            "flex items-center py-2 px-3 text-sm rounded-md",
            collapsed ? "justify-center" : "",
            isActive("/") ? "bg-secondary" : "hover:bg-secondary/80"
          )}
        >
          <HomeIcon className={cn("h-4 w-4", collapsed ? "mx-auto" : "mr-2")} />
          {!collapsed && <span>Home</span>}
        </Link>
        <Link
          to="/admin/dashboard"
          className={cn(
            "flex items-center py-2 px-3 text-sm rounded-md",
            collapsed ? "justify-center" : "",
            isActive("/admin/dashboard") ? "bg-secondary" : "hover:bg-secondary/80"
          )}
        >
          <LayoutDashboardIcon className={cn("h-4 w-4", collapsed ? "mx-auto" : "mr-2")} />
          {!collapsed && <span>Dashboard</span>}
        </Link>
        <Link
          to="/search"
          className={cn(
            "flex items-center py-2 px-3 text-sm rounded-md",
            collapsed ? "justify-center" : "",
            isActive("/search") ? "bg-secondary" : "hover:bg-secondary/80"
          )}
        >
          <SearchIcon className={cn("h-4 w-4", collapsed ? "mx-auto" : "mr-2")} />
          {!collapsed && <span>Search</span>}
        </Link>
        <Link
          to="/admin/scraper"
          className={cn(
            "flex items-center py-2 px-3 text-sm rounded-md",
            collapsed ? "justify-center" : "",
            isActive("/admin/scraper") ? "bg-secondary" : "hover:bg-secondary/80"
          )}
        >
          <RadarIcon className={cn("h-4 w-4", collapsed ? "mx-auto" : "mr-2")} />
          {!collapsed && <span>Scraper</span>}
        </Link>
        <Link
          to="/admin/import"
          className={cn(
            "flex items-center py-2 px-3 text-sm rounded-md",
            collapsed ? "justify-center" : "",
            isActive("/admin/import") ? "bg-secondary" : "hover:bg-secondary/80"
          )}
        >
          <FileSpreadsheetIcon className={cn("h-4 w-4", collapsed ? "mx-auto" : "mr-2")} />
          {!collapsed && <span>Import</span>}
        </Link>
      </div>
      
      <div className="mt-auto space-y-1 pt-4">
        <Link
          to="/settings"
          className={cn(
            "flex items-center py-2 px-3 text-sm rounded-md",
            collapsed ? "justify-center" : "",
            isActive("/settings") ? "bg-secondary" : "hover:bg-secondary/80"
          )}
        >
          <CogIcon className={cn("h-4 w-4", collapsed ? "mx-auto" : "mr-2")} />
          {!collapsed && <span>Settings</span>}
        </Link>
        <Link
          to="/users"
          className={cn(
            "flex items-center py-2 px-3 text-sm rounded-md",
            collapsed ? "justify-center" : "",
            isActive("/users") ? "bg-secondary" : "hover:bg-secondary/80"
          )}
        >
          <UsersIcon className={cn("h-4 w-4", collapsed ? "mx-auto" : "mr-2")} />
          {!collapsed && <span>Users</span>}
        </Link>
        <Link
          to="/help"
          className={cn(
            "flex items-center py-2 px-3 text-sm rounded-md",
            collapsed ? "justify-center" : "",
            isActive("/help") ? "bg-secondary" : "hover:bg-secondary/80"
          )}
        >
          <HelpCircleIcon className={cn("h-4 w-4", collapsed ? "mx-auto" : "mr-2")} />
          {!collapsed && <span>Help</span>}
        </Link>
      </div>
    </nav>
  );
}
