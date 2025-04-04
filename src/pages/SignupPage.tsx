import React from 'react';
import SignupForm from '@/components/forms/SignupForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SignupPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Sign Up for Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SignupForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage; 