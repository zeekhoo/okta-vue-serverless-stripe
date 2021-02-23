"use strict"

const axios = require('axios');
const generatePassword = require('password-generator');
const maxLength = 18;
const minLength = 8;
const uppercaseMinCount = 1;
const lowercaseMinCount = 1;
const numberMinCount = 1;
const specialMinCount = 1;
const UPPERCASE_RE = /([A-Z])/g;
const LOWERCASE_RE = /([a-z])/g;
const NUMBER_RE = /([\d])/g;
const SPECIAL_CHAR_RE = /([\?\-])/g;
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

    let pw = null;
    // If password is provided, then request is coming in from the Register View
    if (eventBody.password) {
      pw = eventBody.password;
      groupIds.push(customerGroupId);
      profile.firstName = eventBody.firstName;
      profile.lastName = eventBody.lastName;
      profile.goals = eventBody.goals;
      profile.zipCode = eventBody.zip;
    } else {
      /*
       * An Okta user requires a password in order to authenticate. In our case, the user
       * does not provide a password yet. So we simply seed a random password to Okta
       */
      pw = customPassword();
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

function isStrongEnough(password) {
  const uc = password.match(UPPERCASE_RE);
  const lc = password.match(LOWERCASE_RE);
  const n = password.match(NUMBER_RE);
  const sc = password.match(SPECIAL_CHAR_RE);
  return password.length >= minLength &&
    uc && uc.length >= uppercaseMinCount &&
    lc && lc.length >= lowercaseMinCount &&
    n && n.length >= numberMinCount &&
    sc && sc.length >= specialMinCount;
}

function customPassword() {
  let password = "";
  const randomLength = Math.floor(Math.random() * (maxLength - minLength)) + minLength;
  while (!isStrongEnough(password)) {
    password = generatePassword(randomLength, false, /[\w\d\?\-]/);
  }
  return password;
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