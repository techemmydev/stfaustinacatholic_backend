import axios from "axios";
import crypto from "crypto";
import Donation from "../models/Donationschema.js";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

// ═══════════════════════════════════════════════════════════════
//  PUBLIC
// ═══════════════════════════════════════════════════════════════

/**
 * POST /api/donations/initialize
 * Creates a pending donation record and initialises a Paystack transaction.
 * Returns { authorizationUrl, reference, accessCode } to the frontend.
 */
export const initializeDonation = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      amount, // Naira — we convert to kobo for Paystack
      project,
      donationType,
      frequency,
      message,
    } = req.body;

    if (!name || !email || !amount || !project) {
      return res
        .status(400)
        .json({ message: "name, email, amount and project are required." });
    }

    if (amount < 100) {
      return res
        .status(400)
        .json({ message: "Minimum donation amount is ₦100." });
    }

    // ── Call Paystack initialize endpoint ────────────────────────
    const paystackRes = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: Math.round(amount * 100), // kobo
        currency: "NGN",
        metadata: {
          name,
          phone: phone || "",
          project,
          donationType,
          frequency: frequency || "none",
          message: message || "",
          custom_fields: [
            { display_name: "Donor Name", variable_name: "name", value: name },
            {
              display_name: "Project",
              variable_name: "project",
              value: project,
            },
            {
              display_name: "Donation Type",
              variable_name: "type",
              value: donationType,
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
      },
    );

    const { authorization_url, reference, access_code } = paystackRes.data.data;

    // ── Save pending donation to DB ──────────────────────────────
    const donation = new Donation({
      name,
      email,
      phone: phone || "",
      amount,
      project,
      donationType,
      frequency: donationType === "recurring" ? frequency : "none",
      message: message || "",
      paystackReference: reference,
      paystackAccessCode: access_code,
      status: "pending",
    });

    await donation.save();

    return res.status(200).json({
      message: "Transaction initialized.",
      authorizationUrl: authorization_url,
      reference,
      accessCode: access_code,
    });
  } catch (error) {
    console.error("initializeDonation error:", error?.response?.data || error);
    return res
      .status(500)
      .json({ message: "Failed to initialize payment. Please try again." });
  }
};

/**
 * GET /api/donations/verify/:reference
 * Called by the frontend after Paystack popup closes successfully.
 * Verifies with Paystack and updates the donation record.
 */
export const verifyDonation = async (req, res) => {
  try {
    const { reference } = req.params;

    // ── Verify with Paystack ─────────────────────────────────────
    const paystackRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
      },
    );

    const txData = paystackRes.data.data;
    const status = txData.status === "success" ? "success" : "failed";

    // ── Update donation record ───────────────────────────────────
    const donation = await Donation.findOneAndUpdate(
      { paystackReference: reference },
      {
        status,
        verifiedAt: status === "success" ? new Date() : null,
      },
      { new: true },
    );

    if (!donation) {
      return res.status(404).json({ message: "Donation record not found." });
    }

    return res.status(200).json({
      message: status === "success" ? "Payment verified." : "Payment failed.",
      status,
      donation,
    });
  } catch (error) {
    console.error("verifyDonation error:", error?.response?.data || error);
    return res.status(500).json({ message: "Verification failed." });
  }
};

/**
 * POST /api/donations/webhook
 * Paystack webhook — handles charge.success server-to-server.
 * Must be registered in your Paystack dashboard as a webhook URL.
 */
export const paystackWebhook = async (req, res) => {
  try {
    // ── Validate Paystack signature ──────────────────────────────
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(401).json({ message: "Invalid signature." });
    }

    const { event, data } = req.body;

    if (event === "charge.success") {
      await Donation.findOneAndUpdate(
        { paystackReference: data.reference },
        { status: "success", verifiedAt: new Date() },
      );
    }

    if (event === "charge.failed") {
      await Donation.findOneAndUpdate(
        { paystackReference: data.reference },
        { status: "failed" },
      );
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error("paystackWebhook error:", error);
    return res.sendStatus(500);
  }
};

// ═══════════════════════════════════════════════════════════════
//  ADMIN
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/admin/donations
 * Returns all donations, newest first.
 */
export const getAllDonationsAdmin = async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.status(200).json(donations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

/**
 * GET /api/admin/donations/stats
 * Returns summary stats for the admin dashboard.
 */
export const getDonationStats = async (req, res) => {
  try {
    const [total, successful, pending, failed] = await Promise.all([
      Donation.countDocuments(),
      Donation.countDocuments({ status: "success" }),
      Donation.countDocuments({ status: "pending" }),
      Donation.countDocuments({ status: "failed" }),
    ]);

    // Total amount raised (successful only)
    const amountResult = await Donation.aggregate([
      { $match: { status: "success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalAmount = amountResult[0]?.total || 0;

    res.status(200).json({ total, successful, pending, failed, totalAmount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

/**
 * DELETE /api/admin/donations/:id
 * Delete a donation record.
 */
export const deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findByIdAndDelete(req.params.id);
    if (!donation)
      return res.status(404).json({ message: "Donation not found." });
    res.status(200).json({ message: "Donation deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};
