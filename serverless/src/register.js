"use strict"

const axios = require('axios');
const ssws = process.env.API_KEY;
const baseUrl = process.env.ISS.split('/oauth2')[0];
const groupid = process.env.CUSTOMER_GROUP_ID;


exports.handler = async function (event, context, callback) {
  const eventBody = JSON.parse(event.body);

  const response = {
    statusCode: 200,
    body: "ok",
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

    const user = {
      profile: {
        login: eventBody.username,
        email: eventBody.username,
        firstName: eventBody.firstName,
        lastName: eventBody.lastName,
        goals: eventBody.goals,
        zipCode: eventBody.zip
      },
      credentials: {
        password: { value: eventBody.password }
      }
    }
    const usersRes = await axios({
      method: 'POST',
      headers: requestHeaders,
      url: baseUrl + '/api/v1/users/' + userId,
      data: user
    })
    const groupsRes = await axios({
      method: 'PUT',
      headers: requestHeaders,
      url: baseUrl + '/api/v1/groups/' + groupid + '/users/' + userId
    })
  }
  catch (err) {
    console.log(err);
    response.statusCode = 400;
    response.body = JSON.stringify(err.response.data);
  }

  callback(null, response)
}