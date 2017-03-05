import Q from 'q'

import logger from '../../logger'

import {
  EventRegistration,
  EventPicklistValues,
  FORM_FIELD_TO_SALESFORCE_FIELD,
  PHC_EVENT_ID,
} from './constants'
import { Account } from '../account/constants'
import { PhcEvent } from '../phc-event/constants'

export function createEventRegistration (connection, accountId, fields) {
  const deferred = Q.defer()

  const payload = {}

  for (let field of fields) {
    if (field in FORM_FIELD_TO_SALESFORCE_FIELD) {
      payload[FORM_FIELD_TO_SALESFORCE_FIELD[field]] = EventPicklistValues.APPLIED
    }
  }

  payload['Account__c'] = accountId
  payload['PHC_Event__c'] = PHC_EVENT_ID

  logger.debug('Creating event registration: requesting', { payload })

  connection.sobject(EventRegistration).create(payload, (error, registration) => {
    logger.debug('Creating event registration: request complete', { registration })

    if (error || !registration.success) {
      logger.error('Error creating registration', { error })
      deferred.reject({
        message: 'Error creating registration.',
        error,
      })
    } else {
      deferred.resolve({
        message: `Successfully created registration ${registration.id}.`,
        payload: {
          registration: {
            id: registration.id,
          },
        },
      })
    }
  })
}

export function getEventRegistration (connection, id) {
  const deferred = Q.defer()

  logger.debug('Fetching event registration: requesting', { id })

  connection.sobject(EventRegistration).retrieve(id, (error, eventRegistration) => {
    logger.debug('Fetching event registration: request complete', eventRegistration)

    if (error) {
      logger.error('Fetching event registration: error', { id, error })
      deferred.reject({
        message: `Error fetching event registration ${id}.`,
        error,
      })
    } else {
      const payload = {
        eventRegistration: {},
      }

      for (let attribute in eventRegistration) {
        if (
          attribute.endsWith('__c') &&
          !attribute.endsWith('_Time__c') &&
          attribute !== Account &&
          attribute !== PhcEvent
        ) {
          payload.eventRegistration[attribute] = eventRegistration[attribute]
        }
      }

      payload.eventRegistration.id = eventRegistration.Id

      deferred.resolve({
        message: `Successfully retrieved event registration ${id}`,
        payload,
      })
    }
  })

  return deferred.promise
}
