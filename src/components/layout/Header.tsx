
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const Header = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'text-civic-blue font-medium' : 'text-civic-gray-700 hover:text-civic-blue';
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="font-bold text-2xl text-civic-blue">LocalWebsiteAudit.ca</Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className={`${isActive('/')} transition-colors`}>Home</Link>
            <Link to="/audits" className={`${isActive('/audits')} transition-colors`}>Browse Audits</Link>
            <Link to="/cities" className={`${isActive('/cities')} transition-colors`}>City Pages</Link>
            <Link to="/tools" className={`${isActive('/tools')} transition-colors`}>Free Tools</Link>
            <Link to="/auditors" className={`${isActive('/auditors')} transition-colors`}>Our Auditors</Link>
            <Link to="/about" className={`${isActive('/about')} transition-colors`}>About Us</Link>
            <Link to="/contact" className={`${isActive('/contact')} transition-colors`}>Contact</Link>
          </nav>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="hidden md:flex border-civic-blue text-civic-blue">
              Request an Audit
            </Button>
            <Button className="bg-civic-blue hover:bg-civic-blue-600 text-white">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
