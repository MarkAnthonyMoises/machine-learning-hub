import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { emails, title, author } = req.body;

    if (!emails || emails.length === 0) {
      return res.status(400).json({ error: "No emails provided" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Machine Learning Hub" <${process.env.EMAIL_USER}>`,
      to: emails, // array of emails
      subject: "📢 New Article Published",
      html: `
        <div style="font-family: Arial; padding:20px;">
          <h2>New Article Posted</h2>
          
          <p><b>@${author}</b> published a new article:</p>
          
          <h3>${title}</h3>

          <p>
            Visit the website to read the full article.
          </p>

          <hr/>

          <small>
            You are receiving this because you are registered in the website.
          </small>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("EMAIL ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
}