
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

interface ContactFormProps {
  recipientName: string;
  recipientId?: string;
}

const ContactForm: React.FC<ContactFormProps> = ({ recipientName, recipientId }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Contact form submitted:', { recipientId, name, email, subject, message });
      toast({
        title: "Message sent",
        description: `Your message to ${recipientName} has been sent successfully.`,
      });
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contactName" className="block text-sm font-medium text-civic-gray-700 mb-1">
            Name
          </label>
          <Input
            id="contactName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="w-full"
          />
        </div>
        <div>
          <label htmlFor="contactEmail" className="block text-sm font-medium text-civic-gray-700 mb-1">
            Email
          </label>
          <Input
            id="contactEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            required
            className="w-full"
          />
        </div>
      </div>
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-civic-gray-700 mb-1">
          Subject
        </label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="What is this regarding?"
          required
          className="w-full"
        />
      </div>
      <div>
        <label htmlFor="contactMessage" className="block text-sm font-medium text-civic-gray-700 mb-1">
          Message
        </label>
        <Textarea
          id="contactMessage"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Your message..."
          required
          className="w-full min-h-[150px]"
        />
      </div>
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="bg-civic-blue hover:bg-civic-blue-600 text-white"
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  );
};

export default ContactForm;
