"use strict"

const axios = require('axios');
const basicAuth = require('basic-auth-token');
const udpBaseUrl = process.env.UDP_BASE_URL;
const issuer = process.env.ISSUER;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

exports.handler = async function (event, context, callback) {
    var subdomain = event.headers.origin;
    subdomain = subdomain.replace('https://', '').replace('http://', '').split('.')[0];

    const eventBody = JSON.parse(event.body);
    if (eventBody.mocksubdomain) subdomain = eventBody.mocksubdomain;

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
        const ccRes = await axios.post(issuer + '/v1/token', 'grant_type=client_credentials&scope=secrets:read', {
            headers: {
                Authorization: 'Basic ' + basicAuth(clientId, clientSecret)
            }
        })
        const subRes = await axios.get(udpBaseUrl + '/api/subdomains/' + subdomain, {
            headers: {
                'Authorization': 'Bearer ' + ccRes.data.access_token
            }
        })
        const ssws = subRes.data.okta_api_token;
        const oktaBaseUrl = subRes.data.okta_org_name;

        const configRes = await axios.get(udpBaseUrl + '/api/configs/' + subdomain + '/bod');
        groupIds.push(configRes.data.settings.prospect_group_id || '');
    

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
            groupIds.push(configRes.data.settings.customer_group_id || '');
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