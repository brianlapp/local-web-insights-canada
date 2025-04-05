import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/schema';

interface PetitionFormProps {
  businessId: string;
  businessName: string;
}

// Define types for our petition signature using the database schema
type PetitionSignature = Database['public']['Tables']['petition_signatures'];

const PetitionForm: React.FC<PetitionFormProps> = ({ businessId, businessName }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLocal, setIsLocal] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setHasError(false);

    // Trim all input values
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    // Create petition data
    const petitionData: PetitionSignature = {
      petition_id: businessId,
      name: trimmedName,
      email: trimmedEmail,
      is_local: isLocal,
      message: trimmedMessage || null,
    };

    try {
      const { error } = await supabase
        .from('petition_signatures')
        .insert(petitionData as any); // Type assertion as a workaround

      if (error) {
        setHasError(true);
        let errorMessage = 'Please try again later.';

        // Handle specific error cases
        if (error.code === '23505') {
          errorMessage = 'You have already signed this petition.';
        } else if (error.code === '429') {
          errorMessage = 'Too many requests. Please try again in a few minutes.';
        }

        toast({
          title: 'Error submitting petition',
          description: errorMessage,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Petition submitted',
        description: `Your support for improving ${businessName}'s website has been recorded.`,
      });

      // Reset form only on success
      setName('');
      setEmail('');
      setIsLocal(false);
      setMessage('');
    } catch (error) {
      setHasError(true);
      toast({
        title: 'Error submitting petition',
        description: 'Please try again later.',
        variant: 'destructive',
      });
      console.error('Petition submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
            aria-invalid={hasError}
            className={`w-full ${hasError ? 'border-red-500' : ''}`}
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
            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
            aria-invalid={hasError}
            className={`w-full ${hasError ? 'border-red-500' : ''}`}
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
        className={`bg-civic-green hover:bg-civic-green-600 text-white ${isSubmitting ? 'opacity-50' : ''}`}
      >
        {isSubmitting ? 'Submitting...' : 'Sign Petition'}
      </Button>
    </form>
  );
};

export default PetitionForm;
