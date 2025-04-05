
import React from 'react';
import { MapPin, Mail, Phone } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import ContactForm from '@/components/ui/ContactForm';
import { Separator } from '@/components/ui/separator';

const ContactPage = () => {
  return (
    <PageLayout>
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
          <p className="text-civic-gray-600 mb-8">
            Have questions about our website audits? Want to learn more about how we can help improve your business's online presence? 
            Get in touch with our team.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="mx-auto bg-civic-blue-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Mail className="text-civic-blue w-6 h-6" />
              </div>
              <h3 className="font-medium mb-2">Email Us</h3>
              <p className="text-civic-gray-500 mb-3">For general inquiries</p>
              <a href="mailto:hello@localwebsiteaudit.ca" className="text-civic-blue hover:underline">
                hello@localwebsiteaudit.ca
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="mx-auto bg-civic-blue-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Phone className="text-civic-blue w-6 h-6" />
              </div>
              <h3 className="font-medium mb-2">Call Us</h3>
              <p className="text-civic-gray-500 mb-3">Monday-Friday, 9am-5pm EST</p>
              <a href="tel:+16135551234" className="text-civic-blue hover:underline">
                (613) 555-1234
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="mx-auto bg-civic-blue-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <MapPin className="text-civic-blue w-6 h-6" />
              </div>
              <h3 className="font-medium mb-2">Visit Us</h3>
              <p className="text-civic-gray-500 mb-3">Our Ottawa office</p>
              <address className="not-italic text-civic-blue">
                123 Main Street<br />
                Ottawa, ON K1P 1J1
              </address>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-6">Send Us a Message</h2>
            <ContactForm recipientName="LocalWebsiteAudit Team" recipientId="contact" />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ContactPage;
