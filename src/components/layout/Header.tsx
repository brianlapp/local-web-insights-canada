
import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Primary navigation items
  const primaryNavItems = [
    { title: 'Audits', path: '/audits' },
    { title: 'Tools', path: '/tools' },
    { title: 'Auditors', path: '/auditors' },
    { title: 'About', path: '/about' },
    { title: 'Contact', path: '/contact' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 py-3 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center" onClick={closeMenu}>
            <img 
              src="/lovable-uploads/af7f3d5a-06a1-4f42-8ffb-d9129686f86b.png" 
              alt="LocalWebsiteAudit.ca Logo" 
              className="h-10 md:h-12"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <ul className="flex space-x-1 lg:space-x-3">
              {primaryNavItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => cn(
                      "text-civic-gray-700 hover:text-civic-blue-600 px-3 py-2 text-sm lg:text-base rounded-md transition-colors",
                      isActive && "text-civic-blue-600 font-medium bg-civic-blue-50"
                    )}
                  >
                    {item.title}
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="flex items-center space-x-2 ml-3">
              <Button
                variant="outline"
                size="sm"
                className="border-civic-blue text-civic-blue hover:bg-civic-blue-50 hidden sm:inline-flex"
                asChild
              >
                <Link to="/audit">Request Audit</Link>
              </Button>
              <Button 
                size="sm" 
                className="bg-civic-green hover:bg-civic-green-600"
                asChild
              >
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          </nav>

          {/* Mobile menu button */}
          <button
            className="block md:hidden text-civic-gray-600 focus:outline-none"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobile && isMenuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden pt-4 pb-2 animate-in slide-in-from-top-5 duration-300 ease-out"
          >
            <nav className="bg-white rounded-lg shadow-lg border border-gray-100">
              <ul className="flex flex-col">
                {primaryNavItems.map((item) => (
                  <li key={item.path} className="border-b border-gray-100 last:border-b-0">
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => cn(
                        "block px-4 py-3 text-civic-gray-700 hover:text-civic-blue-600 hover:bg-civic-blue-50 transition-colors",
                        isActive && "text-civic-blue-600 font-medium bg-civic-blue-50"
                      )}
                      onClick={closeMenu}
                    >
                      {item.title}
                    </NavLink>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col space-y-3 m-4 pt-2 border-t border-gray-100">
                <Button
                  variant="outline"
                  className="border-civic-blue text-civic-blue hover:bg-civic-blue-50 w-full justify-center"
                  asChild
                  onClick={closeMenu}
                >
                  <Link to="/audit">Request an Audit</Link>
                </Button>
                <Button
                  className="bg-civic-green hover:bg-civic-green-600 w-full justify-center"
                  asChild
                  onClick={closeMenu}
                >
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
