"use strict"

const axios = require('axios')
const udpBaseUrl = process.env.UDP_BASE_URL

exports.handler = async function(event, context, callback) {
    var subdomain = event.headers.origin
    subdomain = subdomain.replace('https://', '').replace('http://', '').split('.')[0]

    const eventBody = JSON.parse(event.body)
    if (eventBody.mocksubdomain) {
        subdomain = eventBody.mocksubdomain
        
    }
    console.log('Subdomain: ' + subdomain)
    const subdomainConfig = await getSSWSPromise(subdomain)
    const ssws = subdomainConfig.ssws
    const oktaBaseUrl = subdomainConfig.org
   
    const configRes = await axios.get(udpBaseUrl + '/api/configs/' + subdomain + '/bod')
    let groupIds = []
    groupIds.push(configRes.data.settings.prospect_group_id || '')
   
    const un = eventBody.username
    const name = eventBody.name || ''
    const fn = name.split(' ')[0]
    const ln = name.split(' ')[1] || '!'
    let profile = {
        firstName: fn,
        lastName: ln,
        email: un,
        login: un
    }

    let pw = "Atko123456789#"
    // If password is present, then request is coming in from the Register View
    if (eventBody.password != undefined) {
        pw = eventBody.password
        groupIds.push(configRes.data.settings.customer_group_id || '')
        profile.firstName = eventBody.firstName
        profile.lastName = eventBody.lastName
        profile.goals = eventBody.goals
        profile.zipCode = eventBody.zip
    }

    const user = {
        profile: profile,
        groupIds: groupIds,
        credentials: {
            password: {value: pw}
        }
    }

    var responseBody = null
    const status = await userCreatePromise(user, oktaBaseUrl, ssws)
    if (status == 201) {
        const authnRes = await authnPromise(oktaBaseUrl, un, pw)
        responseBody = JSON.stringify({sessionToken: authnRes.sessionToken})
    } else {
        responseBody = JSON.stringify({err: 'duplicate email'})
    }

    const response = {
        statusCode: status,
        body: responseBody,
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

function userCreatePromise(user, oktaBaseUrl, ssws) {
    return new Promise((resolve,reject)=>{
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
        .then(res=>{
            resolve(201)
        })
        .catch(err=>{
            console.log('ERROR')
            const data = JSON.stringify(err.response.data)
            console.log(data)
            if (data.includes('already exists')) {
                resolve(204)
            } else {
                resolve(400)
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
            data: {username: un, password: pw}
        })
        .then((res) => {
            console.log(res.data)
            resolve(res.data)
        })
        .catch((err)=> {
            reject(err)
        })
    })
}