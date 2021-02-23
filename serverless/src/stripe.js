"use strict"

const axios = require('axios');
const ssws = process.env.API_KEY;
const baseUrl = process.env.ISS.split('/oauth2')[0];

const stripeKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = (stripeKey && stripeKey.length > 0) ? require('stripe')(stripeKey) : false;

exports.webhook = async function (event, context, callback) {
  let response = {
    statusCode: 200,
    body: 'ok'
  }
  const eventBody = JSON.parse(event.body);

  if (!stripe) {
    // stripe is not configured
    callback(null, response);
  } else {
    let data;
    let eventType;
    if (webhookSecret) {
      let signature = event.headers.stripe - signature;
      try {
        const stripeEvent = stripe.webhooks.constructEvent(
          event.body,
          signature,
          webhookSecret
        );
        // Extract the object from the event.
        data = stripeEvent.data;
        eventType = stripeEvent.type;
      } catch (err) {
        console.log(err);
        const msg = `⚠️  Webhook signature verification failed.`;
        response.statusCode = 400;
        response.body = JSON.stringify(msg);
      }
    } else {
      // Webhook signing is recommended, but if the secret is not configured in `config.js`,
      // retrieve the event data directly from the request body.
      data = eventBody.data;
      eventType = eventBody.type;
    }

    switch (eventType) {
      case 'checkout.session.completed':
        // Payment is successful and the subscription is created.
        // You should provision the subscription.  
        try {
          const requestHeaders = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'SSWS ' + ssws
          }    
          let user = {
            profile: {
              stripeCustomerId: data.object.customer
            }
          };
          await axios({
            method: 'POST',
            headers: requestHeaders,
            url: baseUrl + '/api/v1/users/' + data.object.client_reference_id,
            data: user
          });
        } catch(e) {
          console.log(e);
        }
        break;
      case 'invoice.paid':
        // Continue to provision the subscription as payments continue to be made.
        // Store the status in your database and check when a user accesses your service.
        // This approach helps you avoid hitting rate limits.
        break;
      case 'invoice.payment_failed':
        // The payment failed or the customer does not have a valid payment method.
        // The subscription becomes past_due. Notify your customer and send them to the
        // customer portal to update their payment information.
        break;
      default:
      // Unhandled event type
    }

    callback(null, response);
  }

}