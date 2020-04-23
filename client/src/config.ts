// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '1e733d85h3'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-uqr0gdge.auth0.com',            // Auth0 domain
  clientId: 'MB2fwEYIH8Lot8x1wYQwcKk9d4nRD0T7',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
