import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

type SignupMethod = 'email' | 'sms';

interface SignupFormState {
  name: string;
  email: string;
  phone: string;
  preferences: {
    newsletter: boolean;
    updates: boolean;
  };
  verificationCode: string;
}

const SignupForm: React.FC = () => {
  const [method, setMethod] = useState<SignupMethod>('email');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [formState, setFormState] = useState<SignupFormState>({
    name: '',
    email: '',
    phone: '',
    preferences: {
      newsletter: false,
      updates: false,
    },
    verificationCode: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePreferenceChange = (preference: 'newsletter' | 'updates') => {
    setFormState(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [preference]: !prev.preferences[preference],
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { name, email, phone, preferences } = formState;
      const { data, error } = await supabase.auth.signInWithOtp(
        method === 'email'
          ? {
              email,
              options: {
                data: {
                  name,
                  preferences,
                },
              },
            }
          : {
              phone,
              options: {
                data: {
                  name,
                  preferences,
                },
              },
            }
      );

      if (error) throw error;

      toast({
        title: method === 'email' ? 'Verification email sent' : 'Verification code sent',
        description:
          method === 'email'
            ? `Please check ${email} for verification link`
            : `Please enter the code sent to ${phone}`,
      });

      if (method === 'sms') {
        setShowOtpInput(true);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send verification. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (code: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        type: 'sms',
        phone: formState.phone,
        token: code,
      });

      if (error) throw error;

      toast({
        title: 'Verification successful',
        description: 'You are now signed up!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid verification code. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <RadioGroup
        defaultValue="email"
        value={method}
        onValueChange={(value) => setMethod(value as SignupMethod)}
        className="flex space-x-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="email" id="email" />
          <Label htmlFor="email">Email</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="sms" id="sms" />
          <Label htmlFor="sms">SMS</Label>
        </div>
      </RadioGroup>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={formState.name}
            onChange={handleInputChange}
            placeholder="Your name"
            className="mt-1"
          />
        </div>

        {method === 'email' ? (
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formState.email}
              onChange={handleInputChange}
              placeholder="your.email@example.com"
              required
              pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
              className="mt-1"
            />
          </div>
        ) : (
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formState.phone}
              onChange={handleInputChange}
              placeholder="+1234567890"
              required
              pattern="^\+[0-9]{10,15}$"
              className="mt-1"
            />
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="newsletter"
              checked={formState.preferences.newsletter}
              onCheckedChange={() => handlePreferenceChange('newsletter')}
            />
            <Label htmlFor="newsletter">Receive our newsletter</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="updates"
              checked={formState.preferences.updates}
              onCheckedChange={() => handlePreferenceChange('updates')}
            />
            <Label htmlFor="updates">Receive updates about local businesses</Label>
          </div>
        </div>

        {showOtpInput && method === 'sms' ? (
          <div>
            <Label htmlFor="otp">Verification Code</Label>
            <InputOTP
              maxLength={6}
              value={formState.verificationCode}
              onChange={(value) => {
                setFormState(prev => ({ ...prev, verificationCode: value }));
                if (value.length === 6) {
                  handleVerifyOtp(value);
                }
              }}
              className="mt-1"
              render={({ slots }) => (
                <InputOTPGroup>
                  {slots.map((slot, i) => (
                    <InputOTPSlot key={i} {...slot} index={i} />
                  ))}
                </InputOTPGroup>
              )}
            />
          </div>
        ) : (
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-civic-green hover:bg-civic-green-600 text-white"
          >
            {isSubmitting ? 'Sending...' : 'Sign Up'}
          </Button>
        )}
      </div>
    </form>
  );
};

export default SignupForm; 