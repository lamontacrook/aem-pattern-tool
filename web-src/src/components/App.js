import React, { useEffect, useState } from 'react';
import ErrorBoundary from 'react-error-boundary';
import CardList from './CardList';

import allActions from '../config.json'
import actionWebInvoke from '../utils'

// remove the deprecated key
const actions = Object.keys(allActions).reduce((obj, key) => {
  if (key.lastIndexOf('/') > -1) {
    obj[key] = allActions[key]
  }
  return obj
}, {});

let first = false;

const App = (props) => {
  const [state, setState] = useState({
    actionSelected: 'pattern-tool/fetch-cards',
    actionResponse: null,
    actionResponseError: null,
    actionHeaders: null,
    actionHeadersValid: null,
    actionParams: null,
    actionParamsValid: null,
    actionInvokeInProgress: false,
    actionResult: ''
  });

  console.log(actions);


  useEffect(() => {
    if (!first) invokeAction();
    first = true;
  }, [state.actionResponse, invokeAction]);

  console.log('runtime object:', props.runtime)
  console.log('ims object:', props.ims)

  props.runtime.on('configuration', ({ imsOrg, imsToken, locale }) => {
    console.log('configuration change', { imsOrg, imsToken, locale })
  })

  props.runtime.on('history', ({ type, path }) => {
    console.log('history change', { type, path })
  })

  return (

    <ErrorBoundary onError={onError} FallbackComponent={fallbackComponent}>
      <main>
        <CardList data={state.actionResponse} />
      </main>
    </ErrorBoundary>
  )

  // Methods

  // error handler on UI rendering failure
  function onError(e, componentStack) { }

  // component to show if UI fails rendering
  function fallbackComponent({ componentStack, error }) {
    return (
      <React.Fragment>
        <h1 style={{ textAlign: 'center', marginTop: '20px' }}>
          Something went wrong :(
        </h1>
        <pre>{componentStack + '\n' + error.message}</pre>
      </React.Fragment>
    )
  }

  async function invokeAction() {
    setState({ ...state, actionInvokeInProgress: true, actionResult: 'calling action ... ' })
    const actionName = state.actionSelected
    const headers = state.actionHeaders || {}
    const params = state.actionParams || {}
    const startTime = Date.now()
    // all headers to lowercase
    Object.keys(headers).forEach((h) => {
      const lowercase = h.toLowerCase()
      if (lowercase !== h) {
        headers[lowercase] = headers[h]
        headers[h] = undefined
        delete headers[h]
      }
    })
    // set the authorization header and org from the ims props object
    if (props.ims.token && !headers.authorization) {
      headers.authorization = `Bearer ${props.ims.token}`
    }
    if (props.ims.org && !headers['x-gw-ims-org-id']) {
      headers['x-gw-ims-org-id'] = props.ims.org
    }
    let formattedResult = ''
    try {
      // invoke backend action
      const actionResponse = await actionWebInvoke(actions[actionName], headers, params)
      formattedResult = `time: ${Date.now() - startTime} ms\n` + JSON.stringify(actionResponse, 0, 2)
      // store the response
      setState({
        ...state,
        actionResponse,
        actionResult: formattedResult,
        actionResponseError: null,
        actionInvokeInProgress: false
      })
      console.log(`Response from ${actionName}:`, actionResponse)
    } catch (e) {
      // log and store any error message
      formattedResult = `time: ${Date.now() - startTime} ms\n` + e.message
      console.error(e)
      setState({
        ...state,
        actionResponse: null,
        actionResult: formattedResult,
        actionResponseError: e.message,
        actionInvokeInProgress: false
      })
    }
  }
}

export default App

