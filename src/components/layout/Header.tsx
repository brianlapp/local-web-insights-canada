
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
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

  // Navigation items with Tools and Auditors restored
  const navItems = [
    { title: 'Home', path: '/' },
    { title: 'About', path: '/about' },
    { title: 'Auditors', path: '/auditors' },
    { title: 'Audit', path: '/audit' }, 
    { title: 'Tools', path: '/tools' }
  ];

  return (
    <header className="bg-white border-b border-gray-200 py-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/af7f3d5a-06a1-4f42-8ffb-d9129686f86b.png" 
              alt="LocalWebsiteAudit.ca Logo" 
              className="h-12"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6">
            <ul className="flex space-x-6">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "text-civic-gray-700 hover:text-civic-blue-600 transition-colors",
                      isActive(item.path) && "text-civic-blue-600 font-medium"
                    )}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex items-center space-x-4 ml-6">
              <Button
                variant="outline"
                className="border-civic-blue text-civic-blue hover:bg-civic-blue-50"
                asChild
              >
                <Link to="/audit">Request an Audit</Link>
              </Button>
              <Button className="bg-civic-blue hover:bg-civic-blue-600" asChild>
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
            className="md:hidden pt-4 pb-2 animate-in slide-in-from-top-5"
          >
            <nav>
              <ul className="flex flex-col space-y-3">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={cn(
                        "block py-2 text-civic-gray-700 hover:text-civic-blue-600 transition-colors",
                        isActive(item.path) && "text-civic-blue-600 font-medium"
                      )}
                      onClick={closeMenu}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="flex flex-col space-y-3 mt-4 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                className="border-civic-blue text-civic-blue hover:bg-civic-blue-50 w-full justify-center"
                asChild
                onClick={closeMenu}
              >
                <Link to="/audit">Request an Audit</Link>
              </Button>
              <Button
                className="bg-civic-blue hover:bg-civic-blue-600 w-full justify-center"
                asChild
                onClick={closeMenu}
              >
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
