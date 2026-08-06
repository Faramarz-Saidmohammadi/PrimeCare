import { escapeHtml } from "@/lib/request";
import { appointmentStatusLabel } from "@/lib/appointments";

type EmailMessage = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

type AppointmentMailData = {
  reference: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  reason: string;
  doctorName?: string;
  status: string;
  message?: string;
  cancelToken?: string;
};

export async function sendEmail(message: EmailMessage) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  if (!apiKey || !from) return { sent: false, skipped: true };
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: Array.isArray(message.to) ? message.to : [message.to],
      subject: message.subject,
      html: message.html,
      reply_to: message.replyTo,
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Email provider returned ${response.status}: ${detail.slice(0, 300)}`);
  }
  return { sent: true, skipped: false };
}

export async function sendAdminNotification(subject: string, html: string, replyTo?: string) {
  const to = process.env.NOTIFICATION_EMAIL?.trim();
  if (!to) return { sent: false, skipped: true };
  return sendEmail({ to, subject, html, replyTo });
}

function appointmentTable(item: AppointmentMailData) {
  return `<table style="border-collapse:collapse;width:100%;max-width:620px">
    <tr><td style="padding:8px;border-bottom:1px solid #ddd"><strong>Reference</strong></td><td style="padding:8px;border-bottom:1px solid #ddd">${escapeHtml(item.reference)}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #ddd"><strong>Date</strong></td><td style="padding:8px;border-bottom:1px solid #ddd">${escapeHtml(item.date)} at ${escapeHtml(item.time)}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #ddd"><strong>Reason</strong></td><td style="padding:8px;border-bottom:1px solid #ddd">${escapeHtml(item.reason)}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #ddd"><strong>Clinician</strong></td><td style="padding:8px;border-bottom:1px solid #ddd">${escapeHtml(item.doctorName || "Any available dentist")}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #ddd"><strong>Status</strong></td><td style="padding:8px;border-bottom:1px solid #ddd">${escapeHtml(appointmentStatusLabel(item.status))}</td></tr>
  </table>`;
}

export async function sendAppointmentReceived(item: AppointmentMailData) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const manageUrl = item.cancelToken
    ? `${siteUrl}/appointment/manage?token=${encodeURIComponent(item.cancelToken)}`
    : `${siteUrl}/appointment/manage`;
  return sendEmail({
    to: item.email,
    subject: `Appointment request received — ${item.reference}`,
    html: `<h2>We received your appointment request</h2><p>Hello ${escapeHtml(item.name)},</p><p>Your requested time is reserved while the clinic reviews it. This is not a final confirmation until the status changes to confirmed.</p>${appointmentTable(item)}<p><a href="${manageUrl}">Check or cancel your request securely</a>. You can also use reference <strong>${escapeHtml(item.reference)}</strong> with your email address.</p>`,
  });
}

export async function sendAppointmentStatusChanged(item: AppointmentMailData) {
  return sendEmail({
    to: item.email,
    subject: `Appointment ${appointmentStatusLabel(item.status).toLowerCase()} — ${item.reference}`,
    html: `<h2>Your appointment has been updated</h2><p>Hello ${escapeHtml(item.name)},</p>${appointmentTable(item)}<p>Contact the clinic if any detail is incorrect.</p>`,
  });
}

export async function sendAppointmentReminder(item: AppointmentMailData) {
  return sendEmail({
    to: item.email,
    subject: `Reminder: your PrimeCare appointment is tomorrow`,
    html: `<h2>Appointment reminder</h2><p>Hello ${escapeHtml(item.name)},</p><p>This is a reminder for your confirmed dental appointment.</p>${appointmentTable(item)}<p>Please arrive 10 minutes early and bring any relevant records or insurance information.</p>`,
  });
}
