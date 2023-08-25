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

    //'eyJhbGciOiJSUzI1NiIsIng1dSI6Imltc19uYTEta2V5LWF0LTEuY2VyIiwia2lkIjoiaW1zX25hMS1rZXktYXQtMSIsIml0dCI6ImF0In0.eyJpZCI6IjE2OTI4OTM3MDc1ODhfMjBjNDY3MzMtNGNhOS00N2I0LTg4ZDgtMTBkNjMxYjJiNzhlX3VlMSIsInR5cGUiOiJhY2Nlc3NfdG9rZW4iLCJjbGllbnRfaWQiOiJkZXYtY29uc29sZS1wcm9kIiwidXNlcl9pZCI6IjgxRTYyMDAwNjMxQzA4MTUwQTQ5NUU2Q0A3ZmZmMWY2ZTYzMWMwNGNjNDk1ZmIzLmUiLCJzdGF0ZSI6IkxiQkJKN1IyaDd5ZXdrTXhJaTR5aUhTZyIsImFzIjoiaW1zLW5hMSIsImFhX2lkIjoiNkI2QjM5Rjc1NkFCQjk5RTdGMDAwMTAxQGFkb2JlLmNvbSIsImN0cCI6MCwiZmciOiJYWENVNlFHT1hQUDc0UDRLR01RVjNYQUFVND09PT09PSIsInNpZCI6IjE2OTIzOTAzMTc4NTVfN2RmZmIxN2EtNDlkYi00ZmVjLTkwZGYtNDAwYzhmYzc4NjUyX3V3MiIsInJ0aWQiOiIxNjkyODkzNzA3NTg4XzQzNGE2MGNlLTdhZDEtNDk5ZC1hNjU3LTAyNzI4NDJjMDliYl91ZTEiLCJtb2kiOiJlYTdmNjlhMyIsInBiYSI6Ik1lZFNlY05vRVYsTG93U2VjIiwicnRlYSI6IjE2OTQxMDMzMDc1ODgiLCJleHBpcmVzX2luIjoiODY0MDAwMDAiLCJzY29wZSI6IkFkb2JlSUQsb3BlbmlkLHJlYWRfb3JnYW5pemF0aW9ucyxhZGRpdGlvbmFsX2luZm8ucHJvamVjdGVkUHJvZHVjdENvbnRleHQiLCJjcmVhdGVkX2F0IjoiMTY5Mjg5MzcwNzU4OCJ9.RVs33ienywOSvd3jRTo2tkDj5NNXuwDcSMCWh6CdJQlirmRASWHuUYd4vO9_VKmWwk9RZcyhTiszS4LWIaOA9SVC9p6ExEkmsXDxpDV_72bj2sHTic2gV646z_p5zMFGjI43lEh_HcAGDqY_W-KNQh5OtR9zwr0ywIJwmXFQmnVtJMKiAozGmwam5HrLcKPqxHEDmzHuHFGmkKTqkIrkdjXxBQYHYcF4e2KMNjR9hC-w5QpQLu7dbcc9pAcOnWC18a6nsKTYKjX-SAjLK_8nod3l96LCOtgnSEEFsqA-tie_bo7yrjZEbIhUy2slcd9hrBff_TwBNg92jvDrVKWDng'
  
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
