import ms from 'ms'

import api from 'services/api'
import { invalidateByPatterns } from 'services/cache'

export default async (job) => {
  const {
    payload: {
      projectIdentifier,
      invalidationIdentifier
    }
  } = job

  const {
    Id: invalidationId,
    Status: status
  } = await invalidateByPatterns(projectIdentifier, invalidationIdentifier)

  if (!invalidationId) {
    return null
  }

   await api.call(
     'patch',
     `/projects/${ projectIdentifier }/invalidations/${ invalidationIdentifier }`,
     { cdnInvalidationRef: invalidationId }
   )

  return {
    name: 'CHECK_INVALIDATION',
    when: Date.now(),
    payload: {
      projectIdentifier,
      invalidationIdentifier
    }
  }
}
