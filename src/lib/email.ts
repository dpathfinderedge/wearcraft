import nodemailer from 'nodemailer';

interface MailRecipient {
  email: string;
  firstName: string;
}

interface OrderEmailItem {
  name: string;
  quantity: number;
  price: number;
  size: string | null;
  color: string | null;
}

interface OrderEmail {
  recipient: MailRecipient;
  orderNumber: string;
  createdAt: Date;
  items: OrderEmailItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface EmailDeliveryResult {
  sent: boolean;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount);
}

function emailLayout(content: string, preheader: string): string {
  const appName = escapeHtml(process.env.NEXT_PUBLIC_APP_NAME?.trim() || 'WearCraft');
  const safePreheader = escapeHtml(preheader);

  return `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;background:#f5f2ed;color:#25231f;font-family:Arial,sans-serif">
    <span style="display:none;max-height:0;overflow:hidden;opacity:0">${safePreheader}</span>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f2ed;padding:32px 16px">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fff">
          <tr><td style="padding:32px 36px;border-bottom:1px solid #e9e4dc">
            <p style="margin:0;font-size:20px;letter-spacing:2px;text-transform:uppercase">${appName}</p>
          </td></tr>
          <tr><td style="padding:36px">${content}</td></tr>
          <tr><td style="padding:24px 36px;border-top:1px solid #e9e4dc;color:#716c64;font-size:12px;line-height:1.6">
            <p style="margin:0">A considered wardrobe, made to be worn.</p>
            <p style="margin:8px 0 0">This is an automated message from ${appName}. Replies to this email are not monitored.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function requiredSmtpValue(name: string, trim = true): string {
  const value = process.env[name];
  if (value === undefined || value.trim().length === 0) {
    throw new Error(`Missing email configuration: ${name}`);
  }
  return trim ? value.trim() : value;
}

function smtpConfiguration() {
  const host = requiredSmtpValue('SMTP_HOST');
  const port = Number(requiredSmtpValue('SMTP_PORT'));
  const user = requiredSmtpValue('SMTP_USER');
  const pass = requiredSmtpValue('SMTP_PASS', false);
  const from = requiredSmtpValue('SMTP_FROM');

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('SMTP_PORT must be a valid TCP port.');
  }

  return { host, port, user, pass, from };
}

async function deliverEmail(
  kind: string,
  recipient: string,
  subject: string,
  text: string,
  html: string
): Promise<EmailDeliveryResult> {
  try {
    const config = smtpConfiguration();
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      requireTLS: config.port !== 465,
      auth: { user: config.user, pass: config.pass },
      connectionTimeout: 3_000,
      greetingTimeout: 3_000,
      socketTimeout: 6_000,
    });

    await transporter.sendMail({
      from: config.from,
      to: recipient,
      subject,
      text,
      html,
    });
    return { sent: true };
  } catch (error) {
    console.error(`Transactional email delivery failed (${kind}).`, error);
    return { sent: false };
  }
}

export function sendWelcomeEmail(recipient: MailRecipient): Promise<EmailDeliveryResult> {
  const name = escapeHtml(recipient.firstName);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, '');
  const link = appUrl ? `${appUrl}/shop` : undefined;
  const content = `<h1 style="margin:0 0 20px;font-size:28px;font-weight:400">Welcome to WearCraft</h1>
    <p style="font-size:15px;line-height:1.7">Hello ${name},</p>
    <p style="font-size:15px;line-height:1.7">Your account is ready. Explore pieces selected for everyday wear and lasting use.</p>
    ${link ? `<p style="margin:28px 0"><a href="${escapeHtml(link)}" style="display:inline-block;background:#594438;color:#fff;padding:13px 20px;text-decoration:none">Explore the collection</a></p>` : ''}`;

  return deliverEmail(
    'welcome',
    recipient.email,
    'Welcome to WearCraft',
    `Hello ${recipient.firstName}, your WearCraft account is ready.${link ? ` Explore the collection: ${link}` : ''}`,
    emailLayout(content, 'Your WearCraft account is ready.')
  );
}

export function sendAccountUpdateEmail(
  recipient: MailRecipient
): Promise<EmailDeliveryResult> {
  const name = escapeHtml(recipient.firstName);
  const content = `<h1 style="margin:0 0 20px;font-size:28px;font-weight:400">Account details updated</h1>
    <p style="font-size:15px;line-height:1.7">Hello ${name},</p>
    <p style="font-size:15px;line-height:1.7">Your WearCraft profile details were updated. If you did not make this change, please sign in and review your account.</p>`;

  return deliverEmail(
    'account-update',
    recipient.email,
    'Your WearCraft account details changed',
    `Hello ${recipient.firstName}, your WearCraft profile details were updated. If you did not make this change, please sign in and review your account.`,
    emailLayout(content, 'A change was made to your WearCraft profile.')
  );
}

export function sendOrderConfirmationEmail(order: OrderEmail): Promise<EmailDeliveryResult> {
  const name = escapeHtml(order.recipient.firstName);
  const rows = order.items.map((item) => {
    const description = [item.size, item.color]
      .filter((value): value is string => value !== null && value.length > 0)
      .map(escapeHtml)
      .join(' / ');
    const details = description ? `<br><span style="color:#716c64;font-size:12px">${description}</span>` : '';
    return `<tr>
      <td style="padding:12px 0;border-bottom:1px solid #e9e4dc">${escapeHtml(item.name)}${details}</td>
      <td align="center" style="padding:12px 8px;border-bottom:1px solid #e9e4dc">${item.quantity}</td>
      <td align="right" style="padding:12px 0;border-bottom:1px solid #e9e4dc">${escapeHtml(formatPrice(item.price * item.quantity))}</td>
    </tr>`;
  }).join('');
  const createdAt = new Intl.DateTimeFormat('en-NG', { dateStyle: 'long' }).format(order.createdAt);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, '');
  const ordersLink = appUrl ? `${appUrl}/orders` : undefined;
  const content = `<h1 style="margin:0 0 12px;font-size:28px;font-weight:400">Your order is in</h1>
    <p style="font-size:15px;line-height:1.7">Hello ${name},</p>
    <p style="font-size:15px;line-height:1.7">We have received order <strong>${escapeHtml(order.orderNumber)}</strong> placed on ${escapeHtml(createdAt)}. Keep this email for your records.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:24px;border-collapse:collapse;font-size:14px">
      <thead><tr><th align="left" style="padding:10px 0;border-bottom:1px solid #b8afa3">Item</th><th style="padding:10px 8px;border-bottom:1px solid #b8afa3">Qty</th><th align="right" style="padding:10px 0;border-bottom:1px solid #b8afa3">Amount</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:16px;font-size:14px">
      <tr><td style="padding:5px 0">Subtotal</td><td align="right">${escapeHtml(formatPrice(order.subtotal))}</td></tr>
      <tr><td style="padding:5px 0">Delivery</td><td align="right">${escapeHtml(formatPrice(order.shipping))}</td></tr>
      <tr><td style="padding:5px 0">Tax</td><td align="right">${escapeHtml(formatPrice(order.tax))}</td></tr>
      <tr><td style="padding:12px 0;border-top:1px solid #b8afa3;font-weight:bold">Total</td><td align="right" style="padding:12px 0;border-top:1px solid #b8afa3;font-weight:bold">${escapeHtml(formatPrice(order.total))}</td></tr>
    </table>
    ${ordersLink ? `<p style="margin:28px 0"><a href="${escapeHtml(ordersLink)}" style="display:inline-block;background:#594438;color:#fff;padding:13px 20px;text-decoration:none">View your orders</a></p>` : ''}`;
  const textItems = order.items.map((item) =>
    `${item.name}${item.size ? `, size ${item.size}` : ''}${item.color ? `, ${item.color}` : ''} x ${item.quantity}: ${formatPrice(item.price * item.quantity)}`
  ).join('\n');
  const text = `Hello ${order.recipient.firstName},\n\nWe have received order ${order.orderNumber}, placed on ${createdAt}.\n\n${textItems}\n\nSubtotal: ${formatPrice(order.subtotal)}\nDelivery: ${formatPrice(order.shipping)}\nTax: ${formatPrice(order.tax)}\nTotal: ${formatPrice(order.total)}${ordersLink ? `\n\nView your orders: ${ordersLink}` : ''}`;

  return deliverEmail(
    'order-confirmation',
    order.recipient.email,
    `Your WearCraft order ${order.orderNumber}`,
    text,
    emailLayout(content, `Order ${order.orderNumber} has been received.`)
  );
}

export function sendFulfilmentEmail(
  recipient: MailRecipient,
  orderNumber: string,
  status: 'SHIPPED' | 'DELIVERED'
): Promise<EmailDeliveryResult> {
  const name = escapeHtml(recipient.firstName);
  const isDelivered = status === 'DELIVERED';
  const heading = isDelivered ? 'Your order has arrived' : 'Your order is on its way';
  const description = isDelivered
    ? `Order ${orderNumber} has been marked as delivered. We hope you enjoy your pieces.`
    : `Order ${orderNumber} has been handed to the carrier and is on its way to you.`;
  const content = `<h1 style="margin:0 0 20px;font-size:28px;font-weight:400">${heading}</h1>
    <p style="font-size:15px;line-height:1.7">Hello ${name},</p>
    <p style="font-size:15px;line-height:1.7">${escapeHtml(description)}</p>`;

  return deliverEmail(
    `order-${status.toLowerCase()}`,
    recipient.email,
    `${heading}: ${orderNumber}`,
    `Hello ${recipient.firstName}, ${description}`,
    emailLayout(content, description)
  );
}
