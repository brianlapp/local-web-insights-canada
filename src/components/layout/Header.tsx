
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, X, Search, Wrench, Users, Info, MessageSquare } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Header = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'text-civic-blue font-medium' : 'text-civic-gray-700 hover:text-civic-blue';
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="font-bold text-2xl text-civic-blue">LocalWebsiteAudit.ca</Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/audits" className={`${isActive('/audits')} transition-colors flex items-center gap-1`}>
              <Search className="w-4 h-4" />
              <span>Browse Audits</span>
            </Link>
            <Link to="/cities" className={`${isActive('/cities')} transition-colors flex items-center gap-1`}>
              <span>City Pages</span>
            </Link>
            <Link to="/tools" className={`${isActive('/tools')} transition-colors flex items-center gap-1`}>
              <Wrench className="w-4 h-4" />
              <span>Free Tools</span>
            </Link>
            <Link to="/auditors" className={`${isActive('/auditors')} transition-colors flex items-center gap-1`}>
              <Users className="w-4 h-4" />
              <span>Our Auditors</span>
            </Link>
            <Link to="/about" className={`${isActive('/about')} transition-colors flex items-center gap-1`}>
              <Info className="w-4 h-4" />
              <span>About Us</span>
            </Link>
            <Link to="/contact" className={`${isActive('/contact')} transition-colors flex items-center gap-1`}>
              <MessageSquare className="w-4 h-4" />
              <span>Contact</span>
            </Link>
          </nav>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {!isMobile && (
              <Button variant="outline" className="hidden md:flex border-civic-blue text-civic-blue">
                Request an Audit
              </Button>
            )}
            <Button className="bg-civic-blue hover:bg-civic-blue-600 text-white">
              Sign In
            </Button>
            
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden ml-2 text-gray-600" 
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 border-t pt-4 pb-2">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/audits" 
                className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-gray-100" 
                onClick={() => setMobileMenuOpen(false)}
              >
                <Search className="w-5 h-5 text-civic-blue" />
                <span>Browse Audits</span>
              </Link>
              <Link 
                to="/cities" 
                className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-gray-100" 
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>City Pages</span>
              </Link>
              <Link 
                to="/tools" 
                className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-gray-100" 
                onClick={() => setMobileMenuOpen(false)}
              >
                <Wrench className="w-5 h-5 text-civic-blue" />
                <span>Free Tools</span>
              </Link>
              <Link 
                to="/auditors" 
                className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-gray-100" 
                onClick={() => setMobileMenuOpen(false)}
              >
                <Users className="w-5 h-5 text-civic-blue" />
                <span>Our Auditors</span>
              </Link>
              <Link 
                to="/about" 
                className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-gray-100" 
                onClick={() => setMobileMenuOpen(false)}
              >
                <Info className="w-5 h-5 text-civic-blue" />
                <span>About Us</span>
              </Link>
              <Link 
                to="/contact" 
                className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-gray-100" 
                onClick={() => setMobileMenuOpen(false)}
              >
                <MessageSquare className="w-5 h-5 text-civic-blue" />
                <span>Contact</span>
              </Link>
              <Button 
                className="w-full mt-2 bg-civic-blue text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Request an Audit
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
