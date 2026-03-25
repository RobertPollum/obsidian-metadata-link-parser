---
title: Setting Up and Testing PayPal Webhooks Locally Without Guesswork
link: https://dev.to/lightningdev123/setting-up-and-testing-paypal-webhooks-locally-without-guesswork-56c6
author: Lightning Developer
publish_date: 2025-12-29 04:57:09
saved_date: 2026-01-17 15:10:05
tags: #testing #webdev #tutorial #node
---


When you build a payment flow with PayPal, the real work often starts after the user clicks “Pay.” Payments get approved, captures succeed or fail, refunds happen later, disputes appear days after a transaction, and subscriptions renew on their own schedule. All of this information reaches your system through webhooks.

The challenge is local development. PayPal cannot send webhook requests to `localhost`, and deploying every small change just to test an event quickly becomes frustrating. This is where a tunneling tool like Pinggy fits naturally into the workflow.

This article walks through a practical, developer-friendly way to set up and test PayPal webhooks locally, using a simple Node.js server and a single command tunnel.

## What PayPal Webhooks Actually Do

PayPal webhooks are HTTP callbacks sent to your server whenever something important happens in your PayPal account. Instead of your app repeatedly asking PayPal whether anything changed, PayPal pushes the update to you in real time.

Typical events include completed payments, approved checkout orders, refunds, subscription status changes, and customer disputes. Each webhook arrives as an HTTP POST request containing a JSON payload with the event type and related data.

Your server is expected to respond with a 2xx status code. If it does not, PayPal retries the delivery multiple times over several days.

Common events worth handling early include:

PAYMENT.CAPTURE.COMPLETED  
CHECKOUT.ORDER.APPROVED  
PAYMENT.CAPTURE.REFUNDED  
BILLING.SUBSCRIPTION.ACTIVATED  
CUSTOMER.DISPUTE.CREATED

## Why Webhooks Are Essential

Webhooks allow your system to react immediately to payment updates without polling APIs. They are especially important for asynchronous flows such as delayed captures, pending payments, refunds issued later, or disputes raised long after checkout. Any production-grade PayPal integration relies on webhooks to stay accurate and consistent.

The only real requirement is that your webhook endpoint must be publicly reachable over HTTPS.

## What You Need Before Starting

Before writing any code, make sure you have:

A PayPal Developer account  
Node.js version 16 or newer  
Basic familiarity with Express.js  
Access to a terminal

## Step 1: Create a PayPal Sandbox App

Start in the PayPal Developer Dashboard.

Visit developer.paypal.com and sign in  
Open “Apps & Credentials”  
Switch to Sandbox mode  
Create a new app and give it a name

Once created, PayPal shows a Client ID and Secret. These credentials are used later for API authentication and webhook verification.

The sandbox environment also provides test buyer and seller accounts so you can simulate payments without using real money.

## Step 2: Build a Local Webhook Listener

Now you need a small server that can receive webhook requests. Below is a minimal Express setup that preserves the raw request body, which is required for PayPal signature verification later.  

```
import express from "express";
import bodyParser from "body-parser";

const app = express();
const PORT = 3000;

app.use(
  bodyParser.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);

app.post("/webhook/paypal", async (req, res) => {
  const event = req.body;

  console.log("PayPal webhook received");
  console.log("Event type:", event.event_type);
  console.log("Event ID:", event.id);

  switch (event.event_type) {
    case "PAYMENT.CAPTURE.COMPLETED":
      console.log("Payment completed", event.resource?.amount);
      break;
    case "CHECKOUT.ORDER.APPROVED":
      console.log("Order approved", event.resource?.id);
      break;
    case "PAYMENT.CAPTURE.REFUNDED":
      console.log("Payment refunded", event.resource?.amount);
      break;
    case "CUSTOMER.DISPUTE.CREATED":
      console.log("Dispute created", event.resource?.dispute_id);
      break;
    default:
      console.log("Unhandled event", event.event_type);
  }

  res.status(200).send("OK");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

Initialize the project and install dependencies:  

```
npm init -y
npm install express body-parser
```

Add `"type": "module"` to your `package.json`, then start the server:  

```
node paypal_webhook.js
```

Your webhook listener is now active at:

[http://localhost:3000/webhook/paypal](http://localhost:3000/webhook/paypal)

## Step 3: Expose Localhost Using Pinggy

PayPal needs a public HTTPS URL. Instead of deploying your app, you can expose your local server using [Pinggy](https://pinggy.io/).

Open a new terminal and run:  

```
ssh -p 443 -R0:localhost:3000 qr@free.pinggy.io
```

After authentication, [Pinggy](https://pinggy.io/) provides a public URL similar to:

`https://abcdefghij.a.pinggy.link`

Your full webhook endpoint becomes:

`https://abcdefghij.a.pinggy.link/webhook/paypal`

Keep this tunnel running while testing.

## Step 4: Register the Webhook in PayPal

Return to the PayPal Developer Dashboard.

Open your sandbox app  
Scroll to the Webhooks section  
Add a new webhook  
Paste your [Pinggy](https://pinggy.io/) webhook URL  
Select the events you want to receive

Save the configuration and note the Webhook ID shown after creation. This ID is required for signature verification when you move closer to production.

## Step 5: Test Using the Webhook Simulator

PayPal includes a built-in Webhook Simulator that sends mock events directly to your endpoint.

Open the Webhook Simulator  
Enter your [Pinggy](https://pinggy.io/) webhook URL  
Choose an event type  
Send the test event

Back in your terminal, you should see logs confirming the webhook arrived and was processed correctly.

Simulator events use a placeholder webhook ID and are not meant for cryptographic verification. They are purely for functional testing.

## Conclusion

Testing PayPal webhooks locally does not need to involve repeated deployments or complicated infrastructure. A small Express server combined with a lightweight tunnel is enough to validate your logic, event handling, and error paths early in development.

Using the webhook simulator alongside sandbox transactions gives you confidence that your integration behaves correctly before real payments are involved. When moving to production, remember to add proper signature verification and error handling.

Webhooks are the backbone of reliable payment systems. Treat them as first-class components in your architecture, test them thoroughly, and keep your development loop fast and focused.

### Reference:

[How to Set Up and Test PayPal Webhook Locally](https://pinggy.io/blog/how_to_set_up_and_test_paypal_webhook_locally/)