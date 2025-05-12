
import React from 'react';
import { Link } from 'react-router-dom';
import { Phone } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="container py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-playfair font-bold text-primary">
            LuxMe
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-primary">Home</Link>
            <Link to="/services" className="text-gray-600 hover:text-primary">Services</Link>
            <Link to="/gallery" className="text-gray-600 hover:text-primary">Gallery</Link>
            <Link to="/contact" className="text-gray-600 hover:text-primary">Contact</Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <a href="tel:+16137798540" className="flex items-center text-primary">
              <Phone className="w-4 h-4 mr-2" />
              (613) 779-8540
            </a>
            <Link 
              to="/book"
              className="btn btn-primary px-6 py-2"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
