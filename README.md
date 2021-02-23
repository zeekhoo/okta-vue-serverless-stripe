# About
This demo showcaes key concepts in protecting API resources using Okta's [API Access Management](https://developer.okta.com/docs/concepts/api-access-management/). 

A highly stylized sample app (in the [spa](/spa) folder) is used to drive the demo: A make believe e-commerce site that incorporates the following functionality:
* Browse anonymously
* Anonymous -> Known user with low firction "signup"
* Site contents protected until a user "registers" and provides payment.

### 🎁 Bonus 🎁
All the identity functionality is powered by Okta. And as a bonus, the demo also provides a sample integration with [Stripe Checkout](https://stripe.com/docs/payments/checkout), so we get to see a sample integration between the identity provider (Okta) and payments platform (Stripe).

## Prerequisites
* Okta developer account. Signup [here](https://developer.okta.com/signup/).
* Optional: Stripe account (to see the billing integration). Signup [here](https://dashboard.stripe.com/register).
* **Serverless**: The sample APIs are built on *Serverless* and is in the [serverless](/serverless) folder. See install [instructions](https://www.serverless.com/framework/docs/providers/aws/guide/installation/).
* **Terraform 0.14.x**: To automatically provision Okta resources (lots of manual steps if we do it by hand!). [Install](https://learn.hashicorp.com/tutorials/terraform/install-cli) for your operating system.

> Note: Make sure to use Terraform 0.14.x

## Use-cases
### 1. "Signup" a user with Email only
A visitor to the website (the demo SPA) browses around but cannot access content and is prompted to sign-up instead. The sign-up process only requires the visitor to provide an email. The Sign Up button makes a POST request to the ['signup.js'](/serverless/src/signup.js) Lambda function, which creates the user in Okta, logs the user in and returns an Okta [sessionToken](https://developer.okta.com/docs/reference/api/sessions/#session-token). The SPA uses the `sessionToken` to [start an Okta session](https://developer.okta.com/docs/guides/session-cookie/overview/#retrieving-a-session-cookie-via-openid-connect-authorization-endpoint) using the [/authorize](https://developer.okta.com/docs/reference/api/oidc/#authorize) endpoint to retrieve an [id_token](https://developer.okta.com/docs/reference/api/oidc/#id-token) and [access_token](https://developer.okta.com/docs/reference/api/oidc/#access-token) for the SPA.  

It is this `access_token` that prevents unauthorized access to all the APIs going forward.

### 2. __Progressive Profiling__
__"Progress" the "prospect" user (we only know their email) to a "customer" by collecting preferences and most importantly, payment info.__  

By providing email, the visitor is able to access limited content. But in order to gain full access of the site, they are prompted to subscribe to the service by providing payment (via Stripe). A registration form collects information from the visitor to complete their profile, such as full name and preferences. The Submit button makes a POST request to the ['subscribe.js'](/serverless/src/subscribe.js) Lambda function, which forwards the profile updates to Okta. It also initiates a Stripe Checkout Session and returns the Session Id that's needed by the SPA in order to redirect to Stripe Checkout (More on this later).

*AWS API Gateway is configured with the custom Lambda authorizer [auth.js](/serverless/src/auth.js) to prevent access to the API unless the `access_token` retrieved previously is present in the request.*

### 3. Protect APIs with scoped access_tokens
The user accesseses site contents by making API calls. While each call requires an `access_token`, the resources' API also looks at claims in the token to determine the level of access. Okta is configured to return token claims that describe whether or not the user is a "prospect" or "customer", so the [video.js](/serverless/src/video.js) Lambda function already knows the user context, and returns different results based on that.

---

## Setting up and running locally

### 1. Terraform
`cd` into the [`terraform`](/terraform) folder  
Then, rename the "sample" `tfvars` file
```bash
mv terraform.tfvars.sample terraform.tfvars
```
And edit in the values:
| var | value |
| --- | ----- |
| org_name | The "subdomain" part of the Okta developer account's url. e.g. `dev-668899` |
| base_url | The Okta developer account's URL hostname: either `oktapreview.com` or `okta.com` |
| api_token | Get an API token from the Okta developer account's admin UI |
  
  
Now run terraform init
```
terraform init
```
Then apply
```
terraform apply
```
> Take a look using the Okta Admin UI after this is done and notice the resources that were provisioned: 
> * A couple custom profile attributes
> * A couple groups
> * An OIDC app
> * An AuthorizationServer with some custom Scopes and Claims, and a couple specific Access Policy Rules

### 2. Populate environment variables.
At the completion of `terraform apply`, you'll see some *outputs* for ids of resources provisioned. We need those ids in our local environment files for the SPA and Serverless.

Using the Terraform `outputs`, generate a `.env.development.local` file for the SPA:
```bash
terraform output | grep issuer | sed -e "s/issuer/VUE_APP_ISSUER/g" > spa.env.development.local \
&& terraform output | grep client_id | sed -e "s/client_id/VUE_APP_CLIENT_ID/g" >> spa.env.development.local \
&& terraform output | grep prospect_group_id | sed -e "s/prospect_group_id/VUE_APP_PROSPECT_GROUP_ID/g" >> spa.env.development.local \
&& terraform output | grep customer_group_id | sed -e "s/customer_group_id/VUE_APP_CUSTOMER_GROUP_ID/g" >> spa.env.development.local \
&& cp spa.env.development.local ../spa/.env.development.local
```
> The above script generates the `.env.development.local` file in the `spa` folder. Examine its contents and make any changes or fixes if necessary.

Next, generate a `.env.json` file for Serverless:
```bash
touch serverless.env.json \
&& echo "{" > serverless.env.json \
&& echo '  "AWS_PROFILE": "serverless-admin",' >> serverless.env.json \
&& echo '  "AWS_REGION": "us-west-2",' >> serverless.env.json \
&& echo '  "ENVIRONMENT": "dev",' >> serverless.env.json \
&& terraform output | grep issuer | sed -e 's/issuer =/  "ISS":/g' | sed -e 's/$/,/g' >> serverless.env.json \
&& echo '  "AUD": "api://bod.unidemo",' >> serverless.env.json \
&& cat terraform.tfvars | grep api_token | sed -e 's/api_token/  "API_KEY"/g' | sed -e 's/=/: /g' | sed -e 's/$/,/g' >> serverless.env.json \
&& terraform output | grep prospect_group_id | sed -e 's/prospect_group_id =/  "PROSPECT_GROUP_ID":/g' | sed -e 's/$/,/g' >> serverless.env.json \
&& terraform output | grep customer_group_id | sed -e 's/customer_group_id =/  "CUSTOMER_GROUP_ID":/g' >> serverless.env.json \
&& echo "}" >> serverless.env.json \
&& cp serverless.env.json ../serverless/.env.json
```
> The above script generates the `.env.json` file in the `/serverless` folder. Examine its contents and edit if necessary (use the sample `.env.json.sample` as a guide)  
> Edit the following 2 variables (to match your AWS environment) and leave the rest alone (unless there are formatting errors):
> | var | value |
> | --- | ----- |
> | AWS_PROFILE | setup (or use an existing) AWS profile using `aws-cli`. See [instructions](https://www.serverless.com/framework/docs/providers/aws/guide/credentials/) |
> | AWS_REGION  | aws region where you want to deploy to |

### 3. Spin up the Resource Server
`cd` into the [`serverless`](/serverless) folder  
and install the dependencies
```
npm install
```

We don't have to deploy. For testing and demo purposes, we'll use [serverless-offline](https://www.npmjs.com/package/serverless-offline), which emulates AWS Lambda and API Gateway. This should already be installed during `npm install`.
```
serverless offline start
```
> This'll bring up the API on localhost:3000

### 4. Spin up the SPA
`cd` into the [`spa`](/spa) folder  
and install the dependencies
```
npm install
```
then compile and serve
```
npm run serve
```
> The SPA and the resource server are now both up. Open up your browser to `http://localhost:8080` to use the demo

# Stripe Integration
An e-commerce site demo isn't complete without billing integration. And one of the easist payment form integrations is [Stripe Checkout](https://stripe.com/docs/payments/checkout).  
Here's our basic implementation:

1. At the end of the [`subscribe.js`](/serverless/subscribe.js) Lambda function, we `POST` a [Stripe Checkout session](https://stripe.com/docs/api/checkout/sessions).
    * When initiating the Checkout session, we provide the Stripe API with the mandatory `success_url` and `cancel_url`. 
    * Also realize that prior to this, we've already created the user object in Okta. Thus, we can also provide the Stripe Session API the `client_reference_id`, setting it equal to the Okta user id. __This part is CRITICAL because we're going to use it later in the webhook__.
2. The SPA uses the above session id to redirect to the Stripe hosted checkout page. 
3. Upon checkout completion, Stripe redirects back to the SPA at `success_url`.
4. Stripe also fires off the `checkout.session.completed` event to our [webhook](/serverless/stripe.js) Lambda function.
    * The webhook updates the Okta user identified by `client_reference_id` and sets the custom profile attribute `stripeCustomerId` to the customer id found in the payload of the event.
5. Meanwhile, the browser has redirected back to the SPA component at the `success_url` url. Javascrip on this page "polls" Okta by requesting new access and id tokens from Okta. 
    * We configured Okta to return the `stripeCustomerId` claim in the id and access tokens. 
    * What the spa is polling for is the above claim to show up in the tokens. If the webhook has done it's job, the cliam should be populated. And when it does, the process is complete.

## Setup

* Add `VUE_APP_STRIPE_PUBLISHABLE_KEY=<replace-with-your-publishable-key>` to the SPA's `.env.development.local`. You can get the value from your [Stripe developer dashboard](https://stripe.com/docs/development/quickstart#api-keys).
* Install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and [link it to your Stripe account](https://stripe.com/docs/stripe-cli#link-account).
* Listen to webhook events and forward it to our serverless offline running on port 3000
  ```
  stripe listen --forward-to http://localhost:3000/dev/stripe/webhook
  ```
* Add the following 3 key-values to the `serverless.env.json` file in the `/serverless` folder.
  | var | value |
  | --- | ----- |
  | STRIPE_SECRET_KEY |`<replace-with-your-secret-key>`. Get the value from your [Stripe developer dashboard](https://stripe.com/docs/development/quickstart#api-keys) |
  | STRIPE_PRICE_ID | Setup a product in your [Stripe developer dashboard](https://dashboard.stripe.com/products) and get its `API id` |
  | STRIPE_WEBHOOK_SECRET | The CLI printed a webhook secret key to the console when you started the `stripe listen command` |
