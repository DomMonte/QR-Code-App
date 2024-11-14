import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { supabase } from '../lib/supabase';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const setupAccount = async () => {
      const sessionId = searchParams.get('session_id');
      if (!sessionId) {
        setError('Invalid session');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.functions.supabase.co/stripe-webhook`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ 
            type: 'checkout.session.completed',
            data: { 
              object: { 
                id: sessionId 
              } 
            }
          })
        });

        if (!response.ok) throw new Error('Failed to process payment');

        // Wait a moment for the account to be created
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to set up your account. Please contact support.');
      } finally {
        setLoading(false);
      }
    };

    setupAccount();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-lg text-foreground">Setting up your account...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="bg-destructive/10 text-destructive rounded-lg p-4 mb-4 max-w-md text-center">
          {error}
        </div>
        <Button onClick={() => navigate('/')}>Return Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Payment Successful!
        </h1>
        <p className="text-muted-foreground mb-8">
          Check your email for instructions to set up your password and access your new photo album.
        </p>
        <Button onClick={() => navigate('/login')}>
          Sign In
        </Button>
      </div>
    </div>
  );
}