"use server";

import nodemailer from "nodemailer";

export interface BookingPayload {
  name: string;
  email: string;
  topic: string;
  date: string;
  time: string;
}

export async function bookMeeting(payload: BookingPayload): Promise<{ success: boolean; error?: string }> {
  const { name, email, topic, date, time } = payload;

  if (!name || !email || !topic || !date || !time) {
    return { success: false, error: "All fields are required." };
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: 'Courier New', monospace; background: #0a0a0a; color: #e5e5e5; padding: 32px;">
        <div style="max-width: 560px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden;">
          <div style="background: #111; padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <div style="display: flex; gap: 8px; margin-bottom: 12px;">
              <span style="width:12px;height:12px;border-radius:50%;background:#ef4444;display:inline-block;"></span>
              <span style="width:12px;height:12px;border-radius:50%;background:#eab308;display:inline-block;"></span>
              <span style="width:12px;height:12px;border-radius:50%;background:#22d3ee;display:inline-block;"></span>
            </div>
            <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.4);">karim-khaled — new-booking — portfolio</p>
          </div>
          <div style="padding: 28px 24px; background: #0d0d0d;">
            <p style="color: #22d3ee; font-size: 14px; margin-top:0;">$ cat booking-request.json</p>
            <pre style="background:#111;border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:20px;font-size:13px;line-height:1.8;overflow:auto;">{
  "<span style="color:#fde68a">from</span>":      "<span style="color:#86efac">${name}</span>",
  "<span style="color:#fde68a">email</span>":     "<span style="color:#86efac">${email}</span>",
  "<span style="color:#fde68a">date</span>":      "<span style="color:#86efac">${date}</span>",
  "<span style="color:#fde68a">time</span>":      "<span style="color:#86efac">${time}</span>",
  "<span style="color:#fde68a">topic</span>":     "<span style="color:#86efac">${topic}</span>"
}</pre>
            <p style="color:#22d3ee;font-size:13px;">$ echo "Reply to: <a href="mailto:${email}" style="color:#86efac;">${email}</a>"</p>
            <p style="color:rgba(255,255,255,0.3);font-size:11px;margin-bottom:0;">Sent from karim-khaled.dev/portfolio</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Portfolio Booking" <${process.env.EMAIL_USER}>`,
      to: "karimkhaled549@gmail.com",
      subject: `📅 New Meeting Request from ${name} — ${date} at ${time}`,
      html,
      replyTo: email,
    });

    return { success: true };
  } catch (err) {
    console.error("[book-meeting] Failed to send email:", err);
    return { success: false, error: "Failed to send email. Please try again." };
  }
}
