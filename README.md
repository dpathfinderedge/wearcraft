# WearCraft

Under development

## Transactional email

WearCraft sends welcome, profile-change, order-confirmation, shipment, and delivery emails through SMTP. Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` in the server environment. Port `465` uses implicit TLS; other ports use the SMTP transport's standard STARTTLS negotiation. Set `NEXT_PUBLIC_APP_URL` to the public site URL to include account links in messages.

Email delivery happens after the related account, order, or fulfilment change is saved. If SMTP is unavailable, the application keeps the saved change, logs the delivery failure on the server, and returns a warning so the customer or operator is not told the email was sent. Failed email attempts are not automatically retried; configure a durable mail queue before relying on this for high-volume production delivery.