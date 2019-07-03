"use strict"

const axios = require('axios');
const udpBaseUrl = process.env.UDP_BASE_URL;

exports.handler = function(event, context, callback) {
    var subdomain = event.headers.origin;
    subdomain = subdomain.replace('https://', '').replace('http://', '').split('.')[0];
    console.log('subdomain: ' + subdomain);

    getSSWSPromise(subdomain)
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

        var input_profile = {
                login: eventBody.username,
                email: eventBody.username,
                firstName: eventBody.firstName,
                lastName: eventBody.lastName,
                goals: eventBody.goals,
                zipCode: eventBody.zip
            };
        const user = {
            profile: input_profile,
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


function getSSWSPromise(subdomain) {
    return new Promise((resolve, reject) => {
        const requestHeaders = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.UDP_KEY
        }
        axios({
            method: 'GET',
            url: udpBaseUrl + '/api/subdomains/' + subdomain,
            headers: requestHeaders
        })
        .then((res) => {
            if (res.data) {
                resolve(res.data.okta_api_token || '');
            }
        })
        .then((err) => {
            reject(err);
        });
    });
}