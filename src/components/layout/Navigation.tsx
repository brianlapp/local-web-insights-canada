
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="fixed w-full bg-white shadow-sm z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-playfair font-bold text-primary">
            LuxMe Nails & Spa
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/services" className="text-gray-600 hover:text-primary transition-colors">
              Services
            </Link>
            <Link to="/gallery" className="text-gray-600 hover:text-primary transition-colors">
              Gallery
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-primary transition-colors">
              Contact
            </Link>
          </div>

          {/* Contact & Book Button */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="tel:+16137798540" className="flex items-center text-primary">
              <Phone className="w-4 h-4 mr-2" />
              (613) 779-8540
            </a>
            <Button asChild>
              <Link to="/book">Book Now</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-600 hover:text-primary"
            onClick={toggleMenu}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/"
                className="text-gray-600 hover:text-primary px-2 py-1"
                onClick={toggleMenu}
              >
                Home
              </Link>
              <Link 
                to="/services"
                className="text-gray-600 hover:text-primary px-2 py-1"
                onClick={toggleMenu}
              >
                Services
              </Link>
              <Link 
                to="/gallery"
                className="text-gray-600 hover:text-primary px-2 py-1"
                onClick={toggleMenu}
              >
                Gallery
              </Link>
              <Link 
                to="/contact"
                className="text-gray-600 hover:text-primary px-2 py-1"
                onClick={toggleMenu}
              >
                Contact
              </Link>
              <Button asChild className="w-full mt-4">
                <Link to="/book">Book Now</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
