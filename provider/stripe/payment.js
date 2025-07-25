// import Stripe from "stripe";
// import dotenv from "dotenv";
// import Payment from "../../models/paymentModel/stripe/payment.model.js";
// import User from '../../models/userModel/user.js';

// dotenv.config();
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// export const buyPlan = async (req, res) => {
//   try {
//     const { plan } = req.body;
//     const user = req.user;

//     const priceId =
//       plan === "Basic"
//         ? process.env.STRIPE_BASIC_PLAN_ID
//         : process.env.STRIPE_PREMIUM_PLAN_ID;

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       mode: "subscription",
//       customer_email: user.email,
//       line_items: [
//         {
//           price: priceId,
//           quantity: 1,
//         },
//       ],
//       metadata: {
//         userId: user._id.toString(),
//         plan: plan,
//       },
//       success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.CLIENT_URL}/cancel`,
//     });

   
//     await Payment.create({
//       userId: user._id,
//       amount: 0, 
//       payment_status: "pending",
//       payment_IntentId: session.id,
//     });

//     return res.status(200).json({ url: session.url });
//   } catch (error) {
//     console.error("Stripe Checkout Error:", error.message);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };



// ///webhook
// export const stripeWebhook = async (req, res) => {
//   const sig = req.headers["stripe-signature"];
//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       req.body, 
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//   } catch (err) {
//     console.error("❌ Webhook signature verification failed:", err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   console.log("🔔 Received Stripe event:", event.type);
//   switch (event.type) {
//     case "checkout.session.completed": {
//       const session = event.data.object;

//       console.log("✅ Subscription checkout completed:", session.id);

//       let invoice = null;
//       if (session.invoice) {
//         invoice = await stripe.invoices.retrieve(session.invoice);
//       }

//       const amountPaid = session.amount_total / 100;
//       const receiptUrl = invoice ? invoice.hosted_invoice_url : null;

//       const userId = session.metadata.userId;
//       const plan = session.metadata.plan;

//       const paymentRecord = await Payment.findOneAndUpdate(
//         { payment_IntentId: session.id },
//         {
//           $set: {
//             amount: amountPaid,
//             payment_status: "completed",
//             receipt_url: receiptUrl,
//             payment_IntentId: session.id,
//             plan: plan,
//           },
//         },
//         { new: true }
//       );

//       console.log("💳 Payment updated in DB:", paymentRecord);

//       if (userId) {
//         await User.findByIdAndUpdate(userId, { plan: plan });
//         console.log(`🎉 User ${userId} upgraded to ${plan}`);
//       }

//       break;
//     }

//     case "invoice.payment_failed": {
//       const invoice = event.data.object;
//       console.warn("❌ Payment failed for subscription:", invoice.subscription);
//     const  paymentfaild = await payment.findOneAndUpdate({ 
//       payment_IntentId: invoice.id },
//       {
//         $set: {
//           payment_status: "failed",
//         },
//       },
//       { new: true }
//     )
//       break;
//     }

//     default:
//       console.log(`ℹ️ Unhandled event type: ${event.type}`);
//   }

//   res.json({ received: true });
// };

