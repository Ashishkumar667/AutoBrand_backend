import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendPriceDropEmail(to, product) {
  const htmlContent = `
  <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 20px;">
    <div style="max-width: 600px; background: white; padding: 20px; border-radius: 10px; margin: auto;">
      <h2 style="color: #2b2b2b; text-align: center;">💰 Price Drop Alert!</h2>
      
      <p style="font-size: 16px; color: #555;">
        The price of <strong>${product.productName}</strong> has dropped!
      </p>

      <div style="padding: 15px; background: #f0f0f0; border-radius: 8px; text-align: center;">
        <p style="margin: 8px 0; font-size: 18px; color: #d9534f;">Old Price: <s>₹${product.oldPrice}</s></p>
        <p style="margin: 8px 0; font-size: 20px; color: #28a745;">New Price: <strong>₹${product.newPrice}</strong></p>
        <p style="margin: 8px 0; font-size: 16px; color: ${product.inStock ? "#28a745" : "#d9534f"};">
          ${product.inStock ? "✅ In Stock" : "❌ Out of Stock"}
        </p>
      </div>

      <div style="text-align: center; margin-top: 20px;">
        <a href="${product.productUrl}" 
          style="background: #007bff; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-size: 16px;">
          🔗 View Product
        </a>
      </div>

      <hr style="margin: 20px 0;">
      <p style="font-size: 12px; color: #888; text-align: center;">
        You’re receiving this alert from <strong>AutoBrand</strong>.
      </p>
    </div>
  </div>`;

  await transporter.sendAlertMail({
    from: `"AutoBrand Alerts" <${process.env.EMAIL_USER}>`,
    to,
    subject: `💰 Price Drop: ${product.productName} is now ₹${product.newPrice}`,
    html: htmlContent,
  });

  console.log(`📩 Price drop email sent to ${to}`);
}
