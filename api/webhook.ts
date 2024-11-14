import Stripe from 'stripe';
import { supabase } from '../src/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret!);
  } catch (err: any) {
    return res.status(400).json(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    try {
      // Generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      
      // Create the user account
      const { data: userData, error: userError } = await supabase.auth.signUp({
        email: session.customer_details?.email!,
        password: tempPassword,
        options: {
          data: {
            role: 'standard_admin'
          }
        }
      });

      if (userError) throw userError;

      // Create the album
      const { data: albumData, error: albumError } = await supabase
        .from('albums')
        .insert([
          {
            name: session.metadata?.albumName || 'My Photo Album',
            created_by: userData.user?.id
          }
        ])
        .select()
        .single();

      if (albumError) throw albumError;

      // Send welcome email with password reset link
      await supabase.auth.resetPasswordForEmail(
        session.customer_details?.email!,
        {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`
        }
      );

    } catch (error) {
      console.error('Error processing successful payment:', error);
      return res.status(500).json({ error: 'Error processing payment' });
    }
  }

  res.json({ received: true });
}