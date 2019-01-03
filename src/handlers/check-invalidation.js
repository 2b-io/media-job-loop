import ms from 'ms'

import api from 'services/api'
import cloudfront from 'services/cloudfront'

export default async (job) => {
  const {
    name,
    when,
    payload: {
      projectIdentifier,
      invalidationIdentifier
    }
  } = job

  const {
    ref: distributionRef
  } = await api.call('get', `/projects/${ projectIdentifier }/infrastructure`)

  const {
    cdnInvalidationRef: invalidationId
  } = await api.call('get', `/projects/${ projectIdentifier }/invalidations/${ invalidationIdentifier }`)

  const {
    Status: invalidationStatus
  } = await cloudfront.getInvalidation(distributionRef, invalidationId)

  if (!invalidationStatus) {
    return null
  }

  if (invalidationStatus === 'Completed') {
    await api.call(
      'patch',
      `/projects/${ projectIdentifier }/invalidations/${ invalidationIdentifier }`,
      { status: invalidationStatus.toUpperCase() }
    )

    return null
  }

  return {
    name: 'CHECK_INVALIDATION',
    when: Date.now() + ms('1m'),
    payload: {
      projectIdentifier,
      invalidationIdentifier
    }
  }
}
