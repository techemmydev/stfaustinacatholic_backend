import { Subscriber } from "../models/SubscribersSchema.js";

export const Subscribers = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // ✅ Check if the email already exists
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ error: "Email already subscribed!" });
    }

    // ✅ Insert only if email is new
    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();

    res.status(201).json({ message: "Successfully subscribed!" });
  } catch (error) {
    console.error("Error submitting subscription:", error);
    res.status(500).json({ error: "Server error" });
  }
};
