import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { supabase } from '../src/lib/supabase';

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

app.use(cors());
app.use(express.json());

// Create checkout session
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { albumName } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Photo Album Package',
              description: '6 months access to your photo album'
            },
            unit_amount: 14999, // $149.99
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/`,
      metadata: {
        albumName: albumName || 'My Photo Album'
      }
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Webhook handler for successful payments
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed');
    return res.status(400).send('Webhook Error');
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    try {
      // Create user account
      const { data: userData, error: userError } = await supabase.auth.signUp({
        email: session.customer_details?.email!,
        password: Math.random().toString(36).slice(-8),
        options: {
          data: {
            role: 'standard_admin'
          }
        }
      });

      if (userError) throw userError;

      // Create album
      const { error: albumError } = await supabase
        .from('albums')
        .insert([
          {
            name: session.metadata?.albumName || 'My Photo Album',
            created_by: userData.user?.id
          }
        ]);

      if (albumError) throw albumError;

      // Send password reset email
      await supabase.auth.resetPasswordForEmail(
        session.customer_details?.email!,
        {
          redirectTo: `${process.env.FRONTEND_URL}/reset-password`
        }
      );
    } catch (error) {
      console.error('Error processing payment:', error);
      return res.status(500).json({ error: 'Failed to process payment' });
    }
  }

  res.json({ received: true });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});