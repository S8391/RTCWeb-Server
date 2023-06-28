require('dotenv').config();
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Route for creating a payment session
router.post('/create-session', async (req, res) => {
  const { plan } = req.body;

  try {
    // Create a payment session using Stripe API
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID, // Stripe price ID for the selected plan
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/main.html`, // Redirect URL after successful payment
      cancel_url: `${process.env.CLIENT_URL}/main.html`, // Redirect URL if payment is canceled
      client_reference_id: req.user.id, // User ID or unique identifier for tracking purposes
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating payment session:', error);
    res.status(500).json({ error: 'Failed to create payment session.' });
  }
});

module.exports = router;
