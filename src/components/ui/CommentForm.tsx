
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

interface CommentFormProps {
  businessId: string;
  businessName: string;
}

const CommentForm: React.FC<CommentFormProps> = ({ businessId, businessName }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Comment submitted:', { businessId, name, email, comment });
      toast({
        title: "Comment submitted",
        description: `Your feedback for ${businessName} has been received.`,
      });
      setName('');
      setEmail('');
      setComment('');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-civic-gray-700 mb-1">
            Name
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="w-full"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-civic-gray-700 mb-1">
            Email
          </label>
          <Input
            id="email"
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
        <label htmlFor="comment" className="block text-sm font-medium text-civic-gray-700 mb-1">
          Comment
        </label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this website..."
          required
          className="w-full min-h-[100px]"
        />
      </div>
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="bg-civic-blue hover:bg-civic-blue-600 text-white"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Comment'}
      </Button>
    </form>
  );
};

export default CommentForm;
