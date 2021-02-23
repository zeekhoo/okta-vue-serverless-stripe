"use strict"

const axios = require('axios');
const ssws = process.env.API_KEY;
const baseUrl = process.env.ISS.split('/oauth2')[0];
const groupid = process.env.CUSTOMER_GROUP_ID;


const stripeKey = process.env.STRIPE_SECRET_KEY;
const priceId = process.env.STRIPE_PRICE_ID;
const stripe = (stripeKey && stripeKey.length > 0) ? require('stripe')(stripeKey) : false;


exports.handler = async function (event, context, callback) {
  const eventBody = JSON.parse(event.body);

  let response = {
    statusCode: 200,
    body: null,
    isBase64Encoded: false,
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  }

  try {
    const requestHeaders = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'SSWS ' + ssws
    }
    const userId = event.pathParameters.userId;

    let user = {
      profile: {
        login: eventBody.username,
        email: eventBody.username,
        firstName: eventBody.firstName,
        lastName: eventBody.lastName,
        goals: eventBody.goals
      }
    };
    if (eventBody.password) {
      user.credentials = {
        password: { value: eventBody.password }
      }
    }
    // update the user profile (and credentials, if present in the request)
    await axios({
      method: 'POST',
      headers: requestHeaders,
      url: baseUrl + '/api/v1/users/' + userId,
      data: user
    });
    // then add the user to the "customer" group
    await axios({
      method: 'PUT',
      headers: requestHeaders,
      url: baseUrl + '/api/v1/groups/' + groupid + '/users/' + userId
    });

    // Start the Stripe Checkout Session
    if (stripe) {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: 'http://localhost:8080/payment-success',
        cancel_url: 'http://localhost:8080/payment-canceled',
        
        // ⚠️: Include a reference to the Okta UserId so that the webhook knows which user to Update
        client_reference_id: userId
      });
      response.body = JSON.stringify({
        stripeSessionId: session.id
      });
    }
  }
  catch (err) {
    console.log(err);
    response.statusCode = 400;
    response.body = JSON.stringify(err.response.data);
  }
  callback(null, response);
}