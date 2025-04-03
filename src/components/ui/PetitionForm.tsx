
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';

interface PetitionFormProps {
  businessId: string;
  businessName: string;
}

const PetitionForm: React.FC<PetitionFormProps> = ({ businessId, businessName }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLocal, setIsLocal] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Petition submitted:', { businessId, name, email, isLocal, message });
      toast({
        title: "Petition submitted",
        description: `Your support for improving ${businessName}'s website has been recorded.`,
      });
      setName('');
      setEmail('');
      setIsLocal(false);
      setMessage('');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="petitionName" className="block text-sm font-medium text-civic-gray-700 mb-1">
            Name
          </label>
          <Input
            id="petitionName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="w-full"
          />
        </div>
        <div>
          <label htmlFor="petitionEmail" className="block text-sm font-medium text-civic-gray-700 mb-1">
            Email
          </label>
          <Input
            id="petitionEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            required
            className="w-full"
          />
        </div>
      </div>
      <div className="flex items-start space-x-2">
        <Checkbox 
          id="isLocal" 
          checked={isLocal}
          onCheckedChange={(checked) => setIsLocal(checked as boolean)}
        />
        <label 
          htmlFor="isLocal" 
          className="text-sm text-civic-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I am a local resident or frequent customer of this business
        </label>
      </div>
      <div>
        <label htmlFor="petitionMessage" className="block text-sm font-medium text-civic-gray-700 mb-1">
          Why is this improvement important? (Optional)
        </label>
        <Textarea
          id="petitionMessage"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share why you think this website should be improved..."
          className="w-full min-h-[100px]"
        />
      </div>
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="bg-civic-green hover:bg-civic-green-600 text-white"
      >
        {isSubmitting ? 'Submitting...' : 'Sign Petition'}
      </Button>
    </form>
  );
};

export default PetitionForm;
