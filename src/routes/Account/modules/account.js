/* @flow */
import { push } from 'react-router-redux'

// ------------------------------------
// Constants
// ------------------------------------
export const FETCH_ACCOUNTS_REQUEST = 'FETCH_ACCOUNTS_REQUEST'
export const FETCH_ACCOUNTS_SUCCESS = 'FETCH_ACCOUNTS_SUCCESS'
export const FETCH_ACCOUNTS_FAILURE = 'FETCH_ACCOUNTS_FAILURE'

export const LOAD_ACCOUNT_DATA_REQUEST = 'LOAD_ACCOUNT_DATA_REQUEST'
export const LOAD_ACCOUNT_DATA_SUCCESS = 'LOAD_ACCOUNT_DATA_SUCCESS'
export const LOAD_ACCOUNT_DATA_FAILURE = 'LOAD_ACCOUNT_DATA_FAILURE'

// ------------------------------------
// Actions
// ------------------------------------
export function fetchAccountsRequest() {
  return {
    type: FETCH_ACCOUNTS_REQUEST
  }
}

export function fetchAccountsSuccess(data) {
  return {
    type: FETCH_ACCOUNTS_SUCCESS,
    payload: {
      accounts: records,
    },
  }
}

export function fetchAccountsFailure(error) {
  return {
    type: FETCH_ACCOUNTS_FAILURE,
    error,
  }
}

export function loadAccountDataRequest(id) {
  return {
    type: LOAD_ACCOUNT_DATA_REQUEST,
    payload: {
      id,
    },
  }
}

export function loadAccountDataSuccess(data) {
  return {
    type: LOAD_ACCOUNT_DATA_SUCCESS,
    payload: {
      account: data.account,
    },
  }
}

export function loadAccountDataFailure(error) {
  return {
    type: LOAD_ACCOUNT_DATA_FAILURE,
    error,
  }
}

export function fetchAccounts(id) {
  return (dispatch) => {
    dispatch(fetchAccountsRequest(id))

    return fetch('/api/accounts')
      .then(data => data.json())
      .then(data => dispatch(fetchAccountsSuccess(data.records)))
      .catch(err => dispatch(fetchAccountsFailure(err)))
  }
}

export function loadAccountData(id) {
  return (dispatch) => {
    console.log("Loading account data for " + id)
    dispatch(loadAccountDataRequest(id))

    return fetch(`/api/accounts/${id}`)
      .then(data => data.json())
      .then(data => dispatch(loadAccountDataSuccess(data)))
      .then(res => dispatch(push('/check-in')))
      .catch(err => dispatch(loadAccountDataFailure(err)))
  }
}

export const actions = {
  fetchAccounts,
  loadAccountData
}

const ACCOUNT_ACTION_HANDLERS = {
  [FETCH_ACCOUNTS_REQUEST]: (state) => {
    return ({...state, accounts: [], fetching: true})
  },
  [FETCH_ACCOUNTS_SUCCESS]: (state, action) => {
    return ({...state, accounts: action.payload.accounts, fetching: false})
  },
  [FETCH_ACCOUNTS_FAILURE]: (state, action) => {
    return ({...state, error: action.error.message, fetching: false})
  },
  [LOAD_ACCOUNT_DATA_REQUEST]: (state, action) => {
    return ({...state, currentAccount: null, fetching: true})
  },
  [LOAD_ACCOUNT_DATA_SUCCESS]: (state, action) => {
    return ({...state, currentAccount: action.payload.account, fetching: false})
  },
  [LOAD_ACCOUNT_DATA_FAILURE]: (state, action) => {
    return ({...state, error: action.error.message, fetching: false})
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = { accounts: [], currentAccount: null, fetching: false }
export default function accountReducer(state = initialState, action) {
  const handler = ACCOUNT_ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
