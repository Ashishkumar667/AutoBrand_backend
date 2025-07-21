import Snapshot from "../../models/snapmodel/snapshot.js";
import User from "../../models/userModel/user.js";
import { OpenAI } from "openai";
import { sendPriceDropEmail } from "../../utils/sendEmail/AlertEmail/emailAlert.js"; 

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateInsight = async (req, res) => {
  const { brandId } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    const plan = user?.plan || "free";

    const snapshots = await Snapshot.find({ brandId })
      .sort({ createdAt: -1 })
      .limit(plan === "premium" ? 50 : 20);

    if (!snapshots.length) {
      return res.status(404).json({ insight: "No snapshots found for this brand." });
    }

  
    const productName = snapshots[0]?.productName || "Unknown Product";

   
    let prompt = `Analyze these product snapshots and give a SHORT summary with:
      - Price trend
      - Stock trend
      - Any important changes

      Data:
      ${JSON.stringify(snapshots)}
    `;

    if (plan === "premium") {
      prompt = `Analyze these product snapshots in detail and give:
        1. Price trend (changes, drops, discounts)
        2. Stock trend (out-of-stock %, restock intervals)
        3. Recommended pricing & stock strategy
        4. Any anomalies or insights
        5.Give more and exact details

        Data:
        ${JSON.stringify(snapshots)}
      `;
    }

   
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    const insight = completion.choices[0].message.content;

    if (plan === "premium" || plan === "basic") {
      const recentTwo = snapshots.slice(0, 2); 
      if (recentTwo.length === 2) {
        const [latest, previous] = recentTwo;

        if (latest.price < previous.price) {
          await sendPriceDropEmail(
            user.email,
            `📉 Price Drop Alert: ${productName}`,
            `<h2>Price Dropped!</h2>
            <p><b>${productName}</b> is now <b>₹${latest.price}</b> (was ₹${previous.price})</p>
            <a href="${latest.productUrl}">View Product</a>`
          );
        }

       
        if (!previous.inStock && latest.inStock) {
          await sendPriceDropEmail(
            user.email,
            `✅ Restock Alert: ${productName}`,
            `<h2>Back in Stock!</h2>
            <p><b>${productName}</b> is now available for ₹${latest.price}</p>
            <a href="${latest.productUrl}">Buy Now</a>`
          );
        }
      }
    }

   
    res.status(200).json({ plan, insight });

  } catch (err) {
    console.error("Insight generation failed:", err);
    res.status(500).json({ error: err.message });
  }
};
