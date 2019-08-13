"use strict"

const axios = require('axios')
const udpBaseUrl = process.env.UDP_BASE_URL

exports.handler = async function(event, context, callback) {
    var subdomain = event.headers.origin
    subdomain = subdomain.replace('https://', '').replace('http://', '').split('.')[0]
    console.log('subdomain: ' + subdomain)

    const eventBody = JSON.parse(event.body)
    if (eventBody.mocksubdomain) {
        subdomain = eventBody.mocksubdomain
        
    }
    console.log('Subdomain: ' + subdomain)
    const subdomainConfig = await getSSWSPromise(subdomain)
    const requestHeaders = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'SSWS ' + subdomainConfig.ssws
    }
    const baseUrl = subdomainConfig.org

    const userId = event.pathParameters.userId
    console.log('userId='+userId)
    
    const configRes = await axios.get(udpBaseUrl + '/api/configs/' + subdomain + '/bod')
    const groupid = configRes.data.settings.customer_group_id || ''

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
    }
    
    const usersRes = await axios({
        method: 'POST',
        headers: requestHeaders,
        url: baseUrl + '/api/v1/users/' + userId,
        data: user
    })
    console.log(usersRes.data)
        
    const groupsRes = axios({
        method: 'PUT',
        headers: requestHeaders,
        url: baseUrl + '/api/v1/groups/' + groupid + '/users/' + userId
    })
    console.log(groupsRes.data)
    const response = {
        statusCode: 200,
        body: "ok",
        isBase64Encoded: false,
        headers: {
        "Access-Control-Allow-Origin": "*"
        }
    }
    callback(null, response)
}

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
                resolve({
                    ssws: res.data.okta_api_token || '',
                    org: res.data.okta_org_name
                })
            }
        })
        .then((err) => {
            reject(err)
        })
    })
}