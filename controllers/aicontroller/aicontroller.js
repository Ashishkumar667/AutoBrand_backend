import Snapshot from "../../models/snapmodel/snapshot.js";
import Subscription from "../../models/subscriptionModel/subscriptionmodel.js";
import redis from "../../utils/redis/ioredis.js";
import { OpenAI } from "openai";
import { sendPriceDropEmail } from "../../utils/sendEmail/AlertEmail/emailAlert.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateInsight = async (req, res) => {
  const { brandId } = req.body;
  const userId = req.user._id;

  try {

    const sub = await Subscription.findOne({ userId }) || { plan: "free" };
    const plan = sub.plan || "free";


    const cacheKey = `insight:${userId}:${brandId}:${plan}`;


    if (plan === "free") {
      const cachedInsight = await redis.get(cacheKey);
      if (cachedInsight) {
        console.log(" Returning cached insight");
        return res.status(200).json({ plan, insight: JSON.parse(cachedInsight), cached: true });
      }
    }


    const snapshotLimit = plan === "premium" ? 50 : plan === "basic" ? 30 : 15;

    const snapshots = await Snapshot.find({ brandId })
      .sort({ createdAt: -1 })
      .limit(snapshotLimit)
      .lean();

    if (!snapshots.length) {
      return res.status(404).json({ insight: "No snapshots found for this brand." });
    }

    const productName = snapshots[0]?.productName || "Unknown Product";


    let prompt;
    if (plan === "premium") {
      prompt = `
        You are an expert e-commerce analyst. 
        Analyze these product snapshots deeply:
        1. Price trend (changes, drops, discounts)
        2. Stock trend (out-of-stock %, restock intervals)
        3. Recommended pricing & stock strategy
        4. Any anomalies or actionable insights
        5. Predict next possible price movement
        
        Data: ${JSON.stringify(snapshots)}
      `;
    } else if (plan === "basic") {
      prompt = `
        Summarize these product snapshots in detail:
        - Price trend
        - Stock trend
        - Key insights for the user
        
        Data: ${JSON.stringify(snapshots)}
      `;
    } else {
      prompt = `
        Give a SHORT summary of these product snapshots:
        - Price trend
        - Stock availability
        - 1 quick recommendation
        
        Data: ${JSON.stringify(snapshots)}
      `;
    }

    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    const insight = completion.choices[0].message.content;

    if (plan === "free") {
      await redis.setex(cacheKey, 3600, JSON.stringify(insight)); 
    }

  
    if (plan !== "free") {
      const [latest, previous] = snapshots.slice(0, 2);
      if (previous && latest) {

        if (latest.price < previous.price) {
          await sendPriceDropEmail(
            req.user.email,
            ` Price Drop Alert: ${productName}`,
            `<h2>Price Dropped!</h2>
             <p><b>${productName}</b> is now <b>₹${latest.price}</b> (was ₹${previous.price})</p>
             <a href="${latest.productUrl}">View Product</a>`
          );
        }

        if (!previous.inStock && latest.inStock) {
          await sendPriceDropEmail(
            req.user.email,
            ` Restock Alert: ${productName}`,
            `<h2>Back in Stock!</h2>
             <p><b>${productName}</b> is now available for ₹${latest.price}</p>
             <a href="${latest.productUrl}">Buy Now</a>`
          );
        }
      }
    }

    return res.status(200).json({ plan, insight, cached: false });

  } catch (err) {
    console.error(" Insight generation failed:", err);
    return res.status(500).json({ error: err.message });
  }
};
