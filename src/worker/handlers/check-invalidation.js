import ms from 'ms'

import config from 'infrastructure/config'
import api from 'services/api'
import cloudfront from 'services/cloudfront'

export default async (job) => {
  const {
    name,
    when,
    payload: {
      projectIdentifier,
      invalidationId,
      distributionIdentifier
    }
  } = job

  const {
    cdnInvalidationRef: invalidationIdentifier
  } = await api.call('get', `/projects/${ projectIdentifier }/invalidations/${ invalidationId }`)

  const {
    Status: invalidationStatus
  } = await cloudfront.getInvalidation(distributionIdentifier, invalidationIdentifier)

  if (invalidationStatus === 'InProgress') {
    return {
      name: 'CHECK_INVALIDATION',
      when: when + ms('1m'),
      payload: {
        projectIdentifier,
        invalidationId,
        distributionIdentifier
      }
    }
  } else {
      await api.call('patch', `/projects/${ projectIdentifier }/invalidations/${ invalidationId }`, { status: invalidationStatus.toUpperCase() })
      return null
  }
}
