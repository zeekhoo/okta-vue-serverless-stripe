"use strict"

const axios = require('axios');
const ssws = process.env.API_KEY;
const oktaBaseUrl = process.env.ISS.split('/oauth2')[0];
const prospectGroupId = process.env.PROSPECT_GROUP_ID;
const customerGroupId = process.env.CUSTOMER_GROUP_ID;


exports.handler = async function (event, context, callback) {
  const eventBody = JSON.parse(event.body);

  const un = eventBody.username;
  const name = eventBody.name || '';
  const fn = name.split(' ')[0];
  const ln = name.split(' ')[1] || '!';
  let profile = {
    firstName: fn,
    lastName: ln,
    email: un,
    login: un
  }
  let groupIds = [];

  let response = {
    isBase64Encoded: false,
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  }

  try {
    groupIds.push(prospectGroupId);

    let metaRes = await axios.get(oktaBaseUrl + '/api/v1/meta/schemas/user/default', {
      headers: {
        Authorization: 'SSWS ' + ssws
      }
    })
    if (metaRes.data.definitions.custom.properties.numFreebiesAvailable)
      profile.numFreebiesAvailable = 3;

    let pw = "Atko123456789#";
    // If password is present, then request is coming in from the Register View
    if (eventBody.password != undefined) {
      pw = eventBody.password;
      groupIds.push(customerGroupId);
      profile.firstName = eventBody.firstName;
      profile.lastName = eventBody.lastName;
      profile.goals = eventBody.goals;
      profile.zipCode = eventBody.zip;
    }

    const user = {
      profile: profile,
      groupIds: groupIds,
      credentials: {
        password: {
          value: pw
        }
      }
    }
    const status = await userCreatePromise(user, oktaBaseUrl, ssws);
    response.statusCode = status;
    if (status == 201) {
      const authnRes = await authnPromise(oktaBaseUrl, un, pw);
      response.body = JSON.stringify({
        sessionToken: authnRes.sessionToken
      })
    } else {
      response.body = JSON.stringify({
        err: 'duplicate email'
      })
    }
  } catch (err) {
    response.statusCode = 400;
    response.body = JSON.stringify(err.response.data);
  }

  console.log(response);
  callback(null, response);
}



function userCreatePromise(user, oktaBaseUrl, ssws) {
  return new Promise((resolve, reject) => {
    axios({
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'SSWS ' + ssws
      },
      url: oktaBaseUrl + '/api/v1/users?activate=true',
      data: user
    })
      .then(res => {
        console.log('userCreatePromise:');
        console.log(res);
        resolve(201);
      })
      .catch(err => {
        console.log('ERROR');
        const data = JSON.stringify(err.response.data);
        console.log(data);
        if (data.includes('already exists')) {
          resolve(204);
        } else {
          resolve(400);
        }
      })
  })
}

function authnPromise(baseUrl, un, pw) {
  return new Promise((resolve, reject) => {
    axios({
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      url: baseUrl + '/api/v1/authn',
      data: {
        username: un,
        password: pw
      }
    })
      .then((res) => {
        console.log('authnPromise:');
        console.log(res.data);
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      })
  })
}