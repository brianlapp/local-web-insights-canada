import React from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const isMobile = useIsMobile();
  return <header className="bg-white border-b border-civic-gray-200 sticky top-0 z-50">
      <div className="container py-4 flex justify-between items-center">
        <NavLink to="/" className="flex items-center">
          <img src="/lovable-uploads/bd20067a-032a-44d4-b1f9-36d88719430f.png" alt="LocalWebsiteAudit.ca Logo" className="h-16 mr-2" />
        </NavLink>
        
        {isMobile ? <>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-civic-gray-700 hover:text-civic-blue transition-colors" aria-label={isMenuOpen ? "Close menu" : "Open menu"}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            {isMenuOpen && <div className="fixed inset-0 bg-white z-40 pt-20">
                <nav className="container flex flex-col space-y-4 p-4">
                  <NavLink to="/" className={({
              isActive
            }) => `p-2 ${isActive ? 'text-civic-blue font-medium' : 'text-civic-gray-700'} text-lg`} onClick={() => setIsMenuOpen(false)}>
                    Home
                  </NavLink>
                  <NavLink to="/audits" className={({
              isActive
            }) => `p-2 ${isActive ? 'text-civic-blue font-medium' : 'text-civic-gray-700'} text-lg`} onClick={() => setIsMenuOpen(false)}>
                    Audits
                  </NavLink>
                  <NavLink to="/auditors" className={({
              isActive
            }) => `p-2 ${isActive ? 'text-civic-blue font-medium' : 'text-civic-gray-700'} text-lg`} onClick={() => setIsMenuOpen(false)}>
                    Auditors
                  </NavLink>
                  <NavLink to="/tools" className={({
              isActive
            }) => `p-2 ${isActive ? 'text-civic-blue font-medium' : 'text-civic-gray-700'} text-lg`} onClick={() => setIsMenuOpen(false)}>
                    Tools
                  </NavLink>
                  <NavLink to="/about" className={({
              isActive
            }) => `p-2 ${isActive ? 'text-civic-blue font-medium' : 'text-civic-gray-700'} text-lg`} onClick={() => setIsMenuOpen(false)}>
                    About
                  </NavLink>
                  <a href="#" className="btn-green mt-4" onClick={() => setIsMenuOpen(false)}>
                    Request an Audit
                  </a>
                </nav>
              </div>}
          </> : <nav className="flex items-center space-x-6">
            <NavLink to="/" className={({
          isActive
        }) => isActive ? 'text-civic-blue font-medium' : 'text-civic-gray-700 hover:text-civic-blue transition-colors'}>
              Home
            </NavLink>
            <NavLink to="/audits" className={({
          isActive
        }) => isActive ? 'text-civic-blue font-medium' : 'text-civic-gray-700 hover:text-civic-blue transition-colors'}>
              Audits
            </NavLink>
            <NavLink to="/auditors" className={({
          isActive
        }) => isActive ? 'text-civic-blue font-medium' : 'text-civic-gray-700 hover:text-civic-blue transition-colors'}>
              Auditors
            </NavLink>
            <NavLink to="/tools" className={({
          isActive
        }) => isActive ? 'text-civic-blue font-medium' : 'text-civic-gray-700 hover:text-civic-blue transition-colors'}>
              Tools
            </NavLink>
            <NavLink to="/about" className={({
          isActive
        }) => isActive ? 'text-civic-blue font-medium' : 'text-civic-gray-700 hover:text-civic-blue transition-colors'}>
              About
            </NavLink>
            <a href="#" className="btn-green">
              Request an Audit
            </a>
          </nav>}
      </div>
    </header>;
};
export default Header;