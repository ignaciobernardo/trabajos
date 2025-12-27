const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../db/database');

// Create payment intent
router.post('/create-intent', async (req, res) => {
  const { jobId, amount = 2500 } = req.body; // $25.00 in cents
  
  if (!jobId) {
    return res.status(400).json({ error: 'Job ID is required' });
  }
  
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      metadata: {
        jobId: jobId.toString()
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    // Update job with payment intent ID
    const database = db.getDb();
    database.run(
      'UPDATE jobs SET payment_intent_id = ? WHERE id = ?',
      [paymentIntent.id, jobId],
      (err) => {
        if (err) {
          console.error('Error updating payment intent:', err);
        }
      }
    );
    
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Webhook handler for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  const database = db.getDb();
  
  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      const jobId = paymentIntent.metadata.jobId;
      
      // Update job payment status
      database.run(
        'UPDATE jobs SET payment_status = ? WHERE id = ?',
        ['paid', jobId],
        (err) => {
          if (err) {
            console.error('Error updating payment status:', err);
          } else {
            console.log(`Payment succeeded for job ${jobId}`);
          }
        }
      );
      break;
      
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      const failedJobId = failedPayment.metadata.jobId;
      
      database.run(
        'UPDATE jobs SET payment_status = ? WHERE id = ?',
        ['failed', failedJobId],
        (err) => {
          if (err) {
            console.error('Error updating payment status:', err);
          }
        }
      );
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  res.json({ received: true });
});

// Verify payment status
router.get('/verify/:paymentIntentId', async (req, res) => {
  const { paymentIntentId } = req.params;
  
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    res.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

module.exports = router;

