const atob = require('atob');

exports.handler = function(event, context, callback) {
    const accessToken = event.headers.Authorization.split('Bearer ')[1];
    const token = JSON.parse(atob(accessToken.split('.')[1]));
    const scopes = token.scp;
    
    var messageBody = {
        message: "6 minute video plays",
        details: "Because there is a 'prospect' scope but no 'customer' scope, the API only allows a short clip to play",
        alertType: "info"
    }
    
    if (scopes.includes('customer')) {
        messageBody = {
            message: "Whole video plays",
            details: "Because there is a 'customer' scope, the API allows the whole video to play",
            alertType: "success"
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