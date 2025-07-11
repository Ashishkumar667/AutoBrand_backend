import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async(req, res) =>{
    const { amount, plan } = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: plan === 'Basic' ? process.env.STRIPE_BASIC_PLAN_ID : process.env.STRIPE_PREMIUM_PLAN_ID,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/cancel`,
        });

        res.status(200).json({ url: session.url });
    } catch (error) {
        console.error('Stripe Checkout Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const webhookHandler = async(req, res) =>{
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook Error:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
        case 'checkout.session.completed':
            // Handle successful checkout session
            console.log('Checkout session completed:', event.data.object);
            break;
        case 'invoice.payment_succeeded':
            // Handle successful payment
            console.log('Payment succeeded:', event.data.object);
            break;
        default:
            console.warn(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });
}