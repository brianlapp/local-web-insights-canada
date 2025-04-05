
import React from 'react';
import { Button } from '@/components/ui/button';
import { Send, Mail, MapPin, Phone } from 'lucide-react';

const ContactPage = () => {
  return (
    <div className="py-12 md:py-20">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-civic-gray-900 mb-4">
              Get in Touch
            </h1>
            <p className="text-lg text-civic-gray-600">
              Have questions about our website audit services? We're here to help.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-civic-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-civic-blue" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Email Us</h2>
              <p className="text-civic-gray-600 mb-3">
                We'll respond within 24 hours
              </p>
              <a 
                href="mailto:contact@localwebsiteaudit.ca" 
                className="text-civic-blue hover:text-civic-blue-600 font-medium"
              >
                contact@localwebsiteaudit.ca
              </a>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-civic-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-civic-blue" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Call Us</h2>
              <p className="text-civic-gray-600 mb-3">
                Monday-Friday, 9am-5pm ET
              </p>
              <a 
                href="tel:+1234567890" 
                className="text-civic-blue hover:text-civic-blue-600 font-medium"
              >
                (123) 456-7890
              </a>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-civic-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-civic-blue" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Location</h2>
              <p className="text-civic-gray-600 mb-3">
                Ottawa, Ontario
              </p>
              <span className="text-civic-blue font-medium">
                Remote services across Canada
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">Send us a message</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-civic-gray-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-civic-blue focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-civic-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-civic-blue focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-civic-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-civic-blue focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-civic-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-civic-blue focus:border-transparent"
                  required
                ></textarea>
              </div>
              <Button 
                type="submit"
                className="w-full md:w-auto bg-civic-blue hover:bg-civic-blue-600 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
