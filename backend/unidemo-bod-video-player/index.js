const atob = require('atob');
const axios = require('axios');
const udpBaseUrl = process.env.UDP_BASE_URL;

exports.handler = async function(event, context, callback) {
    console.log(event);
    const accessToken = event.headers.Authorization.split('Bearer ')[1];
    const token = JSON.parse(atob(accessToken.split('.')[1]));
    const scopes = token.scp;

    var messageBody = {
        message: "Video partially plays because the user is not a Customer yet.",
        details: "Because there is a 'prospect' scope but no 'customer' scope, the API only allows a short clip to play",
        alertType: "info"
    }
    
    if (scopes.includes('customer')) {
        messageBody = {
            message: "Whole video plays because the user is a Customer.",
            details: "Because there is a 'customer' scope, the API  allows the whole video to play",
            alertType: "success"
        }
    } else {
        let subdomain = event.headers.origin;
        subdomain = subdomain.replace('https://', '').replace('http://', '').split('.')[0];
        
        if (event.headers.mocksubdomain && event.headers.mocksubdomain != 'none')
            subdomain = event.headers.mocksubdomain;
        
        const subdomainConfig = await getSSWSPromise(subdomain);
        const ssws = subdomainConfig.ssws;
        const oktaBaseUrl = subdomainConfig.org;
        let prospect = await getUserPromise(token.sub, oktaBaseUrl, ssws);
        if (prospect.profile) {
            let numFreebiesAvailable = prospect.profile.numFreebiesAvailable <= 0 ? 0 : prospect.profile.numFreebiesAvailable - 1;
            let profile = {
                firstName: prospect.profile.firstName,
                lastName: prospect.profile.lastName,
                login: prospect.profile.login,
                email: prospect.profile.email,
                numFreebiesAvailable: numFreebiesAvailable
            }
            await updateUserPromise(profile, oktaBaseUrl, ssws)
        }
    }
        
    console.log(messageBody);
    
    const response = {
        statusCode: 200,
        body: JSON.stringify(messageBody),
        isBase64Encoded: false,
        headers: {
            "Access-Control-Allow-Origin": "*"
        }
    };
    callback(null, response);
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


function getUserPromise(userid, oktaBaseUrl, ssws) {
    return new Promise((resolve,reject)=>{
        axios({
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'SSWS ' + ssws
            },
            url: oktaBaseUrl+ '/api/v1/users/' + userid,
        })
        .then(res=>{
            resolve(res.data)
        })
        .catch(err=>{
            console.log('ERROR')
            const data = JSON.stringify(err.response.data)
            console.log(data)
            resolve(err.response.data)
        })
    })
}

function updateUserPromise(profile, oktaBaseUrl, ssws) {
    return new Promise((resolve,reject)=>{
        axios({
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'SSWS ' + ssws
            },
            url: oktaBaseUrl+ '/api/v1/users/' + profile.login,
            data: {
                profile: profile
            }
        })
        .then(res=>{
            resolve(200)
        })
        .catch(err=>{
            console.log('ERROR')
            const data = JSON.stringify(err.response.data)
            console.log(data)
            resolve(400)
        })
    })
}