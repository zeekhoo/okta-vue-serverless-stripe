"use strict"

const envfile = require('envfile');
const axios = require('axios');
const configsBaseUrl = 'https://safe-escarpment-74832.herokuapp.com';

exports.handler = function(event, context, callback) {
    var subdomain = event.headers.origin;
    subdomain = subdomain.replace('https://', '').replace('http://', '').split('.')[0]
    console.log('Subdomain: ' + subdomain);

    getSSWSPromise(subdomain, 'bod')
    .then((res) => {
        const ssws = res;
       
        const eventBody = JSON.parse(event.body);
        const oktaBaseUrl = eventBody.baseUrl;
    
        const pw = "Prospect123456789#";
        const un = eventBody.username;
        const name = eventBody.name || '';
        const groupid = eventBody.groupId || '';
        const fn = name.split(' ')[0];
        const ln = name.split(' ')[1] || '';
    
        const user = {
            profile: {
                firstName: fn,
                lastName: ln,
                email: un,
                login: un
            },
            groupIds: [
                groupid
            ],
            credentials: {
                password: {value: pw}
            }
        };

        axios({
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'SSWS ' + ssws
            },
            url: oktaBaseUrl+ '/api/v1/users?activate=true',
            data: user
        })
        .then((res) => {
            console.log(res.data);
            authnPromise(oktaBaseUrl, un, pw)
            .then((res) => {
                const response = {
                    statusCode: 200,
                    body: JSON.stringify({
                        sessionToken: res.sessionToken
                    }),
                    isBase64Encoded: false,
                    headers: {
                        "Access-Control-Allow-Origin": "*"
                    }
                };
                callback(null, response);
            });
        })
        .catch((err) => {
            console.log(err);
        });
    });
};

function getSSWSPromise(subdomain, app) {
    return new Promise((resolve, reject) => {
        axios({
            method: 'GET',
            url: configsBaseUrl + '/api/configs/' + subdomain + '/' + app + '/secret',
        })
        .then((res) => {
            if (res.data) {
                const obj = envfile.parseSync(res.data);
                resolve(obj.OKTA_API_TOKEN || '');
            }
        })
        .then((err) => {
            reject(err);
        });
    });
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
            data: {username: un, password: pw}
        })
        .then((res) => {
            console.log(res.data);
            resolve(res.data);
        })
        .catch((err)=> {
            reject(err);
        });
    });
}