import Stripe from "stripe";
import dotenv from "dotenv";
import Payment from "../../models/paymentModel/stripe/payment.model.js";
import User from '../../models/userModel/user.js';
import sendEmail from "../../utils/sendEmail/email.js";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const buyPlan = async (req, res) => {
  try {
    const { plan } = req.body;
    const user = req.user;

    const priceId =
      plan === "Basic"
        ? process.env.STRIPE_BASIC_PLAN_ID
        : process.env.STRIPE_PREMIUM_PLAN_ID;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: user._id.toString(),
        plan: plan,
      },
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    // Save as pending payment
    await Payment.create({
      userId: user._id,
      amount: 0,
      plan: plan,
      payment_status: "pending",
      payment_IntentId: session.id,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("🔔 Received Stripe event:", event.type);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;

      console.log("✅ Subscription checkout completed:", session.id);

      let invoice = null;
      if (session.invoice) {
        invoice = await stripe.invoices.retrieve(session.invoice);
      }

      const amountPaid = session.amount_total ? session.amount_total / 100 : 0;
      const receiptUrl = invoice ? invoice.hosted_invoice_url : null;

      const userId = session.metadata.userId;
      const plan = session.metadata.plan;
      let userEmail = session.customer_email;
      if (!userEmail && userId) {
        const userDoc = await User.findById(userId);
        userEmail = userDoc?.email;
      }
      console.log("User Email:", userEmail);

      const paymentRecord = await Payment.findOneAndUpdate(
        { payment_IntentId: session.id },
        {
          $set: {
            amount: amountPaid,
            payment_status: "completed",
            receipt_url: receiptUrl,
            plan: plan,
          },
        },
        { new: true }
      );

      console.log("💳 Payment updated in DB:", paymentRecord);

      if (userId) {
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);

        await User.findByIdAndUpdate(userId, {
          plan: plan,
          planExpiry: expiryDate,
        });

        console.log(`🎉 User ${userId} upgraded to ${plan} until ${expiryDate}`);
      }
      
   
  if (userEmail) {
    
    const htmlcontent = `
  <div style="font-family: Arial, sans-serif; background: #f4f4f7; padding: 40px; text-align: center;">
    <table style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <tr>
        <td style="background: linear-gradient(135deg, #6C63FF, #8F6CFF); padding: 30px; color: #fff; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🎉 ${plan} Plan Activated!</h1>
        </td>
      </tr>
      <tr>
        <td style="padding: 30px; text-align: left; color: #333;">
          <p style="font-size: 18px; font-weight: 600;">${User.Name},</p>
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Thank you for upgrading to the <b>${plan}</b> plan with <b>AutoBrand</b>!  
            Your premium features are now unlocked 🚀.
          </p>
          <div style="margin: 20px 0; padding: 15px; background: #f8f8ff; border-left: 4px solid #6C63FF; border-radius: 8px;">
            <p style="margin: 5px 0; font-size: 16px;"><b>✅ Amount Paid:</b> ₹${amountPaid}</p>
            <p style="margin: 5px 0; font-size: 16px;"><b>✅ Plan Valid Until:</b> ${new Date().getFullYear() + 1}</p>
          </div>
          ${
            receiptUrl
              ? `<p style="font-size: 16px; text-align: center; margin-top: 20px;">
                  <a href="${receiptUrl}" style="display: inline-block; padding: 12px 20px; background: #6C63FF; color: #fff; text-decoration: none; border-radius: 8px;">
                    📄 View Your Receipt
                  </a>
                </p>`
              : `<p style="color: #777;">No receipt available</p>`
          }
          <p style="font-size: 16px; margin-top: 25px;">Enjoy AutoBrand’s premium features. If you have any questions, feel free to contact us anytime.</p>
          <p style="font-size: 16px;">Cheers,<br> The AutoBrand Team</p>
        </td>
      </tr>
      <tr>
        <td style="background: #f1f1f7; padding: 20px; text-align: center; font-size: 14px; color: #777;">
          © ${new Date().getFullYear()} AutoBrand. All rights reserved.
        </td>
      </tr>
    </table>
  </div>
  `;

    await sendEmail(
    userEmail,
    `Your ${plan} Plan is Activated`,
    htmlcontent
  );

    console.log(`📧 Confirmation email sent to ${userEmail}`);
  }

      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      console.warn("❌ Payment failed for subscription:", invoice.subscription);

      await Payment.findOneAndUpdate(
        { payment_IntentId: invoice.id },
        { $set: { payment_status: "failed" } },
        { new: true }
      );
      
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object;
      console.log("✅ Recurring yearly payment succeeded:", invoice.id);

      const subscriptionId = invoice.subscription;


      break;
    }

    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};