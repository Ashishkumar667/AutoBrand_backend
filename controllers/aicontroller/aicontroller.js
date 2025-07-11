import Snapshot from "../models/snapModel/snapshot.js";
import { OpenAI } from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateInsight = async (req, res) => {
  const { brandId } = req.body;
  try {
    const data = await Snapshot.find({ brandId }).sort({ createdAt: -1 }).limit(20);
    const prompt = `Analyze the following product snapshots and summarize trends:\n${JSON.stringify(data)}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    res.status(200).json({ insight: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
