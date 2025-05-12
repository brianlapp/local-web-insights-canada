
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const services = [
  {
    title: 'Manicure',
    description: 'Professional nail care and styling',
    image: '/images/manicure.jpg',
    link: '/services#manicure'
  },
  {
    title: 'Pedicure',
    description: 'Relaxing foot treatment and nail care',
    image: '/images/pedicure.jpg',
    link: '/services#pedicure'
  },
  {
    title: 'Spa Packages',
    description: 'Complete relaxation and rejuvenation',
    image: '/images/spa-package.jpg',
    link: '/services#packages'
  }
];

const FeaturedServices: React.FC = () => {
  return (
    <section className="container mx-auto py-16 px-4">
      <h2 className="text-3xl md:text-4xl font-playfair font-bold text-center mb-12">Our Featured Services</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <motion.div
            key={service.title}
            initial={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-all"
          >
            <img 
              src={service.image} 
              alt={service.title} 
              className="w-full h-64 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <Link 
                to={service.link} 
                className="text-primary hover:underline"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedServices;
