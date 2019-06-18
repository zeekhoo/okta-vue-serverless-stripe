"use strict"

const envfile = require('envfile');
const axios = require('axios');
const configsBaseUrl = 'https://safe-escarpment-74832.herokuapp.com';

exports.handler = function(event, context, callback) {
    var subdomain = event.headers.origin;
    subdomain = subdomain.replace('https://', '').replace('http://', '').split('.')[0];
    console.log('subdomain: ' + subdomain);

    getSSWSPromise(subdomain, 'bod')
    .then((ssws) => {
        const requestHeaders = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'SSWS ' + ssws
        }
        const eventBody = JSON.parse(event.body);

        const userId = event.pathParameters.userId;
        const groupid = eventBody.groupId;
        const baseUrl = eventBody.baseUrl;

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
                password: {value: eventBody.password}
            }
        };
        
        axios({
            method: 'POST',
            headers: requestHeaders,
            url: baseUrl + '/api/v1/users/' + userId,
            data: user
        })
        .then((res) => {
            console.log(res.data);
            
            axios({
                method: 'PUT',
                headers: requestHeaders,
                url: baseUrl + '/api/v1/groups/' + groupid + '/users/' + userId
              })
              .then((res) => {
                  console.log(res.data);
    
                  const response = {
                      statusCode: 200,
                      body: "ok",
                      isBase64Encoded: false,
                      headers: {
                        "Access-Control-Allow-Origin": "*"
                      }
                  };
                  callback(null, response);
              })
              .catch((err)=> {
                  console.log(err);
              });
        })
        .catch((err) => {
            console.log(err);
        })        
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