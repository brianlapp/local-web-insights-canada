
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Mail, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-civic-gray-100 border-t border-civic-gray-200">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold text-civic-blue mb-4">LocalWebsiteAudit.ca</h3>
            <p className="text-civic-gray-600 mb-4">
              We help communities improve local websites through audits, feedback, and resources.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-civic-gray-500 hover:text-civic-blue transition-colors" aria-label="Email">
                <Mail size={20} />
              </a>
              <a href="#" className="text-civic-gray-500 hover:text-civic-blue transition-colors" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-civic-gray-500 hover:text-civic-blue transition-colors" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-civic-gray-500 hover:text-civic-blue transition-colors" aria-label="Instagram">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-civic-blue mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <NavLink to="/" className="text-civic-gray-600 hover:text-civic-blue transition-colors">
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/audits" className="text-civic-gray-600 hover:text-civic-blue transition-colors">
                  Audits
                </NavLink>
              </li>
              <li>
                <NavLink to="/auditors" className="text-civic-gray-600 hover:text-civic-blue transition-colors">
                  Auditors
                </NavLink>
              </li>
              <li>
                <NavLink to="/tools" className="text-civic-gray-600 hover:text-civic-blue transition-colors">
                  Tools
                </NavLink>
              </li>
              <li>
                <NavLink to="/about" className="text-civic-gray-600 hover:text-civic-blue transition-colors">
                  About
                </NavLink>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-civic-blue mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-civic-gray-600 hover:text-civic-blue transition-colors">
                  Website Guide
                </a>
              </li>
              <li>
                <a href="#" className="text-civic-gray-600 hover:text-civic-blue transition-colors">
                  SEO Basics
                </a>
              </li>
              <li>
                <a href="#" className="text-civic-gray-600 hover:text-civic-blue transition-colors">
                  Accessibility Tips
                </a>
              </li>
              <li>
                <a href="#" className="text-civic-gray-600 hover:text-civic-blue transition-colors">
                  Free Tools
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-civic-blue mb-4">Contact</h3>
            <p className="text-civic-gray-600 mb-2">
              Have questions or suggestions?
            </p>
            <a href="mailto:info@localwebsiteaudit.ca" className="text-civic-blue hover:underline">
              info@localwebsiteaudit.ca
            </a>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-civic-gray-200 text-center text-civic-gray-500 text-sm">
          <p>© {new Date().getFullYear()} LocalWebsiteAudit.ca. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
