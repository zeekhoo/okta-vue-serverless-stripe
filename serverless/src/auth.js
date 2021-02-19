"use strict";
const AuthPolicy = require('aws-auth-policy');
const OktaJwtVerifier = require('@okta/jwt-verifier');
const iss = process.env.ISS;
const aud = process.env.AUD;

exports.handler = function (event, context) {
  const accessTokenString = event.authorizationToken.split(' ')[1];

  var oktaJwtVerifier = new OktaJwtVerifier({
    issuer: iss
  });

  oktaJwtVerifier.verifyAccessToken(accessTokenString, aud)
    .then((jwt) => {
      var apiOptions = {};
      const arnParts = event.methodArn.split(':');
      const apiGatewayArnPart = arnParts[5].split('/');
      const awsAccountId = arnParts[4];
      apiOptions.region = arnParts[3];
      apiOptions.restApiId = apiGatewayArnPart[0];
      apiOptions.stage = apiGatewayArnPart[1];

      const policy = new AuthPolicy(jwt.claims.sub, awsAccountId, apiOptions);
      policy.allowAllMethods();
      var builtPolicy = policy.build();

      const claims = jwt.claims;
      var ctx = {};
      var issuer = null;
      for (var c in claims) {
        if (claims.hasOwnProperty(c)) {
          ctx[c] = JSON.stringify(claims[c]);
          if (c === 'iss') {
            issuer = claims[c];
          }
        }
      }
      const orgUrl = issuer.split('/oauth2')[0];
      ctx.orgUrl = JSON.stringify(orgUrl);

      const oktaOrg = orgUrl.split('https://')[1];
      ctx.oktaOrg = JSON.stringify(oktaOrg);

      builtPolicy.context = ctx;

      console.log('---builtPolicy---');
      console.log(builtPolicy);
      return context.succeed(builtPolicy);
    })
    .catch((err) => {
      console.log(err);
      return context.fail('Unauthorized');
    });
};
