
import { Link } from "react-router-dom"
import { Phone, Mail, MapPin } from "lucide-react"

const Footer = () => {
  return (
    <footer className="bg-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a href="tel:+16137798540" className="hover:text-primary">(613) 779-8540</a>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                2430 Bank St #9, Ottawa, ON K1V 0T7
              </p>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/services" className="hover:text-primary">Services</Link></li>
              <li><Link to="/gallery" className="hover:text-primary">Gallery</Link></li>
              <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
              <li><Link to="/book" className="hover:text-primary">Book Now</Link></li>
            </ul>
          </div>
          
          {/* Hours */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Hours</h3>
            <ul className="space-y-1">
              <li>Monday - Friday: 9:30 AM - 7:30 PM</li>
              <li>Saturday: 9:30 AM - 6:30 PM</li>
              <li>Sunday: 11:00 AM - 5:00 PM</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} LuxMe Nails and Spa. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
