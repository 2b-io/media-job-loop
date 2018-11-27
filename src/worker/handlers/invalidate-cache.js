import ms from 'ms'

import config from 'infrastructure/config'
import api from 'services/api'
import { invalidateByPatterns } from 'services/cache'

export default async (job) => {
  const {
    payload: {
      projectIdentifier,
      invalidationIdentifier: invalidationId,
      options = {
        deleteOnS3: true,
        deleteOnDistribution: true
      }
    }
  } = job

  const {
    identifier: distributionIdentifier
  } = await api.call('get', `/projects/${ projectIdentifier }/infrastructure`)

  const {
    Id: invalidationIdentifier,
    Status: status
  } = await invalidateByPatterns(projectIdentifier, invalidationId, options)

  if (invalidationIdentifier) {
      api.call('patch', `/projects/${ projectIdentifier }/invalidations/${ invalidationId }`, { cdnInvalidationRef: invalidationIdentifier })

    return {
      name: 'CHECK_INVALIDATION',
      when: Date.now(),
      payload: {
        projectIdentifier,
        distributionIdentifier,
        invalidationId
      }
    }
  } else {
    return null
  }
}
