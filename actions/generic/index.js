/*
* <license header>
*/

/**
 * This is a sample action showcasing how to access an external API
 *
 * Note:
 * You might want to disable authentication and authorization checks against Adobe Identity Management System for a generic action. In that case:
 *   - Remove the require-adobe-auth annotation for this action in the manifest.yml of your application
 *   - Remove the Authorization header from the array passed in checkMissingRequestInputs
 *   - The two steps above imply that every client knowing the URL to this deployed action will be able to invoke it without any authentication and authorization checks against Adobe Identity Management System
 *   - Make sure to validate these changes against your security requirements before deploying the action
 */

const { AEMHeadless } = require('@adobe/aem-headless-client-nodejs');
const fetch = require('node-fetch');
const { Core } = require('@adobe/aio-sdk');
const { errorResponse, getBearerToken, stringParameters, checkMissingRequestInputs } = require('../utils');
const jsonCredentials = require('./service-token.json');
const auth = require('@adobe/jwt-auth');

async function main(params) {
  const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' });

  try {
    let serviceCredentials = jsonCredentials.integration;
    logger.info('getting token');
  
    let { access_token } = await auth({
      clientId: serviceCredentials.technicalAccount.clientId, // Client Id
      technicalAccountId: serviceCredentials.id,              // Technical Account Id
      orgId: serviceCredentials.org,                          // Adobe IMS Org Id
      clientSecret: serviceCredentials.technicalAccount.clientSecret, // Client Secret
      privateKey: serviceCredentials.privateKey,              // Private Key to sign the JWT
      metaScopes: serviceCredentials.metascopes.split(','),   // Meta Scopes defining level of access the access token should provide
      ims: `https://${serviceCredentials.imsEndpoint}`,       // IMS endpoint used to obtain the access token from
    });

    logger.info('Calling the main action')
    logger.debug(stringParameters(params))

    const sdk = new AEMHeadless({
      serviceURL: 'https://author-p101152-e938206.adobeaemcloud.com/',
      endpoint: 'graphql/execute.json/bby/query-cardlist?2',
      auth: access_token
    });

    const content = await sdk.runPersistedQuery('bby/query-cardlist');

    const response = {
      statusCode: 200,
      body: content
    };

    logger.info(`${response.statusCode}: successful request`);
    return response;

  } catch (error) {
    logger.error(error);
    return errorResponse(500, 'server error', logger);
  }
}

exports.main = main;
main();
