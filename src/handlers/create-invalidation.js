import api from 'services/api'
import {
  invalidateByPattern,
  invalidateByProject,
  invalidateByPresetHash,
  invalidateByContentType
} from 'services/invalidation'

const invalidatePatterns = async (projectIdentifier, invalidationIdentifier) => {
  const {
    Id: invalidationId
  } = await invalidateByPattern(projectIdentifier, invalidationIdentifier)

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

export default async (job) => {
  const {
    payload: {
      projectIdentifier,
      invalidationIdentifier,
      presetHash,
      contentType
    }
  } = job

  if (!projectIdentifier) {
    return null
  }

  if (presetHash) {
    return await invalidateByPresetHash(projectIdentifier, presetHash)
  }

  if (contentType) {
    return await invalidateByContentType(projectIdentifier, contentType)
  }

  if (invalidationIdentifier) {
    return await invalidatePatterns(projectIdentifier, invalidationIdentifier)
  }

  return await invalidateByProject(projectIdentifier)
}
